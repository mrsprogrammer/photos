"use client";

import { useRef, ReactNode } from "react";
import useClickOutside from "@/hooks/useClickOutside";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeDisabled?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, footer, closeDisabled = false }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    if (!closeDisabled) onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.80)" }}>
      <div ref={modalRef} className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-lg w-full border-2 border-black relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-700">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} disabled={closeDisabled} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">{children}</div>

        {/* Footer */}
        {footer && <div className="flex gap-3 p-6">{footer}</div>}
      </div>
    </div>
  );
}
