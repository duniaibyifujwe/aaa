import axios from 'axios';

const API_URL = "http://localhost:5000";

const authApi = axios.create({
  baseURL: `${API_URL}`, // Base URL for auth endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = (userData) => authApi.post('/register', userData);
export const loginUser = (credentials) => authApi.post('/login', credentials);
export const logoutUser = () => authApi.get('/logout'); // Frontend-driven logout

export default authApi;