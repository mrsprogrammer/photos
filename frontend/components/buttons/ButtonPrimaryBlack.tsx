import React from "react";

interface ButtonPrimaryBlackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const ButtonPrimaryBlack: React.FC<ButtonPrimaryBlackProps> = ({ children, onClick, disabled = false, type = "button", className = "" }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${className}`}>
      {children}
    </button>
  );
};

export default ButtonPrimaryBlack;
