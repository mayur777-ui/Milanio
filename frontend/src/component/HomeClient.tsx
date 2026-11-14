"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Login from "@/component/Login";
import Register from "@/component/Register";
import { useTheme } from "@/context/themeContext";
import {
  Moon,
  Sun,
  Menu,
  X,
  Video,
  Shield,
  MessageSquare,
  ArrowRight,
  Mic,
  Camera,
  PhoneOff,
  Share2,
  Lock,
  Users,
  Check,
  Keyboard,
  Zap,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeClient({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [quickRoomId, setQuickRoomId] = useState("");
  const [show, setShow] = useState<{
    login?: boolean;
    register?: boolean;
    mobileNav?: boolean;
  }>({
    login: false,
    register: false,
    mobileNav: false,
  });

  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    setShow({ login: !show.login, register: false, mobileNav: false });
  };

  const handleRegister = () => {
    setShow({ login: false, register: !show.register, mobileNav: false });
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = quickRoomId.trim();
    if (!cleanId) return;

    if (isAuthenticated) {
      router.push(`/Loby?roomId=${encodeURIComponent(cleanId)}`);
    } else {
      localStorage.setItem("pendingRoomId", cleanId);
      setShow({ login: false, register: true, mobileNav: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden select-none">
      {/* Subtle Architectural Grid Pattern (Strictly Non-AI Gradient) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Top Floating Navbar */}
      <header className="fixed top-4 left-4 right-4 max-w-6xl mx-auto z-40">
        <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 px-5 py-3 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-2xl">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-white">
              Milanio
            </span>
          </Link>

          {/* Desktop Nav Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-zinc-700" />}
            </button>

            {isAuthenticated ? (
              <Link
                href="/Loby"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition cursor-pointer shadow-sm"
              >
                <span>Enter Lobby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogin}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={handleRegister}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition cursor-pointer shadow-sm"
                >
                  Create account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShow({ ...show, mobileNav: !show.mobileNav })}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400"
              aria-label="Toggle menu"
            >
              {show.mobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {show.mobileNav && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 flex flex-col gap-2"
            >
              {isAuthenticated ? (
                <Link
                  href="/Loby"
                  className="w-full text-center py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-sm font-semibold"
                >
                  Enter Lobby
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="w-full text-center py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={handleRegister}
                    className="w-full text-center py-2 text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-lg"
                  >
                    Create account
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 sm:pt-40 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16">
        {/* Left Copy & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Engineering Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Direct WebRTC Mesh • Sub-100ms Media Latency</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Clear, focused video meetings.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mt-5 max-w-lg leading-relaxed">
            Real-time peer-to-peer conferencing engineered for clarity. Pre-call green room checks, host admission controls, and zero software installs.
          </p>

          {/* Action Row: Instant Start + Quick Code Input */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
            {isAuthenticated ? (
              <Link
                href="/Loby"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
              >
                <span>Enter Meeting Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleRegister}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
              >
                <span>Start instant meeting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Inline Quick Join Input */}
            <form
              onSubmit={handleQuickJoin}
              className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 shadow-sm transition"
            >
              <Keyboard className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Room code"
                value={quickRoomId}
                onChange={(e) => setQuickRoomId(e.target.value)}
                className="w-24 sm:w-28 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none font-mono py-1"
              />
              <button
                type="submit"
                disabled={!quickRoomId.trim()}
                className="ml-1 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-md">
            <div>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">&lt;85ms</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Median Latency</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">P2P Mesh</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Direct Channels</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">0 Plugins</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Browser Native</p>
            </div>
          </div>
        </div>

        {/* Right Authentic Product Mockup (High-Fidelity Meeting Surface) */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden flex flex-col">
            {/* Top Meeting Titlebar */}
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>milanio.live/prd-mesh</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>14:22</span>
              </div>
            </div>

            {/* Video Arena Preview */}
            <div className="p-4 grid grid-cols-2 gap-3 relative">
              {/* Participant 1: Remote Speaker */}
              <div className="aspect-video rounded-xl bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                {/* Simulated Participant Avatar */}
                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-emerald-500/80 flex items-center justify-center text-white font-bold text-sm shadow-md ring-4 ring-emerald-500/20">
                  AJ
                </div>

                {/* Identity Pill with Audio Waveform */}
                <div className="absolute bottom-2 left-2 right-2 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-white text-[11px] flex items-center justify-between">
                  <span className="font-medium truncate">Alex (Lead)</span>
                  <div className="flex items-end gap-0.5 h-3" title="Speaking">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce delay-75" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>

              {/* Participant 2: Local User */}
              <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-sm">
                  YOU
                </div>

                {/* Identity Pill */}
                <div className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-white text-[11px] flex items-center gap-1.5">
                  <span className="font-medium">You</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Simulated Host Admission Toast */}
              <div className="col-span-2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2.5 shadow-lg flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] flex items-center justify-center">
                    S
                  </div>
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    Sarah wants to join
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium cursor-pointer">
                    Deny
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 font-semibold rounded-md shadow-xs cursor-pointer">
                    Admit
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Dock Mock */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-center gap-2">
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 shadow-xs">
                <Mic size={15} />
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 shadow-xs">
                <Camera size={15} />
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 shadow-xs">
                <MessageSquare size={15} />
              </div>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <div className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <PhoneOff size={13} />
                <span>Leave</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bento Grid: Architecture & Capabilities */}
      <section className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Engineered for direct communication
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              A distraction-free real-time meeting stack without heavy client installs or unnecessary complexity.
            </p>
          </div>

          {/* Asymmetric Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Green Room Hardware Pre-check (2 cols wide) */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Pre-Meeting Assurance</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  The Pre-Call Green Room
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
                  Verify camera framing and test audio input levels before you enter the conversation. Never join muted or unready by surprise.
                </p>
              </div>

              {/* Hardware Preview Diagnostic Mock */}
              <div className="mt-6 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700">
                    MIC
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Default Input Stream</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">48kHz • Echo Cancellation Active</p>
                  </div>
                </div>

                {/* Level Meter */}
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-5 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="w-1.5 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 ml-2 font-medium">Optimal</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Host Gatekeeper */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Access Control</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  Host Admission Waiting Room
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Keep room access tightly controlled. Guests knock before entering, giving meeting hosts absolute admission authority.
                </p>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Private Session Locked
                </span>
                <span className="font-mono text-[11px] text-zinc-400">Strict Auth</span>
              </div>
            </div>

            {/* Bento Card 3: Pure WebRTC P2P */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Media Pipeline</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  Encrypted Direct Channels
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Direct browser-to-browser media pipelines eliminate relay lag and ensure media never touches third-party storage.
                </p>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span>SRTP AES-128</span>
                <span className="text-emerald-500 font-semibold">Zero Storage</span>
              </div>
            </div>

            {/* Bento Card 4: Side-Drawer Chat (2 cols wide) */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Collaboration</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  Non-Intrusive Side-Drawer Chat
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
                  Share code links and commentary in real-time. The collapsible drawer gracefully docks beside the video grid so messages never obscure a face.
                </p>
              </div>

              {/* Chat Thread Snippet Mock */}
              <div className="mt-6 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">github.com/project/pr/42</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step Workflow Guide */}
      <section className="py-20 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#09090b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 mb-2">01</span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Generate Instant Session
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Create a private room in one click or paste an invite code to connect immediately.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 mb-2">02</span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Green Room Verification
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Confirm your webcam feed and microphone transmission before knocking on the meeting door.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 mb-2">03</span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Low-Latency Mesh Call
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Experience crystal-clear audio and video with dedicated in-call side-drawer messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-10 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Milanio</span>
            <span>•</span>
            <span>Pure WebRTC Collaboration</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400">
            <button
              onClick={handleLogin}
              className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleRegister}
              className="hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            >
              Create Account
            </button>
            <Link
              href="/Loby"
              className="hover:text-zinc-900 dark:hover:text-white transition"
            >
              Meeting Lobby
            </Link>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      {show.login && (
        <Login
          handleShow={handleLogin}
          onSwitchToRegister={() =>
            setShow({ login: false, register: true, mobileNav: false })
          }
        />
      )}
      {show.register && (
        <Register
          handleShow={handleRegister}
          onSwitchToLogin={() =>
            setShow({ login: true, register: false, mobileNav: false })
          }
        />
      )}
    </div>
  );
}
