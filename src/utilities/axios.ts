import axios from 'axios';

export const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(config => {
  console.log(`[${config.method?.toUpperCase()}] ${config.url} | query: ${JSON.stringify(config?.params || {})} | data: ${JSON.stringify(config?.data || {})}`)
  return config;
}, error => {
  console.error(`[Request Error] ${error}`)
  return Promise.reject(error)
})

axiosInstance.interceptors.response.use(response => {
  return response;
}, error => {
  console.error(`[Response Error] ${error}`)
  return Promise.reject(error)
})