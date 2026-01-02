"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  Sparkles,
  Home,
  Target,
  Users,
  FileText,
  Bell,
  BarChart,
} from "lucide-react";
import logo from "../assets/img/job-matcher.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/", key: "home", icon: Home },
    {
      name: "How It Works",
      href: "#how-it-works",
      key: "how-it-works",
      icon: Sparkles,
    },
    { name: "Features", href: "#features", key: "features", icon: Target },
    { name: "About", href: "#about", key: "about", icon: Users },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700/30 py-3"
            : "bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 py-3"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={() => setActiveLink("home")}
            >
              <Image src={logo} alt="Job Matcher" className="w-20" priority />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <ul className="flex items-center gap-2">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setActiveLink(item.key)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 group rounded-xl ${
                        activeLink === item.key
                          ? "text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                      <span
                        className={`absolute -bottom-1 left-4 right-4 h-0.5 rounded-full ${
                          activeLink === item.key
                            ? "bg-gradient-to-r from-blue-400 to-purple-400"
                            : "bg-transparent group-hover:bg-blue-400/50"
                        } transition-all duration-300`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-700" />

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  Get Started Free
                  <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors text-white hover:bg-white/10"
              aria-label="Toggle menu"
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
        >
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => {
                    setActiveLink(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeLink === item.key
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {activeLink === item.key && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Height Spacer */}
      <div className="h-16" />
    </>
  );
}
