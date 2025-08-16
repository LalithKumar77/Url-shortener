import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const InputField = ({ 
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  autoComplete
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPasswordToggle && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full pl-12 pr-12 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400 ${
            error 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

InputField.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  showPasswordToggle: PropTypes.bool,
  onTogglePassword: PropTypes.func,
  showPassword: PropTypes.bool,
  autoComplete: PropTypes.string
};

export default InputField;