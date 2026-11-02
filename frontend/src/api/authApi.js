import axiosInstance from './axiosInstance';

// Register a new user.
export async function registerUser(formData) {
  const response = await axiosInstance.post('/auth/register', formData);
  return response.data.data;
}

// Log in an existing user.
export async function loginUser(credentials) {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data.data;
}

// Get the currently authenticated user.
export async function getCurrentUser() {
  const response = await axiosInstance.get('/auth/me');
  return response.data.data;
}