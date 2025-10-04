import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get(ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get(ENDPOINTS.ANALYTICS);
    return response.data.data;
  },

  getRecentActivity: async () => {
    const response = await api.get(ENDPOINTS.RECENT_ACTIVITY);
    return response.data.data;
  }
};