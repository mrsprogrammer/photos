"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
function getTokenFromResponse(data: any) {
  return data?.accessToken || data?.access_token || data?.token || data?.jwt;
}

export function useAuth() {
  const router = useRouter();

  const signIn = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || `Sign in failed (${res.status})`);
    }

    const data = await res.json().catch(() => ({}));
    const token = getTokenFromResponse(data);
    if (!token) throw new Error("Authentication token not returned");

    localStorage.setItem("token", token);
    return token;
  }, []);

  const signUp = useCallback(
    async (username: string, password: string) => {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.status !== 201) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Sign up failed (${res.status})`);
      }

      // try to sign in automatically
      try {
        const token = await signIn(username, password);
        return token;
      } catch (err) {
        // if signin fails, surface that error
        throw err;
      }
    },
    [signIn]
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/signin");
  }, [router]);

  const isAuthenticated = useCallback(() => {
    const t = localStorage.getItem("token");
    return !!t;
  }, []);

  return { signIn, signUp, signOut, isAuthenticated } as const;
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // redirect inside effect to comply with hooks rules and avoid running during render
  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const res = await fetch(`${API}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          // backend doesn't expose /auth/me — fall back to local token existence
          if (isAuthenticated()) {
            setChecking(false);
            return;
          } else {
            router.push("/signin");
            return;
          }
        }

        if (!res.ok) {
          // invalid token or other error -> remove token and redirect
          localStorage.removeItem("token");
          router.push("/signin");
          return;
        }

        // valid token
        setChecking(false);
      } catch (err) {
        // network/error - try fallback to local token, otherwise redirect
        if (isAuthenticated()) {
          setChecking(false);
        } else {
          localStorage.removeItem("token");
          router.push("/signin");
        }
      }
    })();
  }, [isAuthenticated, router]);

  return { checking } as const;
}
