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

    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Clean skills array
    const cleanSkills = (data.skills || [])
      .filter((skill: string) => skill && skill.trim().length > 0)
      .map((skill: string) => skill.trim());

    // Clean experience array
    const cleanExperience = (data.experience || []).map((exp: any) => ({
      title: exp.title?.trim() || "",
      company: exp.company?.trim() || "",
      start_date: exp.start_date?.trim() || "",
      end_date: exp.end_date?.trim() || "",
      description: exp.description?.trim() || ""
    }));

    // Clean education array
    const cleanEducation = (data.education || []).map((edu: any) => ({
      school: edu.school?.trim() || "",
      degree: edu.degree?.trim() || "",
      field_of_study: edu.field_of_study?.trim() || "",
      start_year: edu.start_year?.trim() || "",
      end_year: edu.end_year?.trim() || ""
    }));

    // Get the latest CV data
    const { data: existingCv } = await supabase
      .from("parsed_cvs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let cvId;
    let resultData;

    // Prepare the data to update/insert
    const cvData = {
      user_id: user.id,
      full_name: data.full_name?.trim() || "",
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || "",
      skills: cleanSkills,
      experience: cleanExperience,
      education: cleanEducation,
      updated_at: new Date().toISOString(),
    };

    if (existingCv) {
      // Update the existing record
      const { error: updateError, data: updatedData } = await supabase
        .from("parsed_cvs")
        .update({
          ...cvData,
          file_name: existingCv.file_name || "Manual Update",
          content: existingCv.content || JSON.stringify(data),
        })
        .eq('id', existingCv.id)
        .select()
        .single();

      if (updateError) {
        console.error("DB Update Error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      cvId = updatedData?.id;
      resultData = updatedData;
    } else {
      // Insert new record
      const { error: insertError, data: newData } = await supabase
        .from("parsed_cvs")
        .insert({
          ...cvData,
          file_name: "Manual Update",
          content: JSON.stringify(data),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("DB Insert Error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      cvId = newData?.id;
      resultData = newData;
    }

    return NextResponse.json({ 
      success: true, 
      message: "CV data updated successfully",
      cvId: cvId, // Return CV ID
      data: {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        skills_count: cleanSkills.length,
        experience_count: cleanExperience.length,
        education_count: cleanEducation.length
      }
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ 
      error: err.message,
      details: "Internal server error occurred while updating CV"
    }, { status: 500 });
  }
}