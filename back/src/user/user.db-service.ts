import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { User } from './user';
import { UserService } from './user.service';

export class UserDbService implements UserService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async add(email: string, password: string): Promise<User> {
        // Insérer un nouvel utilisateur et récupérer son ID
        const [userResult] = await this.pool.query<ResultSetHeader>(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, password]
        );
        const newUserId = userResult.insertId;

        // Créer et retourner l'objet User
        return new User(newUserId, email, password);
    }

    async getByEmail(email: string): Promise<User | null> {
        // Sélectionner l'utilisateur par son ID
        const [users] = await this.pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return null;
        }

        const user = users[0];
        return new User(user.id, user.email, user.password);
    }

    async update(id: number, email: string, password: string): Promise<User | null> {
        // Mettre à jour les informations de l'utilisateur
        await this.pool.query(
            'UPDATE users SET email = ?, password = ? WHERE id = ?',
            [email, password, id]
        );

        // Récupérer et retourner l'objet User mis à jour
        return this.getByEmail(email);
    }
}
