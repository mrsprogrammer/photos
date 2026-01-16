"use client";

import { useAuth } from "../hooks/useAuth";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

export default function SignOutButton() {
  const { signOut } = useAuth();

  return <ButtonSecondaryBlack onClick={signOut}>Sign&nbsp;out</ButtonSecondaryBlack>;
}
