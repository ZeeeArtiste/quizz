import { Router } from 'express';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { UserRouter } from '../user/user.router';
import { QuestionController } from '../questions/question.controller';
import { QuestionService } from '../questions/question.service';
import { QuizzRouter } from '../quizz/quizz.router';
import { QuizzController } from '../quizz/quizz.controller';
import { QuizzService } from '../quizz/quizz.service';
import { AuthRouter } from '../auth/auth.router';
import { AuthController } from '../auth/auth.controller';

export class ExpressRouter {
    router = Router();

    private userController!: UserController;
    private userRouter!: UserRouter;
    private questionController!: QuestionController;
    private quizzRouter!: QuizzRouter;
    private quizzController!: QuizzController;
    private authController!: AuthController;
    private authRouter!: AuthRouter

    constructor(private userService: UserService, private questionService: QuestionService, private quizzService: QuizzService) {
        this.configureControllers();
        this.configureRouters();
        this.configureRoutes();
    }

    private configureControllers(): void {
        this.userController = new UserController(this.userService);
        this.questionController = new QuestionController(this.questionService);
        this.quizzController = new QuizzController(this.quizzService, this.questionController);
        this.authController = new AuthController(this.userService);
    }

    private configureRouters(): void {
        this.userRouter = new UserRouter(this.userController);
        this.quizzRouter = new QuizzRouter(this.quizzController)
        this.authRouter = new AuthRouter(this.authController)
    }

    private configureRoutes(): void {
        this.router.use('/user', this.userRouter.router);
        this.router.use('/quizz', this.quizzRouter.router);
        this.router.use('/auth', this.authRouter.router);
    }

}
