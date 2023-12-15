// quiz.router.ts

import { Router } from 'express';
import { QuizzController } from './quizz.controller';
import verifyTokenMiddleware from '../middleware/authMiddleware';

export class QuizzRouter {
    router = Router();

    constructor(private quizzController: QuizzController) {
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/all', async (req, res, next) => {
            try {
                const result = await this.quizzController.getAllQuizzes();
                res.status(200).json(result);
            } catch (error) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.get('/:id', async (req, res, next) => {
            try {
                const result = await this.quizzController.getById(parseInt(req.params.id));
                if (result) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ message: 'Quizz non trouvé' });
                }
            } catch (error: unknown) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.post('/add-quizz', verifyTokenMiddleware, async (req, res, next) => {
            try {
                const result = await this.quizzController.createQuiz(req.body);
                res.status(201).json(result);
            } catch (error: unknown) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.put('/update/:id', verifyTokenMiddleware, async (req, res, next) => {
            try {
                const id = parseInt(req.params.id)
                const isExist = await this.quizzController.getById(id)
                if (isExist) {
                    const result = await this.quizzController.updateQuizz(id, req.body);
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ message: "Quizz inexistant" })
                }
            } catch (error: any) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });

        this.router.delete('/delete/:id', verifyTokenMiddleware, async (req, res, next) => {
            const id = parseInt(req.params.id);
            try {
                const exist = await this.quizzController.getById(id)
                if (exist) {
                    const isDone = await this.quizzController.deleteQuizz(id);
                    isDone ? res.status(200).json({ message: "ok" }) : res.status(500).json({ message: "Un problème est survenue" });
                } else {
                    res.status(404).json({ message: "Quizz non trouvé !" })
                }

            } catch (error: unknown) {
                res.status(500).json({ message: "Une erreur est survenue !", error: error })
            }
        });
    }
}
