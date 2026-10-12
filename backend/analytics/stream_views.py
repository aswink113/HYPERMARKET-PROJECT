import cv2
import time
import threading
import logging
from django.http import StreamingHttpResponse, HttpResponse, Http404
from .models import Camera

logger = logging.getLogger(__name__)

class RTSPStreamWorker:
    def __init__(self, camera_id, rtsp_url):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.cap = None
        self.last_frame = None
        self.lock = threading.Lock()
        self.running = False
        self.thread = None
        self.client_count = 0
        self.last_access_time = time.time()

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

    def _capture_loop(self):
        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    self.cap = cv2.VideoCapture(self.rtsp_url)
                    if not self.cap.isOpened():
                        time.sleep(2.0)
                        continue

                ret, frame = self.cap.read()
                if ret and frame is not None:
                    # Resize to 1280x720 for fluid high performance browser streaming
                    h, w = frame.shape[:2]
                    target_w = 1280
                    target_h = int((target_w / w) * h)
                    resized = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
                    
                    ret2, jpeg = cv2.imencode('.jpg', resized, [cv2.IMWRITE_JPEG_QUALITY, 75])
                    if ret2:
                        with self.lock:
                            self.last_frame = jpeg.tobytes()
                else:
                    time.sleep(0.1)

                # Auto-stop after 30 seconds if no clients are viewing
                if self.client_count <= 0 and (time.time() - self.last_access_time) > 30:
                    self.running = False
                    break

                time.sleep(0.03)  # ~30 FPS
            except Exception as e:
                logger.error(f"Error in stream capture loop: {e}")
                time.sleep(1.0)

        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

    def get_frame(self):
        self.last_access_time = time.time()
        with self.lock:
            return self.last_frame


_active_workers = {}
_workers_lock = threading.Lock()

def get_or_create_worker(camera_id, rtsp_url):
    with _workers_lock:
        worker = _active_workers.get(camera_id)
        if not worker or not worker.running or worker.rtsp_url != rtsp_url:
            if worker:
                worker.stop()
            worker = RTSPStreamWorker(camera_id, rtsp_url)
            worker.start()
            _active_workers[camera_id] = worker
        return worker


def video_stream_generator(camera_id, rtsp_url):
    worker = get_or_create_worker(camera_id, rtsp_url)
    worker.client_count += 1
    try:
        while True:
            frame_bytes = worker.get_frame()
            if frame_bytes:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                )
                time.sleep(0.04)  # ~25 FPS
            else:
                time.sleep(0.1)
    finally:
        worker.client_count = max(0, worker.client_count - 1)


def camera_stream_view(request, camera_id):
    try:
        camera = Camera.objects.get(id=camera_id)
    except Camera.DoesNotExist:
        raise Http404("Camera not found")

    rtsp_url = camera.stream_url
    if not rtsp_url:
        return HttpResponse("Camera has no RTSP stream URL configured", status=400)

    response = StreamingHttpResponse(
        video_stream_generator(camera.id, rtsp_url),
        content_type='multipart/x-mixed-replace; boundary=frame'
    )
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    response['Access-Control-Allow-Origin'] = '*'
    return response


def camera_snapshot_view(request, camera_id):
    try:
        camera = Camera.objects.get(id=camera_id)
    except Camera.DoesNotExist:
        raise Http404("Camera not found")

    rtsp_url = camera.stream_url
    if not rtsp_url:
        return HttpResponse("Camera has no RTSP stream URL configured", status=400)

    worker = get_or_create_worker(camera.id, rtsp_url)
    frame_bytes = worker.get_frame()
    if not frame_bytes:
        # Give it a brief moment if just started
        time.sleep(0.5)
        frame_bytes = worker.get_frame()

    if frame_bytes:
        response = HttpResponse(frame_bytes, content_type="image/jpeg")
        response['Access-Control-Allow-Origin'] = '*'
        return response
    else:
        return HttpResponse("Frame not available yet", status=503)
