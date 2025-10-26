import { createClient } from "../supabase/client"
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user
        },
        staleTime: 6 * 60 * 1000
    })
}
