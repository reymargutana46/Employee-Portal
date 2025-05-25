export interface Employee {
  id: number;
  fname: string;
  lname: string;
  mname: string | undefined;
  extname: string | undefined;
  username: string;
  biod: string;

  position: string;
  department: string;
  email: string;
  contactno: string;
  workhours_id: string | undefined;
  workhours_am: string;
  workhours_pm: string;
  telno: string;
}

export interface Position {
  id: number;
  title: string;
}

export interface Position {
  id: number;
  title: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workhour {
  id: number;
  am: string;
  pm: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
