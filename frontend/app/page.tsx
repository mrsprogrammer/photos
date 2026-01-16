"use client";

import Link from "next/link";
import { useRequireAuth } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";
import SignOutButton from "../components/SignOutButton";
import UploadModal from "./../components/UploadModal";
import { useEffect, useState } from "react";
import ButtonPrimaryBlack from "@/components/buttons/ButtonPrimaryBlack";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface Image {
  id: string;
  filename: string;
  s3Key: string;
  uploadedAt: string;
  url: string;
}

export default function Home() {
  const { checking } = useRequireAuth();
  const { getToken } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (checking) return; // wait for auth check

    const token = getToken();
    if (!token) return;

    const fetchImages = async () => {
      try {
        const res = await fetch(`${BACKEND}/images`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch images");
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [checking, getToken]);

  const handleUploadSuccess = () => {
    // Refresh images after successful upload
    if (checking) return;

    const token = getToken();
    if (!token) return;

    const fetchImages = async () => {
      try {
        const res = await fetch(`${BACKEND}/images`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch images");
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black flex items-center justify-center">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <Link className="text-center" href="/">
          <img src="/logo.png" alt="PHOTO HUB" className="h-34 w-auto mx-auto rounded-lg" />
        </Link>
        <div className="flex items-center gap-3">
          <ButtonPrimaryBlack onClick={() => setIsModalOpen(true)}>Upload</ButtonPrimaryBlack>
          <SignOutButton />
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="whitespace-nowrap">No photos yet. Upload one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="w-full rounded-md overflow-hidden shadow-sm bg-gray-200 h-36 sm:h-40 md:h-44 lg:h-48">
                <img src={image.url} alt={image.filename} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}
