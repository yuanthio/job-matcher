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
    const limit = searchParams.get('limit') || '50';
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * parseInt(limit);

    // Get total count
    const { count } = await supabase
      .from("saved_jobs")
      .select('*', { count: 'exact', head: true })
      .eq("user_id", user.id);

    // Get saved jobs with pagination
    const { data: savedJobs, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to match Job interface
    const jobs = savedJobs?.map(job => ({
      id: job.job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      description: job.description,
      score: job.score,
      matchedSkills: job.matched_skills || [],
      missingSkills: job.missing_skills || [],
      posted_date: job.posted_date || "Recently",
      salary: job.salary,
      contract_type: job.contract_type,
      saved_at: job.saved_at,
      isFavorite: true, // Mark as favorite
      // Additional metadata for display
      favoriteDate: new Date(job.saved_at).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    })) || [];

    return NextResponse.json({ 
      success: true,
      jobs,
      pagination: {
        total: count || 0,
        page,
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      success: false,
      error: "Failed to load favorite jobs",
      message: err.message
    }, { status: 500 });
  }
}