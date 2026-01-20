"use client";

import { useAuth } from "../hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ImageLabelsProps {
  imageId: string;
  labels: Label[];
  onLabelRemoved: () => void;
}

export default function ImageLabels({ imageId, labels, onLabelRemoved }: ImageLabelsProps) {
  const { getToken } = useAuth();

  const removeLabel = async (labelId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND}/images/${imageId}/labels/${labelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onLabelRemoved();
      } else {
        alert("Failed to remove label");
      }
    } catch (err) {
      console.error("Error removing label:", err);
      alert("Failed to remove label");
    }
  };

  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span key={label.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor: label.color }}>
          {label.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeLabel(label.id);
            }}
            className="hover:bg-black rounded-full p-0.5 transition-colors cursor-pointer"
            aria-label="Delete label"
            title="Delete label"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
