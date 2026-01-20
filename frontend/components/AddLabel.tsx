"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Modal from "./Modal";
import ButtonPrimaryBlack from "./buttons/ButtonPrimaryBlack";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface AddLabelProps {
  imageId: string;
  existingLabels: Label[];
  onLabelAdded: () => void;
}

export default function AddLabel({ imageId, existingLabels, onLabelAdded }: AddLabelProps) {
  const { getToken } = useAuth();
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const predefinedColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C", "#FF338C", "#33FFF5"];

  useEffect(() => {
    // Fetch labels only when modal is opened
    if (isOpen) {
      fetchAllLabels();
    }
  }, [isOpen]);

  const fetchAllLabels = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND}/images/labels/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const labels = await res.json();
        setAllLabels(labels);
      }
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
  };

  const addLabel = async (labelName: string) => {
    if (!labelName.trim()) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND}/images/${imageId}/labels`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: labelName.toLowerCase().trim(),
        }),
      });

      if (res.ok) {
        return true;
      } else {
        const error = await res.json();
        alert(error.message || "Failed to add label");
        return false;
      }
    } catch (err) {
      console.error("Error adding label:", err);
      alert("Failed to add label");
      return false;
    }
  };

  const addSelectedLabels = async () => {
    if (selectedLabels.length === 0) return;

    setIsAdding(true);
    try {
      // Add all selected labels
      const results = await Promise.all(selectedLabels.map((labelName) => addLabel(labelName)));

      if (results.every((success) => success)) {
        setSelectedLabels([]);
        setIsOpen(false);
        onLabelAdded();
        fetchAllLabels();
      }
    } finally {
      setIsAdding(false);
    }
  };

  const toggleLabelSelection = (labelName: string) => {
    setSelectedLabels((prev) => (prev.includes(labelName) ? prev.filter((name) => name !== labelName) : [...prev, labelName]));
  };

  const clearSelection = () => {
    setSelectedLabels([]);
  };

  const availableLabels = allLabels.filter((label) => !existingLabels.some((existing) => existing.id === label.id));

  const footer = (
    <>
      <ButtonSecondaryBlack size="medium" onClick={clearSelection} disabled={selectedLabels.length === 0 || isAdding}>
        Clear
      </ButtonSecondaryBlack>
      <ButtonPrimaryBlack size="medium" onClick={addSelectedLabels} disabled={selectedLabels.length === 0 || isAdding}>
        Add
      </ButtonPrimaryBlack>
    </>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-3 py-1 bg-black hover:bg-gray-800 rounded-full text-xs text-white transition-colors cursor-pointer">
        + Add Label
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Label" footer={footer}>
        {availableLabels.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">Select labels to add:</p>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <button key={label.id} onClick={() => toggleLabelSelection(label.name)} disabled={isAdding} className={`px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50 cursor-pointer ${selectedLabels.includes(label.name) ? "ring-2 ring-black ring-offset-2" : "hover:opacity-80"}`} style={{ backgroundColor: label.color, color: "#fff" }}>
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No more labels available. Create new labels in sidebar.</p>
        )}
      </Modal>
    </>
  );
}
