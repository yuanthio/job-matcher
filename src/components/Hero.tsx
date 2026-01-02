"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Upload, Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const texts = ["upload your CV", "get AI-powered matches", "receive job alerts"];
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setTypedText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setTypedText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      
      <div className="relative container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              100% Free • No Credit Card Required
            </div>
            
            <div className="space-y-4">
              <h5 className="text-lg md:text-xl font-medium text-blue-600">Smart Job Matching for Everyone 👋</h5>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Find jobs that{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {typedText}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                </span>
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 max-w-2xl">
              Upload your CV once. Our AI analyzes your skills and matches you with perfect job opportunities. 
              Get personalized recommendations and automatic alerts when new positions match your profile.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/auth/register" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-6 text-lg border-2 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            
            {/* Quick Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">CV Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Search className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">AI Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Smart Alerts</span>
              </div>
            </div>
          </div>
          
          {/* Right Animation */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-2 lg:p-4 border border-gray-100">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl rotate-12 shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI Match</span>
              </div>
              
              <DotLottieReact
                src="https://lottie.host/18c1c911-6f8d-45f0-8fa6-96486ece37c5/jusWreBJmL.lottie"
                loop
                autoplay
                className="w-full h-[400px] lg:h-[500px]"
              />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Match Score: 92%</p>
                    <p className="text-sm text-gray-600">Frontend Developer at TechCorp</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Perfect Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}