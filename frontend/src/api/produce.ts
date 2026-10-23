import { request } from './client';
import type { ProduceBin } from '../types';

export const produceApi = {
  getProduceBins: () => request<ProduceBin[]>('/produce-bins/'),
};
