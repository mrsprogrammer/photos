"use client";

import { useRequireAuth } from "../hooks/useAuth";
import Avatar from "./../components/Avatar";

export default function Home() {
  const { checking } = useRequireAuth();

  const placeholders = Array.from({ length: 16 }).map((_, i) => i + 1);

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
        <h1 className="text-lg sm:text-xl font-semibold">My Photos</h1>
        <div className="flex items-center gap-3">
          <Avatar />
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {placeholders.map((i) => (
            <div key={i} className="w-full rounded-md overflow-hidden shadow-sm bg-gray-200 flex items-center justify-center text-gray-500 h-36 sm:h-40 md:h-44 lg:h-48">
              Photo {i}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
