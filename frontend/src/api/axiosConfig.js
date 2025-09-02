import axios from "axios";

// Centralized axios instance for all API calls.
// Base URL is taken from VITE_API_URL (set in environment / .env).
const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

export { apiClient };
