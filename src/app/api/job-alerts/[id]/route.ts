import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// IMPORTANT: Export dinamic route segment config
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // WAIT for params to resolve
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const body = await req.json();
    
    // Validate Telegram target if provided
    if (body.telegramTarget) {
      // Helper function untuk validasi
      const validateTelegramTarget = (target: string): boolean => {
        if (!target) return true;
        const usernameRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
        const chatIdRegex = /^\d+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (usernameRegex.test(target)) return true;
        if (chatIdRegex.test(target)) return true;
        if (phoneRegex.test(target.replace(/^\+/, ''))) return true;
        return false;
      };
      
      const isValid = validateTelegramTarget(body.telegramTarget);
      if (!isValid) {
        return NextResponse.json(
          { 
            error: "Invalid Telegram target format. Use:\n" +
                   "- Username (e.g., johndoe or @johndoe)\n" +
                   "- Chat ID (numbers only, e.g., 123456789)\n" +
                   "- Phone number (with or without +)"
          },
          { status: 400 }
        );
      }
    }

    // Update alert
    const { data, error } = await supabase
      .from("job_alerts")
      .update({
        name: body.name,
        job_title: body.jobTitle,
        location: body.location || null,
        is_remote: body.isRemote || false,
        skills: body.skills || [],
        frequency: body.frequency || "daily",
        telegram_target: body.telegramTarget || null, // Update ke telegram_target
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      alert: data,
      message: "Job alert updated successfully" 
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Sama seperti di atas
) {
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

    // WAIT for params to resolve
    const { id } = await params; // PERHATIAN: await di sini!
    
    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    // Delete alert
    const { error } = await supabase
      .from("job_alerts")
      .delete()
      .eq("id", id) // Gunakan id yang sudah di-resolve
      .eq("user_id", user.id);

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Job alert deleted successfully" 
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Tambahkan GET untuk mengambil single alert
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // WAIT for params to resolve
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    // Get single alert
    const { data: alert, error } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ alert });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}