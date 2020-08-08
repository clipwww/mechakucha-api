import axios from 'axios';

export const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(config => {
  console.log(`[${config.method?.toUpperCase()}] ${config.url}`)
  // console.log(`[Query] ${JSON.stringify(config?.params ?? {}, null, 2)}`)
  // console.log(`[Param] ${JSON.stringify(config?.data ?? {}, null, 2)}`)
  return config;
})

// axiosInstance.interceptors.response.use(response => {
//   console.log(response.data);
//   return response;
// })