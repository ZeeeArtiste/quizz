import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface RequestWithAuthentication extends Request {
    isAuthenticated?: boolean;
    user?: JwtPayload | null;
}

const verifyTokenMiddleware = (req: RequestWithAuthentication, res: Response, next: NextFunction) => {
    const token = req.cookies['token'];

    if (!token) {
        res.status(401);
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            res.status(401).json({ message: "Non authentifié" });
        } else {
            next()
        }
    });
};

export default verifyTokenMiddleware;
