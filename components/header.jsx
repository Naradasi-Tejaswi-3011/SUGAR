import React from "react";
import { Button } from "./ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-xl font-semibold text-pink-500 hover:text-pink-600 transition-colors">
            SUGAR
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-pink-500 transition-colors">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-pink-500 transition-colors">
              Analytics
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
