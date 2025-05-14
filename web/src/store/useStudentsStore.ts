
import { create } from 'zustand';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  status: 'Active' | 'Inactive';
}

interface StudentsState {
  students: Student[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  sortBy: (field: keyof Student) => void;
  filterByStatus: (status: Student['status']) => void;
  exportData: () => void;
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  students: [
    { id: '2024-0001', name: 'John Smith', gradeLevel: 'Grade 10', section: 'Section A', status: 'Active' }
  ],
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  addStudent: (student) => {
    const newStudent = {
      ...student,
      id: `2024-${String(get().students.length + 1).padStart(4, '0')}`
    };
    set((state) => ({ students: [...state.students, newStudent] }));
  },
  sortBy: (field) => {
    set((state) => ({
      students: [...state.students].sort((a, b) => 
        a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0
      )
    }));
  },
  filterByStatus: (status) => {
    set((state) => ({
      students: state.students.filter(student => student.status === status)
    }));
  },
  exportData: () => {
    const { students } = get();
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      "ID,Name,Grade Level,Section,Status\n" +
      students.map(s => `${s.id},${s.name},${s.gradeLevel},${s.section},${s.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}));
