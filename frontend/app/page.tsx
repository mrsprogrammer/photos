"use client";

import Link from "next/link";
import { useRequireAuth } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";
import SignOutButton from "../components/SignOutButton";
import Sidebar from "../components/Sidebar";
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
          <svg className="animate-spin h-16 w-16 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black flex">
      <Sidebar onUploadClick={() => setIsModalOpen(true)} />
      <div className="flex-1 ml-20 md:ml-64 flex flex-col">
        <header className="fixed top-0 right-0 left-20 md:left-64 flex items-center justify-between md:justify-end px-4 py-2 md:py-4 border-b bg-white min-h-[104px] z-20">
          <Link href="/" className="md:hidden flex items-center overflow-hidden h-20">
            <img src="/logo.png" alt="PHOTO HUB" className="h-28 w-auto object-cover rounded-lg -my-1.5" />
          </Link>
          <div className="flex items-center gap-3">
            <SignOutButton />
          </div>
        </header>

        <main className="p-8 sm:p-12 flex-1 mt-[104px]">
          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-12 w-12 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
              </svg>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="whitespace-nowrap">No photos yet. Upload one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((image) => (
                <div key={image.id} className="w-full overflow-hidden aspect-[3/2] flex items-center justify-center border border-gray-300  rounded-lg">
                  <img src={image.url} alt={image.filename} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}
