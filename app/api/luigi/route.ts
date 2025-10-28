import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { luigiInput } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            throw new Error("DeepSeek API key is not configured yet.")
        }

        if (!user) {
            return NextResponse.json({
                error: 'Not authenticated.'
            }, {
                status: 401
            })
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: luigiInput
                }],
                temperature: 0.2
            })
        })

        if(!response.ok) {
            const text = await response.text();
            return NextResponse.json({
                error: `DeepSeek API ERROR: ${response.status} - ${text}`
            }, {
                status: 502
            })
        }
        const data = await response.json();
        const completion = data.choices[0].message.content;

        return NextResponse.json({
            result: completion,
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to process request'
        }, {
            status: 500
        })
    }
}