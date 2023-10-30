import { Router } from 'express';
import { QuestionController } from './question.controller';

export class QuestionRouter {
    router = Router();

    constructor(private questionController: QuestionController) {
        this.configureRoutes();
    }

    private configureRoutes(): void {

         this.router.get('/all', (req, res, next) => {
            try {
                const result = this.questionController.getAllQuestions();
                res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });

        this.router.get('/:id', (req, res, next) => {
            try {                
                const result = this.questionController.getById(
                    parseInt(req.params.id),
                );
                res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });

        this.router.post('/add-question', (req, res, next) => {
            try {
                // const result = this.userController.add(req.body.username);
                // res.status(200).json(result);
            } catch (error: unknown) {
                next(error);
            }
        });

        
    }
}
