import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const carApi = axios.create({
  baseURL: `${API_URL}/cars`, // Base URL for car endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token for authenticated requests (Crucial for protected routes)



export const registerCar = (carData) => carApi.post('/car', carData); // CREATE
export const getCars = () => carApi.get('/'); // READ
export const updateCar = (id, carData) => carApi.put(`/${id}`, carData); // UPDATE
export const deleteCar = (id) => carApi.delete(`/${id}`); // DELETE

// The original recordEntry function which creates a ParkingRecord (not just a Car)
// This might be in parkingApi.js. If you moved it here, ensure it hits the correct endpoint.
// Assuming your parking entry is still at /api/parkin/entry
const parkingApi = axios.create({
  baseURL: `${API_URL}/parkin`, // Base URL for parking-related endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});
parkingApi.interceptors.request.use( // Also add interceptor for parkingApi
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const recordEntry = (entryData) => parkingApi.post('/entry', entryData);