// job-matcher/src/components/NavbarDashboard.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import profile from "../assets/img/profile.jpg";
import logo from "../assets/img/job-matcher.png";
import LogoutButton from "./ButtonLogout";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  User,
  LogOut,
  Bell,
  Home,
  Menu,
  X,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function NavbarDashboard() {
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // Tambahkan state untuk track mount
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Set isMounted to true hanya di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    if (!isMounted) return; // Jangan jalankan di server

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMounted]);

  // Handle click outside
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMounted]);

  // Load favorite count - HANYA di client
  useEffect(() => {
    if (!isMounted) return;

    const loadFavoriteCount = async () => {
      try {
        const res = await fetch("/api/get-favorite-jobs?limit=1");
        const data = await res.json();

        if (data.success && data.pagination) {
          setFavoriteCount(data.pagination.total);
        }
      } catch (error) {
        console.error("Error loading favorite count:", error);
      }
    };

    loadFavoriteCount();

    // Listen for favorite updates
    const handleFavoriteUpdate = () => {
      loadFavoriteCount();
    };

    window.addEventListener("favoriteUpdated", handleFavoriteUpdate);

    return () => {
      window.removeEventListener("favoriteUpdated", handleFavoriteUpdate);
    };
  }, [isMounted]);

  // Fungsi untuk cek active link
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Jangan render apapun sampai mounted (untuk menghindari hydration mismatch)
  if (!isMounted) {
    return (
      <div className="h-16">
        {/* Placeholder dengan tinggi sama untuk menghindari layout shift */}
      </div>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/30 shadow-2xl"
            : "bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50"
        }`}
        style={{ padding: "12px 0" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div onClick={() => router.push("/dashboard")}>
                <Image 
                  src={logo} 
                  alt="Job Matcher" 
                  className="w-20" 
                  priority 
                  width={80}
                  height={32}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive("/dashboard")
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                href="/dashboard/alerts"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive("/dashboard/alerts")
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Bell className="w-4 h-4" />
                Job Alerts
              </Link>

              <Link
                href="/dashboard/favorites"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 relative ${
                  isActive("/dashboard/favorites")
                    ? "bg-gradient-to-r from-pink-600/20 to-rose-600/20 text-white border border-pink-500/30 shadow-lg shadow-pink-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Heart className="w-4 h-4" />
                Favorites
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full min-w-[18px] flex items-center justify-center">
                    {favoriteCount > 99 ? "99+" : favoriteCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-3 group"
                  aria-expanded={open}
                  aria-label="User menu"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image
                      src={profile}
                      alt="Profile"
                      width={42}
                      height={42}
                      className="relative rounded-full border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 object-cover"
                      priority
                    />
                  </div>

                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-white">
                      Welcome back
                    </p>
                    <p className="text-xs text-gray-400">View profile</p>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${
                      open ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border border-gray-700 py-2 z-50 bg-gray-900/95 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">
                        Your Account
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        user@example.com
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        router.push("/dashboard/profile");
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile & Settings
                    </button>

                    <button
                      onClick={() => {
                        router.push("/dashboard/favorites");
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors relative"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Favorite Jobs</span>
                      {favoriteCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full">
                          {favoriteCount > 99 ? "99+" : favoriteCount}
                        </span>
                      )}
                    </button>

                    <div className="my-1 border-t border-gray-700" />

                    <LogoutButton className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </LogoutButton>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors text-white hover:bg-white/10`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl shadow-2xl border-t border-gray-700 transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive("/dashboard")
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
                {isActive("/dashboard") && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                )}
              </Link>

              <Link
                href="/dashboard/alerts"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive("/dashboard/alerts")
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Job Alerts</span>
                {isActive("/dashboard/alerts") && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                )}
              </Link>

              <Link
                href="/dashboard/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive("/dashboard/favorites")
                    ? "bg-gradient-to-r from-pink-600/20 to-rose-600/20 text-white border border-pink-500/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Favorites</span>
                {favoriteCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full">
                    {favoriteCount > 99 ? "99+" : favoriteCount}
                  </span>
                )}
                {isActive("/dashboard/favorites") && (
                  <div className="ml-2 w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400" />
                )}
              </Link>

              <button
                onClick={() => {
                  router.push("/dashboard/profile");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-300 hover:text-white hover:bg-white/10`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile & Settings</span>
              </button>

              <LogoutButton
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onLogout={() => setIsMobileMenuOpen(false)}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </LogoutButton>
            </div>

            {/* Profile Info di Mobile */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="relative">
                  <Image
                    src={profile}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-blue-500/50"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Welcome back</p>
                  <p className="text-xs text-gray-400 truncate">
                    user@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Height Spacer */}
      <div className="h-16" />

      {/* Tambahkan CSS secara inline untuk menghindari hydration issue */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}