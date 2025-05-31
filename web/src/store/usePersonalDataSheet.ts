import { Auth } from "@/types/user";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const auth: Auth = JSON.parse(localStorage.getItem('auth')) || "";
const instance = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: { "Content-Type": "multipart/form-data", "Accept": "application/json", "Authorization": `Bearer ${auth.token}` },
});
instance.interceptors.response.use(

    (response) => response, // Pass successful responses through
    (error: AxiosError) => {

        toast.error(error.response.status, { description: error.response.data!.message })
        return Promise.reject(error); // Ensure the error is still thrown
    }
);
export default instance;
