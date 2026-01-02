"use client";

import { Github, Twitter, Linkedin, Heart, Mail, FileText, Bell, BarChart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8 py-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="text-xl font-bold text-white">JobMatcher</span>
              <span className="text-sm text-purple-400">AI</span>
            </div>
            <p className="text-sm">
              AI-powered job matching that connects your skills with the perfect opportunities. 100% free forever.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/yuanthio" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <Link href="#how-it-works" className="hover:text-white transition-colors">CV Upload & Parsing</Link>
              </li>
              <li className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-purple-400" />
                <Link href="#features" className="hover:text-white transition-colors">AI Matching</Link>
              </li>
              <li className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-400" />
                <Link href="#features" className="hover:text-white transition-colors">Job Alerts</Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <Link href="#features" className="hover:text-white transition-colors">Email Digests</Link>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">Sign Up Free</Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-white transition-colors">About Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get Started</h3>
            <p className="text-sm mb-4">
              Ready to find your perfect job match?
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Sign Up Free
              <Heart className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p>
              © {currentYear} JobMatcher AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Yuanthio Virly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}