import { Router } from 'express';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { UserRouter } from '../user/user.router';
import { QuestionRouter } from '../questions/question.router';
import { QuestionController } from '../questions/question.controller';
import { QuestionService } from '../questions/question.service';
import { QuizzRouter } from '../quizz/quizz.router';
import { QuizzController } from '../quizz/quizz.controller';
import { QuizzService } from '../quizz/quizz.service';

export class ExpressRouter {
    router = Router();

    private userController!: UserController;
    private userRouter!: UserRouter;
    private questionRouter!: QuestionRouter;
    private questionController!: QuestionController;
    private quizzRouter!: QuizzRouter;
    private quizzController!: QuizzController;



    constructor(private userService: UserService, private questionService: QuestionService, private quizzService: QuizzService) {
        console.log('coucou', questionService);

        this.configureControllers();
        this.configureRouters();
        this.configureRoutes();
    }

    private configureControllers(): void {
        this.userController = new UserController(this.userService);
        this.questionController = new QuestionController(this.questionService);
        this.quizzController = new QuizzController(this.quizzService, this.questionController);
    }

    private configureRouters(): void {
        this.userRouter = new UserRouter(this.userController);
        this.questionRouter = new QuestionRouter(this.questionController);
        this.quizzRouter = new QuizzRouter(this.quizzController)
    }

    private configureRoutes(): void {
        this.router.use('/user', this.userRouter.router);
        this.router.use('/questions', this.questionRouter.router);
        this.router.use('/quizz', this.quizzRouter.router);

    }

}
