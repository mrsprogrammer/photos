"use client";

import { RefObject, useEffect } from "react";

// Accept refs that may be nullable (RefObject<T | null>)
export default function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutside: () => void) {
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        onOutside();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onOutside]);
}
