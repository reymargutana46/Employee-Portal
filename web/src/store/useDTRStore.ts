
import { create } from 'zustand';
import { format } from 'date-fns';
import { AttendanceStatus, DTRList, DTRList } from '@/types/dtr';
import axios from '../utils/axiosInstance';
import { Res } from '@/types/response';



interface DTRFilter {
  status?: AttendanceStatus;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

interface DTRState {
  records: DTRList[];
  searchTerm: string;
  filters: DTRFilter;
  selectedDate: Date | null;

  // Actions
  fetchDTR: () => void;
  setSearchTerm: (term: string) => void;
  setSelectedDate: (date: Date | null) => void;
  addManualDTR: (record: DTRList) => void;
  addRecord: (record: DTRList) => void;
  filterByStatus: (status?: AttendanceStatus) => void;
  filterByDateRange: (start: Date | null, end: Date | null) => void;
  exportData: () => void;

  // Computed
  getFilteredRecords: () => DTRList[];
  getTodayRecord: () => DTRList | undefined;
}


export const useDTRStore = create<DTRState>((set, get) => ({
  records: [],
  searchTerm: '',
  filters: {},
  selectedDate: null,

  fetchDTR: () => {
    axios.get<Res<DTRList[]>>('/dtr').then((res) => {
      set(state => ({
        records: res.data.data
      }))
    })
  },
  setSearchTerm: (term) => set({ searchTerm: term }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  addManualDTR: (record) => {

    set(state => ({
      records: [record, ...state.records]
    }));
  },

  // Added for compatibility with ImportDTRDialog
  addRecord: (record) => {
    const newRecord = {
      ...record,
      id: Date.now()
    };
    set(state => ({
      records: [newRecord, ...state.records]
    }));
  },

  filterByStatus: (status) => {
    set(state => ({
      filters: { ...state.filters, status }
    }));
  },

  filterByDateRange: (start, end) => {
    set(state => ({
      filters: { ...state.filters, dateRange: { start, end } }
    }));
  },

  exportData: () => {
    const { records } = get();
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,AM Arrival,AM Departure,PM Arrival,PM Departure,Status\n" +
      records.map(r => `${r.date},${r.am_arrival},${r.am_departure},${r.pm_arrival},${r.pm_departure},${r.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dtr_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getFilteredRecords: () => {
    const { records, searchTerm, filters, selectedDate } = get();
    const lowerSearch = searchTerm.toLowerCase();
    return records.filter(record => {
      if (
        searchTerm &&
        !record.employee.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }

      if (filters.status && record.status !== filters.status) {
        return false;
      }

      if (filters.dateRange?.start && filters.dateRange?.end) {
        const recordDate = new Date(record.date);
        if (
          recordDate < filters.dateRange.start ||
          recordDate > filters.dateRange.end
        ) {
          return false;
        }
      }

      if (selectedDate) {
        const recordDateStr = record.date;
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        if (recordDateStr !== selectedDateStr) {
          return false;
        }
      }

      return true;
    });
  },

  getTodayRecord: () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return get().records.find(record => record.date === todayStr);
  }
}));
