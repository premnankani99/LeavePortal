import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getAllAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
        const announcements = await prisma.announcements.findMany({
            include: {
                author: {
                    select: { full_name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        
        // Map data to match frontend expectations (profiles: { full_name })
        const mapped = announcements.map(ann => ({
            ...ann,
            profiles: { full_name: ann.author.full_name }
        }));
        
        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch announcements" });
    }
};

export const getMyAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employee_id } = req.params;
        
        const announcements = await prisma.announcements.findMany({
            include: {
                author: { select: { full_name: true } },
                announcement_reads: {
                    where: { employee_id: String(employee_id) },
                    select: { read_at: true, employee_id: true }
                }
            },
            orderBy: [
                { is_pinned: 'desc' },
                { created_at: 'desc' }
            ]
        });

        const mapped = announcements.map(ann => ({
            ...ann,
            profiles: { full_name: ann.author.full_name },
            my_read: ann.announcement_reads[0] || null
        }));
        
        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch announcements" });
    }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content, priority, is_pinned, valid_until, author_id } = req.body;
        
        const newAnn = await prisma.announcements.create({
            data: {
                title,
                content,
                priority: priority || 'normal',
                is_pinned: is_pinned || false,
                valid_until: valid_until ? new Date(valid_until) : null,
                author_id: String(author_id)
            }
        });
        
        res.status(201).json(newAnn);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create announcement" });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Need to delete related reads first due to foreign key
        await prisma.announcement_reads.deleteMany({
            where: { announcement_id: String(id) }
        });
        
        await prisma.announcements.delete({
            where: { id: String(id) }
        });
        
        res.status(200).json({ message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ error: "Could not delete announcement" });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { announcement_id, employee_id } = req.body;
        
        // Upsert is best here
        const readRecord = await prisma.announcement_reads.upsert({
            where: {
                announcement_id_employee_id: {
                    announcement_id: String(announcement_id),
                    employee_id: String(employee_id)
                }
            },
            update: {}, // Do nothing if it already exists
            create: {
                announcement_id: String(announcement_id),
                employee_id: String(employee_id),
                read_at: new Date()
            }
        });
        
        res.status(200).json(readRecord);
    } catch (error) {
        res.status(500).json({ error: "Could not mark as read" });
    }
};

export const getAnnouncementReads = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const reads = await prisma.announcement_reads.findMany({
            where: { announcement_id: String(id) },
            include: {
                employee: {
                    select: { full_name: true, email: true, department_id: true }
                }
            }
        });
        
        const mapped = reads.map(r => ({
            ...r,
            profiles: {
                full_name: r.employee.full_name,
                email: r.employee.email,
                department_id: r.employee.department_id
            }
        }));
        
        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch reads" });
    }
};
