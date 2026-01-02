"use client";

import { useState } from "react";
import { Search, MapPin, Building, Save, Briefcase, Filter, Sparkles } from "lucide-react";

interface JobSearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading?: boolean;
}

export interface SearchCriteria {
  jobTitle: string;
  location?: string;
  isRemote?: boolean;
}

export default function JobSearchForm({ onSearch, isLoading = false }: JobSearchFormProps) {
  const [formData, setFormData] = useState<SearchCriteria>({
    jobTitle: "",
    location: "",
    isRemote: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.jobTitle.trim()) {
      onSearch(formData);
    }
  };

  const popularJobTitles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Product Manager",
    "UX Designer",
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Job Search</h2>
          <p className="text-sm text-gray-600 mt-1">Find your perfect role</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Target Role *
            </span>
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g., Frontend Developer, Software Engineer"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
          
          {/* Popular Job Titles Suggestions */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {popularJobTitles.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setFormData({ ...formData, jobTitle: title })}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg transition-colors duration-200 hover:border-gray-400"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Remote Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location (Optional)
              </span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., London, Remote, Singapore"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 w-full transition-all duration-200">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-200 ${formData.isRemote ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formData.isRemote ? 'translate-x-4' : ''}`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Remote Only</span>
                <p className="text-xs text-gray-600 mt-1">Show remote positions only</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !formData.jobTitle.trim()}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  Search Jobs
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (formData.jobTitle.trim()) {
                console.log("Saving search criteria:", formData);
                alert("Search criteria saved for alerts!");
              }
            }}
            disabled={!formData.jobTitle.trim()}
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Save Search</span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Filter className="w-3 h-3" />
            <p>💡 Save your search criteria to receive email alerts for new matching jobs.</p>
          </div>
        </div>
      </form>
    </div>
  );
}