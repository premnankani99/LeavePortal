import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { HTTP_STATUS } from '../constants/httpCodes';
import { MESSAGES } from '../constants/strings';

// Define the permissions mapping for each role
const rolePermissions: Record<string, string[]> = {
  admin: [
    'leaves:read', 
    'leaves:write', 
    'employees:read', 
    'employees:write', 
    'announcements:write',
    'holidays:write'
  ],
  hr: [
    'leaves:read', 
    'employees:read',
    'holidays:write'
  ],
  employee: [
    'leaves:self'
  ]
};

/**
 * Middleware factory to check if the authenticated user has a specific permission.
 * @param {string} permission - The required permission (e.g., 'leaves:write').
 * @returns {Function} Express middleware function.
 */
export const hasPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // If there is no user attached to the request (e.g. verifyToken failed or wasn't called)
    if (!req.user || !req.user.role) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.SERVER_ERROR });
      return;
    }

    const userRole = req.user.role;
    const allowedPermissions = rolePermissions[userRole] || [];

    // Check if the user's role grants them the required permission
    if (allowedPermissions.includes(permission)) {
      next();
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Access denied. Insufficient permissions." });
    }
  };
};
