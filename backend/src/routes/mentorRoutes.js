import express from 'express';
import { getMyStudents } from '../controllers/mentorController.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/my-students', authorizeRole('MENTOR', 'ADMIN'), getMyStudents);

export default router;
