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
  description: "Deconstructing short-form video DNA for the Indian creator economy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-gray-900 bg-white dark:bg-black dark:text-gray-100 relative`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
