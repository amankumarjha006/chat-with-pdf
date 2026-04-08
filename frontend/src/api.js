/**
 * API configuration — uses VITE_API_URL env variable in production,
 * falls back to localhost:10000 for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default API_BASE_URL;
