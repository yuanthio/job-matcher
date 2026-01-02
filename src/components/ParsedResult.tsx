"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from "react";
import { Edit2, Save, X, Plus, Trash2, User, Mail, Phone, Code, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
}

interface ParsedData {
  full_name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

interface ParsedResultProps {
  jsonText: string;
  onSave?: (data: ParsedData) => Promise<void>;
  readOnly?: boolean;
  onDataChange?: (data: ParsedData) => void;
}

export interface ParsedResultRef {
  setIsEditing: (value: boolean) => void;
  getCurrentData: () => ParsedData;
}

const ParsedResult = forwardRef<ParsedResultRef, ParsedResultProps>(({ 
  jsonText, 
  onSave, 
  readOnly = false,
  onDataChange
}, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ParsedData>({
    full_name: "",
    email: "",
    phone: "",
    skills: [],
    experience: [],
    education: []
  });

  // Gunakan ref untuk mencegah infinite loop
  const lastJsonTextRef = useRef<string>("");
  const isInitialMount = useRef(true);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setIsEditing: (value: boolean) => {
      setIsEditing(value);
    },
    getCurrentData: () => data
  }));

  // Parse JSON text when component mounts or jsonText changes
  useEffect(() => {
    if (!jsonText || jsonText === lastJsonTextRef.current) {
      return;
    }

    try {
      // Try to parse as JSON directly first
      let parsedData;
      if (jsonText.startsWith('{')) {
        parsedData = JSON.parse(jsonText);
      } else {
        // If it's a string containing JSON, try to extract it
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedData = JSON.parse(match[0]);
        }
      }

      if (parsedData) {
        const newData = {
          full_name: parsedData.full_name || "",
          email: parsedData.email || "",
          phone: parsedData.phone || "",
          skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
          experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((exp: any) => ({
            title: exp.title || "",
            company: exp.company || "",
            start_date: exp.start_date || "",
            end_date: exp.end_date || "",
            description: exp.description || ""
          })) : [],
          education: Array.isArray(parsedData.education) ? parsedData.education.map((edu: any) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            field_of_study: edu.field_of_study || "",
            start_year: edu.start_year || "",
            end_year: edu.end_year || ""
          })) : []
        };
        
        // Update ref untuk track perubahan
        lastJsonTextRef.current = jsonText;
        
        // Set data hanya jika berbeda
        setData(prevData => {
          if (JSON.stringify(prevData) === JSON.stringify(newData)) {
            return prevData;
          }
          return newData;
        });
        
        // Notify parent component tentang initial data change
        // Hanya panggil onDataChange saat initial mount atau jika data benar-benar berbeda
        if (isInitialMount.current) {
          isInitialMount.current = false;
          if (onDataChange) {
            setTimeout(() => onDataChange(newData), 0);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      toast.error("Data Format Error", {
        description: "Could not parse CV data. Please edit manually.",
      });
    }
  }, [jsonText]); // Hanya depend pada jsonText

  // Handler functions dengan useCallback untuk mencegah re-render berlebihan
  const handleSkillChange = useCallback((index: number, value: string) => {
    setData(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      const newData = { ...prev, skills: newSkills };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const addSkill = useCallback(() => {
    setData(prev => {
      const newData = { ...prev, skills: [...prev.skills, ""] };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const removeSkill = useCallback((index: number) => {
    setData(prev => {
      const newSkills = prev.skills.filter((_, i) => i !== index);
      const newData = { ...prev, skills: newSkills };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const handleExperienceChange = useCallback((index: number, field: keyof Experience, value: string) => {
    setData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      const newData = { ...prev, experience: newExperience };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const addExperience = useCallback(() => {
    setData(prev => {
      const newData = {
        ...prev,
        experience: [...prev.experience, {
          title: "",
          company: "",
          start_date: "",
          end_date: "",
          description: ""
        }]
      };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const removeExperience = useCallback((index: number) => {
    setData(prev => {
      const newExperience = prev.experience.filter((_, i) => i !== index);
      const newData = { ...prev, experience: newExperience };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const handleEducationChange = useCallback((index: number, field: keyof Education, value: string) => {
    setData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      const newData = { ...prev, education: newEducation };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const addEducation = useCallback(() => {
    setData(prev => {
      const newData = {
        ...prev,
        education: [...prev.education, {
          school: "",
          degree: "",
          field_of_study: "",
          start_year: "",
          end_year: ""
        }]
      };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const removeEducation = useCallback((index: number) => {
    setData(prev => {
      const newEducation = prev.education.filter((_, i) => i !== index);
      const newData = { ...prev, education: newEducation };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        // Clean up data before saving
        const cleanData = {
          ...data,
          skills: data.skills.filter(skill => skill && skill.trim().length > 0).map(skill => skill.trim()),
          experience: data.experience.map(exp => ({
            title: exp.title?.trim() || "",
            company: exp.company?.trim() || "",
            start_date: exp.start_date?.trim() || "",
            end_date: exp.end_date?.trim() || "",
            description: exp.description?.trim() || ""
          })),
          education: data.education.map(edu => ({
            school: edu.school?.trim() || "",
            degree: edu.degree?.trim() || "",
            field_of_study: edu.field_of_study?.trim() || "",
            start_year: edu.start_year?.trim() || "",
            end_year: edu.end_year?.trim() || ""
          }))
        };
        
        await onSave(cleanData);
        setIsEditing(false);
        
        // Update local data with cleaned version
        setData(cleanData);
        
        // Notify parent component tentang final saved data
        if (onDataChange) {
          setTimeout(() => onDataChange(cleanData), 0);
        }
        
      } catch (error) {
        console.error("Failed to save:", error);
        toast.error("Save Failed", {
          description: "Failed to save changes. Please try again.",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handler untuk perubahan field secara langsung
  const handleDirectFieldChange = useCallback((field: keyof ParsedData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Notify parent component about data change
      if (onDataChange && isEditing) {
        setTimeout(() => onDataChange(newData), 0);
      }
      
      return newData;
    });
  }, [onDataChange, isEditing]);

  const skillsString = data.skills.filter(s => s.trim()).join(", ");

  return (
    <div className="space-y-6">
      {/* Header dengan tombol edit/save */}
      {!readOnly && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes & Update Jobs"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
                Edit Information
              </button>
            )}
          </div>
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Personal Info</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={data.full_name}
                  onChange={(e) => handleDirectFieldChange('full_name', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 font-medium">{data.full_name || "-"}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleDirectFieldChange('email', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900 font-medium">{data.email || "-"}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleDirectFieldChange('phone', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 font-medium">{data.phone || "-"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          </div>
          {isEditing && (
            <button
              onClick={addSkill}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            {data.skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(i, e.target.value)}
                  placeholder="Enter skill (e.g., React, Python)"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeSkill(i)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {data.skills.length === 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">No skills added yet. Click "Add Skill" to add one.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(s => s.trim()).length > 0 ? (
              data.skills.filter(s => s.trim()).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 text-sm">No skills found. Click "Edit Information" to add skills.</p>
              </div>
            )}
          </div>
        )}
        
        {!isEditing && skillsString && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Skills for job matching:</span> {skillsString}
            </p>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
          </div>
          {isEditing && (
            <button
              onClick={addExperience}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          )}
        </div>

        <div className="space-y-4">
          {data.experience.length > 0 ? (
            data.experience.map((exp, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-200 relative group"
              >
                {isEditing && (
                  <button
                    onClick={() => removeExperience(i)}
                    className="absolute top-3 right-3 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(i, 'title', e.target.value)}
                          placeholder="e.g., Software Engineer"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(i, 'company', e.target.value)}
                          placeholder="e.g., Google, Microsoft"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.start_date}
                          onChange={(e) => handleExperienceChange(i, 'start_date', e.target.value)}
                          placeholder="e.g., Jan 2020"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.end_date}
                          onChange={(e) => handleExperienceChange(i, 'end_date', e.target.value)}
                          placeholder="e.g., Present"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(i, 'description', e.target.value)}
                        placeholder="Describe your role and responsibilities..."
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium text-base">{exp.title || "No title"}</p>
                        <p className="text-gray-600 text-sm">{exp.company || "Unknown company"}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {exp.start_date || "?"} — {exp.end_date || "Present"}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-sm mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
              <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No experience recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          </div>
          {isEditing && (
            <button
              onClick={addEducation}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          )}
        </div>

        <div className="space-y-4">
          {data.education.length > 0 ? (
            data.education.map((edu, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-200 relative group"
              >
                {isEditing && (
                  <button
                    onClick={() => removeEducation(i)}
                    className="absolute top-3 right-3 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(i, 'degree', e.target.value)}
                        placeholder="e.g., Bachelor of Science"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">School</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(i, 'school', e.target.value)}
                          placeholder="e.g., University of Technology"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field_of_study}
                          onChange={(e) => handleEducationChange(i, 'field_of_study', e.target.value)}
                          placeholder="e.g., Computer Science"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.start_year}
                          onChange={(e) => handleEducationChange(i, 'start_year', e.target.value)}
                          placeholder="e.g., 2018"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.end_year}
                          onChange={(e) => handleEducationChange(i, 'end_year', e.target.value)}
                          placeholder="e.g., 2022 or Present"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium text-base">{edu.degree || "No degree"}</p>
                        <p className="text-gray-600 text-sm">{edu.school || "Unknown school"}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {edu.start_year || "?"} — {edu.end_year || "Present"}
                      </span>
                    </div>
                    {edu.field_of_study && (
                      <p className="text-gray-700 text-sm mt-1">
                        <span className="font-medium">Field:</span> {edu.field_of_study}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
              <GraduationCap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No education history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ParsedResult.displayName = "ParsedResult";

export default ParsedResult;