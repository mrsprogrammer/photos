import React from "react";

interface ButtonSecondaryBlackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  size?: "big" | "medium" | "small";
}

const ButtonSecondaryBlack: React.FC<ButtonSecondaryBlackProps> = ({ children, onClick, disabled = false, type = "button", className = "", size = "medium" }) => {
  const sizeClasses = {
    big: "px-4 py-2 text-base",
    medium: "px-3 py-1.5 text-sm",
    small: "px-2 py-1 text-xs",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${sizeClasses[size]} border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition cursor-pointer bg-zinc-50 ${className}`}>
      {children}
    </button>
  );
};

export default ButtonSecondaryBlack;
