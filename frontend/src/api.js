import axios from "axios";

const getBackendURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const proto = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port || (proto === "https:" ? "443" : "80");
  if (port === "3000") {
    return `http://${host}:5000`;
  }
  return `${proto}//${host}:${port}`;
};

axios.defaults.baseURL = getBackendURL();

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default axios;
