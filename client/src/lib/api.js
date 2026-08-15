import { supabase } from './supabase';

const API_URL = 'http://localhost:5000/api';

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// API Services
export const api = {
  // Projects
  getProjects: async () => {
    const response = await fetch(`${API_URL}/projects`, { cache: 'no-store' });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'API request failed');
    return json.data || json; // Handle both paginated and non-paginated structures safely
  },
  getProject: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API request failed');
    return data;
  },
  createProject: (data) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getMyProjects: () => fetchWithAuth('/projects/my-projects').then(res => res.data || res),
  updateProject: (id, data) => fetchWithAuth(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => fetchWithAuth(`/projects/${id}`, { method: 'DELETE' }),
  
  // Investment Requests
  getInvestmentRequests: () => fetchWithAuth('/investment-requests'),
  createInvestmentRequest: (data) => fetchWithAuth('/investment-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRequestStatus: (id, status) => fetchWithAuth(`/investment-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Saved Projects
  getSavedProjects: () => fetchWithAuth('/saved-projects'),
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
