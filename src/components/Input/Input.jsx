// Input component - text, email, password, number, textarea; label, error, required
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  helpText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const handleTogglePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`input-wrap ${error ? 'input-wrap--error' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-field-wrap">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className="input-field input-field--textarea"
            {...props}
          />
        ) : (
          <input
            id={name}
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-field ${isPasswordField ? 'input-field--password' : ''}`}
            {...props}
          />
        )}
        {isPasswordField && (
          <button
            type="button"
            className="input-eye"
            onClick={handleTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {helpText && !error && <p className="input-help">{helpText}</p>}
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export default Input;
