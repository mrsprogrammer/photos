"use client";

import React, { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import Modal from "./Modal";
import ButtonPrimaryBlack from "./buttons/ButtonPrimaryBlack";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { uploading, uploadProgress, error, success, successCount, uploadFiles, resetState, isAuthenticated } = useImageUpload();

  const handleUpload = async () => {
    const result = await uploadFiles(files, () => {
      onUploadSuccess?.();
      handleClose();
    });
    if (result) {
      setFiles([]);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      resetState();
      onClose();
    }
  };

  const footer = (
    <>
      <div className="flex-1">
        <ButtonSecondaryBlack onClick={handleClose} disabled={uploading}>
          Cancel
        </ButtonSecondaryBlack>
      </div>
      <div className="flex-1">
        <ButtonPrimaryBlack onClick={handleUpload} disabled={files.length === 0 || uploading || !isAuthenticated}>
          {uploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : "Upload"}
        </ButtonPrimaryBlack>
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Photo" footer={footer} closeDisabled={uploading}>
      <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8">
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])} disabled={uploading} className="w-full cursor-pointer hover:underline" />
      </div>

      {files.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {files.length} file{files.length !== 1 ? "s" : ""}
        </div>
      )}

      {uploading && uploadProgress.total > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Uploading {uploadProgress.current} of {uploadProgress.total}...
        </div>
      )}

      {success && successCount > 0 && (
        <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-sm">
          ✓ Successfully uploaded {successCount} {successCount === 1 ? "photo" : "photos"}!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
          {error}
          {successCount > 0 && (
            <div className="mt-2 text-sm">
              {successCount} {successCount === 1 ? "photo was" : "photos were"} uploaded successfully before the limit was reached.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
