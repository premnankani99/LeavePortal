import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MESSAGES } from '../constants/strings';
import { HTTP_STATUS } from '../constants/httpCodes';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

/**
 * Middleware to verify JWT token.
 * @param {AuthRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.SERVER_ERROR });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        req.user = decoded;
        next();
    } catch (_error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Middleware to check if user is admin.
 * @param {AuthRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.SERVER_ERROR });
    }
};
