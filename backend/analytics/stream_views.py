import cv2
import time
import threading
import logging
import re
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
        import os
        os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'

        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
                    if self.cap.isOpened():
                        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    else:
                        time.sleep(1.0)
                        continue

                # Continuously grab latest frame
                grabbed = self.cap.grab()
                if grabbed:
                    ret, frame = self.cap.retrieve()
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
                    time.sleep(0.01)

                # Auto-stop after 45 seconds if no clients are viewing
                if self.client_count <= 0 and (time.time() - self.last_access_time) > 45:
                    self.running = False
                    break

                time.sleep(0.01)  # High polling rate so OpenCV buffer never accumulates
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


_face_detector = None
_face_detector_lock = threading.Lock()

def get_face_detector(width=1280, height=720):
    global _face_detector
    with _face_detector_lock:
        import os
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'face_detection_yunet.onnx')
        if not os.path.exists(model_path):
            return None
        try:
            detector = cv2.FaceDetectorYN.create(
                model_path,
                "",
                (width, height),
                score_threshold=0.45,
                nms_threshold=0.3,
                top_k=10
            )
            return detector
        except Exception as e:
            logger.error(f"Failed to load FaceDetectorYN: {e}")
            return None


_face_recognizer = None
_face_recognizer_lock = threading.Lock()

def get_face_recognizer():
    global _face_recognizer
    with _face_recognizer_lock:
        if _face_recognizer is None:
            import os
            sface_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'face_recognition_sface.onnx')
            if os.path.exists(sface_path):
                try:
                    _face_recognizer = cv2.FaceRecognizerSF.create(sface_path, "")
                except Exception as e:
                    logger.error(f"Failed to load FaceRecognizerSF: {e}")
        return _face_recognizer


def camera_scan_face_view(request, camera_id):
    import json
    import base64
    import numpy as np
    from django.http import JsonResponse
    from .models import User

    try:
        camera = Camera.objects.get(id=camera_id)
    except Camera.DoesNotExist:
        return JsonResponse({'error': 'Camera not found'}, status=404)

    rtsp_url = camera.stream_url
    if not rtsp_url:
        return JsonResponse({'error': 'No stream URL'}, status=400)

    worker = get_or_create_worker(camera.id, rtsp_url)
    frame_bytes = worker.get_frame()
    if not frame_bytes:
        time.sleep(0.5)
        frame_bytes = worker.get_frame()

    if not frame_bytes:
        return JsonResponse({'detected': False, 'message': 'Frame not available yet', 'faceCount': 0})

    arr = np.frombuffer(frame_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return JsonResponse({'detected': False, 'message': 'Failed to decode frame', 'faceCount': 0})

    h, w = img.shape[:2]
    detector = get_face_detector(w, h)
    has_face = False
    face_count = 0
    crop_b64 = ""
    matched_user_dict = None
    best_similarity_score = 0.0

    if detector is not None:
        try:
            detector.setInputSize((w, h))
            _, faces = detector.detect(img)
            if faces is not None and len(faces) > 0:
                face_count = len(faces)
                has_face = True
                
                # Extract detected face crop
                primary_face = faces[0]
                box = primary_face[:4].astype(int)
                x, y, fw, fh = box
                # Add padding
                pad_x = int(fw * 0.25)
                pad_y = int(fh * 0.35)
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(w, x + fw + pad_x)
                y2 = min(h, y + fh + pad_y)
                
                face_crop = img[y1:y2, x1:x2]
                if face_crop.size > 0:
                    ret, crop_jpg = cv2.imencode('.jpg', face_crop, [cv2.IMWRITE_JPEG_QUALITY, 85])
                    if ret:
                        crop_b64 = f"data:image/jpeg;base64,{base64.b64encode(crop_jpg.tobytes()).decode('ascii')}"

                # Match against enrolled staff faces using SFace Deep Neural Network
                recognizer = get_face_recognizer()
                if recognizer is not None:
                    try:
                        aligned_detected = recognizer.alignCrop(img, primary_face)
                        detected_feat = recognizer.feature(aligned_detected)

                        # Check all registered employees with face_photos in database
                        enrolled_users = User.objects.exclude(face_photos=[]).exclude(face_photos__isnull=True)
                        for user in enrolled_users:
                            photos = user.face_photos or []
                            for p_data in photos:
                                if not p_data or not isinstance(p_data, str) or ',' not in p_data:
                                    continue
                                try:
                                    raw_b64 = p_data.split(',', 1)[1]
                                    enrolled_bytes = base64.b64decode(raw_b64)
                                    enrolled_arr = np.frombuffer(enrolled_bytes, dtype=np.uint8)
                                    enrolled_img = cv2.imdecode(enrolled_arr, cv2.IMREAD_COLOR)
                                    if enrolled_img is None:
                                        continue
                                    
                                    eh, ew = enrolled_img.shape[:2]
                                    edet = get_face_detector(ew, eh)
                                    if edet is None:
                                        continue
                                    edet.setInputSize((ew, eh))
                                    _, efaces = edet.detect(enrolled_img)
                                    if efaces is not None and len(efaces) > 0:
                                        aligned_enrolled = recognizer.alignCrop(enrolled_img, efaces[0])
                                        enrolled_feat = recognizer.feature(aligned_enrolled)
                                        
                                        # Cosine distance match score (SFace standard: threshold >= 0.363 means same person)
                                        score = recognizer.match(detected_feat, enrolled_feat, cv2.FaceRecognizerSF_FR_COSINE)
                                        if score > best_similarity_score:
                                            best_similarity_score = float(score)
                                        
                                        if score >= 0.363:
                                            matched_user_dict = {
                                                'id': user.id,
                                                'name': user.name,
                                                'department': user.department,
                                                'designation': user.designation,
                                                'avatar': user.avatar,
                                                'role': user.role,
                                                'email': user.email,
                                                'similarity': round(float(score), 3)
                                            }
                                            break
                                except Exception as err:
                                    continue
                            if matched_user_dict:
                                break
                    except Exception as match_err:
                        logger.error(f"SFace biometric match error: {match_err}")
        except Exception as e:
            logger.error(f"Face detection inference error: {e}")

    # Compute embedding list if face detected
    embedding_list = []
    if detector is not None and has_face:
        try:
            recognizer = get_face_recognizer()
            if recognizer is not None:
                aligned_detected = recognizer.alignCrop(img, primary_face)
                detected_feat = recognizer.feature(aligned_detected)
                embedding_list = detected_feat.flatten().tolist()
        except Exception:
            pass

    # If detected face did not match any enrolled staff, persist directly to PostgreSQL UnknownFace table
    if has_face and not matched_user_dict and crop_b64:
        try:
            from .models import UnknownFace
            import datetime
            now_str = datetime.datetime.now().strftime("%I:%M:%S %p")
            recognizer = get_face_recognizer()
            
            # Check against existing UnknownFace records in DB using cosine distance
            matched_uf = None
            if recognizer is not None and len(embedding_list) > 0:
                det_np = np.array(embedding_list, dtype=np.float32)
                for uf in UnknownFace.objects.all():
                    if uf.embedding and len(uf.embedding) == len(embedding_list):
                        uf_np = np.array(uf.embedding, dtype=np.float32)
                        dot = np.dot(det_np, uf_np)
                        norm_prod = np.linalg.norm(det_np) * np.linalg.norm(uf_np)
                        sim = dot / norm_prod if norm_prod > 0 else 0
                        if sim >= 0.36:
                            matched_uf = uf
                            break

            if matched_uf:
                matched_uf.last_seen = now_str
                matched_uf.scan_count += 1
                matched_uf.latest_snapshot = crop_b64
                snaps = matched_uf.snapshots or []
                if crop_b64 not in snaps:
                    snaps = [crop_b64] + snaps[:3]
                matched_uf.snapshots = snaps
                if not matched_uf.embedding and embedding_list:
                    matched_uf.embedding = embedding_list
                matched_uf.save()
            else:
                # Create a new UnknownFace profile in DB
                existing_keys = UnknownFace.objects.values_list('person_key', flat=True)
                nums = [int(re.search(r'\d+', k).group()) for k in existing_keys if re.search(r'\d+', k)]
                next_id = (max(nums) + 1) if nums else 1
                pkey = f"UNKNOWN-{next_id:03d}"
                UnknownFace.objects.create(
                    id=f"UF-{int(time.time()*1000)}",
                    person_key=pkey,
                    first_seen=now_str,
                    last_seen=now_str,
                    scan_count=1,
                    latest_snapshot=crop_b64,
                    snapshots=[crop_b64],
                    embedding=embedding_list
                )
        except Exception as persist_err:
            logger.error(f"Error persisting unknown face in DB: {persist_err}")

    resp = JsonResponse({
        'detected': has_face,
        'faceCount': face_count,
        'matchedStaff': matched_user_dict,
        'similarityScore': round(best_similarity_score, 3),
        'snapshotUrl': f"/api/cameras/{camera_id}/snapshot/?t={int(time.time() * 1000)}",
        'faceCrop': crop_b64,
        'faceEmbedding': embedding_list
    })
    resp['Access-Control-Allow-Origin'] = '*'
    return resp



