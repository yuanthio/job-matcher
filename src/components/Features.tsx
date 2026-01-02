"use client";

import { FileSearch, Target, Bell, Zap, Shield, TrendingUp, Edit, Search, Mail, BarChart } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: FileSearch,
    title: "CV Upload & Parsing",
    description: "Upload your PDF CV and let our AI extract skills, experience, and education automatically with 99% accuracy.",
    details: [
      "PDF format support",
      "Automatic skill extraction",
      "Edit parsed data if needed",
      "Save to your profile"
    ],
    color: "blue"
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    description: "Get personalized job recommendations based on your skills, experience, and preferences.",
    details: [
      "Match scores (0-100%)",
      "Top 5-10 daily matches",
      "Sorted by relevance",
      "Visual match indicators"
    ],
    color: "purple"
  },
  {
    icon: BarChart,
    title: "Match Analysis",
    description: "Understand why you match with detailed skill analysis and gap identification.",
    details: [
      "Matched skills (green)",
      "Missing skills (red)",
      "Skill gap suggestions",
      "Improvement tips"
    ],
    color: "green"
  },
  {
    icon: Bell,
    title: "Job Alerts",
    description: "Never miss an opportunity with automated alerts for new matching jobs.",
    details: [
      "Daily/Weekly digests",
      "Email notifications",
      "Customizable frequency",
      "Pause anytime"
    ],
    color: "orange"
  },
  {
    icon: Edit,
    title: "Profile Management",
    description: "Easily update your skills, experience, and job preferences as you grow.",
    details: [
      "Edit skills manually",
      "Update job preferences",
      "Add new experiences",
      "Real-time updates"
    ],
    color: "indigo"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is secure and private. We never share your information with third parties.",
    details: [
      "Encrypted storage",
      "GDPR compliant",
      "No data selling",
      "Full control"
    ],
    color: "gray"
  }
];

export default function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      green: "from-green-500 to-emerald-500",
      orange: "from-orange-500 to-red-500",
      indigo: "from-indigo-500 to-blue-500",
      gray: "from-gray-600 to-gray-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/5" />
      
      <div className="relative container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powerful Features
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Land Your Dream Job
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Our platform combines AI intelligence with user-friendly tools to streamline your job search.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:border-transparent
                ${hoveredIndex === index ? 'scale-105 z-10' : 'hover:scale-[1.02]'}`}
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getColorClasses(feature.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${getColorClasses(feature.color)} p-3 mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              
              {/* Features List */}
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              
              {/* Hover Indicator */}
              <div className={`absolute bottom-6 left-8 right-8 h-0.5 bg-gradient-to-r ${getColorClasses(feature.color)} opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100`} />
            </div>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {[
            { value: "99%", label: "Parsing Accuracy", icon: "📊" },
            { value: "5-10", label: "Daily Matches", icon: "🎯" },
            { value: "24/7", label: "AI Analysis", icon: "🤖" },
            { value: "100%", label: "Free Forever", icon: "🎁" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 text-center group hover:shadow-xl transition-all duration-300"
            >
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}