import type { Metadata } from "next";
import "./globals.css";
import '@mantine/core/styles.css';
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MathSeek",
  description: "A math-solver platform powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
          <Providers>
            {children}
          </Providers>
      </body>
    </html>
  );
}
