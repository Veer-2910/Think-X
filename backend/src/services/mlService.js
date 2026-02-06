import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Call Python ML prediction script
 * @param {number} attendance - Attendance percentage (0-100)
 * @param {number} cgpa - Current CGPA (0-10)
 * @param {number} failures - Number of failed assessments
 * @param {number} issues - Number of disciplinary issues
 * @returns {Promise<Object>} ML prediction result
 */
export const callPythonPredictor = async (attendance, cgpa, failures, issues) => {
  try {
    // Path to Python script (relative to backend root)
    const pythonScript = path.join(__dirname, '..', '..', '..', 'ml', 'predict.py');
    
    const command = `python "${pythonScript}" --attendance ${attendance} --cgpa ${cgpa} --failures ${failures} --issues ${issues}`;
    
    const { stdout, stderr } = await execPromise(command, {
      timeout: 10000 // 10 second timeout
    });
    
    if (stderr && !stderr.includes('UserWarning')) {
      console.warn('Python stderr:', stderr);
    }
    
    // Parse the output
    const result = parseMLOutput(stdout);
    return result;
    
  } catch (error) {
    console.error('Error calling Python predictor:', error.message);
    throw new Error(`ML prediction failed: ${error.message}`);
  }
};

/**
 * Parse Python script output
 * @param {string} stdout - Python script output
 * @returns {Object} Parsed prediction result
 */
const parseMLOutput = (stdout) => {
  try {
    // Extract probability and risk level from output
    const lines = stdout.split('\n');
    
    let probability = null;
    let riskLevel = null;
    let prediction = null;
    let confidence = null;
    
    for (const line of lines) {
      if (line.includes('Dropout Probability:')) {
        const match = line.match(/(\d+\.\d+)%/);
        if (match) probability = parseFloat(match[1]) / 100;
      }
      if (line.includes('Risk Level:')) {
        const match = line.match(/Risk Level:\s*(\w+)/);
        if (match) riskLevel = match[1];
      }
      if (line.includes('Prediction:')) {
        const match = line.match(/Prediction:\s*(.+)/);
        if (match) prediction = match[1].trim();
      }
      if (line.includes('Confidence:')) {
        const match = line.match(/(\d+\.\d+)%/);
        if (match) confidence = parseFloat(match[1]) / 100;
      }
    }
    
    if (probability === null) {
      throw new Error('Could not parse ML probability from output');
    }
    
    return {
      probability,
      riskLevel,
      prediction,
      confidence: confidence || probability
    };
    
  } catch (error) {
    console.error('Error parsing ML output:', error.message);
    throw error;
  }
};

/**
 * Get ML prediction for a student
 * @param {Object} student - Student object
 * @returns {Promise<Object>} ML prediction
 */
export const getMLPrediction = async (student) => {
  try {
    const attendance = student.attendancePercent || 0;
    const cgpa = student.currentCGPA || 0;
    
    // Count failed assessments (if available)
    const failures = student.assessments 
      ? student.assessments.filter(a => (a.marksObtained / a.totalMarks) < 0.33).length 
      : 0;
    
    const issues = student.disciplinaryIssues || 0;
    
    const prediction = await callPythonPredictor(attendance, cgpa, failures, issues);
    
    return {
      ...prediction,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error(`Error getting ML prediction for student ${student.id}:`, error.message);
    // Return null to allow graceful fallback
    return null;
  }
};

/**
 * Check if ML prediction needs refresh (older than 7 days)
 * @param {Date} lastUpdated - Last ML update timestamp
 * @returns {boolean} True if refresh needed
 */
export const needsMLRefresh = (lastUpdated) => {
  if (!lastUpdated) return true;
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return new Date(lastUpdated) < sevenDaysAgo;
};
