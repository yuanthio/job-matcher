"use client";

import { Upload, Target, Bell, BarChart, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your CV",
      description: "Upload your PDF CV. Our AI extracts skills, experience, and education automatically.",
      features: ["PDF format only", "99% parsing accuracy", "Edit extracted data"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02",
      icon: Target,
      title: "Set Your Preferences",
      description: "Tell us your target role, location preferences, and remote work options.",
      features: ["Job title matching", "Location filters", "Remote/hybrid preferences"],
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      icon: BarChart,
      title: "Get AI-Powered Matches",
      description: "Receive job recommendations with match scores and detailed analysis.",
      features: ["5-10 daily matches", "Visual match indicators", "Skill gap analysis"],
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "04",
      icon: Bell,
      title: "Receive Smart Alerts",
      description: "Get notified about new opportunities matching your criteria.",
      features: ["Daily/Weekly digests", "Email notifications", "Pause anytime"],
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="how-it-works" className="relative px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30" />
      
      <div className="relative container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How JobMatcher{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Works For You
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Get matched with your dream job in minutes. No endless searching, no manual applications.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="relative bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Step Number */}
                <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} p-3 mb-6 ml-auto`}>
                  <step.icon className="w-full h-full text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6">{step.description}</p>
                
                {/* Features */}
                <ul className="space-y-2">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${step.color} bg-opacity-10 flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 group-last:hidden" />
              )}
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Ready to start? It's completely free!</span>
          </div>
        </div>
      </div>
    </section>
  );
}