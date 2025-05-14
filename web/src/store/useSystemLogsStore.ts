
import { create } from 'zustand';
import { format } from 'date-fns';

export type LogAction = 
  | 'User Login'
  | 'User Logout' 
  | 'Data Created' 
  | 'Data Updated' 
  | 'Data Deleted'
  | 'Permission Changed'
  | 'Role Changed'
  | 'System Update'
  | 'System Error';

export interface SystemLog {
  id: number;
  timestamp: string;
  user: string;
  action: LogAction;
  details: string;
  ipAddress: string;
}

interface SystemLogsState {
  logs: SystemLog[];
  searchTerm: string;
  filterAction: LogAction | null;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFilterAction: (action: LogAction | null) => void;
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  exportLogs: () => void;
  
  // Computed
  getFilteredLogs: () => SystemLog[];
}

// Mock logs data
const mockLogs: SystemLog[] = [
  { 
    id: 1, 
    timestamp: '2025-04-17 10:30:45',
    user: 'admin@school.com', 
    action: 'User Login', 
    details: 'Successfully logged in',
    ipAddress: '192.168.1.1'
  },
  { 
    id: 2, 
    timestamp: '2025-04-17 09:15:22',
    user: 'principal@school.com', 
    action: 'Role Changed', 
    details: 'Added secretary role to user john@school.com',
    ipAddress: '192.168.1.5'
  },
  { 
    id: 3, 
    timestamp: '2025-04-16 16:40:12',
    user: 'john@school.com', 
    action: 'Data Created', 
    details: 'Created new student record: Jane Smith',
    ipAddress: '192.168.1.10'
  },
  { 
    id: 4, 
    timestamp: '2025-04-16 14:22:18',
    user: 'secretary@school.com', 
    action: 'Data Updated', 
    details: 'Updated leave request for employee ID 103',
    ipAddress: '192.168.1.15'
  },
  { 
    id: 5, 
    timestamp: '2025-04-15 11:05:33',
    user: 'admin@school.com', 
    action: 'System Update', 
    details: 'System updated to version 2.1.0',
    ipAddress: '192.168.1.1'
  },
];

export const useSystemLogsStore = create<SystemLogsState>((set, get) => ({
  logs: mockLogs,
  searchTerm: '',
  filterAction: null,
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  setFilterAction: (action) => set({ filterAction: action }),
  
  addLog: (log) => set((state) => ({
    logs: [
      {
        id: Date.now(),
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        ...log
      },
      ...state.logs
    ]
  })),
  
  exportLogs: () => {
    const { logs } = get();
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      "ID,Timestamp,User,Action,Details,IP Address\n" +
      logs.map(log => `${log.id},"${log.timestamp}","${log.user}","${log.action}","${log.details}","${log.ipAddress}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  getFilteredLogs: () => {
    const { logs, searchTerm, filterAction } = get();
    
    return logs.filter(log => {
      // Filter by search term
      if (searchTerm && 
          !log.user.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !log.action.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by action
      if (filterAction && log.action !== filterAction) {
        return false;
      }
      
      return true;
    });
  }
}));
