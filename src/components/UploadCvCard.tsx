"use client";

import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
  Briefcase,
  FileCode,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronRight,
  FileUp,
  RefreshCw,
  History,
  Star,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import ParsedResult, { ParsedResultRef } from "./ParsedResult";
import JobRecommendations from "./JobRecommendations";
import JobSearchForm, { SearchCriteria } from "./JobSearchForm";
import SkillGapAnalysis from "./SkillGapAnalysis";
import type { Job } from "./JobRecommendations";

interface ParsedData {
  full_name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: any[];
  education: any[];
}

interface CvDataFromDB {
  id: string;
  user_id: string;
  file_name: string;
  content: string;
  full_name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: any[];
  education: any[];
  parsed_at: string;
  updated_at: string;
}

export default function UploadCvCard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingFromDB, setLoadingFromDB] = useState(true);
  const [loadingJobsFromDB, setLoadingJobsFromDB] = useState(false);
  const [result, setResult] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"cv" | "search" | "analysis">("cv");
  const [uploadError, setUploadError] = useState<string>("");
  const [hasPreviousData, setHasPreviousData] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [isEditingCv, setIsEditingCv] = useState(false);
  const parsedResultRef = useRef<ParsedResultRef>(null);

  // Load previous CV data on component mount
  useEffect(() => {
    loadPreviousCvData();
  }, []);

  // Effect untuk sync data ketika tab CV aktif
  useEffect(() => {
    if (activeTab === "cv" && parsedData) {
      const updatedResult = JSON.stringify(parsedData, null, 2);
      setResult(updatedResult);
    }
  }, [activeTab, parsedData]);

  const loadPreviousCvData = async () => {
    setLoadingFromDB(true);
    try {
      const res = await fetch("/api/get-latest-cv");
      const data = await res.json();

      if (data.success && data.cv_data) {
        const cvData: CvDataFromDB = data.cv_data;

        // Set data from database
        setResult(cvData.content);
        setCurrentCvId(cvData.id);

        const newParsedData = {
          full_name: cvData.full_name,
          email: cvData.email,
          phone: cvData.phone,
          skills: cvData.skills || [],
          experience: cvData.experience || [],
          education: cvData.education || [],
        };

        setParsedData(newParsedData);
        setHasPreviousData(true);

        // Load job recommendations from database
        await loadJobRecommendationsFromDB(cvData.id);

        setDebugInfo(
          `Loaded previous CV data from ${new Date(
            cvData.updated_at || cvData.parsed_at
          ).toLocaleDateString()}`
        );
      }
    } catch (error) {
      console.error("Error loading previous CV data:", error);
    } finally {
      setLoadingFromDB(false);
      setIsFirstLoad(false);
    }
  };

  const loadJobRecommendationsFromDB = async (cvId: string) => {
    setLoadingJobsFromDB(true);
    try {
      const res = await fetch(
        `/api/get-job-recommendations?cvId=${cvId}&limit=10`
      );
      const data = await res.json();

      if (data.success && data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        console.log("Loaded", data.jobs.length, "previously recommended jobs");

        // Toast yang lebih user-friendly
        toast.success("Loaded Previous Matches", {
          description: `Loaded ${data.jobs.length} previously found job matches.`,
          duration: 2000,
        });
      } else {
        console.log("No previous job recommendations found");
      }
    } catch (error) {
      console.error("Error loading job recommendations:", error);
    } finally {
      setLoadingJobsFromDB(false);
    }
  };

  const handleParsedDataChange = (newData: ParsedData) => {
    setParsedData(newData);
    const updatedResult = JSON.stringify(newData, null, 2);
    setResult(updatedResult);
  };

  // TAMBAHKAN: Handler untuk favorite toggle
  const handleFavoriteToggle = (jobId: string, isFavorite: boolean, job?: Job) => {
    // Update local state
    const updatedJobs = jobs.map((j) =>
      j.id === jobId ? { ...j, isFavorite, saved_at: new Date().toISOString() } : j
    );
    setJobs(updatedJobs);

    // Trigger event untuk update navbar count
    const event = new CustomEvent('favoriteUpdated');
    window.dispatchEvent(event);

    // Show custom toast untuk favorite action
    if (isFavorite && job) {
      // Toast akan ditampilkan oleh JobRecommendations component
      console.log(`Job "${job.title}" added to favorites`);
    }
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setFile(f);
    setUploadError("");
    setDebugInfo("");
    setActiveTab("cv");
  };

  const submitCv = async () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a PDF file to upload.",
      });
      return;
    }

    setLoading(true);
    setJobs([]);
    setDebugInfo("Starting CV parsing...");

    const form = new FormData();
    form.append("file", file);

    try {
      setDebugInfo("Uploading CV to server...");
      const res = await fetch("/api/parse-cv", {
        method: "POST",
        body: form,
      });

      // Cek status response
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();

      if (json.error) {
        setDebugInfo(`Error: ${json.error}`);
        toast.error("Parsing Error", {
          description: json.error,
        });
        return;
      }

      setResult(json.parsed);
      setHasPreviousData(true);

      // Set CV ID jika ada
      if (json.cvId) {
        setCurrentCvId(json.cvId);
      }

      setDebugInfo("CV parsed successfully. Extracting skills...");

      // Parse the result to get structured data
      if (json.structured_data) {
        const newParsedData = json.structured_data;
        setParsedData(newParsedData);

        const skills = newParsedData.skills || [];
        setDebugInfo(`Found ${skills.length} skills: ${skills.join(", ")}`);

        // Show success toast
        toast.success("CV Successfully Analyzed!", {
          description: `Successfully extracted ${skills.length} skills from your CV.`,
          duration: 3000,
        });

        // Fetch job recommendations based on skills
        if (skills.length > 0) {
          await fetchJobRecommendations(skills, undefined, true);
        } else {
          setDebugInfo("No skills found in CV. Please check your CV format.");
          setJobs([]);
          toast.warning("No Skills Found", {
            description:
              "No skills were found in your CV. Please edit your CV data manually.",
          });
        }
      } else {
        setDebugInfo("No structured data returned from API");
      }
    } catch (error: any) {
      console.error("Submit CV Error:", error);
      setDebugInfo(`Error: ${error.message}`);
      toast.error("Upload Error", {
        description: error.message || "Failed to parse CV. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobRecommendations = async (
    skills: string[],
    searchCriteria?: SearchCriteria,
    showToast: boolean = true
  ) => {
    setDebugInfo(`Searching jobs...`);
    setSearchLoading(true);

    try {
      // Get experience and education from parsedData
      const experience = parsedData?.experience || [];
      const education = parsedData?.education || [];

      const res = await fetch("/api/recommend-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          searchCriteria,
          experience,
          education,
          cvId: currentCvId,
        }),
      });

      const data = await res.json();

      if (data.jobs && Array.isArray(data.jobs)) {
        // Update CV ID jika ada dari response
        if (data.cvId && data.cvId !== currentCvId) {
          setCurrentCvId(data.cvId);
        }

        // Add posted date and other metadata with unique IDs
        const enrichedJobs = data.jobs.map((job: any, index: number) => ({
          ...job,
          posted_date:
            job.posted_date ||
            new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          id: job.id || `job-${Date.now()}-${index}`,
          matchedSkills: job.matchedSkills || job.matched || [],
          missingSkills: job.missingSkills || job.missing || [],
          matchedExperience: job.matchedExperience || [],
          experienceCount: job.experienceCount || 0,
          educationMatch: job.educationMatch || false,
          seniorityMatch: job.seniorityMatch || false,
          breakdown: job.breakdown || null,
          saved_at: job.saved_at || new Date().toISOString(),
        }));

        setJobs(enrichedJobs);
        setDebugInfo(`Found ${enrichedJobs.length} job recommendations`);

        // Show toast if requested
        if (showToast && enrichedJobs.length > 0) {
          toast.success("Job Recommendations Found!", {
            description: `Found ${enrichedJobs.length} matching jobs for your profile.`,
            duration: 3000,
          });
        }
      } else {
        setDebugInfo("No jobs returned from API");
        setJobs([]);
        if (showToast) {
          toast.info("No Jobs Found", {
            description:
              "No job recommendations found. Try different search criteria.",
          });
        }
      }
    } catch (error: any) {
      setDebugInfo(`Error fetching jobs: ${error.message}`);
      console.error("Job fetch error:", error);
      setJobs([]);
      if (showToast) {
        toast.error("Error Fetching Jobs", {
          description: error.message,
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setActiveTab("search");

    // If we have skills from CV, use them. Otherwise use the job title as search.
    const skills = parsedData?.skills || [criteria.jobTitle];

    await fetchJobRecommendations(skills, criteria, true);
  };

  const handleSaveParsedData = async (data: ParsedData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/update-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.error) {
        toast.error("Save Failed", {
          description: result.error,
        });
        return;
      }

      toast.success("Profile Updated!", {
        description: "Your CV profile has been updated successfully.",
        duration: 3000,
      });

      // Update local state
      setParsedData(data);
      setHasPreviousData(true);

      // Update result string
      const updatedResult = JSON.stringify(data, null, 2);
      setResult(updatedResult);

      setIsEditingCv(false);

      // Clean up old job recommendations for this CV
      if (currentCvId) {
        await fetch("/api/cleanup-job-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvId: currentCvId }),
        });
      }

      // Refresh job recommendations with updated skills
      const skills = data.skills.filter((s: string) => s.trim());
      if (skills.length > 0) {
        await fetchJobRecommendations(
          skills,
          searchCriteria || undefined,
          true
        );
      } else {
        toast.warning("No Skills", {
          description:
            "Please add at least one skill to get job recommendations.",
        });
        setJobs([]);
      }

      // Reload data dari database
      await loadPreviousCvData();
    } catch (error: any) {
      toast.error("Save Error", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const reloadPreviousData = () => {
    loadPreviousCvData();
    toast.info("Reloading Your Data", {
      description: "Loading your previous CV profile and job matches...",
    });
  };

  const clearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This will remove your CV profile and job recommendations."
      )
    ) {
      setResult("");
      setParsedData(null);
      setJobs([]);
      setFile(null);
      setHasPreviousData(false);
      setDebugInfo("");
      setCurrentCvId(null);
      setSearchCriteria(null);
      setIsEditingCv(false);
      toast.info("Data Cleared", {
        description: "All your data has been cleared.",
      });
    }
  };

  const startEditingCv = () => {
    setIsEditingCv(true);
    setActiveTab("cv");

    setTimeout(() => {
      if (parsedResultRef.current) {
        parsedResultRef.current.setIsEditing(true);
      }
    }, 100);
  };

  const refreshJobRecommendations = async () => {
    if (parsedData?.skills && parsedData.skills.length > 0) {
      await fetchJobRecommendations(
        parsedData.skills,
        searchCriteria || undefined,
        true
      );
    } else {
      toast.warning("No Skills Found", {
        description: "Please add skills to your CV profile first.",
      });
    }
  };

  return (
    <div className="space-y-8 mb-10">
      {/* Upload Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-4">
            <FileCode className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Your CV
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Upload your resume to extract skills and get personalized job
            recommendations
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your job matches are automatically saved and updated
          </p>
        </div>

        {hasPreviousData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Previous profile found
                  </p>
                  <p className="text-xs text-gray-600">
                    Your last CV analysis is available
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={reloadPreviousData}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors border border-blue-200"
                  disabled={loadingFromDB}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingFromDB ? "animate-spin" : ""}`}
                  />
                  Reload
                </button>
                <button
                  onClick={refreshJobRecommendations}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors border border-green-200"
                  disabled={searchLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${searchLoading ? "animate-spin" : ""}`}
                  />
                  Refresh Jobs
                </button>
                <button
                  onClick={clearAllData}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors border border-red-200"
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          className={`relative border-3 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }
            ${file ? "border-green-500 bg-green-50" : ""}
          `}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div
            className={`p-4 rounded-full mb-4 transition-all duration-300 ${
              file ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <UploadCloud
              className={`w-10 h-10 ${
                file ? "text-green-500" : "text-gray-400"
              }`}
            />
          </div>

          {!file ? (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & Drop your CV here
              </p>
              <p className="text-gray-500 mb-4">or click to browse files</p>
              <p className="text-xs text-gray-400">
                Supported: PDF only • Max 10MB
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <p className="text-lg font-medium text-gray-900">
                  File selected
                </p>
              </div>
              <p className="text-gray-600 mb-4">Ready to analyze</p>
            </>
          )}

          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />

          {file && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-sm">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                    </p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Ready to upload
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={submitCv}
            disabled={loading || !file}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-white/10 group-hover:to-blue-500/20 transition-all duration-500" />
            <div className="relative flex items-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing CV...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Parse CV & Get Job Matches
                  </span>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Loading State for DB Data */}
      {loadingFromDB && (
        <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your previous data...</p>
        </div>
      )}

      {/* Results Section */}
      {(result || parsedData || searchCriteria || hasPreviousData) &&
      !loadingFromDB ? (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-2 shadow-sm">
            <div className="flex">
              <button
                onClick={() => setActiveTab("cv")}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-xl transition-all duration-300 ${
                  activeTab === "cv"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV & Skills
                </span>
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-xl transition-all duration-300 ${
                  activeTab === "search"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Search
                </span>
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-xl transition-all duration-300 ${
                  activeTab === "analysis"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  Skill Gaps
                </span>
              </button>
            </div>
          </div>

          {/* Content Area - Handle Different Tabs */}
          {activeTab === "analysis" ? (
            /* Skill Gap Analysis Tab */
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg">
                    <Target className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Skill Gap Analysis
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Identify missing skills and get improvement recommendations
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Based on {jobs.length} job matches
                </div>
              </div>
              <div className="h-screen overflow-y-auto pr-2">
                {jobs.length > 0 ? (
                  <SkillGapAnalysis 
                    cvId={currentCvId || undefined}
                    autoLoad={true}
                    onAnalysisComplete={(data) => {
                      console.log("Skill gap analysis completed:", data);
                    }}
                  />
                ) : (
                  <div className="p-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No job matches found
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Get job recommendations first to analyze skill gaps
                    </p>
                    <button
                      onClick={() => setActiveTab("cv")}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Get Job Matches
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Original CV & Search Tabs Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: CV Results or Job Search Form */}
              <div>
                {activeTab === "cv" ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Your CV Profile
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Review and edit your information
                          </p>
                        </div>
                      </div>
                      {hasPreviousData && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {jobs.length > 0
                            ? `${jobs.length} matches found`
                            : "No matches"}
                        </div>
                      )}
                    </div>
                    {parsedData ? (
                      <div className="space-y-6 h-screen overflow-y-auto pr-2">
                        <ParsedResult
                          ref={parsedResultRef}
                          jsonText={result || JSON.stringify(parsedData, null, 2)}
                          onSave={handleSaveParsedData}
                          onDataChange={handleParsedDataChange}
                        />
                      </div>
                    ) : (
                      <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 text-center">
                        <p className="text-gray-500">
                          No CV data found. Upload a CV to see results.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <JobSearchForm
                    onSearch={handleSearch}
                    isLoading={searchLoading}
                  />
                )}
              </div>

              {/* Right Column: Job Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Job Recommendations
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {searchCriteria
                          ? `Showing results for "${searchCriteria.jobTitle}"`
                          : jobs.length > 0
                          ? "Based on your CV profile"
                          : "Search for jobs"}
                      </p>
                    </div>
                  </div>
                  {jobs.length > 0 && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <span className="text-sm font-medium text-white">
                        {jobs.length} {jobs.length === 1 ? "match" : "matches"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="h-screen overflow-y-auto pr-2">
                  {searchLoading || isSaving || loadingJobsFromDB ? (
                    <div className="p-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {isSaving
                          ? "Updating your profile and searching for matches..."
                          : searchLoading
                          ? "Searching for jobs..."
                          : "Loading your saved matches..."}
                      </p>
                    </div>
                  ) : jobs.length > 0 ? (
                    <JobRecommendations
                      jobs={jobs}
                      searchCriteria={searchCriteria || undefined}
                      showFavoriteButton={true}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ) : activeTab === "cv" && parsedData?.skills?.length === 0 ? (
                    <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Add skills to get matches
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Add skills to your CV profile to get personalized job
                        recommendations.
                      </p>
                      <button
                        onClick={startEditingCv}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200"
                      >
                        Edit Profile to Add Skills
                      </button>
                    </div>
                  ) : (
                    <div className="p-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 text-center">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === "search"
                          ? "Ready to search jobs"
                          : "Get personalized matches"}
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        {activeTab === "search"
                          ? "Enter a job title and location to find matching positions"
                          : parsedData
                          ? "Click 'Edit Information' to add skills and get job matches"
                          : "Upload and analyze your CV to see personalized job matches"}
                      </p>
                      {activeTab === "cv" && parsedData && (
                        <button
                          onClick={startEditingCv}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200"
                        >
                          Edit Profile to Add Skills
                        </button>
                      )}
                      {activeTab === "cv" && !parsedData && (
                        <button
                          onClick={() => setActiveTab("search")}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200"
                        >
                          Search Jobs Directly
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : !loadingFromDB ? (
        /* Empty State - When no CV uploaded yet */
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-8 shadow-lg">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-lg" />
                <FileUp className="w-16 h-16 text-blue-600 relative z-10" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Get Started with Job Matching
            </h2>

            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Upload your CV to discover personalized job recommendations based
              on your skills and experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-fit mb-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Upload CV
                </h4>
                <p className="text-xs text-gray-600">
                  Upload your resume in PDF format
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-fit mb-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  AI Analysis
                </h4>
                <p className="text-xs text-gray-600">
                  Extract skills and experience automatically
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-fit mb-3">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Get Matches
                </h4>
                <p className="text-xs text-gray-600">
                  Receive personalized job recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}