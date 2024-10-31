
import axios from 'axios';

const HttpToken = axios.create({

  baseURL: 'http://localhost:3000', 
});

HttpToken.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

  }
  return config;
});

export default HttpToken;
