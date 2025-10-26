'use client';
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            
        }
    })
}