import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error} = await supabase.auth.getUser();
    
    if(!user) {
        return NextResponse.json({
            user: null
        })
    } else {
        return NextResponse.json({
            user
        })
    }
}