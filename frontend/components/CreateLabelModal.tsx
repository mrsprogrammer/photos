"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Modal from "./Modal";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface CreateLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelCreated: () => void;
}

export default function CreateLabelModal({ isOpen, onClose, onLabelCreated }: CreateLabelModalProps) {
  const { getToken } = useAuth();
  const [labelName, setLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FF5733");
  const [isCreating, setIsCreating] = useState(false);

  const predefinedColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C", "#FF338C", "#33FFF5", "#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C", "#34495E", "#E67E22", "#95A5A6", "#D35400"];

  const handleCreate = async () => {
    if (!labelName.trim()) {
      alert("Please enter a label name");
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsCreating(true);
    try {
      const res = await fetch(`${BACKEND}/images/labels`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: labelName.toLowerCase().trim(),
          color: selectedColor,
        }),
      });

      if (res.ok) {
        setLabelName("");
        setSelectedColor("#FF5733");
        onLabelCreated();
        onClose();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create label");
      }
    } catch (err) {
      console.error("Error creating label:", err);
      alert("Failed to create label");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setLabelName("");
    setSelectedColor("#FF5733");
    onClose();
  };

  return (
    <Modal title="Create New Label" isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Label</h2>

        <div className="space-y-4">
          {/* Label Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label Name</label>
            <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleCreate()} placeholder="e.g. vacation, family, nature..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" disabled={isCreating} autoFocus />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-10 gap-2">
              {predefinedColors.map((color) => (
                <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-black ring-offset-2 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: color }} disabled={isCreating} aria-label={`Select color ${color}`} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: selectedColor }}>
                {labelName || "Label Name"}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleClose} disabled={isCreating} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={isCreating || !labelName.trim()} className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {isCreating ? "Creating..." : "Create Label"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
