export interface Auth {
    user: User | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    csrf_token?: string;
    [key: string]: unknown;
}

export interface Profile {
    id: number;
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    birthday: string;
    mobile_number: string;
    address: string;
    street: string;
    barangay: string;
    city: string;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    account_no: string | null;
    username: string | null;
    email: string;
    role: 'user' | 'staff' | 'admin' | 'superadmin';
    email_verified: boolean;
    email_verified_at: string | null;
    department: 'ZCS' | 'SBR' | 'HBR' | 'OMT' | 'IPC' | null;
    position: string | null;
    profile?: Profile;
    department_relation?: Department;
    avatar?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
