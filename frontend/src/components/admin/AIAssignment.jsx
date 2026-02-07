import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Sparkles, Brain, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const PROBLEM_CATEGORIES = {
    academic_struggles: { label: 'Academic Struggles', color: 'bg-blue-100 text-blue-700' },
    family_issues: { label: 'Family Issues', color: 'bg-purple-100 text-purple-700' },
    financial_problems: { label: 'Financial Problems', color: 'bg-orange-100 text-orange-700' },
    health_concerns: { label: 'Health Concerns', color: 'bg-red-100 text-red-700' },
    mental_health: { label: 'Mental Health', color: 'bg-pink-100 text-pink-700' },
    bereavement: { label: 'Bereavement/Loss', color: 'bg-gray-100 text-gray-700' },
    social_isolation: { label: 'Social Isolation', color: 'bg-indigo-100 text-indigo-700' },
    attendance_issues: { label: 'Attendance Issues', color: 'bg-yellow-100 text-yellow-700' },
    substance_abuse: { label: 'Substance Abuse', color: 'bg-red-200 text-red-800' },
    career_confusion: { label: 'Career Confusion', color: 'bg-teal-100 text-teal-700' }
};

const AIAssignment = ({ studentId, studentName, onMentorSelect }) => {
    const { success, error } = useToast();
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);

            // Step 1: Analyze student problems
            const analyzeResponse = await aiAPI.analyzeStudent(studentId);
            const analysisData = analyzeResponse.data.data;

            setAnalysis(analysisData);

            // Step 2: Get mentor suggestions
            const suggestResponse = await aiAPI.suggestMentors(studentId);
            const suggestionsData = suggestResponse.data.data;

            setSuggestions(suggestionsData.suggestions);

            success('AI Analysis completed!');
        } catch (err) {
            error(err.response?.data?.message || 'Failed to analyze student');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={24} />
                    <h3 className="text-lg font-semibold text-slate-900">AI-Powered Assignment</h3>
                </div>

                {!analysis && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Brain size={18} />
                        {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                )}
            </div>

            {analyzing && (
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-secondary-600">Gemini AI is analyzing student problems...</p>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="space-y-4">
                    {/* Problem Categories */}
                    <div>
                        <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center gap-1">
                            <AlertCircle size={16} />
                            Detected Problems
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.categories.map((category) => {
                                const config = PROBLEM_CATEGORIES[category] || { label: category, color: 'bg-gray-100 text-gray-700' };
                                return (
                                    <span
                                        key={category}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                                    >
                                        {config.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div className="bg-white rounded-lg p-4 border border-secondary-200">
                        <p className="text-sm text-secondary-700">
                            <span className="font-semibold">AI Summary:</span> {analysis.summary}
                        </p>
                        {analysis.confidence && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 bg-secondary-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${analysis.confidence * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-secondary-600 font-medium">
                                    {Math.round(analysis.confidence * 100)}% confident
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mentor Suggestions */}
                    {suggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-secondary-700 mb-3 flex items-center gap-1">
                                <TrendingUp size={16} />
                                Recommended Mentors
                            </h4>
                            <div className="space-y-2">
                                {suggestions.slice(0, 5).map((mentor) => (
                                    <div
                                        key={mentor.id}
                                        onClick={() => onMentorSelect && onMentorSelect(mentor.id)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${mentor.isRecommended
                                                ? 'border-primary bg-primary-50 hover:border-primary-600'
                                                : 'border-secondary-200 bg-white hover:border-secondary-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900">{mentor.name}</p>
                                                    {mentor.isRecommended && (
                                                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium">
                                                            Top Match
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-secondary-600 mt-1">
                                                    {mentor.specialization || 'General Mentoring'} • {mentor.department || 'All Departments'}
                                                </p>
                                                {mentor.matchedCategories && mentor.matchedCategories.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {mentor.matchedCategories.map(cat => {
                                                            const config = PROBLEM_CATEGORIES[cat];
                                                            return config ? (
                                                                <span key={cat} className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                                                                    {config.label}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-secondary-500">Load</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {mentor.currentLoad}/{mentor.maxStudents}
                                                    </p>
                                                </div>
                                                {mentor.matchScore > 0 && (
                                                    <CheckCircle2 className="text-primary" size={20} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {suggestions.length === 0 && (
                        <div className="text-center py-4 text-secondary-500 text-sm">
                            No mentors available for assignment
                        </div>
                    )}

                    {/* Re-analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full px-4 py-2 border-2 border-primary text-primary hover:bg-primary-50 font-medium rounded-lg transition-colors"
                    >
                        Re-analyze with latest data
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIAssignment;
