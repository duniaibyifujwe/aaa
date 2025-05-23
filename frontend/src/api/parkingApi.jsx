import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Get API URL from .env

const parkingApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Parking Slots ---
export const getParkingSlots = () => parkingApi.get('/slots');
export const getAvailableParkingSlots = () => parkingApi.get('/slots/available');
export const getParkingSlotById = (id) => parkingApi.get(`/slots/${id}`);
export const createParkingSlots = (slots) => parkingApi.post('/slots', { slots }); // For initial setup
export const updateParkingSlot = (id, status) => parkingApi.put(`/slots/${id}`, { slotStatus: status });

// --- Car Management (Optional for frontend, as entry handles registration) ---
export const getCarByPlateNo = (plateNo) => parkingApi.get(`/cars/${plateNo}`);

// --- Parking Entry/Exit ---
export const recordEntry = (carDetails) => parkingApi.post('/parkin/entry', carDetails);
export const recordExit = (plateNo) => parkingApi.post('/parkin/exit', { plateNo });
// export const getParkingHistory = (plateNo = '') => parkingApi.get(`/parkin/history`, { params: { plateNo } }); // Can filter by plateNo
export const getParkingHistory = (filters = {}) => parkingApi.get(`/parkin/history`, { params: filters });

// --- Payments ---
export const recordPayment = (parkingRecordId, amountPaid) => parkingApi.post('/payments', { parkingRecordId, amountPaid });
export const getAllPayments = () => parkingApi.get('/payments');
export const getDailyRevenue = (date) => parkingApi.get(`/payments/daily-revenue`, { params: { date } });
export const getPaymentById = (id) => parkingApi.get(`/payments/${id}`);


export default parkingApi; // Export the instance if you need it directly