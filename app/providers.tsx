'use client';
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children} : { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={{
                fontFamily: 'Poppins, Arial, Helvetica, sans-serif'
            }} defaultColorScheme="dark" withGlobalClasses>
                {children}
            </MantineProvider>
        </QueryClientProvider>
    )
}