import { create } from 'zustand';
import { dtrecords } from '@/lib/supabase';
import { insertDTRRecords, cleanDTRRecordPayload } from '@/lib/supabase';

interface DtrecordsState {
  records: dtrecords[];
  loading: boolean;
  error: string | null;
  
  // Actions
  insertRecords: (rawRecords: any[]) => Promise<number>;
  cleanRecord: (record: any) => dtrecords | null;
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
      const count = await insertDTRRecords(rawRecords);
      set({ loading: false });
      return count;
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  
  cleanRecord: (record: any) => {
    return cleanDTRRecordPayload(record);
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));