import { Clock, Calendar } from 'lucide-react';
import Card from '../ui/Card';

const CounselingTimeline = ({ history }) => {
    return (
        <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <Clock size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Counseling History</h3>
            </div>

            <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-slate-100">
                {history && history.length > 0 ? (
                    history.map((session, index) => (
                        <div key={index} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm -ml-[5px]"></div>

                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(session.date).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                    {session.counselorName || 'Counselor'}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                <p className="text-sm text-slate-700 leading-relaxed">{session.notes || session.summary}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 pl-6">
                        <p className="text-slate-400 italic">No counseling sessions recorded.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CounselingTimeline;
