import prisma from '../config/database.js';

/**
 * Get assigned students for the logged-in mentor
 * GET /api/mentor/my-students
 */
export const getMyStudents = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Find the Mentor record linked to this user's email
    // The User and Mentor tables are separate but share email
    let mentor = await prisma.mentor.findUnique({
      where: { email: userEmail }
    });

    if (!mentor) {
      // If no mentor profile exists yet, but they have the role, 
      // we could optionally create one or just return empty
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No mentor profile found for this user'
      });
    }

    // Get assigned students with their risk profile
    const assignments = await prisma.mentorAssignment.findMany({
      where: { 
        mentorId: mentor.id,
        status: 'ACTIVE'
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            department: true,
            semester: true,
            currentCGPA: true,
            attendancePercent: true,
            dropoutRisk: true,
            riskReason: true,
            mlProbability: true
          }
        }
      }
    });

    const students = assignments.map(a => a.student);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned students',
      error: error.message
    });
  }
};
