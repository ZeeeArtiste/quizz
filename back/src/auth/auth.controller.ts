import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';

export class AuthController {

    constructor(private userService: UserService) { }


    async login(email: string, password: string): Promise<{ token: string, email: string }> {
        const user = await this.userService.getByEmail(email);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Mot de passe invalide');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '24h' });

        return { token, email };
    }

}
