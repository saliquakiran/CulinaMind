import { useState, JSX, FC, ChangeEvent } from "react";

interface InputProps {
  label: string;
  type?: "text" | "password";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  eyeIcon?: JSX.Element;
  eyeSlashIcon?: JSX.Element;
  placeholder?: string;
  className?: string;
}

const Input: FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  eyeIcon,
  eyeSlashIcon,
  placeholder = "",
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => !value && setIsFocused(false);

  const isPassword = type === "password";

  return (
    <div className={`relative w-full ${className}`}>
      <label
        className={`absolute left-3 p-2 font-league-spartan rounded-full transform -translate-y-1/2 transition-all duration-300 ${
          isFocused || value
            ? "-top-[4%] text-xs text-primary bg-white"
            : "text-gray-500 top-[55%] bg-transparent"
        }`}
      >
        {label}
      </label>
      <input
        type={isPassword && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? placeholder : ""}
        className={`w-full sm:pt-5 pt-4 sm:text-base text-sm sm:placeholder:text-base placeholder:text-sm pb-2.5 focus:ouline-none font-league-spartan ring-[1px] focus:ring-2 px-3 rounded-md outline-none focus:ring-primary`}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? eyeSlashIcon : eyeIcon}
        </button>
      )}
    </div>
  );
};

export default Input;
