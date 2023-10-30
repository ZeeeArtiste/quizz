// quiz.router.ts

import { Router } from 'express';
import { QuizzController } from './quizz.controller';

export class QuizzRouter {
    router = Router();

    constructor(private quizzController: QuizzController) {
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/all', (req, res, next) => {
            try {
                const result = this.quizzController.getAllQuizzes();
                res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });

        this.router.get('/:id', (req, res, next) => {
            try {
                const result = this.quizzController.getById(parseInt(req.params.id));
                res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });

        this.router.post('/add-quiz', async (req, res, next) => {
            try {
                const result = await this.quizzController.createQuiz(req.body);
                res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });
    }
}
