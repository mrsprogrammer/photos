"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function UploadForm() {
  const { isAuthenticated, getUserId, getToken } = useAuth();
  const userId = getUserId();
  const token = getToken();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} disabled={uploading} />
        <button className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400" onClick={handleUpload} disabled={!file || uploading || !isAuthenticated()}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">✓ Upload successful!</div>}
    </div>
  );
}
