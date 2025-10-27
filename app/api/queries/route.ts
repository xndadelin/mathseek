import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { error } from "console";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data : { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                error: 'Not authenticated'
            }, {
                status: 401
            })
        }

        const { data, error: fetchError } = await supabase.from('queries').select('id,equation,created_at').eq('user_id', user.id).order('created_at', {
            ascending: false
        })

        if (fetchError) {
            throw fetchError;
        }

        return NextResponse.json({
            queries: data
        }, {
            status: 200
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to fetch queries'
        }, {
            status: 500
        })
    }
} 