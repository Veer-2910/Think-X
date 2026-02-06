// Reusable Badge component for risk levels
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    default: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
