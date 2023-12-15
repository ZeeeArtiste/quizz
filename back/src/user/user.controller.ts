import { User } from './user';
import { UserService } from './user.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserController {

    private readonly saltRounds = 10;

    constructor(private userService: UserService) { }

    async add(email: string, password: string): Promise<{ token: string }> {
        if (!this.validateEmail(email)) {
            throw new Error('Email invalide');
        }

        if (await this.getByEmail(email)) {
            throw new Error('Email déjà existant');
        }

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        const user = await this.userService.add(email, hashedPassword);

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
        return { token };
    }

    async getByEmail(email: string): Promise<User | null> {
        if (!this.validateEmail(email)) {
            throw new Error('Email invalide');
        }

        return this.userService.getByEmail(email);
    }

    async update(id: number, email: string, newPassword: string): Promise<User | null> {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error('ID invalide');
        }
        if (!this.validateEmail(email)) {
            throw new Error('Email invalide');
        }

        const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
        return this.userService.update(id, email, hashedPassword);
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}
