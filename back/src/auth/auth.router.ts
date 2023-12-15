import { Router } from 'express';
import verifyTokenMiddleware, { RequestWithAuthentication } from '../middleware/authMiddleware';
import { AuthController } from './auth.controller';

export class AuthRouter {
    router = Router();

    constructor(private authController: AuthController) {
        this.configureRoutes();
    }

    private configureRoutes(): void {

        this.router.post('/login', async (req, res, next) => {
            try {
                const result = await this.authController.login(req.body.email, req.body.password);
                res.cookie('token', result.token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'none',//because origin is localhost and not 127.0.0.1
                    maxAge: 24 * 60 * 60 * 1000
                });

                res.status(200).json({ email: result.email });
            } catch (error: unknown) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.get('/verify-token', verifyTokenMiddleware, (req, res) => {
            res.status(200).send()
        });

        this.router.get('/logout', (req, res) => {
            // Effacer le cookie
            res.cookie('token', '', {
                httpOnly: true,
                expires: new Date(0),
            });

            res.status(200).json({ message: "Déconnexion réussie" });
        });


    }

}
