// job-matcher/src/components/JobRecommendations.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  AlertCircle,
  Star,
  Calendar,
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  Save,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Target,
  BarChart3,
  History,
  Heart,
  HeartOff,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience?: string[];
  experienceCount?: number;
  educationMatch?: boolean;
  seniorityMatch?: boolean;
  posted_date?: string;
  salary?: string;
  contract_type?: string;
  saved_at?: string;
  isFavorite?: boolean;
  breakdown?: {
    skills: number;
    experience: number;
    education: number;
    seniority: number;
    bonus: number;
  };
}

interface JobRecommendationsProps {
  jobs: Job[];
  searchCriteria?: {
    jobTitle: string;
    location?: string;
    isRemote?: boolean;
  };
  showFavoriteButton?: boolean;
  onFavoriteToggle?: (jobId: string, isFavorite: boolean, job?: Job) => void;
}

export default function JobRecommendations({
  jobs,
  searchCriteria,
  showFavoriteButton = true,
  onFavoriteToggle,
}: JobRecommendationsProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [favoriteJobs, setFavoriteJobs] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState<Set<string>>(
    new Set()
  );
  const [favoriteAnimation, setFavoriteAnimation] = useState<string | null>(
    null
  );
  const [initialized, setInitialized] = useState(false);

  // Initialize favorite jobs from props and check with server
  useEffect(() => {
    const initializeFavorites = async () => {
      const favoriteSet = new Set<string>();

      // First, use local favorite status from props
      jobs.forEach((job) => {
        if (job.isFavorite) {
          favoriteSet.add(job.id);
        }
      });

      // Then verify with server for each job
      try {
        const favoritePromises = jobs.map(async (job) => {
          try {
            const res = await fetch("/api/check-favorite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId: job.id }),
            });

            const data = await res.json();
            if (data.success && data.isFavorite) {
              favoriteSet.add(job.id);
            }
          } catch (error) {
            console.error(
              "Error checking favorite status for job:",
              job.id,
              error
            );
          }
        });

        await Promise.all(favoritePromises);
      } catch (error) {
        console.error("Error initializing favorites:", error);
      }

      setFavoriteJobs(favoriteSet);
      setInitialized(true);
    };

    initializeFavorites();
  }, [jobs]);

  if (!initialized && jobs.length > 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg">
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job recommendations...</p>
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex flex-col items-center text-center py-8">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No job matches found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            {searchCriteria?.jobTitle
              ? `We couldn't find any jobs matching "${searchCriteria.jobTitle}"`
              : "Try adding more specific skills or broaden your search terms."}
          </p>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 w-full max-w-md">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Suggestions:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Try different job titles or keywords
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Check if your skills match the requirements
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Consider remote positions for more options
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const toggleJobDetails = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const toggleFavorite = async (job: Job) => {
    const jobId = job.id;
    const isFavorite = favoriteJobs.has(jobId);

    // Trigger animation
    if (!isFavorite) {
      setFavoriteAnimation(jobId);
      setTimeout(() => setFavoriteAnimation(null), 1000);
    }

    setLoadingFavorites((prev) => new Set(prev).add(jobId));

    try {
      const action = isFavorite ? "unsave" : "save";

      const response = await fetch("/api/save-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          job: {
            id: job.id,
            jobId: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            description: job.description,
            score: job.score,
            matchedSkills: job.matchedSkills,
            missingSkills: job.missingSkills,
            posted_date: job.posted_date,
            salary: job.salary,
            contract_type: job.contract_type,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newFavoriteJobs = new Set(favoriteJobs);

        if (isFavorite) {
          newFavoriteJobs.delete(jobId);
          toast.success("Removed from Favorites", {
            description: `${job.title} has been removed from your favorites.`,
            duration: 3000,
            icon: <HeartOff className="w-5 h-5 text-red-500" />,
          });
        } else {
          newFavoriteJobs.add(jobId);
          toast.success("Added to Favorites! 🎉", {
            description: `${job.title} at ${job.company} has been saved to your favorites.`,
            duration: 4000,
            icon: <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />,
            action: {
              label: "View Favorites",
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.location.href = "/dashboard/favorites";
                }
              },
            },
          });
        }

        setFavoriteJobs(newFavoriteJobs);

        // Call parent callback if provided
        if (onFavoriteToggle) {
          onFavoriteToggle(jobId, !isFavorite, job);
        }

        // Trigger event untuk update navbar count
        const event = new CustomEvent("favoriteUpdated");
        window.dispatchEvent(event);
      } else {
        toast.error("Failed to Update", {
          description:
            data.error || "Failed to update favorites. Please try again.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Network Error", {
        description:
          "Failed to connect to server. Please check your connection.",
        duration: 3000,
      });
    } finally {
      setLoadingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 60) return "from-amber-500 to-yellow-500";
    if (score >= 40) return "from-orange-500 to-amber-500";
    return "from-red-500 to-orange-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  const formatSavedDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );

    if (diffInDays === 0) return "Added today";
    if (diffInDays === 1) return "Added yesterday";
    if (diffInDays < 7) return `Added ${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Criteria Display */}
      {searchCriteria && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Current Search
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                  <span className="font-medium text-gray-900">
                    {searchCriteria.jobTitle}
                  </span>
                  {searchCriteria.location && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {searchCriteria.location}
                      </span>
                    </>
                  )}
                  {searchCriteria.isRemote && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 border border-green-200 rounded-lg">
                      Remote
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <span className="text-sm font-medium text-white">
                {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Jobs Indicator */}
      {favoriteJobs.size > 0 && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
            <div>
              <p className="text-sm font-medium text-pink-900">
                You have {favoriteJobs.size} favorite{" "}
                {favoriteJobs.size === 1 ? "job" : "jobs"} in this list
              </p>
              <p className="text-xs text-pink-700 mt-1">
                Jobs marked with ❤️ are already in your favorites
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const isExpanded = expandedJob === job.id;
          const isFavorite = favoriteJobs.has(job.id);
          const isLoading = loadingFavorites.has(job.id);
          const isAnimating = favoriteAnimation === job.id;

          return (
            <div
              key={job.id}
              className={`group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isFavorite
                  ? "border-pink-300 hover:border-pink-400 ring-1 ring-pink-200"
                  : "hover:border-blue-300"
              } ${isAnimating ? "animate-pulse ring-2 ring-pink-500" : ""}`}
            >
              {/* Job Header */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Title and Company */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`p-2 rounded-lg relative ${
                          isFavorite
                            ? "bg-gradient-to-r from-pink-100 to-rose-100"
                            : "bg-gradient-to-r from-blue-50 to-purple-50"
                        }`}
                      >
                        {isAnimating && (
                          <div className="absolute inset-0 animate-ping bg-pink-300 rounded-lg opacity-75"></div>
                        )}
                        {isFavorite ? (
                          <Heart className="w-5 h-5 text-pink-600 fill-pink-600 relative z-10" />
                        ) : (
                          <Building className="w-5 h-5 text-blue-600 relative z-10" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          {isFavorite && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200 rounded-lg text-xs font-medium">
                              <Heart className="w-3 h-3 fill-pink-600" />
                              Favorite
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600 text-sm">
                            {job.company}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          {job.saved_at && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 text-xs flex items-center gap-1">
                                <History className="w-3 h-3" />
                                {formatSavedDate(job.saved_at)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {job.posted_date && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          <Clock className="w-3 h-3" />
                          Posted: {job.posted_date}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </span>
                      )}
                      {job.contract_type && (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          {job.contract_type}
                        </span>
                      )}
                      {job.matchedSkills.length > 0 && (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {job.matchedSkills.length} skills match
                        </span>
                      )}
                      {job.matchedExperience &&
                        job.matchedExperience.length > 0 && (
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs">
                            <Briefcase className="w-3 h-3 inline mr-1" />
                            {job.matchedExperience.length} exp match
                          </span>
                        )}
                      {job.educationMatch && (
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs">
                          <GraduationCap className="w-3 h-3 inline mr-1" />
                          Education match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Section */}
                  <div className="flex flex-col items-end gap-3">
                    <div
                      className={`px-4 py-3 rounded-xl border ${getScoreBgColor(
                        job.score
                      )} min-w-[120px]`}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(
                            job.score
                          )} bg-clip-text text-transparent`}
                        >
                          {job.score}%
                        </span>
                        <p className="text-xs mt-1 text-gray-600">
                          {getScoreText(job.score)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreColor(
                            job.score
                          )} rounded-full transition-all duration-500`}
                          style={{ width: `${job.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleJobDetails(job.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Details
                        </>
                      )}
                    </button>

                    {showFavoriteButton && (
                      <button
                        onClick={() => toggleFavorite(job)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                          isFavorite
                            ? "bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-700 border border-pink-300 hover:border-pink-400"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            {isAnimating && (
                              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 animate-pulse"></div>
                            )}
                            <Heart
                              className={`w-4 h-4 relative z-10 ${
                                isFavorite ? "fill-pink-600 text-pink-600" : ""
                              } ${isAnimating ? "animate-bounce" : ""}`}
                            />
                            <span className="relative z-10">
                              {isFavorite
                                ? "Remove Favorite"
                                : "Add to Favorites"}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Apply Now
                  </a>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-6 space-y-6">
                    {/* Saved/Favorite Info */}
                    <div
                      className={`p-4 rounded-xl border ${
                        isFavorite
                          ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 ${
                          isFavorite ? "text-pink-700" : "text-blue-700"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isFavorite
                              ? "bg-gradient-to-r from-pink-100 to-rose-100"
                              : "bg-gradient-to-r from-blue-100 to-purple-100"
                          }`}
                        >
                          {isFavorite ? (
                            <Heart className="w-5 h-5 fill-pink-600 text-pink-600" />
                          ) : (
                            <History className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isFavorite
                              ? "Added to your favorites"
                              : "Available to save"}
                          </p>
                          <p className="text-xs mt-1 opacity-80">
                            {isFavorite
                              ? "This job is saved in your favorites list. Click the heart icon to remove it."
                              : "Click the heart icon to save this job to your favorites for easy access later."}
                          </p>
                        </div>
                      </div>
                      {job.saved_at && (
                        <div className="mt-2 text-xs opacity-70">
                          {formatSavedDate(job.saved_at)}
                        </div>
                      )}
                    </div>

                    {/* Job Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        Job Description
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Skills Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Matched Skills */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Matched Skills ({job.matchedSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.matchedSkills.length > 0 ? (
                            job.matchedSkills.map((skill, idx) => (
                              <span
                                key={`${job.id}-skill-${idx}`}
                                className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-gray-500 text-sm">
                                No skills matched
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Missing Skills ({job.missingSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.missingSkills.length > 0 ? (
                            job.missingSkills.map((skill, idx) => (
                              <span
                                key={`${job.id}-missing-${idx}`}
                                className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                All skills matched! 🎉
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Experience Match */}
                    {job.matchedExperience &&
                      job.matchedExperience.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            Relevant Experience ({job.matchedExperience.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedExperience.map((exp, idx) => (
                              <span
                                key={`${job.id}-exp-${idx}`}
                                className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Score Breakdown */}
                    {job.breakdown && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-600" />
                          Match Breakdown
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">
                                Skills Match
                              </span>
                              <span className="font-medium">
                                {job.breakdown.skills}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                                style={{ width: `${job.breakdown.skills}%` }}
                              />
                            </div>
                          </div>

                          {job.breakdown.experience > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">
                                  Experience Match
                                </span>
                                <span className="font-medium">
                                  {job.breakdown.experience}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                                  style={{
                                    width: `${job.breakdown.experience}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {job.breakdown.education > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">
                                  Education Match
                                </span>
                                <span className="font-medium">
                                  {job.breakdown.education}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                                  style={{
                                    width: `${job.breakdown.education}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {job.breakdown.seniority > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">
                                  Seniority Match
                                </span>
                                <span className="font-medium">
                                  {job.breakdown.seniority}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                                  style={{
                                    width: `${job.breakdown.seniority}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {job.breakdown.bonus > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">
                                  Bonus Factors
                                </span>
                                <span className="font-medium">
                                  {job.breakdown.bonus}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                                  style={{ width: `${job.breakdown.bonus}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skill Gap Suggestions */}
                    {job.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          Skill Improvement Suggestions
                          <span className="ml-auto text-xs text-gray-500">
                            {job.missingSkills.length} missing skills
                          </span>
                        </h4>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Learning these skills could improve your match by
                              ~{(job.missingSkills.length * 5).toFixed(0)}%
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.missingSkills
                                .slice(0, 5)
                                .map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 rounded-lg text-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {job.missingSkills.length > 5 && (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-sm">
                                  +{job.missingSkills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Top priority:
                                </p>
                                <p className="text-sm text-gray-600">
                                  Focus on{" "}
                                  <span className="font-medium">
                                    {job.missingSkills[0]}
                                  </span>{" "}
                                  first
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Learning resources:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  <li>Online courses (Coursera, Udemy)</li>
                                  <li>Official documentation & tutorials</li>
                                  <li>Practice projects on GitHub</li>
                                </ul>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Estimated timeline:
                                </p>
                                <p className="text-sm text-gray-600">
                                  Basic proficiency: 2-4 weeks • Advanced: 2-3
                                  months
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                Want detailed analysis? Check the Skill Gap
                                Analysis dashboard
                              </span>
                              <button
                                onClick={() => {
                                  // Aksi untuk membuka detailed skill gap analysis
                                  toast.info("Detailed Analysis", {
                                    description:
                                      "Skill gap analysis feature coming soon!",
                                    duration: 3000,
                                  });
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View detailed analysis →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Job Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {job.salary && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Salary</p>
                          <p className="text-gray-900 font-medium">
                            {job.salary}
                          </p>
                        </div>
                      )}
                      {job.contract_type && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Contract Type
                          </p>
                          <p className="text-gray-900 font-medium">
                            {job.contract_type}
                          </p>
                        </div>
                      )}
                      {job.posted_date && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Posted Date
                          </p>
                          <p className="text-gray-900 font-medium">
                            {job.posted_date}
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          Overall Match
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getScoreColor(
                                job.score
                              )} rounded-full`}
                              style={{ width: `${job.score}%` }}
                            />
                          </div>
                          <span className="text-gray-900 font-medium text-sm">
                            {job.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Tips */}
      {jobs.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Tips for Better Matches
              </h4>
              <p className="text-xs text-gray-700">
                Apply to positions with 60%+ match rate for best results. Save
                jobs you're interested in to review later.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                <span className="text-xs text-gray-700">
                  Excellent Match (80%+)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                <span className="text-xs text-gray-700">
                  Good Match (60-79%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                <span className="text-xs text-gray-700">Favorite Job</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
