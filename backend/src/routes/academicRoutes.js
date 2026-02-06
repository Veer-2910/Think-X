import express from 'express';
import multer from 'multer';
import {
  addAttendance,
  addAssessment,
  getStudentAcademicProfile,
  bulkUploadAttendance,
  bulkUploadAssessments,
  uploadAssessmentsCSV,
  uploadAttemptsCSV
} from '../controllers/academicController.js';
import { validateStudentId } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Single Record Entry
router.post('/attendance', addAttendance);
router.post('/assessment', addAssessment);

// Merged Data View
router.get('/profile/:id', validateStudentId, getStudentAcademicProfile);

// Bulk CSV Uploads
router.post('/attendance/upload', upload.single('file'), bulkUploadAttendance);
router.post('/assessment/upload', upload.single('file'), bulkUploadAssessments);

// New CSV Upload Routes
router.post('/assessments/upload/csv', upload.single('file'), uploadAssessmentsCSV);
router.post('/attempts/upload/csv', upload.single('file'), uploadAttemptsCSV);

export default router;
