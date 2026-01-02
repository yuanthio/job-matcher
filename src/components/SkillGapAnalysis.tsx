"use client";

import { useState, useEffect, useRef } from "react";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  ExternalLink,
  Zap,
  ChevronRight,
  Award,
  Clock,
  BarChart3,
  Sparkles,
  Download,
  Share2,
  Filter,
  Search,
  Bookmark,
  Lightbulb,
  Users,
  GraduationCap,
  Briefcase,
  Code,
  Server,
  Database,
  Cloud,
  Smartphone,
  Lock,
  Globe,
  Cpu,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

interface SkillGapAnalysisProps {
  cvId?: string;
  jobId?: string;
  autoLoad?: boolean;
  compactMode?: boolean;
  onAnalysisComplete?: (data: any) => void;
}

interface SkillData {
  skill: string;
  count: number;
  frequency: number;
  impactScore: number;
}

interface ImprovementSuggestion {
  skill: string;
  impactScore: number;
  priority: number;
  action: string;
  estimatedImprovement: number;
  resources: string[];
}

interface AnalysisData {
  totalJobs: number;
  topMissingSkills: SkillData[];
  skillFrequency: { [key: string]: { missing: number, matched: number } };
  improvementSuggestions: ImprovementSuggestion[];
  overallMissingSkills: string[];
  matchDistribution: {
    excellent: number;
    good: number;
    fair: number;
    low: number;
  };
  statistics: {
    totalMissingSkills: number;
    totalMatchedSkills: number;
    averageMissingPerJob: number;
    averageMatchedPerJob: number;
    overallMatchRate: number;
  };
}

export default function SkillGapAnalysis({
  cvId,
  jobId,
  autoLoad = true,
  compactMode = false,
  onAnalysisComplete
}: SkillGapAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    topSkills: true,
    suggestions: true,
    statistics: !compactMode,
    resources: false
  });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      loadSkillGapAnalysis();
      hasLoadedRef.current = true;
    }
  }, [autoLoad]);

  const loadSkillGapAnalysis = async () => {
    setLoading(true);
    try {
      let url = `/api/get-skill-gap-analysis?`;
      if (cvId) url += `cvId=${cvId}&`;
      if (jobId) url += `jobId=${jobId}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        
        // Callback jika ada
        if (onAnalysisComplete) {
          onAnalysisComplete(data.analysis);
        }
        
        // Show toast untuk notifikasi
        if (data.analysis.totalJobs > 0) {
          toast.success("Skill Gap Analysis Complete", {
            description: `Analyzed ${data.analysis.totalJobs} jobs, found ${data.analysis.topMissingSkills.length} key skill gaps`,
            duration: 3000,
          });
        }
      } else {
        toast.error("Analysis Failed", {
          description: data.error || "Could not load skill gap analysis",
        });
      }
    } catch (error) {
      console.error("Error loading skill gap analysis:", error);
      toast.error("Network Error", {
        description: "Failed to load skill gap analysis",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    
    if (lowerSkill.includes('react') || lowerSkill.includes('vue') || lowerSkill.includes('angular')) {
      return <Code className="w-4 h-4" />;
    } else if (lowerSkill.includes('python') || lowerSkill.includes('java') || lowerSkill.includes('javascript')) {
      return <Code className="w-4 h-4" />;
    } else if (lowerSkill.includes('aws') || lowerSkill.includes('azure') || lowerSkill.includes('cloud')) {
      return <Cloud className="w-4 h-4" />;
    } else if (lowerSkill.includes('sql') || lowerSkill.includes('database') || lowerSkill.includes('mongodb')) {
      return <Database className="w-4 h-4" />;
    } else if (lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') || lowerSkill.includes('devops')) {
      return <Server className="w-4 h-4" />;
    } else if (lowerSkill.includes('mobile') || lowerSkill.includes('ios') || lowerSkill.includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (lowerSkill.includes('security') || lowerSkill.includes('cyber')) {
      return <Lock className="w-4 h-4" />;
    } else if (lowerSkill.includes('web') || lowerSkill.includes('frontend') || lowerSkill.includes('backend')) {
      return <Globe className="w-4 h-4" />;
    } else if (lowerSkill.includes('ai') || lowerSkill.includes('machine learning') || lowerSkill.includes('data')) {
      return <Cpu className="w-4 h-4" />;
    }
    
    return <Code className="w-4 h-4" />;
  };

  const getSkillCategory = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    
    if (lowerSkill.includes('react') || lowerSkill.includes('vue') || lowerSkill.includes('angular') || 
        lowerSkill.includes('javascript') || lowerSkill.includes('typescript')) {
      return "Frontend";
    } else if (lowerSkill.includes('node') || lowerSkill.includes('express') || lowerSkill.includes('django') || 
               lowerSkill.includes('spring') || lowerSkill.includes('.net')) {
      return "Backend";
    } else if (lowerSkill.includes('aws') || lowerSkill.includes('azure') || lowerSkill.includes('gcp') || 
               lowerSkill.includes('cloud') || lowerSkill.includes('docker') || lowerSkill.includes('kubernetes')) {
      return "DevOps/Cloud";
    } else if (lowerSkill.includes('sql') || lowerSkill.includes('mysql') || lowerSkill.includes('postgresql') || 
               lowerSkill.includes('mongodb') || lowerSkill.includes('redis')) {
      return "Database";
    } else if (lowerSkill.includes('python') || lowerSkill.includes('java') || lowerSkill.includes('c++') || 
               lowerSkill.includes('go') || lowerSkill.includes('rust')) {
      return "Programming";
    } else if (lowerSkill.includes('figma') || lowerSkill.includes('adobe') || lowerSkill.includes('ui') || 
               lowerSkill.includes('ux')) {
      return "Design";
    } else if (lowerSkill.includes('agile') || lowerSkill.includes('scrum') || lowerSkill.includes('project')) {
      return "Methodology";
    }
    
    return "Other";
  };

  const getImpactColor = (impactScore: number) => {
    if (impactScore >= 70) return "text-red-600 bg-red-50 border-red-200";
    if (impactScore >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    if (impactScore >= 30) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 70) return "bg-red-500";
    if (frequency >= 50) return "bg-orange-500";
    if (frequency >= 30) return "bg-amber-500";
    return "bg-yellow-500";
  };

  const handleRefresh = () => {
    loadSkillGapAnalysis();
    toast.info("Refreshing Analysis", {
      description: "Updating skill gap analysis...",
    });
  };

  const handleExport = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `skill-gap-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Exported Successfully", {
      description: "Skill gap analysis exported as JSON",
    });
  };

  const filteredSkills = analysis?.topMissingSkills.filter(skill =>
    skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (compactMode) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Skill Gaps</h3>
          </div>
          <button
            onClick={loadSkillGapAnalysis}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : analysis && analysis.topMissingSkills.length > 0 ? (
          <div className="space-y-2">
            {analysis.topMissingSkills.slice(0, 3).map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getSkillIcon(skill.skill)}
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {skill.skill}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                  {skill.frequency.toFixed(0)}%
                </span>
              </div>
            ))}
            {analysis.topMissingSkills.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, topSkills: true }))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  +{analysis.topMissingSkills.length - 3} more skills
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">No skill gaps found</p>
            <button
              onClick={loadSkillGapAnalysis}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Analyze
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Skill Gap Analysis</h2>
              <p className="text-gray-600 text-sm mt-1">
                Identify missing skills and get personalized improvement suggestions
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={!analysis}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={loadSkillGapAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Now
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your skill gaps...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {/* No Analysis State */}
      {!loading && !analysis && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit mx-auto mb-4">
              <Target className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready for Skill Gap Analysis
            </h3>
            <p className="text-gray-600 mb-6">
              Analyze your job matches to identify missing skills and get personalized improvement suggestions.
            </p>
            <button
              onClick={loadSkillGapAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300"
            >
              Start Analysis
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && analysis && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Jobs Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.totalJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Missing Skills Found</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {analysis.statistics.totalMissingSkills}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Matched Skills</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {analysis.statistics.totalMatchedSkills}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overall Match Rate</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {analysis.statistics.overallMatchRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Match Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Match Score Distribution</h3>
              </div>
              <div className="text-sm text-gray-500">
                Based on {analysis.totalJobs} jobs
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Excellent (80%+)", count: analysis.matchDistribution.excellent, color: "bg-emerald-500" },
                { label: "Good (60-79%)", count: analysis.matchDistribution.good, color: "bg-amber-500" },
                { label: "Fair (40-59%)", count: analysis.matchDistribution.fair, color: "bg-orange-500" },
                { label: "Low (<40%)", count: analysis.matchDistribution.low, color: "bg-red-500" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`h-2 ${item.color} rounded-full mb-2`} style={{ 
                    width: `${(item.count / analysis.totalJobs) * 100}%` 
                  }} />
                  <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((item.count / analysis.totalJobs) * 100).toFixed(0)}% of jobs
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Missing Skills */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between flex-col sm:flex-row mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Missing Skills</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Skills you're missing most frequently in job requirements
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, topSkills: !prev.topSkills }))}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.topSkills ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {expandedSections.topSkills && (
              <div className="space-y-4">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        selectedSkill === skill.skill 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSkill(skill.skill === selectedSkill ? null : skill.skill)}
                    >
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getSkillIcon(skill.skill)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{skill.skill}</span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {getSkillCategory(skill.skill)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Missing in {skill.count} of {analysis.totalJobs} jobs ({skill.frequency.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${getImpactColor(skill.impactScore)}`}>
                              <Zap className="w-3 h-3" />
                              Impact: {skill.impactScore.toFixed(0)}
                            </span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                              <div 
                                className={`h-full ${getFrequencyColor(skill.frequency)} rounded-full`}
                                style={{ width: `${Math.min(skill.frequency, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedSkill === skill.skill ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      
                      {selectedSkill === skill.skill && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Why this skill matters:</h4>
                              <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>High demand in {skill.frequency.toFixed(0)}% of jobs you're targeting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>Learning this could improve your match rate by ~{(skill.impactScore * 0.3).toFixed(0)}%</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span>Common requirement in {getSkillCategory(skill.skill)} roles</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick learning path:</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">Beginner level</span>
                                  <span className="text-gray-500">2-4 weeks</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">Intermediate level</span>
                                  <span className="text-gray-500">1-3 months</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">Advanced level</span>
                                  <span className="text-gray-500">3-6 months</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No skills match your search</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Personalized recommendations to improve your job match rate
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, suggestions: !prev.suggestions }))}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {expandedSections.suggestions ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
            
            {expandedSections.suggestions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.improvementSuggestions.slice(0, 6).map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                      index < 3 
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          index < 3 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index < 3 ? <Zap className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">Priority {suggestion.priority}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                        +{suggestion.estimatedImprovement}% match
                      </span>
                    </div>
                    
                    <h4 className="text-base font-semibold text-gray-900 mb-2">{suggestion.skill}</h4>
                    <p className="text-sm text-gray-600 mb-4">{suggestion.action}</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Recommended resources:</p>
                      <ul className="space-y-1">
                        {suggestion.resources.slice(0, 2).map((resource, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <BookOpen className="w-3 h-3" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Impact score: {suggestion.impactScore.toFixed(0)}</span>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          View details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistics & Details */}
          {expandedSections.statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Frequency Chart */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Skill Frequency Analysis</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(analysis.skillFrequency)
                    .sort((a, b) => (b[1].missing + b[1].matched) - (a[1].missing + a[1].matched))
                    .slice(0, 10)
                    .map(([skill, data], index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSkillIcon(skill)}
                            <span className="text-sm font-medium text-gray-900">{skill}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {data.matched} matched • {data.missing} missing
                          </div>
                        </div>
                        <div className="flex h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500"
                            style={{ width: `${(data.matched / (data.matched + data.missing)) * 100}%` }}
                          />
                          <div 
                            className="bg-red-500"
                            style={{ width: `${(data.missing / (data.matched + data.missing)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Learning Resources */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Learning Resources</h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      platform: "Coursera",
                      description: "Professional certificates from top universities",
                      link: "https://www.coursera.org"
                    },
                    {
                      platform: "Udemy",
                      description: "Affordable courses on specific technologies",
                      link: "https://www.udemy.com"
                    },
                    {
                      platform: "FreeCodeCamp",
                      description: "Free coding tutorials and projects",
                      link: "https://www.freecodecamp.org"
                    },
                    {
                      platform: "LinkedIn Learning",
                      description: "Professional development courses",
                      link: "https://www.linkedin.com/learning"
                    },
                    {
                      platform: "YouTube",
                      description: "Free tutorials and coding channels",
                      link: "https://www.youtube.com"
                    }
                  ].map((resource, index) => (
                    <a
                      key={index}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                          {resource.platform}
                        </p>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Tip:</span> Focus on 2-3 high-impact skills first
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, statistics: !prev.statistics }))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {expandedSections.statistics ? "Hide Details" : "Show More Details"}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                Export Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component untuk refresh icon
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);