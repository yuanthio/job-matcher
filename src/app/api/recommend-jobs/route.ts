import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  let skills: string[] = [];
  let searchCriteria: any = null;
  let experience: any[] = [];
  let education: any[] = [];
  let cvId: number | null = null;
  
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
                // Ignore errors in API route
              }
            });
          },
        },
      }
    );

    // Verifikasi user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    skills = body.skills || [];
    searchCriteria = body.searchCriteria;
    experience = body.experience || [];
    education = body.education || [];
    cvId = body.cvId || null;

    console.log("Search criteria:", searchCriteria);
    console.log("Skills count:", skills.length);
    console.log("Experience count:", experience.length);
    console.log("Education count:", education.length);
    console.log("CV ID:", cvId);

    // Jika ada CV ID, dapatkan data CV terbaru
    let latestCvId = cvId;
    if (!latestCvId) {
      const { data: latestCv } = await supabase
        .from("parsed_cvs")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      
      if (latestCv) {
        latestCvId = latestCv.id;
      }
    }

    // Save search criteria to database for alerts
    if (searchCriteria?.jobTitle) {
      await supabase.from("saved_searches").upsert({
        user_id: user.id,
        job_title: searchCriteria.jobTitle,
        location: searchCriteria.location || null,
        is_remote: searchCriteria.isRemote || false,
        last_searched_at: new Date().toISOString(),
      });
    }

    // Determine what to search for
    let searchQuery = "";
    if (searchCriteria?.jobTitle) {
      // Use job title from search criteria
      searchQuery = searchCriteria.jobTitle;
      if (skills.length > 0) {
        // Also include skills if available
        searchQuery = `${searchQuery} ${skills.slice(0, 3).join(" ")}`;
      }
    } else if (skills.length > 0) {
      // Use skills from CV
      searchQuery = skills.slice(0, 3).join(" OR ");
    } else {
      return NextResponse.json({ jobs: [] });
    }

    // Add location filter if specified
    let locationFilter = "";
    if (searchCriteria?.location) {
      locationFilter = `&where=${encodeURIComponent(searchCriteria.location)}`;
    }

    // Add remote filter if specified
    let remoteFilter = "";
    if (searchCriteria?.isRemote) {
      remoteFilter = "&remote=true";
    }

    console.log("Final search query:", searchQuery);

    // Fetch jobs dari Adzuna
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=7e991c55&app_key=44fdd5cf726de082d08a7e5925cb44be&results_per_page=10&what=${encodeURIComponent(searchQuery)}${locationFilter}${remoteFilter}&max_days_old=30`;

    console.log("Adzuna URL:", adzunaUrl);

    const jobRes = await fetch(adzunaUrl);
    
    if (!jobRes.ok) {
      console.error("Adzuna API error status:", jobRes.status);
      const errorText = await jobRes.text();
      console.error("Adzuna API error text:", errorText);
      
      // Coba load dari database jika API error
      const { data: savedJobs } = await supabase
        .from("job_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(10);
      
      if (savedJobs && savedJobs.length > 0) {
        console.log("Loaded from database:", savedJobs.length, "jobs");
        return NextResponse.json({ 
          jobs: savedJobs.map(job => ({
            ...job,
            matchedSkills: job.matched_skills || [],
            missingSkills: job.missing_skills || [],
            matchedExperience: job.matched_experience || [],
          }))
        });
      }
      
      return NextResponse.json({ jobs: [] });
    }

    const jobJson = await jobRes.json();
    console.log("Adzuna API response count:", jobJson.results?.length || 0);
    
    const jobs = jobJson.results || [];

    // Calculate match score
    const computed = jobs.map((job: any) => {
      const jobTitle = (job.title || "").toLowerCase();
      const jobDescription = (job.description || "").toLowerCase();
      const jobCategory = (job.category?.label || "").toLowerCase();
      const jobCompany = (job.company?.display_name || "").toLowerCase();
      
      const jobText = `${jobTitle} ${jobDescription} ${jobCategory} ${jobCompany}`;
      
      const jobKeywords = jobText
        .match(/\b[a-zA-Z]{3,}\b/g)
        ?.map((word: string) => word.toLowerCase())
        .filter((word: string) => word.length > 3)
        .slice(0, 50) || [];

      // Cari skill yang match
      const matchedSkills = skills.filter((skill: string) => {
        const cleanSkill = skill.toLowerCase().trim();
        if (!cleanSkill) return false;
        
        if (jobText.includes(cleanSkill)) return true;
        
        const skillWords = cleanSkill.split(/[\s\-_]+/);
        return skillWords.some(word => 
          word.length > 2 && jobText.includes(word)
        );
      });

      const missingSkills = skills.filter(
        (skill: string) => !matchedSkills.includes(skill)
      );

      // Calculate experience match
      let matchedExperience: string[] = [];
      let experienceScore = 0;
      
      if (experience.length > 0) {
        const jobExpKeywords = [
          'junior', 'mid', 'senior', 'lead', 'manager', 'director',
          'entry', 'associate', 'intern', 'experienced', 'expert'
        ];
        
        const jobExpLevel = jobExpKeywords.find(keyword => 
          jobText.includes(keyword)
        ) || '';
        
        matchedExperience = experience
          .map((exp: any) => {
            const expTitle = (exp.title || "").toLowerCase();
            const expCompany = (exp.company || "").toLowerCase();
            const expText = `${expTitle} ${expCompany}`;
            
            const expKeywords = expText.split(/[\s\-_]+/).filter(w => w.length > 3);
            const hasMatch = expKeywords.some(keyword => 
              jobText.includes(keyword)
            );
            
            return hasMatch ? exp.title : null;
          })
          .filter(Boolean) as string[];
        
        experienceScore = Math.min((matchedExperience.length / Math.max(experience.length, 1)) * 30, 30);
      }

      // Calculate education match
      let educationMatch = false;
      let educationScore = 0;
      
      if (education.length > 0) {
        const eduKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'university', 'college'];
        const hasEducationMatch = eduKeywords.some(keyword => 
          jobText.includes(keyword)
        );
        
        if (hasEducationMatch) {
          educationMatch = true;
          educationScore = 10;
        }
      }

      // Calculate base score
      let skillsScore = 0;
      if (skills.length > 0) {
        skillsScore = Math.round((matchedSkills.length / skills.length) * 50);
      }

      // Bonus for job title relevance
      let titleBonus = 0;
      if (searchCriteria?.jobTitle) {
        const searchTitle = searchCriteria.jobTitle.toLowerCase();
        if (jobTitle.includes(searchTitle)) {
          titleBonus = 15;
        } else if (jobText.includes(searchTitle)) {
          titleBonus = 10;
        }
      }

      // Bonus untuk skill umum
      const commonTechSkills = ["javascript", "python", "java", "react", "node", "sql", "html", "css", "typescript"];
      const commonSkillBonus = commonTechSkills.filter(skill => 
        jobText.includes(skill)
      ).length * 3;

      const seniorityScore = 5;
      
      const finalScore = Math.min(
        skillsScore + experienceScore + educationScore + titleBonus + commonSkillBonus + seniorityScore, 
        100
      );
      
      // Format posted date
      const postedDate = job.created ? new Date(job.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : "Recently";

      const breakdown = {
        skills: skillsScore,
        experience: experienceScore,
        education: educationScore,
        seniority: seniorityScore,
        bonus: titleBonus + commonSkillBonus
      };

      return {
        id: job.id?.toString() || `${job.title}-${job.company}-${Date.now()}`,
        title: job.title || "No title",
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "Remote",
        url: job.redirect_url || `https://www.adzuna.co.uk/jobs/details/${job.id}`,
        description: job.description || "No description available",
        score: finalScore,
        matchedSkills: matchedSkills,
        missingSkills: missingSkills,
        matchedExperience: matchedExperience,
        experienceCount: experience.length,
        educationMatch: educationMatch,
        seniorityMatch: true,
        posted_date: postedDate,
        salary: job.salary_min ? `£${job.salary_min.toLocaleString()}` : "Competitive",
        contract_type: job.contract_type || "Full-time",
        jobId: job.id,
        breakdown: breakdown,
        searchCriteria: searchCriteria
      };
    });

    // Sort by score descending
    computed.sort((a: any, b: any) => b.score - a.score);

    // Take top 10 jobs
    const resultJobs = computed.slice(0, 10);

    console.log("Final jobs count:", resultJobs.length);

    // Save jobs to database
    if (resultJobs.length > 0 && latestCvId) {
      const jobsToSave = resultJobs.map((job: any) => ({
        user_id: user.id,
        cv_id: latestCvId,
        job_id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        score: job.score,
        matched_skills: job.matchedSkills,
        missing_skills: job.missingSkills,
        matched_experience: job.matchedExperience,
        education_match: job.educationMatch,
        seniority_match: job.seniorityMatch,
        posted_date: job.posted_date,
        salary: job.salary,
        contract_type: job.contract_type,
        breakdown: job.breakdown,
        search_criteria: job.searchCriteria,
        updated_at: new Date().toISOString()
      }));

      // Delete old recommendations for this CV
      if (latestCvId) {
        await supabase
          .from("job_recommendations")
          .delete()
          .eq("user_id", user.id)
          .eq("cv_id", latestCvId);
      }

      // Insert new recommendations
      const { error: saveError } = await supabase
        .from("job_recommendations")
        .insert(jobsToSave);

      if (saveError) {
        console.error("Error saving recommendations:", saveError);
      } else {
        console.log("Saved", jobsToSave.length, "job recommendations to database");
      }
    }

    return NextResponse.json({ 
      jobs: resultJobs,
      cvId: latestCvId,
      searchQuery,
      skillCount: skills.length,
      searchCriteria,
      hasExperience: experience.length > 0,
      hasEducation: education.length > 0
    });

  } catch (err: any) {
    console.error("Error in recommend-jobs:", err);
    
    // Return empty array untuk error
    return NextResponse.json({ 
      jobs: []
    });
  }
}