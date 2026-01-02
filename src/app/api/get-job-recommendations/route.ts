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

    // Verifikasi user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cvId = searchParams.get('cvId');
    const limit = searchParams.get('limit') || '10';

    let query = supabase
      .from("job_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(parseInt(limit));

    // Filter berdasarkan CV ID jika diberikan
    if (cvId) {
      query = query.eq("cv_id", cvId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data ke format yang diharapkan komponen dengan format user-friendly
    const transformedJobs = jobs?.map(job => {
      // Format tanggal yang user-friendly
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      };

      // Format posted_date jika ada
      let formattedPostedDate = job.posted_date;
      if (job.created) {
        try {
          const postedDate = new Date(job.created);
          formattedPostedDate = postedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch (e) {
          console.error("Error formatting posted date:", e);
        }
      }

      // Parse breakdown jika berupa string
      let parsedBreakdown = job.breakdown;
      if (typeof job.breakdown === 'string') {
        try {
          parsedBreakdown = JSON.parse(job.breakdown);
        } catch (e) {
          console.error("Error parsing breakdown:", e);
          parsedBreakdown = null;
        }
      }

      return {
        id: job.job_id || job.id,
        title: job.title || "No title available",
        company: job.company || "Unknown company",
        location: job.location || "Location not specified",
        url: job.url || "#",
        description: job.description || "No description available",
        score: typeof job.score === 'number' ? job.score : 0,
        matchedSkills: Array.isArray(job.matched_skills) ? job.matched_skills : [],
        missingSkills: Array.isArray(job.missing_skills) ? job.missing_skills : [],
        matchedExperience: Array.isArray(job.matched_experience) ? job.matched_experience : [],
        experienceCount: job.experienceCount || 0,
        educationMatch: Boolean(job.education_match),
        seniorityMatch: Boolean(job.seniority_match),
        posted_date: formattedPostedDate || "Recently",
        salary: job.salary || "Competitive salary",
        contract_type: job.contract_type || "Full-time",
        jobId: job.job_id,
        breakdown: parsedBreakdown,
        saved_at: job.created_at ? formatDate(job.created_at) : null,
        // Additional metadata for better UX
        match_status: job.score >= 80 ? "Excellent match" : 
                     job.score >= 60 ? "Good match" : 
                     job.score >= 40 ? "Fair match" : "Low match",
        // Untuk komponen JobRecommendations
        isSaved: true // Mark as saved untuk styling yang berbeda
      };
    }) || [];

    return NextResponse.json({ 
      success: true,
      jobs: transformedJobs,
      count: transformedJobs.length,
      message: transformedJobs.length > 0 
        ? `Found ${transformedJobs.length} saved job matches` 
        : "No saved job matches found"
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      success: false,
      error: "Failed to load job recommendations",
      message: "Please try again later"
    }, { status: 500 });
  }
}