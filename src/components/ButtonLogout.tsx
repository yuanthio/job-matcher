"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoutButtonProps {
  className?: string;
  children?: ReactNode;
  onLogout?: () => void;
}

export default function LogoutButton({ className = "", children, onLogout }: LogoutButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    onLogout?.();
  };

  return (
    <button onClick={logout} className={className}>
      {children || "Logout"}
    </button>
  );
}