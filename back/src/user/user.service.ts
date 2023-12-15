import { User } from './user';

export interface UserService {
    add(email: string, password: string): Promise<User>;
    getByEmail(email: string): Promise<User | null>;
    update(id: number, email: string, password: string): Promise<User | null>;
}
