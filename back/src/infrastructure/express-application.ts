import { ExpressRouter } from './express-router';
import { ExpressServer } from './express-server';
import { UserJSONService } from '../user/user.json-service';
import { UserService } from '../user/user.service';
import * as dotenv from 'dotenv';
import { QuestionService } from '../questions/question.service';
import { QuestionJSONService } from '../questions/question.json-service';
import { QuizzService } from '../quizz/quizz.service';
import { QuizJSONService } from '../quizz/quizz.json-service';

export class ExpressApplication {
    private expressRouter!: ExpressRouter;
    private port!: string;
    private server!: ExpressServer;
    private userService!: UserService;
    private questionService!: QuestionService;
    private quizzService!: QuizzService;



    constructor() {
        this.configureApplication();
    }

    bootstrap(): void {
        this.server.bootstrap();
    }

    private configureApplication(): void {
        this.configureEnvironment();
        this.configureServerPort();
        this.configureServices();
        this.configureExpressRouter();
        this.configureServer();
    }

    private configureEnvironment(): void {
        dotenv.config({
            path: '.env',
        });
    }

    private configureServerPort(): void {
        this.port = this.getPort();
    }

    private configureServices(): void {
        this.userService = new UserJSONService();
        this.questionService = new QuestionJSONService();
        this.quizzService = new QuizJSONService();

    }

    private configureExpressRouter(): void {
        this.expressRouter = new ExpressRouter(this.userService, this.questionService, this.quizzService);
    }

    private configureServer(): void {
        this.server = new ExpressServer(this.expressRouter, this.port);
    }

    private getPort(): string {
        const port = process.env.PORT;
        if (!port) {
            throw new Error('No port was found in env file.');
        }

        return port;
    }
}
