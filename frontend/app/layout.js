import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "Social Lens | AI for Content",
  description: "AI-powered social media content analysis and strategy",
};

import { AmplifyProvider } from "@/components/auth/AmplifyProvider";
import { AuthProvider } from "@/components/auth/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-gray-900 bg-white dark:bg-black dark:text-gray-100 relative`}
      >
        <AmplifyProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
