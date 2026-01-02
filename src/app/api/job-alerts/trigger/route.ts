import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { JobAlertCronService } from "@/services/job-alert-cron";

// Initialize cron service
const cronService = new JobAlertCronService();

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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    if (!body.alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns this alert
    const { data: alert, error: alertError } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("id", body.alertId)
      .eq("user_id", user.id)
      .single();

    if (alertError || !alert) {
      return NextResponse.json(
        { error: "Alert not found or unauthorized" },
        { status: 404 }
      );
    }

    // Trigger alert manually
    const success = await cronService.triggerManualAlert(body.alertId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to trigger alert" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Job alert triggered successfully" 
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}