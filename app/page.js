"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import PageWrapper from "@/components/PageWrapper";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const features = [
    {
      title: "Prevent Tab Switching",
      description: "Stay focused on your studies by blocking distracting websites and apps.",
      imageUrl: "https://media.gcflearnfree.org/content/55e0941392956f3c3dae3396_07_30_2015/tips_managingmultiplewindows_snap.jpg"
    },
    {
      title: "Focus Assist",
      description: "Enhance your concentration with customizable study timers and break reminders.",
      imageUrl: "https://collegerover.com/images/campus-library/78/music-midterms.jpg"
    },
    {
      title: "Drag and Drop Files",
      description: "Easily organize your study materials by dragging files directly into your study session.",
      imageUrl: "https://cdn-icons-png.freepik.com/128/8202/8202904.png"
    },
    {
      title: "Companion Study Mode",
      description: "Collaborate with friends in real-time group study sessions.",
      imageUrl: "https://clockify.me/blog/wp-content/uploads/2021/06/Learn-together-social.png"
    },
    {
      title: "To-Do List Organization",
      description: "Keep track of your tasks and assignments with our intuitive to-do list feature.",
      imageUrl: "https://cdn-icons-png.freepik.com/512/8476/8476676.png"
    },
    {
      title: "Reward System",
      description: "Stay motivated with rewards for maintaining your study streak and achieving goals.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVmlvTlmZUfZi9US6Tz4BVea8N_LhcfcFjgA&s"
    }
  ];

  return (
    <PageWrapper>
      {/* Navigation Bar */}
      <div className="sticky top-0 w-full z-10 bg-white bg-opacity-95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 logo-wrapper">
              <img src="/logo.png" alt="Sugar Cube Logo" className="h-full w-full object-contain drop-shadow-md sugar-logo" />
            </div>
            <h1 className="text-2xl font-bold text-blue-600 tracking-wider">SUGAR</h1>
          </div>
          <div className="flex space-x-3">
            <Link href="/auth/signin" className="bg-blue-100 px-5 py-2 rounded-full text-blue-700 hover:bg-blue-200 transition-all duration-300 font-medium shadow-sm hover:shadow-md">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-blue-600 px-5 py-2 rounded-full text-white hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section with iframe background */}
      <div className="relative flex flex-col items-center justify-center min-h-[75vh]">
        {/* Iframe background */}
        <iframe 
          src="https://cubes-ur9v.vercel.app/" 
          className="absolute inset-0 w-full h-full border-none z-0 opacity-60"
          title="Animated background with floating cubes"
        />
        
        {/* Background overlay for more professional look */}
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm z-0"></div>
        
        {/* Floating Sugar Cubes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div 
              key={`cube-${index}`}
              className={`absolute opacity-40 floating-cube-${index}`}
              style={{
                left: `${12 * index}%`,
                top: `${10 * (index % 4) + 20}%`,
                transform: `rotate(${(index * 3) - 10}deg)`
              }}
            >
              <img 
                src="/logo.png" 
                alt="Floating sugar cube" 
                className="w-10 h-10 md:w-12 md:h-12 opacity-30 sugar-logo"
              />
            </div>
          ))}
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center py-24 px-4 max-w-4xl mx-auto text-center">
          {/* Bubble Animation Container */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((index) => (
              <div 
                key={index}
                className={`absolute rounded-full bubble-${index} ${
                  index % 3 === 0 ? 'bg-blue-200' : 
                  index % 3 === 1 ? 'bg-blue-100' : 'bg-blue-300'
                }`}
                style={{
                  width: `${(index % 3) * 8 + 8}px`,
                  height: `${(index % 3) * 8 + 8}px`,
                  left: `${(index * 5) % 100}%`,
                  top: `${(index * 7) % 100}%`
                }}
              />
            ))}
          </div>
          
          {/* Logo and Sugar Cube Character */}
          <div className="mb-6 relative">
            <div className="relative h-36 w-36 mx-auto logo-wrapper">
              {/* Subtle glow effect behind the cube */}
              <div className="absolute inset-0 bg-blue-300 rounded-full filter blur-xl opacity-20 animate-pulse"></div>
              <img src="/logo.png" alt="Sugar Cube Character" className="h-full w-full object-contain drop-shadow-md relative z-10 sugar-logo hero-sugar-cube" />
              {/* Light bulb icon with reduced animation */}
              <div className="absolute -top-8 -left-8 animate-pulse" style={{ animationDuration: '3s' }}>
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 bg-blue-200 rounded-full opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 text-blue-400">
                    <path 
                      d="M9 21h6m-6-4h6m-6-1h6m-3-15a7 7 0 0 1 7 7c0 2.5-2 4-3 5.5-.5.8-1 1.5-1 2.5h-6c0-1-.5-1.7-1-2.5-1-1.5-3-3-3-5.5a7 7 0 0 1 7-7Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Title with Animation */}
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 mb-3">
            SUGAR
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl font-medium text-gray-700 mb-8 italic">
            <span className="inline-block animate-slideRight">Padhai ki meethi shuruvadh.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-12">
            <Link href="/auth/signup" 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 relative overflow-hidden group">
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link href="/study-room" 
              className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-md border border-blue-200 hover:shadow-lg hover:scale-105 transform transition-all duration-300 hover:bg-blue-50 group">
              <span className="group-hover:text-blue-700 transition-colors duration-300">Explore Features</span>
            </Link>
          </div>
          
          {/* Scroll Down Icon */}
          <a href="#features" className="absolute bottom-10 animate-bounce text-gray-800 flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Scroll to learn more</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Our Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover all the tools we offer to enhance your studying experience and boost productivity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards with Animation */}
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden group"
              >
                <div className="h-48 overflow-hidden rounded-lg mb-5 relative">
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h2>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonial Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">What Students Might Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial Cards */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-500 mb-4">★★★★★</div>
              <p className="text-gray-700 italic mb-4">"SUGAR helped me improve my focus during late-night study sessions. The timer feature is amazing!"</p>
              <p className="font-semibold">- Riya Sharma</p>
              <p className="text-sm text-gray-500">Engineering Student</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-500 mb-4">★★★★★</div>
              <p className="text-gray-700 italic mb-4">"The notes summarizer is a game-changer! It saves me hours of work condensing my study materials."</p>
              <p className="font-semibold">- Arjun Patel</p>
              <p className="text-sm text-gray-500">Medical Student</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-500 mb-4">★★★★★</div>
              <p className="text-gray-700 italic mb-4">"Studying with friends using companion mode made remote learning actually enjoyable!"</p>
              <p className="font-semibold">- Priya Singh</p>
              <p className="text-sm text-gray-500">MBA Student</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <img src="/logo.png" alt="Sugar Logo" className="w-8 h-8 sugar-logo" />
              <span className="text-2xl font-bold text-blue-400">SUGAR</span>
            </div>
            
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a href="#" className="hover:text-blue-400 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Pricing</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <hr className="border-gray-700 my-8" />
          
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 SUGAR. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for students worldwide</p>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      
      {/* Add CSS for custom animations */}
      <style jsx global>{`
        @keyframes floatCube {
          0% { 
            transform: translateY(0) rotate(0deg); 
          }
          25% {
            transform: translateY(-30px) rotate(3deg);
          }
          50% { 
            transform: translateY(-60px) rotate(6deg); 
          }
          75% {
            transform: translateY(-30px) rotate(-3deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes float {
          0% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-15px) scale(1.05); 
            opacity: 0.6;
          }
          100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -100%; }
          100% { background-position: 200%; }
        }
        
        .animate-shimmer {
          background-size: 200%;
          animation: shimmer 2s linear infinite;
        }
        
        .animate-slideRight {
          animation: slideRight 1s ease-out;
        }
        
        @keyframes slideRight {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        /* Add sugar cube pattern to sections */
        .sugar-pattern {
          background-image: radial-gradient(rgba(254, 215, 170, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Fixed positions for floating cubes */
        .floating-cube-1 {
          animation: floatCube 15s ease-in-out infinite;
          animation-delay: 0s;
        }
        .floating-cube-2 {
          animation: floatCube 18s ease-in-out infinite;
          animation-delay: 1s;
        }
        .floating-cube-3 {
          animation: floatCube 20s ease-in-out infinite;
          animation-delay: 2s;
        }
        .floating-cube-4 {
          animation: floatCube 22s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .floating-cube-5 {
          animation: floatCube 19s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .floating-cube-6 {
          animation: floatCube 21s ease-in-out infinite;
          animation-delay: 3s;
        }
        .floating-cube-7 {
          animation: floatCube 17s ease-in-out infinite;
          animation-delay: 2.5s;
        }
        .floating-cube-8 {
          animation: floatCube 16s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        
        /* Fixed positions for bubbles */
        .bubble-1 {
          animation: float 5s linear infinite;
          animation-delay: 0.2s;
        }
        .bubble-2 {
          animation: float 7s linear infinite;
          animation-delay: 1s;
        }
        .bubble-3 {
          animation: float 9s linear infinite;
          animation-delay: 0.5s;
        }
        .bubble-4 {
          animation: float 8s linear infinite;
          animation-delay: 1.5s;
        }
        .bubble-5 {
          animation: float 10s linear infinite;
          animation-delay: 2s;
        }
        .bubble-6 {
          animation: float 6s linear infinite;
          animation-delay: 1s;
        }
        .bubble-7 {
          animation: float 11s linear infinite;
          animation-delay: 0.7s;
        }
        .bubble-8 {
          animation: float 12s linear infinite;
          animation-delay: 1.2s;
        }
        .bubble-9 {
          animation: float 9s linear infinite;
          animation-delay: 2.2s;
        }
        .bubble-10 {
          animation: float 7s linear infinite;
          animation-delay: 3s;
        }
        .bubble-11 {
          animation: float 8s linear infinite;
          animation-delay: 1.8s;
        }
        .bubble-12 {
          animation: float 6s linear infinite;
          animation-delay: 0.8s;
        }
        .bubble-13 {
          animation: float 10s linear infinite;
          animation-delay: 2.5s;
        }
        .bubble-14 {
          animation: float 7s linear infinite;
          animation-delay: 1.3s;
        }
        .bubble-15 {
          animation: float 9s linear infinite;
          animation-delay: 0.3s;
        }
        .bubble-16 {
          animation: float 12s linear infinite;
          animation-delay: 1.7s;
        }
        .bubble-17 {
          animation: float 11s linear infinite;
          animation-delay: 2.7s;
        }
        .bubble-18 {
          animation: float 8s linear infinite;
          animation-delay: 0.9s;
        }
        .bubble-19 {
          animation: float 6s linear infinite;
          animation-delay: 3.2s;
        }
        .bubble-20 {
          animation: float 10s linear infinite;
          animation-delay: 0.5s;
        }
        
        /* Remove white background from logo - comprehensive approach */
        .sugar-logo {
          /* Basic blend modes for background removal */
          mix-blend-mode: multiply;
          
          /* Color adjustments to improve visibility */
          filter: brightness(1.1) contrast(1.2) saturate(1.1);
          
          /* Force transparency */
          background-color: transparent !important;
          box-shadow: none !important;
          
          /* 3D rendering properties for better display */
          transform-style: preserve-3d;
          backface-visibility: hidden;
          position: relative;
          
          /* Additional properties to ensure transparency works across browsers */
          -webkit-background-clip: content-box;
          background-clip: content-box;
          isolation: isolate;
        }
        
        /* Additional wrapper to ensure background isolation */
        .logo-wrapper {
          position: relative;
          background: transparent !important;
          overflow: visible;
          isolation: isolate;
        }
        
        /* Additional style for the hero sugar cube for better visibility */
        .hero-sugar-cube {
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)) !important;
        }
        
        /* Ensuring the image background is completely transparent */
        img.sugar-logo {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </PageWrapper>
  );
}
