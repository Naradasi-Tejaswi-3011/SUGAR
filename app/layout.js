import { Rubik } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata = {
  title: "SUGAR - Virtual Study Room",
  description: "A focused study environment to boost your productivity",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={rubik.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
} 