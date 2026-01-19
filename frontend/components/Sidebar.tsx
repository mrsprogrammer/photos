"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

interface SidebarProps {
  onUploadClick: () => void;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Container - visible only on small screens */}
      <div className="fixed top-0 left-0 w-20 h-screen bg-black z-50 md:hidden flex flex-col items-center pt-6">
        <button onClick={toggleSidebar} className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Toggle menu">
          <span className={`w-6 h-0.5 bg-black transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`w-6 h-0.5 bg-black transition-all ${isOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-6 h-0.5 bg-black transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </div>

      {/* Overlay - visible only on small screens when sidebar is open */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-full md:w-64 flex flex-col items-center gap-12 border-r-2 border-black px-6 bg-white z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center w-full h-26">
          <img src="/logo.png" alt="PHOTO HUB" className="w-32 h-auto rounded-lg overflow-hidden" />
        </Link>

        {/* Upload Button */}
        <ButtonSecondaryBlack
          onClick={() => {
            onUploadClick();
            setIsOpen(false);
          }}
        >
          + Upload photos
        </ButtonSecondaryBlack>
      </div>
    </>
  );
}
