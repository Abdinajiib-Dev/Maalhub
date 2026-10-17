import { supabase } from './supabase';

const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_URL = (rawApiUrl && !rawApiUrl.includes('fly.dev')) ? rawApiUrl : '/api';

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
  let token = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (e) {
    // Ignore network error on getSession
  }

  if (!token) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.access_token) {
            token = item.access_token;
            break;
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  const defaultHeaders = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return await parseResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection or try again later.');
    }
    throw err;
  }
};

// API Services
export const api = {
  // Projects
  getProjects: async () => {
    const json = await fetchWithAuth('/projects', { cache: 'no-store' });
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },
  getProject: async (id) => {
    return fetchWithAuth(`/projects/${id}`, { cache: 'no-store' });
  },
  createProject: (data) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getMyProjects: () => fetchWithAuth('/projects/my-projects').then(res => (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])),
  updateProject: (id, data) => fetchWithAuth(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => fetchWithAuth(`/projects/${id}`, { method: 'DELETE' }),

  // Investment Phases
  addProjectPhase: (projectId, data) => fetchWithAuth(`/projects/${projectId}/phases`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProjectPhase: (projectId, phaseId, data) => fetchWithAuth(`/projects/${projectId}/phases/${phaseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProjectPhase: (projectId, phaseId) => fetchWithAuth(`/projects/${projectId}/phases/${phaseId}`, {
    method: 'DELETE',
  }),
  
  // Investment Requests & Portfolio
  getInvestmentRequests: () => fetchWithAuth('/investment-requests').then(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
  getMyInvestments: () => fetchWithAuth('/investment-requests/my-investments').then(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
  createInvestmentRequest: (data) => fetchWithAuth('/investment-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRequestStatus: (id, status) => fetchWithAuth(`/investment-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Progress Reports (from Entrepreneurs)
  getProjectReports: (projectId) => fetchWithAuth(`/projects/${projectId}/reports`).then(res => (Array.isArray(res) ? res : [])),
  createProjectReport: (projectId, data) => fetchWithAuth(`/projects/${projectId}/reports`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteProjectReport: (projectId, reportId) => fetchWithAuth(`/projects/${projectId}/reports/${reportId}`, {
    method: 'DELETE',
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

  uploadPhaseEvidence: async (projectId, file) => {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `project-${projectId}/${Date.now()}-${cleanFileName}`;

    let bucketName = 'phase-evidence';
    
    // Attempt upload to phase-evidence bucket, fallback to project-documents
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError && uploadError.message?.includes('not found')) {
      bucketName = 'project-documents';
      const retry = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      uploadError = retry.error;
    }

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { publicUrl, fileName: file.name };
  },

  uploadIdentityDocument: async (userId, file) => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `identity/${userId}/${Date.now()}-${cleanFileName}`;

    let bucketName = 'identity-documents';
    
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError && (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket') || uploadError.statusCode === '404')) {
      bucketName = 'project-documents';
      let retry = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      uploadError = retry.error;

      if (uploadError && (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket'))) {
        bucketName = 'profile-photos';
        let secondRetry = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, { cacheControl: '3600', upsert: true });
        uploadError = secondRetry.error;
      }
    }

    if (uploadError) {
      console.warn('Identity document storage upload error:', uploadError);
      return { publicUrl: null, fileName: file.name };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { publicUrl, fileName: file.name };
  },

  // Admin API Methods
  getAdminStats: () => fetchWithAuth('/admin/stats'),
  getAdminUsers: () => fetchWithAuth('/admin/users'),
  updateUserRole: (id, role) => fetchWithAuth(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }),
  updateUserVerification: (id, status) => fetchWithAuth(`/admin/users/${id}/verification`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteUserAdmin: (id) => fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminProjects: () => fetchWithAuth('/admin/projects'),
  updateProjectStatusAdmin: (id, status) => fetchWithAuth(`/admin/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteProjectAdmin: (id) => fetchWithAuth(`/admin/projects/${id}`, { method: 'DELETE' }),
};
