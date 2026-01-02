import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Ignore errors
              }
            });
          },
        },
      }
    );

    // Verify user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cvId = searchParams.get('cvId');
    const jobId = searchParams.get('jobId');
    const limit = searchParams.get('limit') || '50';

    let query = supabase
      .from("job_recommendations")
      .select("id, job_id, title, missing_skills, matched_skills, score, company")
      .eq("user_id", user.id)
      .order("score", { ascending: false });

    // Filter berdasarkan CV ID jika diberikan
    if (cvId) {
      query = query.eq("cv_id", cvId);
    }

    // Filter berdasarkan job ID jika diberikan
    if (jobId) {
      query = query.eq("job_id", jobId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Jika tidak ada job recommendations
    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ 
        success: true,
        analysis: {
          totalJobs: 0,
          topMissingSkills: [],
          skillFrequency: {},
          improvementSuggestions: [],
          overallMissingSkills: [],
          matchDistribution: {
            excellent: 0,
            good: 0,
            fair: 0,
            low: 0
          }
        },
        message: "No job recommendations found for skill gap analysis"
      });
    }

    // Aggregasi skill gap analysis
    const missingSkillsMap: { [key: string]: number } = {};
    const matchedSkillsMap: { [key: string]: number } = {};
    let totalMissingSkills = 0;
    let totalMatchedSkills = 0;
    const matchDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      low: 0
    };

    jobs.forEach(job => {
      // Hitung distribusi match score
      const score = job.score || 0;
      if (score >= 80) matchDistribution.excellent++;
      else if (score >= 60) matchDistribution.good++;
      else if (score >= 40) matchDistribution.fair++;
      else matchDistribution.low++;

      // Aggregate missing skills
      if (job.missing_skills && Array.isArray(job.missing_skills)) {
        job.missing_skills.forEach((skill: string) => {
          if (skill && skill.trim()) {
            const cleanSkill = skill.trim().toLowerCase();
            missingSkillsMap[cleanSkill] = (missingSkillsMap[cleanSkill] || 0) + 1;
            totalMissingSkills++;
          }
        });
      }

      // Aggregate matched skills
      if (job.matched_skills && Array.isArray(job.matched_skills)) {
        job.matched_skills.forEach((skill: string) => {
          if (skill && skill.trim()) {
            const cleanSkill = skill.trim().toLowerCase();
            matchedSkillsMap[cleanSkill] = (matchedSkillsMap[cleanSkill] || 0) + 1;
            totalMatchedSkills++;
          }
        });
      }
    });

    // Urutkan missing skills berdasarkan frekuensi
    const topMissingSkills = Object.entries(missingSkillsMap)
      .map(([skill, count]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        count,
        frequency: (count / jobs.length) * 100,
        impactScore: calculateImpactScore(skill, count, jobs.length)
      }))
      .sort((a, b) => {
        // Prioritaskan berdasarkan impact score, lalu frequency, lalu count
        if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
        if (b.frequency !== a.frequency) return b.frequency - a.frequency;
        return b.count - a.count;
      })
      .slice(0, parseInt(limit));

    // Hitung skill frequency map untuk visualisasi
    const skillFrequency: { [key: string]: { missing: number, matched: number } } = {};
    
    // Gabungkan semua skills yang unique
    const allSkills = new Set([
      ...Object.keys(missingSkillsMap),
      ...Object.keys(matchedSkillsMap)
    ]);

    allSkills.forEach(skill => {
      const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
      skillFrequency[formattedSkill] = {
        missing: missingSkillsMap[skill] || 0,
        matched: matchedSkillsMap[skill] || 0
      };
    });

    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions(topMissingSkills, jobs.length);

    // Overall missing skills (unique)
    const overallMissingSkills = Array.from(new Set(
      Object.keys(missingSkillsMap).map(skill => 
        skill.charAt(0).toUpperCase() + skill.slice(1)
      )
    )).sort();

    return NextResponse.json({ 
      success: true,
      analysis: {
        totalJobs: jobs.length,
        topMissingSkills,
        skillFrequency,
        improvementSuggestions,
        overallMissingSkills,
        matchDistribution,
        statistics: {
          totalMissingSkills,
          totalMatchedSkills,
          averageMissingPerJob: totalMissingSkills / jobs.length,
          averageMatchedPerJob: totalMatchedSkills / jobs.length,
          overallMatchRate: (totalMatchedSkills / (totalMatchedSkills + totalMissingSkills)) * 100 || 0
        }
      },
      message: `Skill gap analysis completed for ${jobs.length} jobs`
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      success: false,
      error: "Failed to analyze skill gaps",
      message: err.message
    }, { status: 500 });
  }
}

// Fungsi helper untuk menghitung impact score
function calculateImpactScore(skill: string, count: number, totalJobs: number): number {
  const frequency = (count / totalJobs) * 100;
  
  // Skill yang banyak dicari di industri
  const highDemandSkills = [
    'react', 'javascript', 'typescript', 'python', 'java',
    'aws', 'docker', 'kubernetes', 'node.js', 'sql',
    'machine learning', 'data analysis', 'cloud', 'devops'
  ];
  
  // Skill yang sedang trending
  const trendingSkills = [
    'ai', 'artificial intelligence', 'generative ai', 'llm',
    'rust', 'go', 'next.js', 'react native', 'graphql'
  ];
  
  let demandMultiplier = 1.0;
  const lowerSkill = skill.toLowerCase();
  
  if (highDemandSkills.some(s => lowerSkill.includes(s) || s.includes(lowerSkill))) {
    demandMultiplier = 1.5;
  }
  
  if (trendingSkills.some(s => lowerSkill.includes(s) || s.includes(lowerSkill))) {
    demandMultiplier = 1.8;
  }
  
  // Impact score berdasarkan frequency dan demand
  return Math.round(frequency * demandMultiplier * 10) / 10;
}

// Fungsi untuk generate improvement suggestions
function generateImprovementSuggestions(topMissingSkills: any[], totalJobs: number): any[] {
  const suggestions = [];
  
  // Skill-based suggestions
  topMissingSkills.slice(0, 5).forEach((skillData, index) => {
    const skill = skillData.skill;
    const impact = skillData.impactScore;
    
    let suggestion = {
      skill,
      impactScore: impact,
      priority: index + 1,
      action: '',
      estimatedImprovement: 0,
      resources: [] as string[]
    };
    
    // Custom suggestions berdasarkan skill
    if (skill.toLowerCase().includes('react')) {
      suggestion.action = `Learn ${skill} to improve your frontend development opportunities`;
      suggestion.estimatedImprovement = Math.min(impact * 1.5, 30);
      suggestion.resources = [
        "React Official Documentation",
        "FreeCodeCamp React Course",
        "YouTube: React Tutorial for Beginners"
      ];
    } else if (skill.toLowerCase().includes('python')) {
      suggestion.action = `Master ${skill} for data science and backend development roles`;
      suggestion.estimatedImprovement = Math.min(impact * 1.3, 25);
      suggestion.resources = [
        "Python.org Official Tutorial",
        "Coursera: Python for Everybody",
        "Real Python Tutorials"
      ];
    } else if (skill.toLowerCase().includes('aws') || skill.toLowerCase().includes('cloud')) {
      suggestion.action = `Get certified in ${skill} for cloud engineering positions`;
      suggestion.estimatedImprovement = Math.min(impact * 1.8, 35);
      suggestion.resources = [
        "AWS Free Tier & Training",
        "AWS Certified Solutions Architect",
        "A Cloud Guru Courses"
      ];
    } else if (skill.toLowerCase().includes('sql')) {
      suggestion.action = `Improve your ${skill} skills for database-related roles`;
      suggestion.estimatedImprovement = Math.min(impact * 1.2, 20);
      suggestion.resources = [
        "SQLZoo Interactive Tutorial",
        "Mode Analytics SQL Tutorial",
        "LeetCode SQL Problems"
      ];
    } else {
      suggestion.action = `Develop ${skill} skills to increase your job match rate`;
      suggestion.estimatedImprovement = Math.min(impact * 1.1, 15);
      suggestion.resources = [
        "Udemy Courses",
        "LinkedIn Learning",
        "Official Documentation"
      ];
    }
    
    suggestions.push(suggestion);
  });
  
  // General improvement suggestions
  suggestions.push({
    skill: "Multiple Skills",
    impactScore: 25,
    priority: 6,
    action: "Focus on building 2-3 key skills from the missing skills list",
    estimatedImprovement: 15,
    resources: ["Create personal projects", "Contribute to open source", "Build a portfolio"]
  });
  
  suggestions.push({
    skill: "Soft Skills",
    impactScore: 15,
    priority: 7,
    action: "Improve communication and teamwork skills",
    estimatedImprovement: 10,
    resources: ["Toastmasters International", "Coursera: Communication Skills", "Team collaboration tools"]
  });
  
  return suggestions.sort((a, b) => b.impactScore - a.impactScore);
}