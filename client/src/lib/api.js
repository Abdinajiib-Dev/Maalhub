import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper function to safely parse API response and handle non-JSON / HTML error responses
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  } else {
    const text = await response.text();
    if (text.trim().toLowerCase().startsWith('<!doctype') || text.includes('<html')) {
      throw new Error(`Server returned HTML response (${response.status} ${response.statusText}). Please ensure the API server is running.`);
    }
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text };
      }
    }
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Helper function to fetch data from our backend with the user's JWT
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const token = session.access_token;
  
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return parseResponse(response);
};

// API Services
export const api = {
  // Projects
  getProjects: async () => {
    const response = await fetch(`${API_URL}/projects`, { cache: 'no-store' });
    const json = await parseResponse(response);
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },
  getProject: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, { cache: 'no-store' });
    return parseResponse(response);
  },
  createProject: (data) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getMyProjects: () => fetchWithAuth('/projects/my-projects').then(res => (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])),
  updateProject: (id, data) => fetchWithAuth(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => fetchWithAuth(`/projects/${id}`, { method: 'DELETE' }),
  
  // Investment Requests
  getInvestmentRequests: () => fetchWithAuth('/investment-requests').then(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
  createInvestmentRequest: (data) => fetchWithAuth('/investment-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRequestStatus: (id, status) => fetchWithAuth(`/investment-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Saved Projects
  getSavedProjects: () => fetchWithAuth('/saved-projects').then(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
  saveProject: (project_id) => fetchWithAuth('/saved-projects', { method: 'POST', body: JSON.stringify({ project_id }) }),
  unsaveProject: (project_id) => fetchWithAuth(`/saved-projects/${project_id}`, { method: 'DELETE' }),
  
  // Messages
  getConversations: () => fetchWithAuth('/messages'),
  getMessages: (id) => fetchWithAuth(`/messages/${id}/messages`),
  getUnreadMessages: () => fetchWithAuth('/messages/unread'),
  markConversationAsRead: (id) => fetchWithAuth(`/messages/${id}/read`, { method: 'PUT' }),
  sendMessage: (id, text) => fetchWithAuth(`/messages/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: text }),
  }),
  startConversation: (participant_id) => fetchWithAuth('/messages', {
    method: 'POST',
    body: JSON.stringify({ participant_id }),
  }),
  
  // Profile
  getUserProfile: (id) => fetchWithAuth(`/auth/me/${id}`),
  updateProfile: (profileData) => fetchWithAuth('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  // Storage
  uploadAvatar: async (userId, file) => {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },
};
