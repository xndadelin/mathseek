'use client';
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user');
            const data = await response.json();
            return data.user
        },
        staleTime: 6 * 60 * 1000
    })
}