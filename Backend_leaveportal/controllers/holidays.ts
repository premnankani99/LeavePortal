import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { HTTP_STATUS } from '../constants/httpCodes';
import { MESSAGES } from '../constants/strings';

export const getHolidays = async (req: Request, res: Response): Promise<void> => {
    try {
        const holidays = await prisma.holidays.findMany({
            orderBy: { date: 'asc' }
        });
        res.status(HTTP_STATUS.OK).json(holidays);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
    }
};

export const addHoliday = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, name, description, type } = req.body;
        
        if (!date || !name) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Date and Name are required" });
            return;
        }

        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateObj < today) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "You cannot add a holiday for a past date." });
            return;
        }
        
        dateObj.setHours(0,0,0,0);

        const newHoliday = await prisma.holidays.create({
            data: {
                date: dateObj,
                name,
                description: description || null,
                type: type || 'public'
            }
        });

        res.status(HTTP_STATUS.CREATED).json(newHoliday);
    } catch (error: any) {
        console.error("Error adding holiday:", error);
        if (error.code === 'P2002') {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "A holiday on this date already exists." });
            return;
        }
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not create holiday" });
    }
};

export const deleteHoliday = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.holidays.delete({
            where: { id: id as string }
        });
        res.status(HTTP_STATUS.OK).json({ message: "Holiday deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting holiday:", error);
        if (error.code === 'P2025') {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Holiday not found" });
            return;
        }
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.DELETE_ERROR });
    }
};
