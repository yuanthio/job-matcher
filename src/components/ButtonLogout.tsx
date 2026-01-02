"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoutButtonProps {
  className?: string;
  children?: ReactNode;
}

export default function LogoutButton({ className = "", children }: LogoutButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button onClick={logout} className={className}>
      {children || "Logout"}
    </button>
  );
}