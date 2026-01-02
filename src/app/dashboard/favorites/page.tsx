"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Star,
  Filter,
  Search,
  MapPin,
  Building,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Trash2,
  DollarSign,
  Clock,
  X,
  Grid3x3,
  List,
  SortAsc,
  Eye,
  EyeOff,
  HeartOff,
  Target,
} from "lucide-react";
import NavbarDashboard from "@/components/NavbarDashboard";
import SkillGapAnalysis from "@/components/SkillGapAnalysis";
import { toast } from "sonner";

export default function FavoritesPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "score" | "title">("recent");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showOnlyHighMatches, setShowOnlyHighMatches] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadFavoriteJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, sortBy, selectedCompanies, selectedLocations, showOnlyHighMatches]);

  const loadFavoriteJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-favorite-jobs");
      const data = await res.json();

      if (data.success) {
        const jobsWithFavoriteFlag = data.jobs.map((job: any) => ({
          ...job,
          isFavorite: true,
        }));
        setJobs(jobsWithFavoriteFlag);
      } else {
        console.error("Failed to load favorites:", data.error);
        toast.error("Failed to Load Favorites", {
          description: data.error || "Could not load your favorite jobs.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error loading favorite jobs:", error);
      toast.error("Network Error", {
        description: "Failed to load favorite jobs. Please try again.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term) ||
          (job.description && job.description.toLowerCase().includes(term))
      );
    }

    // Company filter
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter((job) =>
        selectedCompanies.includes(job.company)
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((job) =>
        selectedLocations.some((location) =>
          job.location.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // High matches filter
    if (showOnlyHighMatches) {
      filtered = filtered.filter((job) => job.score >= 70);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.saved_at || "").getTime() -
          new Date(a.saved_at || "").getTime()
        );
      } else if (sortBy === "score") {
        return b.score - a.score;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredJobs(filtered);
  };

  const getUniqueCompanies = () => {
    const companies = jobs.map((job) => job.company);
    return [...new Set(companies)].slice(0, 15);
  };

  const getUniqueLocations = () => {
    const locations = jobs.map((job) => job.location);
    return [...new Set(locations)].slice(0, 15);
  };

  const handleRemoveFavorite = async (jobId: string, jobTitle: string) => {
    setRemovingJobId(jobId);
    
    try {
      const response = await fetch("/api/save-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "unsave",
          job: { id: jobId },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
        
        // Show success toast
        toast.success("Removed from Favorites", {
          description: `${jobTitle} has been removed from your favorites.`,
          duration: 3000,
          icon: <HeartOff className="w-5 h-5 text-red-500" />,
        });

        // Trigger event untuk update navbar count
        const event = new CustomEvent('favoriteUpdated');
        window.dispatchEvent(event);

        // Show undo toast dengan action button
        toast.info("Job Removed", {
          description: `${jobTitle} removed from favorites.`,
          duration: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                const undoResponse = await fetch("/api/save-job", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    action: "save",
                    job: { id: jobId, title: jobTitle },
                  }),
                });
                
                const undoData = await undoResponse.json();
                
                if (undoData.success) {
                  // Reload jobs untuk include yang baru di-restore
                  await loadFavoriteJobs();
                  
                  toast.success("Restored to Favorites", {
                    description: `${jobTitle} has been restored to your favorites.`,
                    duration: 3000,
                  });
                  
                  // Trigger event untuk update navbar count
                  window.dispatchEvent(event);
                }
              } catch (error) {
                console.error("Error undoing remove:", error);
              }
            },
          },
        });
      } else {
        toast.error("Failed to Remove", {
          description: data.error || "Failed to remove from favorites. Please try again.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Network Error", {
        description: "Failed to connect to server. Please check your connection.",
        duration: 3000,
      });
    } finally {
      setRemovingJobId(null);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setSortBy("recent");
    setShowOnlyHighMatches(false);
    setIsMobileFiltersOpen(false);
    
    toast.info("Filters Cleared", {
      description: "All filters have been cleared.",
      duration: 2000,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (score >= 60) return "bg-gradient-to-r from-amber-500 to-yellow-500";
    if (score >= 40) return "bg-gradient-to-r from-orange-500 to-amber-500";
    return "bg-gradient-to-r from-red-500 to-orange-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const handleBulkRemove = async (jobIds: string[], jobTitles: string[]) => {
    if (jobIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to remove ${jobIds.length} job${jobIds.length > 1 ? 's' : ''} from favorites?`)) {
      return;
    }
    
    try {
      // Remove each job one by one
      for (let i = 0; i < jobIds.length; i++) {
        await fetch("/api/save-job", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "unsave",
            job: { id: jobIds[i] },
          }),
        });
      }
      
      // Update local state
      setJobs((prev) => prev.filter((job) => !jobIds.includes(job.id)));
      
      // Show success toast
      toast.success("Bulk Removal Successful", {
        description: `${jobIds.length} job${jobIds.length > 1 ? 's' : ''} removed from favorites.`,
        duration: 3000,
      });
      
      // Trigger event untuk update navbar count
      const event = new CustomEvent('favoriteUpdated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error in bulk remove:", error);
      toast.error("Bulk Removal Failed", {
        description: "Failed to remove some jobs. Please try again.",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <>
        <NavbarDashboard />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
          <div className="w-full px-4 py-8">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading your favorite jobs...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarDashboard />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Main Content Container */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-20 max-w-7xl">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 max-w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex-shrink-0">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                      Favorite Jobs
                    </h1>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {jobs.length === 0
                        ? "You haven't saved any jobs to favorites yet"
                        : `You have ${jobs.length} favorite ${
                            jobs.length === 1 ? "job" : "jobs"
                          } saved`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-shrink-0 flex gap-2">
                {filteredJobs.length > 0 && (
                  <button
                    onClick={() => handleBulkRemove(
                      filteredJobs.map(j => j.id),
                      filteredJobs.map(j => j.title)
                    )}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap text-sm"
                  >
                    Remove All Filtered ({filteredJobs.length})
                  </button>
                )}
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Back to Search
                </button>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis Card */}
          {jobs.length > 0 && (
            <div className="mb-6">
              <SkillGapAnalysis 
                compactMode={true}
                autoLoad={true}
                onAnalysisComplete={(data) => {
                  console.log("Favorite jobs skill gap analysis:", data);
                }}
              />
            </div>
          )}

          {/* Success Message Toast (Conditional) */}
          {jobs.length > 0 && filteredJobs.length === jobs.length && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-600 fill-green-600" />
                <p className="text-sm font-medium text-green-800">
                  All your favorite jobs are shown here
                </p>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Use filters to narrow down your list or click the heart icon on job listings to add more.
              </p>
            </div>
          )}

          {/* Mobile Filter Button */}
          {jobs.length > 0 && (
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filters & Sorting
                {(selectedCompanies.length > 0 ||
                  selectedLocations.length > 0 ||
                  searchTerm ||
                  showOnlyHighMatches) && (
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {[
                      ...selectedCompanies,
                      ...selectedLocations,
                      searchTerm ? "Search" : "",
                      showOnlyHighMatches ? "High Matches" : "",
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6 max-w-full">
            {/* Filters Sidebar - Desktop */}
            {jobs.length > 0 && (
              <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
                <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: "recent", label: "Recently Added" },
                        { value: "score", label: "Highest Match" },
                        { value: "title", label: "Job Title" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as any)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sortBy === option.value
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                          {sortBy === option.value && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Matches Filter */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowOnlyHighMatches(!showOnlyHighMatches)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        showOnlyHighMatches
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Show only high matches (70%+)</span>
                      </div>
                      {showOnlyHighMatches ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Company Filter */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Companies
                      </label>
                      {selectedCompanies.length > 0 && (
                        <button
                          onClick={() => setSelectedCompanies([])}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-1">
                      {getUniqueCompanies().map((company) => (
                        <label
                          key={company}
                          className="flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompanies([...selectedCompanies, company]);
                              } else {
                                setSelectedCompanies(
                                  selectedCompanies.filter((c) => c !== company)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="truncate">{company}</span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-700">
                            {jobs.filter(j => j.company === company).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Locations
                      </label>
                      {selectedLocations.length > 0 && (
                        <button
                          onClick={() => setSelectedLocations([])}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-1">
                      {getUniqueLocations().map((location) => (
                        <label
                          key={location}
                          className="flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLocations([...selectedLocations, location]);
                              } else {
                                setSelectedLocations(
                                  selectedLocations.filter((l) => l !== location)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="truncate">{location}</span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-700">
                            {jobs.filter(j => j.location === location).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear All Filters */}
                  {(selectedCompanies.length > 0 ||
                    selectedLocations.length > 0 ||
                    searchTerm ||
                    showOnlyHighMatches) && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={clearAllFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Desktop Stats and View Toggle */}
              {jobs.length > 0 && (
                <div className="hidden lg:flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{filteredJobs.length}</span> of{" "}
                    <span className="font-medium">{jobs.length}</span> jobs
                    {showOnlyHighMatches && " (70%+ matches)"}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "list"
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "grid"
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Stats */}
              {jobs.length > 0 && (
                <div className="lg:hidden mb-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {filteredJobs.length} jobs found
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedCompanies.length > 0 && `${selectedCompanies.length} companies • `}
                          {selectedLocations.length > 0 && `${selectedLocations.length} locations • `}
                          {showOnlyHighMatches && "High matches only"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <SortAsc className="w-4 h-4 inline mr-1" />
                        {sortBy === "recent"
                          ? "Recent"
                          : sortBy === "score"
                          ? "Score"
                          : "Title"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jobs List/Grid */}
              {jobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-full w-fit mx-auto mb-4">
                      <Heart className="w-12 h-12 text-pink-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      No favorite jobs yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start exploring jobs and click the heart icon to save them
                      to your favorites.
                    </p>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Start Exploring Jobs
                    </button>
                  </div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        No matches found
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        No jobs match your current filters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 rounded-xl font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Jobs Container */}
                  <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" : "space-y-4 sm:space-y-6"}`}>
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`bg-white rounded-2xl border border-gray-200 hover:border-pink-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                          viewMode === "grid" ? "h-full flex flex-col" : ""
                        } ${removingJobId === job.id ? 'opacity-50' : ''}`}
                      >
                        <div className={`p-4 sm:p-6 ${viewMode === "grid" ? "flex-1" : ""}`}>
                          {/* Job Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 p-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg">
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 fill-pink-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {job.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-1 mt-1">
                                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                                      {job.company}
                                    </span>
                                    <span className="text-gray-400 hidden sm:inline">•</span>
                                    <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{job.location}</span>
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveFavorite(job.id, job.title)}
                                  disabled={removingJobId === job.id}
                                  className="flex-shrink-0 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Remove from favorites"
                                >
                                  {removingJobId === job.id ? (
                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                </button>
                              </div>

                              {/* Quick Info */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-xs">
                                  <Heart className="w-3 h-3 fill-pink-600" />
                                  <span className="hidden sm:inline">Favorite</span>
                                </span>
                                {job.salary && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="hidden sm:inline">{job.salary}</span>
                                    <span className="sm:hidden">Salary</span>
                                  </span>
                                )}
                                {viewMode === "list" && job.posted_date && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs">
                                    <Clock className="w-3 h-3" />
                                    {job.posted_date}
                                  </span>
                                )}
                              </div>

                              {/* Score Badge - Grid View */}
                              {viewMode === "grid" && (
                                <div className="mt-3">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                                    <div className={`w-2 h-2 rounded-full ${getScoreColor(job.score)}`} />
                                    <span className={`text-sm font-bold ${getScoreTextColor(job.score)}`}>
                                      {job.score}% match
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Score Badge - List View */}
                            {viewMode === "list" && (
                              <div className="flex-shrink-0">
                                <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl min-w-[80px]">
                                  <div className="flex flex-col items-center">
                                    <span className={`text-lg font-bold ${getScoreTextColor(job.score)}`}>
                                      {job.score}%
                                    </span>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {job.score >= 80 ? "Excellent" :
                                       job.score >= 60 ? "Good" :
                                       job.score >= 40 ? "Fair" : "Low"} Match
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Job Description (Grid View only) */}
                          {viewMode === "grid" && job.description && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                                {job.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
                              </p>
                            </div>
                          )}

                          {/* Saved Date */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Saved on{" "}
                              {new Date(job.saved_at || "").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                          <div className="flex flex-col items-stretch gap-2">
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Apply Now</span>
                              <span className="sm:hidden">Apply</span>
                            </a>
                            {viewMode === "grid" && (
                              <button
                                onClick={() => handleRemoveFavorite(job.id, job.title)}
                                disabled={removingJobId === job.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 rounded-lg sm:rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {removingJobId === job.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    <span className="hidden sm:inline">Removing...</span>
                                    <span className="sm:hidden">...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                    <span className="sm:hidden">Delete</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredJobs.length > 6 && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => {
                          // Logic for loading more jobs if implemented
                          console.log("Load more jobs");
                          toast.info("Feature Coming Soon", {
                            description: "Load more feature is under development.",
                            duration: 3000,
                          });
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 rounded-xl font-medium transition-colors"
                      >
                        Load More Jobs
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen && jobs.length > 0 && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            {/* Filters Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search favorites..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "recent", label: "Recently Added" },
                      { value: "score", label: "Highest Match" },
                      { value: "title", label: "Job Title" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as any);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Matches Filter */}
                <div>
                  <button
                    onClick={() => setShowOnlyHighMatches(!showOnlyHighMatches)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      showOnlyHighMatches
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>Show only high matches (70%+)</span>
                    </div>
                    {showOnlyHighMatches ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Company Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Companies
                    </label>
                    {selectedCompanies.length > 0 && (
                      <button
                        onClick={() => setSelectedCompanies([])}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-1">
                    {getUniqueCompanies().map((company) => (
                      <label
                        key={company}
                        className="flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies([...selectedCompanies, company]);
                            } else {
                              setSelectedCompanies(
                                selectedCompanies.filter((c) => c !== company)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{company}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {jobs.filter(j => j.company === company).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Locations
                    </label>
                    {selectedLocations.length > 0 && (
                      <button
                        onClick={() => setSelectedLocations([])}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-1">
                    {getUniqueLocations().map((location) => (
                      <label
                        key={location}
                        className="flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLocations([...selectedLocations, location]);
                            } else {
                              setSelectedLocations(
                                selectedLocations.filter((l) => l !== location)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="truncate">{location}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {jobs.filter(j => j.location === location).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 z-10">
                  <div className="flex gap-3">
                    <button
                      onClick={clearAllFilters}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}