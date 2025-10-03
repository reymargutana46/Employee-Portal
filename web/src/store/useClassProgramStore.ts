import { create } from "zustand";
import axios from "@/utils/axiosInstance";
import type {
  ClassProgram,
  ClassProgramFormData,
  ClassProgramResponse,
  ClassProgramListResponse,
  UpdateClassProgramRequest,
} from "@/types/classProgram";

interface ClassProgramState {
  classPrograms: ClassProgram[];
  currentClassProgram: ClassProgram | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchClassPrograms: () => Promise<void>;
  fetchClassProgram: (id: number) => Promise<void>;
  createClassProgram: (data: ClassProgramFormData) => Promise<ClassProgram | null>;
  updateClassProgram: (id: number, data: UpdateClassProgramRequest) => Promise<ClassProgram | null>;
  deleteClassProgram: (id: number) => Promise<void>;
  clearError: () => void;
  setCurrentClassProgram: (classProgram: ClassProgram | null) => void;
}

export const useClassProgramStore = create<ClassProgramState>((set, get) => ({
  classPrograms: [],
  currentClassProgram: null,
  isLoading: false,
  error: null,

  fetchClassPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<ClassProgramListResponse>("/class-programs");
      set({
        classPrograms: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch class programs",
        isLoading: false,
      });
    }
  },

  fetchClassProgram: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<ClassProgramResponse>(`/class-programs/${id}`);
      set({
        currentClassProgram: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch class program",
        isLoading: false,
      });
    }
  },

  createClassProgram: async (data: ClassProgramFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<ClassProgramResponse>("/class-programs", data);
      const newClassProgram = response.data.data;
      
      set((state) => ({
        classPrograms: [newClassProgram, ...state.classPrograms],
        isLoading: false,
      }));
      
      return newClassProgram;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create class program";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateClassProgram: async (id: number, data: UpdateClassProgramRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put<ClassProgramResponse>(`/class-programs/${id}`, data);
      const updatedClassProgram = response.data.data;
      
      set((state) => ({
        classPrograms: state.classPrograms.map((cp) =>
          cp.id === id ? updatedClassProgram : cp
        ),
        currentClassProgram: 
          state.currentClassProgram?.id === id ? updatedClassProgram : state.currentClassProgram,
        isLoading: false,
      }));
      
      return updatedClassProgram;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update class program";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  deleteClassProgram: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/class-programs/${id}`);
      
      set((state) => ({
        classPrograms: state.classPrograms.filter((cp) => cp.id !== id),
        currentClassProgram: 
          state.currentClassProgram?.id === id ? null : state.currentClassProgram,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete class program",
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentClassProgram: (classProgram: ClassProgram | null) => {
    set({ currentClassProgram: classProgram });
  },
}));