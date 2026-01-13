"use client";

import UploadForm from "../../components/UploadForm";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-lg sm:text-xl font-semibold">Upload Image</h1>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Upload a photo</h2>
          <UploadForm />
        </div>
      </main>
    </div>
  );
}
