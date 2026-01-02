// job-matcher/src/app/api/job-alerts/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper function untuk validasi Telegram target
function validateTelegramTarget(target: string): boolean {
  if (!target) return true; // Boleh kosong
  
  // Bisa berupa:
  // 1. Username: johndoe atau @johndoe (5-32 karakter, huruf, angka, underscore)
  // 2. Chat ID: angka (123456789)
  // 3. Phone number: +6281234567890 (optional)
  
  const usernameRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
  const chatIdRegex = /^\d+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  // Test untuk username (dengan atau tanpa @)
  if (usernameRegex.test(target)) {
    return true;
  }
  
  // Test untuk chat_id (angka saja)
  if (chatIdRegex.test(target)) {
    return true;
  }
  
  // Test untuk nomor telepon (dengan atau tanpa +)
  if (phoneRegex.test(target.replace(/^\+/, ''))) {
    return true;
  }
  
  return false;
}

export async function GET() {
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

    // Get user's job alerts
    const { data: alerts, error } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alerts });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    
    // Validate required fields
    if (!body.name || !body.jobTitle) {
      return NextResponse.json(
        { error: "Name and job title are required" },
        { status: 400 }
      );
    }

    // Validate Telegram target if provided
    if (body.telegramTarget) {
      // Validasi format: bisa angka (chat_id) atau username
      const isValid = validateTelegramTarget(body.telegramTarget);
      if (!isValid) {
        return NextResponse.json(
          { 
            error: "Invalid Telegram target format. Use:\n" +
                   "- Username (e.g., johndoe or @johndoe, 5-32 characters, letters/numbers/underscore)\n" +
                   "- Chat ID (numbers only, e.g., 123456789)\n" +
                   "- Phone number (with or without +, e.g., +6281234567890)" 
          },
          { status: 400 }
        );
      }
    }

    // Create new alert
    const { data, error } = await supabase
      .from("job_alerts")
      .insert({
        user_id: user.id,
        name: body.name,
        job_title: body.jobTitle,
        location: body.location || null,
        is_remote: body.isRemote || false,
        skills: body.skills || [],
        frequency: body.frequency || "daily",
        telegram_target: body.telegramTarget || null, // Ganti ke telegram_target
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      alert: data,
      message: "Job alert created successfully" 
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}