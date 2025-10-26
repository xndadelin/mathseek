'use client';

import { createClient } from "../supabase/client";
export default async function auth() {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'slack_oidc',
    })

    if(error) {
        console.error('error during oauth', error);
    }
}