import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY is missing in environment variables');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');

/**
 * Generate a personalized improvement plan for a student
 * @param {object} student - Student profile data including academic stats
 * @returns {Promise<object>} - Structured improvement plan
 */
export const generateStudentImprovementPlan = async (student) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const studentContext = `
        Student Name: ${student.name}
        Department: ${student.department}
        Semester: ${student.semester}
        Current CGPA: ${student.currentCGPA}
        Attendance: ${student.attendancePercent}%
        Risk Level: ${student.dropoutRisk}
        Counselor Notes: ${student.counselorNotes || 'None'}
        Family Income: ${student.familyIncome || 'Unknown'}
        Disciplinary Issues: ${student.disciplinaryIssues || 0}
        Probable Issues: ${student.problemCategories || 'None'}
        `;

        const prompt = `You are an expert academic counselor and student mentor. Create a detailed, personalized improvement plan for the following student:

        ${studentContext}

        Please provide a structured response in the following JSON format (output ONLY valid JSON):
        {
            "academic_guidance": [
                "Specific step 1 to improve grades",
                "Specific step 2..."
            ],
            "behavioral_guidance": [
                "Advice on attendance/behavior",
                "Social engagement tips..."
            ],
            "mentor_focus_areas": [
                "Key topic 1 for mentor to discuss",
                "Key topic 2..."
            ],
            "resource_recommendations": [
                "Book/Video/Technique recommendation 1",
                "Recommendation 2..."
            ],
            "motivational_message": "A short, encouraging message for the student"
        }
        
        Tailor the advice to their specific department (${student.department}) and risk factors. Be practical and empathetic.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean markdown
        // Clean markdown and extract JSON
        let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Find JSON object if there's extra text
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        try {
            return JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Gemini Plan JSON Parse Error:', parseError);
            console.error('Raw Gemini Response:', text);

            // Return fallback structure to avoid crashing
            return {
                academic_guidance: ["Review course materials regularly", "Seek help from professors during office hours"],
                behavioral_guidance: ["Maintain consistent attendance", "Participate more in class discussions"],
                mentor_focus_areas: ["Discuss current academic challenges", "Set achievable short-term goals"],
                resource_recommendations: ["Visit the learning center", "Join a study group"],
                motivational_message: "Consistency is key to success. Keep moving forward!"
            };
        }

    } catch (error) {
        console.error('Gemini Plan Generation Error:', error);
        throw new Error(`Failed to generate improvement plan: ${error.message}`);
    }
};

/**
 * Analyze student problems from counselor notes using Gemini AI
 * @param {string} counselorNotes - The counselor's notes about the student
 * @returns {Promise<object>} - Analysis result with problem categories and summary
 */
export const analyzeStudentProblems = async (counselorNotes) => {
    try {
        if (!counselorNotes || counselorNotes.trim().length === 0) {
            return {
                categories: [],
                summary: 'No issues documented',
                confidence: 0
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an expert student counselor analyzing student problems. Based on the following counselor notes, identify and categorize the student's problems.

Counselor Notes:
"${counselorNotes}"

Please analyze and respond in the following JSON format (output ONLY valid JSON, no additional text):
{
  "categories": ["category1", "category2", ...],
  "summary": "brief summary of issues (1-2 sentences)",
  "confidence": 0.0 to 1.0,
  "reasoning": "why you chose these categories"
}

Available categories (use exact names):
- academic_struggles: Poor grades, difficulty understanding subjects, exam failures
- family_issues: Family conflicts, divorce, domestic problems  
- financial_problems: Unable to pay fees, family financial crisis
- health_concerns: Physical health issues, chronic illness
- mental_health: Depression, anxiety, stress, mental health struggles
- bereavement: Death of family member, grief, loss
- social_isolation: Loneliness, lack of friends, social withdrawal
- attendance_issues: Frequent absences, late arrivals
- substance_abuse: Alcohol, drugs, addiction issues
- career_confusion: Unsure about career path, lack of direction

Return only categories that clearly apply based on the notes. Be specific and accurate.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const analysis = JSON.parse(text);

        return {
            categories: analysis.categories || [],
            summary: analysis.summary || 'Analysis completed',
            confidence: analysis.confidence || 0.5,
            reasoning: analysis.reasoning || ''
        };

    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw new Error(`Failed to analyze student problems: ${error.message}`);
    }
};

/**
 * Suggest mentors based on problem categories
 * @param {array} problemCategories - Array of problem category IDs
 * @param {array} availableMentors - Array of mentor objects with specializations
 * @returns {array} - Sorted array of mentor recommendations
 */
export const suggestMentors = (problemCategories, availableMentors) => {
    // Define category to specialization mapping
    const categorySpecializationMap = {
        academic_struggles: ['Academic Support', 'General Mentoring'],
        family_issues: ['Family Counseling', 'General Mentoring'],
        financial_problems: ['Financial Guidance', 'General Mentoring'],
        health_concerns: ['Mental Health Support', 'General Mentoring'],
        mental_health: ['Mental Health Support', 'Counseling'],
        bereavement: ['Grief Counseling', 'Mental Health Support'],
        social_isolation: ['Social Skills', 'General Mentoring'],
        attendance_issues: ['Academic Support', 'General Mentoring'],
        substance_abuse: ['Addiction Counseling', 'Mental Health Support'],
        career_confusion: ['Career Guidance', 'Academic Support']
    };

    // Score each mentor
    const mentorScores = availableMentors.map(mentor => {
        let score = 0;
        const matchedCategories = [];

        problemCategories.forEach(category => {
            const preferredSpecializations = categorySpecializationMap[category] || [];

            preferredSpecializations.forEach(spec => {
                if (mentor.specialization && mentor.specialization.includes(spec)) {
                    score += 10; // High score for exact match
                    matchedCategories.push(category);
                }
            });
        });

        // Give lower score for general mentoring if no specific match
        if (score === 0 && mentor.specialization && mentor.specialization.includes('General Mentoring')) {
            score = 3;
        }

        return {
            ...mentor,
            matchScore: score,
            matchedCategories,
            isRecommended: score > 5
        };
    });

    // Sort by score (highest first)
    return mentorScores.sort((a, b) => b.matchScore - a.matchScore);
};

export default {
    analyzeStudentProblems,
    suggestMentors,
    generateStudentImprovementPlan
};
