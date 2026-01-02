"use client";

import Image from "next/image";
import profile from "../assets/img/profile.jpg";
import Link from "next/link";
import { Quote, Award, Users, Globe, Target, Heart } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="relative px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      
      <div className="relative container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Making Job Search{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Smarter & Fairer
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe everyone deserves to find work they love without the stress of endless searching. 
            Our AI-powered platform puts your skills at the center and connects you with opportunities that truly match.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content - Founder Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 lg:p-10 shadow-2xl overflow-hidden group">
              {/* Gradient Overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative">
                <Quote className="w-12 h-12 text-blue-400 mb-6 opacity-50" />
                
                <blockquote className="text-xl lg:text-2xl text-white font-medium leading-relaxed mb-8">
                  "Job searching shouldn't feel like finding a needle in a haystack. I built JobMatcher to make the 
                  process intelligent, personalized, and accessible to everyone - completely free."
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur" />
                    <Image
                      src={profile}
                      alt="Founder"
                      width={70}
                      height={70}
                      className="relative rounded-full border-4 border-gray-800 object-cover w-16 h-16 lg:w-20 lg:h-20"
                    />
                  </div>
                  
                  <div>
                    <Link
                      href="https://yuanthio.github.io/"
                      className="text-white font-bold text-lg lg:text-xl hover:text-blue-300 transition-colors inline-flex items-center gap-2 group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Yuanthio Virly
                      <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400">Founder & Developer</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <span className="text-blue-400 font-medium">JobMatcher AI</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
            </div>
          </div>
          
          {/* Right Content - Values */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: Target,
                  title: "Precision Matching",
                  description: "AI that understands your unique skills and career goals.",
                  color: "text-blue-600"
                },
                {
                  icon: Users,
                  title: "User-First Design",
                  description: "Built for job seekers, by someone who's been there.",
                  color: "text-purple-600"
                },
                {
                  icon: Globe,
                  title: "Accessible to All",
                  description: "Completely free, no hidden costs, no credit card required.",
                  color: "text-green-600"
                },
                {
                  icon: Award,
                  title: "Continuous Improvement",
                  description: "Regular updates based on user feedback and needs.",
                  color: "text-orange-600"
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${value.color.replace('text', 'bg')}/10 flex items-center justify-center mb-4`}>
                    <value.icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-bold text-gray-900 text-lg mb-3">Why JobMatcher is Different</h4>
              <ul className="space-y-3">
                {[
                  "AI-powered matching with detailed skill analysis",
                  "No manual searching - jobs come to you",
                  "Completely free - now and forever",
                  "Privacy focused - your data stays yours",
                  "Actionable insights to improve your matches"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}