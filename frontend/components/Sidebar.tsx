"use client";

import Link from "next/link";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

interface SidebarProps {
  onUploadClick: () => void;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white flex flex-col items-center pt-4 gap-12 border-r-2 border-black px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center w-full">
        <img src="/logo.png" alt="PHOTO HUB" className="w-32 h-auto rounded-lg" />
      </Link>

      {/* Upload Button */}
      <button onClick={onUploadClick} className="w-full px-4 py-3 bg-black border-2 border-black text-white rounded-lg hover:bg-white hover:text-black transition cursor-pointer font-semibold">
        + Upload photo
      </button>
    </div>
  );
}
