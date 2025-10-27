import { useQuery } from "@tanstack/react-query";
import { createClient } from "../supabase/server";

export default function useQueries() {
    return useQuery({
        queryKey: ['queries'],
        queryFn: async () => {
            const response = await fetch('/api/queries', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json();
            return data?.queries || [];
        },
        staleTime: 5 * 60 * 1000,
    })
}