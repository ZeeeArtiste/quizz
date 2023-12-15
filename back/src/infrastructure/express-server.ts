import express from 'express';
import { ExpressRouter } from './express-router';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';


export class ExpressServer {
    private express = express();

    constructor(
        private expressRouter: ExpressRouter,
        private port: string,
    ) {
        this.configureCors()
        this.configureBodyParser();
        this.configureCookiesParser();
        this.configureRoutes();
    }

    bootstrap(): void {
        this.express.listen(this.port, () => {
            console.log(`> Listening on port ${this.port}`);
        });
    }

    private configureBodyParser(): void {
        this.express.use(bodyParser.json());
    }

    private configureCookiesParser(): void {
        this.express.use(cookieParser());
    }

    private configureRoutes(): void {
        this.express.use('/api', this.expressRouter.router);
    }

    private configureCors(): void {
        this.express.use(
            cors({
                origin: "http://localhost:5173",
                credentials: true
            })
        );
    }
}
