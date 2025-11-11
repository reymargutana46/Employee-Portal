import { create } from 'zustand';
import axios from '../utils/axiosInstance'
import { Res } from '@/types/response';
import { Department, Employee, Position } from '@/types/employee';
import { Role } from '@/types/user';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Suspended';

interface EmployeeState {
  isLoading: boolean;
  employee: Employee | null;
  employees: Employee[];
  searchTerm: string;
  sortField: keyof Employee | null;
  sortDirection: 'asc' | 'desc';
  filterDepartment: Department | null;
  filterStatus: EmployeeStatus | null;
  roles: Role[]
  departments: Department[]
  positions: Position[]
  // Actions
  setSearchTerm: (term: string) => void;
  fetchsetup: () => void;
  fetchEmployee: () => Promise<void>;
  fetchEmployeeForce: () => Promise<void>; // Add this new function
  fetchMe: () => Promise<void>;
  setSorting: (field: keyof Employee) => void;
  setFilterDepartment: (department: Department | null) => void;
  setFilterStatus: (status: EmployeeStatus | null) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: number, updates: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  exportData: () => void;
  updateProfile: (id: number, profileData: Partial<Employee>) => Promise<void>
  updateProfileWithFile: (id: number, formData: FormData) => Promise<void>
  updatePassword: (passwordData: { userId: number; currentPassword: string; newPassword: string }) => Promise<void>
  // Computed
  getFilteredEmployees: () => Employee[];
  getFullName: (employee: Employee) => string;
}



export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employee: null,
  isLoading: false,
  employees: [],
  searchTerm: '',
  sortField: null,
  sortDirection: 'asc',
  filterDepartment: null,
  filterStatus: null,
  roles: [],
  departments: [],
  positions: [],

  fetchEmployee: async () => {
    const { employees } = get();
    // Always fetch for principals and secretaries to ensure they see updated data
    // For other roles, only fetch if we don't have data yet
    const authData = localStorage.getItem('auth');
    let isPrincipalOrSecretary = false;
    
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        isPrincipalOrSecretary = auth.user?.roles?.some((role: Role) => 
          role.name === 'principal' || role.name === 'secretary'
        ) || false;
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
    
    if (employees.length && !isPrincipalOrSecretary) return;

    try {
      const res = await axios.get<Res<Employee[]>>('/employee');
      set({ employees: res.data.data });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  },
  
  // New function to force refresh employee data
  fetchEmployeeForce: async () => {
    try {
      const res = await axios.get<Res<Employee[]>>('/employee');
      set({ employees: res.data.data });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  },
  fetchMe: async () => {
    set({ isLoading: true });
    const res = await axios.get<Res<Employee>>('/accounts/me');
    set({ employee: res.data.data, isLoading: false });
  },
  fetchsetup: async () => {
    const state = get();
    // Only fetch if we don't already have the data
    if (state.roles.length > 0 && state.departments.length > 0 && state.positions.length > 0) {
      return;
    }
    
    try {
      const [response, depts, pst] = await Promise.all([
        axios.get<Res<Role[]>>('/set-up/role'),
        axios.get<Res<Department[]>>('/set-up/department'),
        axios.get<Res<Position[]>>('/set-up/position')
      ]);
      
      set({ 
        roles: response.data.data, 
        departments: depts.data.data, 
        positions: pst.data.data 
      });
    } catch (error) {
      console.error('Failed to fetch setup data:', error);
      throw error;
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  setSorting: (field) => set((state) => {
    if (state.sortField === field) {
      // Toggle direction if same field
      return { sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' };
    }
    // Set new field and default to asc
    return { sortField: field, sortDirection: 'asc' };
  }),

  setFilterDepartment: (department) => set({ filterDepartment: department }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  addEmployee: (employee: Employee) => set((state) => {
    console.log("Current employees:", state.employees);
    console.log("Adding employee:", employee);
    return {
      employees: [...state.employees, employee]
    };
  }),
  updateEmployee: (id, updates) => {
    set((state) => {
      const updatedEmployees = state.employees.map(emp =>
        emp.id === id ? { ...emp, ...updates } : emp
      );
      console.log("Updated employee list:", updatedEmployees);
      console.log("Updated employee:", updatedEmployees.find(emp => emp.id === id));
      return { employees: updatedEmployees };
    });
  },

  deleteEmployee: async (id) => {

    try {
      await axios.delete('employee/' + id)
      set((state) => ({

        employees: state.employees.filter(emp => emp.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete employee:', error)
      throw error
    }

  },

  exportData: () => {
    const { employees } = get();
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Position,Department,Time In,Time Out\n" +
      employees.map(e => `${e.id},${e.fname} ${e.lname},${e.position},${e.department},${e.workhours_am},${e.workhours_pm}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getFilteredEmployees: () => {
    const { employees, searchTerm, sortField, sortDirection, filterDepartment, filterStatus: filterPosition } = get();

    // Filter
    let filtered = employees.filter(employee => {
      // Filter by search term
      if (searchTerm && !employee.lname.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !employee.position.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !employee.department.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by department
      if (filterDepartment && employee.department !== filterDepartment.name) {
        return false;
      }

      // Filter by status
      if (filterPosition && employee.position !== filterPosition) {
        return false;
      }

      return true;
    });

    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];

        if (valueA < valueB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  },
  getFullName: (employee) => {
    return `${employee.fname} ${employee.mname ? employee.mname + ' ' : ''}${employee.lname}${employee.extname ? ', ' + employee.extname : ''}`;
  },
  updateProfile: async (id, profileData) => {
    try {
      // Send PUT request to update employee profile
      const response = await axios.put<Res<Employee>>(`/accounts/update/profile`, profileData)

      // Update the employee in the store
      set((state) => {
        // Assuming 'employees' is available in the state
        if (!state.employees) {
          console.warn("Employees array is not initialized in the store.")
          return state // Return the current state if 'employees' is not available
        }

        const updatedEmployees = state.employees.map((emp: Employee) =>
          emp.id === id ? { ...emp, ...response.data.data } : emp,
        )

        // Also update the current employee if it's the same one
        const updatedEmployee =
          state.employee?.id === id ? { ...state.employee, ...response.data.data } : state.employee

        return {
          employees: updatedEmployees,
          employee: updatedEmployee,
        }
      })

      console.log("Profile updated successfully:", response.data.data)
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error // Re-throw to handle in component
    }
  },

  updateProfileWithFile: async (id, formData) => {
    try {
      // Send PUT request to update employee profile with file upload
      const response = await axios.put<Res<Employee>>(`/accounts/update/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update the employee in the store
      set((state) => {
        // Assuming 'employees' is available in the state
        if (!state.employees) {
          console.warn("Employees array is not initialized in the store.")
          return state // Return the current state if 'employees' is not available
        }

        const updatedEmployees = state.employees.map((emp: Employee) =>
          emp.id === id ? { ...emp, ...response.data.data } : emp,
        )

        // Also update the current employee if it's the same one
        const updatedEmployee =
          state.employee?.id === id ? { ...state.employee, ...response.data.data } : state.employee

        return {
          employees: updatedEmployees,
          employee: updatedEmployee,
        }
      })

      console.log("Profile with file updated successfully:", response.data.data)
    } catch (error) {
      console.error("Failed to update profile with file:", error)
      throw error // Re-throw to handle in component
    }
  },

  updatePassword: async (passwordData) => {
    try {
      // Send POST request to change password
      const response = await axios.post("/accounts/change-password", {
        userId: passwordData.userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      console.log("Password updated successfully:", response.data)
    } catch (error) {
      console.error("Failed to update password:", error)
      throw error // Re-throw to handle in component
    }
  },
}));
