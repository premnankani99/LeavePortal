import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { HTTP_STATUS } from '../constants/httpCodes';
import { MESSAGES } from '../constants/strings';
import * as LeaveService from '../services/leaveService';
import * as CompOffService from '../services/compOffService';

/**
 * Applies for a new leave.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { leave_type, start_date, end_date, reason, is_half_day } = req.body;
        if (!req.user?.id) throw new Error("No user ID");
        const newLeave = await LeaveService.applyNewLeaveService(
            req.user.id, leave_type, new Date(start_date), new Date(end_date), reason, is_half_day, false
        );
        res.status(HTTP_STATUS.CREATED).json({ message: MESSAGES.LEAVE_APPLIED, leave: newLeave });
    } catch (_error: any) {
        if (_error.message === "EMPLOYEE_NOT_FOUND") res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.EMPLOYEE_NOT_FOUND });
        else res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Applies for a new leave on behalf of an employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const applyLeaveOnBehalf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { employee_id, leave_type, start_date, end_date, reason, is_half_day } = req.body;
        if (!employee_id) throw new Error("No employee ID");
        const newLeave = await LeaveService.applyNewLeaveService(
            employee_id, leave_type, new Date(start_date), new Date(end_date), reason, is_half_day, true
        );
        res.status(HTTP_STATUS.CREATED).json({ message: MESSAGES.LEAVE_APPLIED, leave: newLeave });
    } catch (_error: any) {
        if (_error.message === "EMPLOYEE_NOT_FOUND") res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.EMPLOYEE_NOT_FOUND });
        else res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Fetches personal leaves for the current employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) throw new Error("No user ID");
        const leaves = await LeaveService.fetchEmployeeLeavesService(req.user.id);
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Fetches all leaves across the system for admin view.
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getAllLeaves = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const leaves = await LeaveService.fetchAllLeavesService();
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Updates the status of a specific leave request.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const updatedLeave = await LeaveService.processLeaveActionService(String(req.params.id), req.body.status, req.body.adminNote);
        res.status(HTTP_STATUS.OK).json({ message: MESSAGES.LEAVE_STATUS_UPDATED, leave: updatedLeave });
    } catch (_error: any) {
        if (_error.message === "LEAVE_NOT_FOUND") res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.LEAVE_NOT_FOUND });
        else res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
    }
};

/**
 * Processes a withdrawal request for a leave.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const withdrawLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { message, updatedLeave } = await LeaveService.withdrawLeaveService(String(req.params.id), req.body.datesToWithdraw);
        res.status(HTTP_STATUS.OK).json({ message, leave: updatedLeave });
    } catch (_error: any) {
        if (_error.message === "LEAVE_NOT_FOUND") res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.LEAVE_NOT_FOUND });
        else if (_error.message === "CANNOT_WITHDRAW") res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.CANNOT_WITHDRAW });
        else res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.SERVER_ERROR });
    }
};

/**
 * Adjusts an unpaid leave logic (Placeholder).
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const adjustUnpaidLeave = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json({ message: "adjustUnpaidLeave unimplemented" });
};

/**
 * Fetches all leaves associated with a specific employee ID.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getLeavesByEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const leaves = await LeaveService.fetchEmployeeLeavesService(String(req.params.employeeId));
        res.status(HTTP_STATUS.OK).json(leaves);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

/**
 * Requests a new compensatory off for an employee.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const requestCompOff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) throw new Error("No user ID");
        const compOff = await CompOffService.requestCompOffService(req.user.id, req.body.total_days, req.body.reason);
        res.status(HTTP_STATUS.CREATED).json({ message: "Comp-off requested successfully", compOff });
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to request comp-off" });
    }
};

/**
 * Fetches all pending compensatory off requests.
 * @param {AuthRequest} _req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getPendingCompOffRequests = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await CompOffService.fetchPendingCompOffsService();
        res.status(HTTP_STATUS.OK).json(requests);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch requests" });
    }
};

/**
 * Approves or rejects a specific compensatory off request.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const actionCompOffRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) throw new Error("No user ID");
        await CompOffService.actionCompOffService(String(req.params.id), req.user.id, req.body.status, req.body.adminNote);
        res.status(HTTP_STATUS.OK).json({ message: `Request ${req.body.status} successfully` });
    } catch (_error: any) {
        if (_error.message === "Request not found") res.status(HTTP_STATUS.NOT_FOUND).json({ error: _error.message });
        else if (_error.message === "Request is already processed") res.status(HTTP_STATUS.BAD_REQUEST).json({ error: _error.message });
        else res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to action request" });
    }
};

/**
 * Fetches the logged-in user's comp off records.
 * @param {AuthRequest} req - Request object.
 * @param {Response} res - Response object.
 * @returns {Promise<void>}
 */
export const getMyCompOffs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) throw new Error("No user ID");
        const compOffs = await CompOffService.fetchMyCompOffsService(req.user.id);
        res.status(HTTP_STATUS.OK).json(compOffs);
    } catch (_error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};
