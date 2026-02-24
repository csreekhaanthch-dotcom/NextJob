// app/api/jobs/list/route.ts

import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();

    // IMPORTANT: Change "jobs" to your actual table name in Supabase
    const { data, error } = await supabase
      .from("jobs") 
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Could not fetch jobs." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}