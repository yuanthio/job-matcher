import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // get uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // File ke Gemini format
    const uploadFile = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf",
      },
    };

    const prompt = `
        Extract structured resume data in CLEAN JSON ONLY.
        Do NOT include explanations.

        Return JSON with the following shape:

        {
        "full_name": "",
        "email": "",
        "phone": "",
        "skills": ["", ""],
        "experience": [
            {
            "title": "",
            "company": "",
            "start_date": "",
            "end_date": "",
            "description": ""
            }
        ],
        "education": [
            {
            "school": "",
            "degree": "",
            "field_of_study": "",
            "start_year": "",
            "end_year": ""
            }
        ]
        }

        Rules:
        - Always include **school**, **degree**, **field_of_study**, **start_year**, **end_year** for education.
        - If something is missing in the PDF, set the field to an empty string "" (never omit keys).
        - Keep all text concise.
        `;

    const geminiResponse = await model.generateContent([
      { text: prompt },
      uploadFile,
    ]);

    const text = geminiResponse.response.text();

    if (!text) {
      return NextResponse.json(
        { error: "Gemini parsing failed" },
        { status: 500 }
      );
    }

    // Parse JSON untuk mendapatkan data terstruktur
    let parsedData = null;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
    }

    // Cek apakah user sudah punya data CV
    const { data: existingCv } = await supabase
      .from("parsed_cvs")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let cvId;
    let insertedData;

    if (existingCv) {
      // Update existing CV
      const { error: updateError, data: updatedData } = await supabase
        .from("parsed_cvs")
        .update({
          file_name: file.name,
          content: text,
          full_name: parsedData?.full_name || "",
          email: parsedData?.email || "",
          phone: parsedData?.phone || "",
          skills: parsedData?.skills || [],
          experience: parsedData?.experience || [],
          education: parsedData?.education || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCv.id)
        .select()
        .single();

      if (updateError) {
        console.error("DB Update Error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      cvId = updatedData?.id;
      insertedData = updatedData;
    } else {
      // Insert new CV
      const { error: insertError, data: newData } = await supabase
        .from("parsed_cvs")
        .insert({
          user_id: user.id,
          file_name: file.name,
          content: text,
          full_name: parsedData?.full_name || "",
          email: parsedData?.email || "",
          phone: parsedData?.phone || "",
          skills: parsedData?.skills || [],
          experience: parsedData?.experience || [],
          education: parsedData?.education || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("DB Insert Error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      cvId = newData?.id;
      insertedData = newData;
    }

    return NextResponse.json({ 
      parsed: text,
      structured_data: parsedData,
      cvId: cvId, // Return CV ID
      message: "CV parsed and saved successfully" 
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      error: err.message,
      details: "Internal server error occurred while parsing CV"
    }, { status: 500 });
  }
}