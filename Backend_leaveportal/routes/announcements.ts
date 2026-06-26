import { Router } from 'express';
import { 
    getAllAnnouncements, 
    getMyAnnouncements, 
    createAnnouncement, 
    deleteAnnouncement, 
    markAsRead, 
    getAnnouncementReads 
} from '../controllers/announcements';

const router = Router();

router.get('/all', getAllAnnouncements);
router.get('/my/:employee_id', getMyAnnouncements);
router.post('/create', createAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.post('/read', markAsRead);
router.get('/:id/reads', getAnnouncementReads);

export default router;
