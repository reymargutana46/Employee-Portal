export interface Auth {
    token: string,
    user: User
}

export interface User {
    username: string,
    fullname: string,
    firstname?: string,
    lastname: string,
    email: string,
    roles: Role[]
}

export interface Role {
    id?: number,
    name: string
}
