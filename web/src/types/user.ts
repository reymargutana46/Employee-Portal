import { Employee } from "./employee";

export interface Auth {
    token: string,
    user: User
}

export interface User {
    employee_id?: number;
    username: string | null;
    fullname: string;
    firstname?: string;
    lastname: string;
    middlename?: string;
    extension?: string;
    employee_id_string?: string; // Keep for backward compatibility
    email: string;
    contactno?: string;
    department?: string;
    position?: string;
    has_account?: boolean;
    profile_picture?: string;
    roles: Role[];
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id?: number,
    name: string
}

export interface UserProfile {
    username: string;
    email_verified_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    employee: Employee;
    roles: Role[];
}
