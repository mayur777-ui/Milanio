"use client";

import React, { useState } from "react";
import Link from "next/link";
import Login from "@/component/Login";
import Register from "@/component/Register";
import { useTheme } from "@/context/themeContext";
import { Moon, Sun, AlignRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import group from "../img/groupImg.png";
import logo from '../img/logo.png';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
export default function HomeClient({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [show, setShow] = useState<{
    login?: boolean;
    register?: boolean;
    hamburger?: boolean;
  }>({
    login: false,
    register: false,
    hamburger: false,
  });
  const { theme, toggleTheme } = useTheme();
  const handleLogin = () => {
    setShow({ login: !show.login });
  };

  const handleRegister = () => {
    setShow({ login: false, register: !show.register });
  };

  const features = [
    {
      title: "Crystal Clear Video",
      description:
        "Experience high-definition video calls with minimal latency.",
      icon: "📹",
    },
    {
      title: "End-to-End Encryption",
      description: "Your conversations are secure and private, always.",
      icon: "🔒",
    },
    {
      title: "Cross-Platform",
      description: "Connect seamlessly on any device, anywhere.",
      icon: "🌐",
    },
  ];

  const processSteps = [
    {
      step: "1",
      title: "Sign Up",
      description: "Create your account in seconds.",
    },
    {
      step: "2",
      title: "Join a Call",
      description: "Start or join a video call with a single click.",
    },
    {
      step: "3",
      title: "Collaborate",
      description: "Share screens, chat, and work together in real-time.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-zinc-900 dark:to-zinc-800">
      {/* Navigation */}
      <motion.nav
        className="flex  justify-between items-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md top-4 left-4 right-4 px-4 sm:px-6 py-3 rounded-full shadow-lg fixed"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div>
          <Image className="w-[65px] h-[50px]" src={logo} alt="" />
        </div>
        <div className="flex items-center gap-6 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end sm:justify-center">
          {!isAuthenticated && (
            <>
              <motion.div
                className="gap-2 sm:gap-3 justify-center hidden sm:flex"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <button
                  onClick={handleLogin}
                  className="cursor-pointer hover:bg-gradient-to-tl from-blue-500 to-blue-100 px-5 rounded-xl py-2 font-medium dark:bg-blue-400"
                >
                  Login
                </button>

                <button
                  onClick={handleRegister}
                  className="group relative overflow-hidden border rounded-2xl px-5 py-3 font-medium border-zinc-700 hover:text-amber-50 dark:text-gray-200 dark:hover:text-zinc-700 dark:border-amber-50  text-black transition-all duration-300 ease-in-out"
                >
                  <span className="absolute inset-0 bg-zinc-700 dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></span>
                  <span className="relative">Create Account</span>
                </button>
              </motion.div>
              <button
                className="block sm:hidden mb-2.5"
                onClick={() => {
                  // console.log("clicked hamburger");
                  setShow({ hamburger: !show.hamburger })}
                }
              >
                {""}
                <AlignRight />
              </button>
            </>
          )}
        </div>
      </motion.nav>
        {show.hamburger && (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ duration: 0.3 }}
    className="hamburger absolute top-16 right-4 w-52 flex flex-col items-center bg-white dark:bg-zinc-800 rounded-xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-700 z-50 overflow-hidden"
  >
    <button
      onClick={handleLogin}
      className="w-full text-center py-3 text-sm font-medium text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200"
    >
      Login
    </button>
    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
    <button
      onClick={handleRegister}
      className="w-full text-center py-3 text-sm font-medium text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200"
    >
      Create Account
    </button>
  </motion.div>
)}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-16 pt-24 sm:pt-32 pb-10 sm:pb-20 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-zinc-900 dark:to-blue-900">
        <motion.div
          className="w-full md:w-1/2 text-center md:text-left space-y-4 sm:space-y-6 mb-8 md:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-zinc-800 dark:text-white">
            Secure, Seamless <br /> Video Calls
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-md mx-auto md:mx-0">
            Connect instantly with crystal-clear video and collaborate in
            real-time, anywhere.
          </p>
          {isAuthenticated ? (
            <Link
              href="/Loby"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Go to Lobby
            </Link>
          ) : (
            <>
              {show.register || show.login ? null : (
                <button
                  onClick={handleRegister}
                  className="group relative overflow-hidden border rounded-2xl px-5 py-3 font-medium border-zinc-700 hover:text-amber-50 dark:text-gray-200 dark:hover:text-zinc-700 dark:border-amber-50  text-black transition-all duration-300 ease-in-out"
                >
                  <span className="absolute inset-0 bg-zinc-700 dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></span>
                  <span className="relative">Create Account</span>
                </button>
              )}
            </>
          )}
        </motion.div>
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <Image
            src={group}
            alt="Group video call"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto"
            priority
          />
        </motion.div>
      </section>

      {show.login || show.register ? null : (
        <>
          <section className="min-h-screen w-full">
            {/* Features Section */}
            <section className="py-16 flex flex-col items-center justify-center sm:py-20 px-4 sm:px-6 md:px-16 bg-white dark:bg-zinc-900">
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-zinc-800 dark:text-white mb-10 sm:mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Why Choose Us?
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 bg-gray-100 dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-3xl sm:text-4xl mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Process Section */}
            <section className=" relative z-0 py-16 sm:py-20 px-4 sm:px-6 md:px-16 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-zinc-900 dark:to-zinc-800">
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-zinc-800 dark:text-white mb-10 sm:mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                How It Works
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto z-0">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative p-6 bg-gray-100 dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                     <div className="absolute left-[-3px] top-[-19px] bg-blue-600 rounded-[100%] p-1 px-3 text-2xl sm:text-xl mb-4">
                        {step.step}
                    </div>
                     <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-white mb-2">
                        {step.title}
                    </h3>
                     <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
                        {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          </section>

          {/* Footer */}
          <footer className="bg-gray-200 text-zinc-800 px-6 sm:px-10 md:px-16 pt-12 pb-8 dark:bg-zinc-900 dark:text-white">
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

    {/* Brand Info */}
    <div>
      <Image className="w-[100px] h-[90px]" src={logo} alt="" />
      <p className="text-sm text-zinc-900 dark:text-gray-300 mb-4">
        A secure and modern video meeting platform for everyone. Connect from anywhere, anytime.
      </p>
      <div className="flex items-center gap-4 mt-4">
        <a href="#" aria-label="Facebook">
          <Facebook className="w-5 h-5 dark:hover:text-gray-400 hover:text-indigo-600 transition" />
        </a>
        <a href="#" aria-label="Twitter">
          <Twitter className="w-5 h-5 dark:hover:text-gray-400 hover:text-indigo-600 transition" />
        </a>
        <a href="#" aria-label="Instagram">
          <Instagram className="w-5 h-5 dark:hover:text-gray-400 hover:text-indigo-600 transition" />
        </a>
        <a href="#" aria-label="LinkedIn">
          <Linkedin className="w-5 h-5 dark:hover:text-gray-400 hover:text-indigo-600 transition" />
        </a>
      </div>
    </div>

    {/* Useful Links */}
    <div>
      <h3 className="text-lg font-semibold  mb-4">Quick Links</h3>
      <ul className="space-y-3 text-sm">
        <li><a href="/about" className="dark:hover:text-gray-400 hover:text-indigo-600">About Us</a></li>
        <li><a href="/features" className="dark:hover:text-gray-400 hover:text-indigo-600">Features</a></li>
        <li><a href="/pricing" className="dark:hover:text-gray-400 hover:text-indigo-600">Pricing</a></li>
        <li><a href="/faq" className="dark:hover:text-gray-400 hover:text-indigo-600">FAQs</a></li>
        <li><a href="/contact" className="dark:hover:text-gray-400 hover:text-indigo-600">Contact</a></li>
      </ul>
    </div>

    {/* Resources */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Resources</h3>
      <ul className="space-y-3 text-sm">
        <li><a href="/blog" className="dark:hover:text-gray-400 hover:text-indigo-600">Blog</a></li>
        <li><a href="/privacy" className="dark:hover:text-gray-400 hover:text-indigo-600">Privacy Policy</a></li>
        <li><a href="/terms" className="dark:hover:text-gray-400 hover:text-indigo-600">Terms & Conditions</a></li>
        <li><a href="/help" className="dark:hover:text-gray-400 hover:text-indigo-600">Help Center</a></li>
        <li><a href="/roadmap" className="dark:hover:text-gray-400 hover:text-indigo-600">Roadmap</a></li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
      <ul className="space-y-4 text-sm">
        <li className="flex items-start gap-2">
          <Mail className="w-5 h-5 mt-1" />
          mayurlaxkar76@gmail.com
        </li>
        <li className="flex items-start gap-2">
          <Phone className="w-5 h-5 mt-1" />
          +916378336346
        </li>
        <li className="flex items-start gap-2">
          <MapPin className="w-5 h-5 mt-1" />
          Udaipur, India
        </li>
      </ul>
    </div>
  </div>

  {/* Bottom Strip */}
  <div className="mt-10 pt-6 border-t border-zinc-700 text-center text-sm text-zinc-500">
    © {new Date().getFullYear()} MayurMeet. All rights reserved.
  </div>
</footer>
        </>
      )}

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="p-2 sm:p-3 fixed bottom-4 sm:bottom-6 right-4 sm:right-6 rounded-full bg-white dark:bg-zinc-800 border dark:border-zinc-700 border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === "dark" ? (
          <Sun className="text-yellow-400" size={20} />
        ) : (
          <Moon className="text-blue-600" size={20} />
        )}
      </motion.button>

      {/* Modals */}
      {show.login && <Login handleShow={handleLogin} />}
      {show.register && <Register handleShow={handleRegister} />}
    </div>
  );
}
