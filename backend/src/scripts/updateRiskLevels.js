import prisma from '../config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Calculate risk level based on student data
 */
function calculateRiskLevel(student) {
    const attendance = student.attendancePercent || 0;
    const cgpa = student.currentCGPA || 0;
    const disciplinary = student.disciplinaryIssues || 0;

    let riskScore = 0;

    // Attendance factor (40% weight)
    if (attendance < 50) riskScore += 40;
    else if (attendance < 60) riskScore += 30;
    else if (attendance < 75) riskScore += 15;

    // CGPA factor (40% weight)
    if (cgpa < 5.0) riskScore += 40;
    else if (cgpa < 6.0) riskScore += 30;
    else if (cgpa < 7.0) riskScore += 15;

    // Disciplinary issues (20% weight)
    if (disciplinary >= 3) riskScore += 20;
    else if (disciplinary >= 1) riskScore += 10;

    // Determine risk level
    if (riskScore >= 60) return { level: 'HIGH', probability: 0.75 + (riskScore - 60) / 100 };
    if (riskScore >= 30) return { level: 'MEDIUM', probability: 0.45 + (riskScore - 30) / 100 };
    return { level: 'LOW', probability: riskScore / 100 };
}

/**
 * Update all students' risk levels
 */
async function updateAllStudentsRisk() {
    try {
        console.log('🔄 Starting batch risk prediction...\n');

        // Get all students
        const students = await prisma.student.findMany();

        console.log(`Found ${students.length} students\n`);

        let updated = 0;
        let highRisk = 0;
        let mediumRisk = 0;
        let lowRisk = 0;

        for (const student of students) {
            const { level, probability } = calculateRiskLevel(student);

            await prisma.student.update({
                where: { id: student.id },
                data: {
                    dropoutRisk: level,
                    mlProbability: probability
                }
            });

            updated++;

            if (level === 'HIGH') highRisk++;
            else if (level === 'MEDIUM') mediumRisk++;
            else lowRisk++;

            if (updated % 50 === 0) {
                console.log(`✅ Updated ${updated}/${students.length} students...`);
            }
        }

        console.log(`\n✅ Successfully updated ${updated} students!`);
        console.log(`\n📊 Risk Distribution:`);
        console.log(`   🔴 HIGH Risk: ${highRisk}`);
        console.log(`   🟡 MEDIUM Risk: ${mediumRisk}`);
        console.log(`   🟢 LOW Risk: ${lowRisk}`);

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the update
updateAllStudentsRisk()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
