"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu, FiLogOut, FiUser, FiShoppingCart } from "react-icons/fi";
import { apiClient } from "../../lib/api";
import { removeToken } from "../../lib/auth";
import { Button } from "../ui/button";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      removeToken();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-accent/10 rounded-lg"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-accent">Billing App</h2>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/sale">
          <Button variant="ghost" size="icon">
            <FiShoppingCart className="w-5 h-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <FiUser className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoading}
          className="text-error hover:text-red-700"
        >
          <FiLogOut className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}

