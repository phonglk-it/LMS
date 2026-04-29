import type { Metadata } from "next";
import { Public_Sans } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "sonner";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "EduRio LMS",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}