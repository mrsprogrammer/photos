"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import useClickOutside from "../hooks/useClickOutside";
import { useAuth } from "../hooks/useAuth";

export default function Avatar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-700">U</span>
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Mobile: full screen menu (visible on small screens) */}
          <div className="sm:hidden fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-700">U</span>
                <span className="font-medium">Account</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                Close
              </button>
            </div>

            <div className="p-4 flex-1">
              {!isAuthenticated() ? (
                <Link href="/signin" className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                  Sign in
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/upload" className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                    Upload photos
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: small dropdown (hidden on small screens) */}
          <div className="hidden sm:block origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              {!isAuthenticated() ? (
                <Link href="/signin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign in
                </Link>
              ) : (
                <>
                  <Link href="/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Upload photos
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
