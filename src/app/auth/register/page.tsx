"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff, UserCircle, ArrowRight, CheckCircle, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    fullName: false,
    email: false,
    password: false
  });

  const passwordStrength = () => {
    if (password.length === 0) return { strength: 0, color: "bg-gray-200", text: "" };
    if (password.length < 6) return { strength: 33, color: "bg-red-500", text: "Weak" };
    if (password.length < 8) return { strength: 66, color: "bg-yellow-500", text: "Fair" };
    return { strength: 100, color: "bg-green-500", text: "Strong" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("already registered") || error.status === 400) {
        toast.warning("Email already exists");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      toast.error("User creation failed");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      full_name: fullName,
      email,
    });

    if (profileError) {
      toast.error("Failed to create profile");
      setLoading(false);
      return;
    }

    toast.success("Registration successful! Please check your email for verification.");
    
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            
            <p className="text-gray-600">
              Join thousands of professionals finding their dream jobs
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.username ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <input
                  type="text"
                  id="username"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setIsFocused(prev => ({ ...prev, username: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, username: false }))}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                           focus:outline-none focus:border-blue-500 transition-all duration-200"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.fullName ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <input
                  type="text"
                  id="fullName"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setIsFocused(prev => ({ ...prev, fullName: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, fullName: false }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                           focus:outline-none focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.email ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                           focus:outline-none focus:border-blue-500 transition-all duration-200"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.password ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                           focus:outline-none focus:border-blue-500 transition-all duration-200"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Password strength</span>
                    <span className={`font-medium ${
                      strength.strength < 33 ? "text-red-500" :
                      strength.strength < 66 ? "text-yellow-500" :
                      "text-green-500"
                    }`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-2">Password requirements:</p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    password.length >= 6 ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {password.length >= 6 && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span>At least 6 characters</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {password.length >= 8 && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span>8+ characters for stronger password</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold 
                       rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 
                       disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Back to Home Button Inside Card */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Return to Homepage
            </Link>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 group"
                >
                  Sign in here
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}