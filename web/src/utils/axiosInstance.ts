import { useAuth } from "@/context/AuthContext";
import { Auth } from "@/types/user";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Define interface for error response
interface ErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

const instance = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
});

// Add request interceptor to dynamically set auth token
instance.interceptors.request.use(
    (config) => {
        const auth: Auth = JSON.parse(localStorage.getItem('auth') || '{}');
        if (auth.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
instance.interceptors.response.use(
    (response) => response, // Pass successful responses through
    (error: AxiosError<ErrorResponse>) => {
        if (error.response) {
            const errorData = error.response.data;
            const message = errorData?.message || 'An error occurred';
            toast.error(`Error ${error.response.status}`, { description: message });
        } else {
            toast.error('Network Error', { description: 'Unable to connect to server' });
        }
        return Promise.reject(error); // Ensure the error is still thrown
    }
);
export default instance;
