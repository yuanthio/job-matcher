import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
              } catch {}
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

    const body = await req.json();
    const { job, action = 'save' } = body;
    
    if (!job) {
      return NextResponse.json({ error: "Job data required" }, { status: 400 });
    }

    if (action === 'unsave') {
      // Remove from saved jobs
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", job.id || job.jobId);

      if (error) {
        console.error("DB Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Job removed from favorites",
        action: 'removed',
        jobId: job.id || job.jobId,
        jobTitle: job.title
      });
    } else {
      // Save job to database
      const { error } = await supabase
        .from("saved_jobs")
        .upsert({
          user_id: user.id,
          job_id: job.id || job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          description: job.description,
          score: job.score,
          matched_skills: job.matchedSkills || job.matched || [],
          missing_skills: job.missingSkills || job.missing || [],
          posted_date: job.posted_date,
          salary: job.salary,
          contract_type: job.contract_type,
          saved_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,job_id'
        });

      if (error) {
        console.error("DB Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Job saved to favorites",
        action: 'saved',
        jobId: job.id || job.jobId,
        jobTitle: job.title,
        company: job.company,
        saved_at: new Date().toISOString()
      });
    }

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      error: err.message,
      details: "Failed to process favorite job request"
    }, { status: 500 });
  }
}