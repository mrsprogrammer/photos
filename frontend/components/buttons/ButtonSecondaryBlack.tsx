import React from "react";

interface ButtonSecondaryBlackProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const ButtonSecondaryBlack: React.FC<ButtonSecondaryBlackProps> = ({ children, onClick, disabled = false, type = "button", className = "" }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition cursor-pointer bg-zinc-50 ${className}`}>
      {children}
    </button>
  );
};

export default ButtonSecondaryBlack;
