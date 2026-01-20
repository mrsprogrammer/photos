import React from "react";

interface ButtonPrimaryBlackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  size?: "big" | "medium" | "small";
}

const ButtonPrimaryBlack: React.FC<ButtonPrimaryBlackProps> = ({ children, onClick, disabled = false, type = "button", className = "", size = "medium" }) => {
  const sizeClasses = {
    big: "py-2.5 px-4 text-base",
    medium: "py-1.5 px-3 text-sm",
    small: "py-1 px-2 text-xs",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`w-full ${sizeClasses[size]} rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${className}`}>
      {children}
    </button>
  );
};

export default ButtonPrimaryBlack;
