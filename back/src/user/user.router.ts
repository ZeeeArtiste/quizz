import { Router } from 'express';
import { UserController } from './user.controller';

export class UserRouter {
    router = Router();

    constructor(private userController: UserController) {
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/:email', async (req, res, next) => {
            try {
                const result = await this.userController.getByEmail(
                    (req.params.email),
                );
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ message: 'Compte non trouvé' });
                }
            } catch (error: unknown) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.post('/add-user', async (req, res, next) => {
            try {
                const result = await this.userController.add(req.body.email, req.body.password);
                res.status(200).json(result);
            } catch (error: any) {
                res.status(500).json({ message: error.message, error: error })
            }
        });
    }

}
