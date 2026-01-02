// job-matcher/src/app/api/telegram/test/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TelegramNotifier } from "@/services/telegram-notifier";

const telegramNotifier = new TelegramNotifier(process.env.TELEGRAM_BOT_TOKEN!);

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
    
    if (!body.telegramTarget) {
      return NextResponse.json(
        { error: "Telegram target is required" },
        { status: 400 }
      );
    }

    // Send a test message
    const testMessage = `🔔 *Connection Test Successful!*\n\n` +
      `Your Telegram is correctly set up for job alerts!\n\n` +
      `*Next steps:*\n` +
      `1. Save this alert\n` +
      `2. You'll receive job notifications based on your chosen frequency\n` +
      `3. Make sure to keep this chat active with @YuanJobMatcher_bot\n\n` +
      `_✨ You're all set!_`;

    const success = await telegramNotifier.sendMessage(body.telegramTarget, testMessage);

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: "Telegram connection test successful" 
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: "Failed to send test message. Make sure you've started a chat with @YuanJobMatcher_bot on Telegram." 
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      success: false,
      error: "Server error: " + err.message 
    }, { status: 500 });
  }
}