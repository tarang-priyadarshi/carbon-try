// frontend/services/authService.js
import axios from 'axios';

const API_URL = '/api/auth/';

export const register = (data) => axios.post(API_URL + 'register', data);
export const login = (data) => axios.post(API_URL + 'login', data);
export const forgotPassword = (data) => axios.post(API_URL + 'forgot-password', data);
export const resetPassword = (data) => axios.post(API_URL + 'reset-password', data);
