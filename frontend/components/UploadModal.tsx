"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import useClickOutside from "@/hooks/useClickOutside";
import ButtonPrimaryBlack from "./buttons/ButtonPrimaryBlack";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const { isAuthenticated, getUserId, getToken } = useAuth();
  const userId = getUserId();
  const token = getToken();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    if (!uploading) onClose();
  });

  async function handleUpload() {
    if (!file || !token || !isAuthenticated()) return;
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. request presigned url or upload endpoint
      const signRes = await fetch(`${BACKEND}/images/sign?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      if (!signRes.ok) throw new Error("Failed to get presigned URL");
      const { url, key } = await signRes.json();

      // 2a. For S3: PUT file to presigned URL
      // 2b. For local: POST file as multipart form data
      let uploadUrl = url;
      const isS3Url = url.includes("s3") || url.includes("amazonaws");

      if (isS3Url) {
        // S3: PUT with raw binary
        const putRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error("S3 upload failed");
      } else {
        // Local: POST as multipart form data
        const formData = new FormData();
        formData.append("image", file);
        formData.append("key", key);
        const postRes = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        if (!postRes.ok) throw new Error("Local upload failed");
      }

      // 3. save image metadata to database
      const saveRes = await fetch(`${BACKEND}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          s3Key: key,
          filename: file.name,
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save image metadata");

      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        setSuccess(false);
        onUploadSuccess?.();
        onClose();
      }, 1000);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.80)" }}>
      <div ref={modalRef} className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-lg w-full border-2 border-black">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-700">
          <h2 className="text-xl font-semibold">Upload Photo</h2>
          <button onClick={onClose} disabled={uploading} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} disabled={uploading} className="w-full cursor-pointer hover:underline" />
          </div>

          {error && <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">{error}</div>}

          {success && <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-sm">✓ Upload successful!</div>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6">
          <div className="flex-1">
            <ButtonSecondaryBlack onClick={onClose} disabled={uploading}>
              Cancel
            </ButtonSecondaryBlack>
          </div>
          <div className="flex-1">
            <ButtonPrimaryBlack onClick={handleUpload} disabled={!file || uploading || !isAuthenticated()}>
              {uploading ? "Uploading..." : "Upload"}
            </ButtonPrimaryBlack>
          </div>
        </div>
      </div>
    </div>
  );
}
