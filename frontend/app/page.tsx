"use client";

import Link from "next/link";
import { useRequireAuth } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";
import SignOutButton from "../components/SignOutButton";
import Sidebar from "../components/Sidebar";
import UploadModal from "./../components/UploadModal";
import ConfirmDeleteModal from "./../components/ConfirmDeleteModal";
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
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

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

  const handleDeleteImage = async (imageId: string) => {
    const token = getToken();
    if (!token) return;

    setDeletingImageId(imageId);
    try {
      const res = await fetch(`${BACKEND}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete image");

      // Remove image from state
      setImages(images.filter((img) => img.id !== imageId));
      setImageToDelete(null);
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image");
    } finally {
      setDeletingImageId(null);
    }
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
                <div key={image.id} className="relative w-full overflow-hidden aspect-[3/2] flex items-center justify-center border border-gray-300 rounded-lg group">
                  <img src={image.url} alt={image.filename} className="w-full h-full object-contain" />
                  <button onClick={() => setImageToDelete(image.id)} disabled={deletingImageId === image.id} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" aria-label="Delete photo">
                    {deletingImageId === image.id ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
      <ConfirmDeleteModal isOpen={imageToDelete !== null} onClose={() => setImageToDelete(null)} onConfirm={() => imageToDelete && handleDeleteImage(imageToDelete)} isDeleting={deletingImageId !== null} />
    </div>
  );
}
