import axios from "axios";

// Create an instance of axios with the base URL
const api = axios.create({
  // baseURL: "http://localhost:8000",
  baseURL: "https://fastapi-speak-v0-production.up.railway.app",
});

// Export the Axios instance
export default api;

// http://127.0.0.1:8000
// https://fastapi-speak-v0-production.up.railway.app
