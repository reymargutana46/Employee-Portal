import { ServiceRequest } from "@/types/serviceRequest";
import { create } from "zustand";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";

interface ServiceRequestState {
    serviceRequests: ServiceRequest[];
    selectedRequest: ServiceRequest | null;
    isLoading: boolean;
    error: string | null;
    fetchRequests: () => Promise<void>;
    createRequest: (request: Omit<ServiceRequest, "requestor" | "id">) => Promise<void>;
    updateRequest: (id: number, request: Partial<ServiceRequest>) => Promise<void>;
    updateStatus: (id: number, status: ServiceRequest["status"]) => Promise<void>;
    deleteRequest: (id: number) => Promise<void>;
    submitRating: (id: number, rating: number, remarks: string) => Promise<void>;
    setSelectedRequest: (request: ServiceRequest | null) => void;

}



export const useSeerviceRequestStore = create<ServiceRequestState>((set, get) => ({
    serviceRequests: [],
    selectedRequest: null,
    isLoading: false,
    error: null,
    fetchRequests: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get<Res<ServiceRequest[]>>("/service-request"); // Replace with your API endpoint
            const data = await response.data.data;
            set({ serviceRequests: data, isLoading: false });
        } catch (error) {
            set({ error: "Failed to fetch requests", isLoading: false });
        }
    },

    createRequest: async (request) => {
        set({ isLoading: true });
        try {
            const response = await axios.post<Res<ServiceRequest>>("/service-request", request);
            const data = await response.data.data;
            set((state) => ({ serviceRequests: [...state.serviceRequests, data], isLoading: false }));
        } catch (error) {
            set({ error: "Failed to create request", isLoading: false });
        }
    },

    updateRequest: async (id, request) => {
        set({ isLoading: true });
        try {
            const response = await axios.put<Res<ServiceRequest>>(`/service-request/${id}`, request);
            const data = await response.data.data;
            set((state) => ({
                serviceRequests: state.serviceRequests.map((req) => (req.id === id ? { ...req, ...data } : req)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: "Failed to update request", isLoading: false });
        }
    },

    updateStatus: async (id, status) => {
        set({ isLoading: true });
        try {
            const response = await axios.post<Res<ServiceRequest>>(`/service-request/${id}/status`, { status });
            const data = await response.data.data;
            set((state) => ({
                serviceRequests: state.serviceRequests.map((req) => (req.id === id ? { ...req, ...data } : req)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: "Failed to update status", isLoading: false });
        }
    },

    deleteRequest: async (id) => {
        set({ isLoading: true });
        try {
            await axios.delete(`/service-request/${id}`);
            set((state) => ({ serviceRequests: state.serviceRequests.filter((req) => req.id !== id), isLoading: false }));
        } catch (error) {
            set({ error: "Failed to delete request", isLoading: false });
        }
    },
    submitRating: async (id, rating, remarks) => {
        set({ isLoading: true });
        try {
            const response = await axios.post<Res<ServiceRequest>>(`/service-request/${id}/rating`, { rating, remarks });
            const data = await response.data.data;
            set((state) => ({
                serviceRequests: state.serviceRequests.map((req) => (req.id === id ? { ...req, ...data } : req)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: "Failed to submit rating", isLoading: false });
        }

     },
    setSelectedRequest: (request) => set({ selectedRequest: request }),

}));
