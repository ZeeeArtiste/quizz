import { ExpressRouter } from './express-router';
import { ExpressServer } from './express-server';
import { UserDbService } from '../user/user.db-service';
import { UserService } from '../user/user.service';
import * as dotenv from 'dotenv';
import { QuestionService } from '../questions/question.service';
import { QuestionDBService } from '../questions/question.db-service';
import { QuizzService } from '../quizz/quizz.service';
import { QuizzDBService } from '../quizz/quizz.db-service';
import { createPool } from 'mysql2/promise';
import { Pool } from 'mysql2/promise';

export class ExpressApplication {
    private expressRouter!: ExpressRouter;
    private port!: string;
    private server!: ExpressServer;
    private userService!: UserService;
    private questionService!: QuestionService;
    private quizzService!: QuizzService;
    private pool!: Pool;



    constructor() {
        this.configureApplication();
    }

    bootstrap(): void {
        this.server.bootstrap();
    }

    private configureApplication(): void {
        this.configureEnvironment();
        this.configureServerPort();
        this.configureBdd();
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
        this.userService = new UserDbService(this.pool);
        this.questionService = new QuestionDBService(this.pool);
        this.quizzService = new QuizzDBService(this.pool);
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

    private configureBdd() {
        this.pool = createPool({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
        });
    }
}
