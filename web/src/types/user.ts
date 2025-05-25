import { Employee } from "./employee";

export interface Auth {
    token: string,
    user: User
}

export interface User {
    username: string,
    fullname: string,
    firstname?: string,
    lastname: string,
    employee_id: string,
    email: string,
    roles: Role[]
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
