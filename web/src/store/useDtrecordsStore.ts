import { create } from 'zustand';
// Supabase imports removed - using local API
import axios from '@/utils/axiosInstance';

interface DtrecordsState {
  records: any[];
  loading: boolean;
  error: string | null;
  
  // Actions
  insertRecords: (rawRecords: any[]) => Promise<number>;
  cleanRecord: (record: any) => any | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDtrecordsStore = create<DtrecordsState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  
  insertRecords: async (rawRecords: any[]) => {
    set({ loading: true, error: null });
    try {
      // Use local API endpoint
      await axios.post('/dtr/import', {
        employee_name: rawRecords[0]?.employee_name || 'Unknown',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        records: rawRecords.map(record => ({
          day: new Date(record.date).getDate().toString(),
          am_arrival: record.time_in || '',
          am_departure: record.time_out || '',
          pm_arrival: record.time_in2 || '',
          pm_departure: record.time_out2 || '',
          undertime_hour: '0',
          undertime_minute: '0'
        }))
      });
      set({ loading: false });
      return rawRecords.length;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  
  cleanRecord: (record: any) => {
    // Local record cleaning for PostgreSQL
    if (!record || !record.employee_name || !record.date) return null;
    return {
      employee_name: String(record.employee_name).trim(),
      employee_id: Number(record.employee_id) || 0,
      date: record.date,
      am_time_in: record.time_in || null,
      am_time_out: record.time_out || null,
      pm_time_in: record.time_in2 || null,
      pm_time_out: record.time_out2 || null
    };
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));