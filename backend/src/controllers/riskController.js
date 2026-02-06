import prisma from '../config/database.js';
import { calculateHybridRisk } from '../services/riskEngine.js';
import { getMLPrediction, needsMLRefresh } from '../services/mlService.js';

/**
 * Get comprehensive risk profile for a student (with ML integration)
 * GET /api/risk/profile/:id
 */
export const getRiskProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        attendanceRecords: {
          orderBy: { date: 'desc' }
        },
        assessments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if ML prediction needs refresh
    let mlPrediction = null;
    let mlFromCache = false;

    if (student.mlProbability !== null && !needsMLRefresh(student.mlLastUpdated)) {
      // Use cached ML prediction
      mlPrediction = {
        probability: student.mlProbability,
        confidence: student.mlConfidence,
        riskLevel: student.mlProbability >= 0.7 ? 'HIGH' : student.mlProbability >= 0.4 ? 'MEDIUM' : 'LOW'
      };
      mlFromCache = true;
    } else {
      // Get fresh ML prediction
      try {
        mlPrediction = await getMLPrediction(student);
        
        if (mlPrediction) {
          // Store ML prediction in database
          await prisma.student.update({
            where: { id },
            data: {
              mlProbability: mlPrediction.probability,
              mlConfidence: mlPrediction.confidence,
              mlLastUpdated: new Date()
            }
          });
        }
      } catch (error) {
        console.warn('ML prediction failed, using rule-based only:', error.message);
      }
    }

    // Calculate hybrid risk
    const riskProfile = calculateHybridRisk(student, mlPrediction);

    // Auto-trigger interventions for HIGH risk students
    if (riskProfile.overallRisk === 'HIGH') {
      try {
        const { triggerHighRiskAlert } = await import('../services/alertService.js');
        const { autoAssignMentor, createInterventionTask } = await import('../services/interventionService.js');
        
        // Create alert
        await triggerHighRiskAlert(student);
        
        // Auto-assign mentor if available
        const assignment = await autoAssignMentor(student.id);
        
        // Create intervention task
        await createInterventionTask(
          student.id,
          'HIGH',
          `Immediate Intervention Required for ${student.name}`,
          `Student showing HIGH dropout risk. ${riskProfile.recommendations.join('. ')}`,
          assignment?.mentorId
        );
        
        console.log(`Auto-intervention triggered for HIGH risk student: ${student.studentId}`);
      } catch (error) {
        console.error('Error triggering interventions:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...riskProfile,
        mlFromCache,
        mlLastUpdated: student.mlLastUpdated
      }
    });
  } catch (error) {
    console.error('Get risk profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk profile',
      error: error.message
    });
  }
};

/**
 * Get risk profiles for all students (with optional filtering)
 * GET /api/risk/profiles?riskLevel=HIGH
 */
export const getAllRiskProfiles = async (req, res) => {
  try {
    const { riskLevel, department, includeML } = req.query;

    const where = {};
    if (riskLevel) where.dropoutRisk = riskLevel;
    if (department) where.department = department;

    const students = await prisma.student.findMany({
      where,
      include: {
        attendanceRecords: {
          orderBy: { date: 'desc' }
        },
        assessments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    const riskProfiles = students.map(student => {
      // Use cached ML prediction if available
      let mlPrediction = null;
      if (includeML === 'true' && student.mlProbability !== null) {
        mlPrediction = {
          probability: student.mlProbability,
          confidence: student.mlConfidence,
          riskLevel: student.mlProbability >= 0.7 ? 'HIGH' : student.mlProbability >= 0.4 ? 'MEDIUM' : 'LOW'
        };
      }
      
      return calculateHybridRisk(student, mlPrediction);
    });

    // Sort by hybrid score (highest first)
    riskProfiles.sort((a, b) => (b.hybridScore || b.riskScore) - (a.hybridScore || a.riskScore));

    res.status(200).json({
      success: true,
      count: riskProfiles.length,
      data: riskProfiles
    });
  } catch (error) {
    console.error('Get all risk profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk profiles',
      error: error.message
    });
  }
};
