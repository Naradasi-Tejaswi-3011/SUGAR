"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-purple-100 p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-pink-500 hover:text-pink-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your study journey</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200",
                formFieldInput: 
                  "border-2 border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200",
                card: "rounded-xl shadow-none",
              },
            }}
            routing="path"
            path="/auth/signin"
            signUpUrl="/auth/signup"
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-pink-500 hover:text-pink-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 