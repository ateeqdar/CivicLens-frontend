import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the Supabase JWT token
api.interceptors.request.use(async (config) => {
  try {
    // getSession is fast (reads from local storage)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
       config.headers.Authorization = `Bearer ${session.access_token}`;
     }
  } catch (err) {
    // Silent fail for auth, backend will handle 401
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const issueService = {
  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },
  getMyIssues: async () => {
    const response = await api.get('/issues/my');
    return response.data;
  },
  getAuthorityIssues: async (params = {}) => {
    const response = await api.get('/issues/authority', { params });
    return response.data;
  },
  getAllPublicIssues: async () => {
    const response = await api.get('/issues/public');
    return response.data;
  },
  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },
  updateIssueStatus: async (id, status, resolved_image_url = null) => {
    const payload = { status };
    if (resolved_image_url) {
      payload.resolved_image_url = resolved_image_url;
    }
    const response = await api.patch(`/issues/${id}/status`, payload);
    return response.data;
  },
  reassignIssue: async (id, assigned_authority) => {
    const response = await api.patch(`/issues/${id}/reassign`, { assigned_authority });
    return response.data;
  },
  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  }
};

export default api;
