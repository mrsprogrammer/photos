import { useState } from "react";
import { useAuth } from "./useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface UploadProgress {
  current: number;
  total: number;
}

export function useImageUpload() {
  const { isAuthenticated, getUserId, getToken } = useAuth();
  const userId = getUserId();
  const token = getToken();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const uploadFiles = async (files: File[], onSuccess?: () => void) => {
    if (files.length === 0 || !token || !isAuthenticated()) return false;

    setUploading(true);
    setError(null);
    setSuccess(false);
    setSuccessCount(0);
    setUploadProgress({ current: 0, total: files.length });

    let uploadedCount = 0;
    let limitReached = false;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

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
          if (!signRes.ok) throw new Error(`Failed to get presigned URL for ${file.name}`);
          const { url, key } = await signRes.json();

          // 2a. For S3: PUT file to presigned URL
          // 2b. For local: POST file as multipart form data
          const isS3Url = url.includes("s3") || url.includes("amazonaws");

          if (isS3Url) {
            // S3: PUT with raw binary
            const putRes = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type || "application/octet-stream" },
              body: file,
            });
            if (!putRes.ok) throw new Error(`S3 upload failed for ${file.name}`);
          } else {
            // Local: POST as multipart form data
            const formData = new FormData();
            formData.append("image", file);
            formData.append("key", key);
            const postRes = await fetch(url, {
              method: "POST",
              body: formData,
            });
            if (!postRes.ok) throw new Error(`Local upload failed for ${file.name}`);
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

          if (!saveRes.ok) {
            const errorData = await saveRes.json().catch(() => null);
            const errorMessage = errorData?.message || `Failed to save image metadata for ${file.name}`;

            // Check if it's a limit error
            if (errorMessage.includes("Image limit reached")) {
              limitReached = true;
              setError(errorMessage);
              break; // Stop uploading more files
            }

            throw new Error(errorMessage);
          }

          uploadedCount++;
          setSuccessCount(uploadedCount);
        } catch (fileError: any) {
          // If it's not a limit error, throw it
          if (!limitReached) {
            throw fileError;
          }
        }
      }

      if (uploadedCount > 0) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 3000);
      }

      return uploadedCount > 0;
    } catch (e: any) {
      if (!limitReached) {
        setError(e.message || String(e));
      }
      return uploadedCount > 0;
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setSuccessCount(0);
    setUploadProgress({ current: 0, total: 0 });
  };

  return {
    uploading,
    uploadProgress,
    error,
    success,
    successCount,
    uploadFiles,
    resetState,
    isAuthenticated: isAuthenticated(),
  };
}
