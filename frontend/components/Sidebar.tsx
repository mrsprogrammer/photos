"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";
import ButtonPrimaryBlack from "./buttons/ButtonPrimaryBlack";
import CreateLabelModal from "./CreateLabelModal";
import { useAuth } from "../hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  onUploadClick: () => void;
  selectedLabels: string[];
  onLabelToggle: (labelName: string) => void;
  onClearFilters: () => void;
}

export default function Sidebar({ onUploadClick, selectedLabels, onLabelToggle, onClearFilters }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateLabelModalOpen, setIsCreateLabelModalOpen] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND}/images/labels/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLabels(data);
      }
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
  };

  const handleLabelCreated = () => {
    fetchLabels();
  };

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
      <div className={`fixed left-20 md:left-0 top-0 h-screen w-[calc(100%-80px)] md:w-64 flex flex-col items-start gap-6 border-r-2 border-black px-6 pt-0 pb-6 bg-white z-40 transition-transform duration-300 overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center w-full">
          <img src="/logo.png" alt="PHOTO HUB" className="w-32 h-auto rounded-lg overflow-hidden" />
        </Link>

        {/* Upload Button */}
        <ButtonPrimaryBlack
          size="big"
          onClick={() => {
            onUploadClick();
            setIsOpen(false);
          }}
        >
          + Upload photos
        </ButtonPrimaryBlack>

        {/* Labels Section */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-700">Labels:</h3>
            <div className="flex gap-2">
              {selectedLabels.length > 0 && (
                <ButtonSecondaryBlack
                  size="medium"
                  onClick={() => {
                    onClearFilters();
                    setIsOpen(false);
                  }}
                >
                  Clear
                </ButtonSecondaryBlack>
              )}
              <ButtonPrimaryBlack size="medium" onClick={() => setIsCreateLabelModalOpen(true)}>
                + New
              </ButtonPrimaryBlack>
            </div>
          </div>

          {/* Label List with checkboxes */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {labels.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No labels yet</p>
            ) : (
              labels.map((label) => (
                <button key={label.id} onClick={() => onLabelToggle(label.name)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${selectedLabels.includes(label.name) ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"}`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }}></span>
                    <span className="text-sm flex-1">{label.name}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateLabelModal isOpen={isCreateLabelModalOpen} onClose={() => setIsCreateLabelModalOpen(false)} onLabelCreated={handleLabelCreated} />
    </>
  );
}
