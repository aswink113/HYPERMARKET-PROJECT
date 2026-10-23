import { BACKEND_URL, API_BASE_URL, request } from './client';
import { storeApi } from './stores';
import { cameraApi } from './cameras';
import { produceApi } from './produce';
import { securityApi } from './security';
import { attendanceApi } from './attendance';
import { analyticsApi } from './analytics';
import { userApi } from './users';
import { masterDataApi } from './masterData';

export { BACKEND_URL, API_BASE_URL, request };
export * from './stores';
export * from './cameras';
export * from './produce';
export * from './security';
export * from './attendance';
export * from './analytics';
export * from './users';
export * from './masterData';

export const api = {
  ...storeApi,
  ...cameraApi,
  ...produceApi,
  ...securityApi,
  ...attendanceApi,
  ...analyticsApi,
  ...userApi,
  ...masterDataApi,
};

export default api;
