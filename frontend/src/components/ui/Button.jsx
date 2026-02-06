// Reusable Button component
export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
