import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 
import "../src/index.css";
interface InputProps {
    title: string
    placeholder: string
    type: string
    required: boolean
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?:string
}

const Input = ({
  title,
  placeholder,
  required = false,
  type,
  value,
  onChange,
  error
}: InputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {title}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
      {error && <div className="mt-2 text-red-500 text-sm text-right">{error}</div>}
    </div>
  );
}

interface PasswordInputProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?:string
}

export function PasswordInput({
  title,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  error
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {title}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && <div className="mt-2 text-red-500 text-sm text-right">{error}</div>}

    </div>
  );
}
export default Input