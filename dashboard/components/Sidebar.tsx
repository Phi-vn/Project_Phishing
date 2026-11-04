"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("user_email") || "admin@phisharmor.vn";
      const role = localStorage.getItem("user_role") || "Super Admin";
      setCurrentUser({ email, role });
    }
  }, [pathname]);

  useEffect(() => {
    // Check initial dark mode from DOM or localStorage
    const isDarkMode = document.documentElement.classList.contains("dark") || 
      localStorage.getItem("theme") === "dark";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (targetTheme: "dark" | "light") => {
    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (pathname === path) return true;
    return false;
  };

  const activeClass = "flex items-center gap-2.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 rounded-lg text-[13px] font-semibold transition-all shadow-xs";
  const inactiveClass = "flex items-center gap-2.5 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg text-[13px] font-medium transition-all";

  const getClassName = (path: string) => (isActive(path) ? activeClass : inactiveClass);

  const Icon = ({ path }: { path: string }) => {
    const active = isActive(path);
    const strokeClass = active ? "stroke-sky-600 dark:stroke-sky-400" : "stroke-slate-500 dark:stroke-slate-400";
    const className = `w-4 h-4 ${strokeClass} transition-colors shrink-0`;

    switch (path) {
      case "/":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>;
      case "/block":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
      case "/overview":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
      case "/scan":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
      case "/history":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
      case "/metrics":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>;
      case "/training":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>;
      case "/feedback":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
      case "/settings":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-2.82.11 1.65 1.65 0 0 0-1.82.33h-.08a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83h.08a1.65 1.65 0 0 0 1.82-.33 1.65 1.65 0 0 0-.11-2.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 2.82-.11 1.65 1.65 0 0 0 1.82-.33h.08a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83h-.08a1.65 1.65 0 0 0-1.82.33z" /></svg>;
      case "/login":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
      case "/onboarding":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
      case "/export":
        return <svg className={className} fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
      default:
        return null;
    }
  };

  return (
    <aside className="print:hidden w-[270px] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 transition-colors duration-300 select-none">
      
      {/* STICKY HEADER */}
      <div className="p-5 flex items-center gap-3 shrink-0 border-b border-slate-100 dark:border-slate-800/60">
        <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex justify-center items-center text-white shadow-md shadow-sky-500/20 ring-1 ring-sky-500/40">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-[16px] tracking-tight text-slate-900 dark:text-white leading-none">
            PhishArmor AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-1">
            Hệ thống chống lừa đảo
          </p>
        </div>
      </div>

      {/* SCROLLABLE LINKS */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-hide">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-3 uppercase tracking-wider">
            Tiện ích trình duyệt
          </h2>
          <ul className="space-y-0.5">
            <li><Link href="/" className={getClassName("/")}><Icon path="/" /> Popup tiện ích</Link></li>
            <li><Link href="/block" className={getClassName("/block")}><Icon path="/block" /> Mẫu trang chặn URL</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-3 uppercase tracking-wider">
            Hệ thống quản lý
          </h2>
          <ul className="space-y-0.5">
            <li><Link href="/overview" className={getClassName("/overview")}><Icon path="/overview" /> Bảng tổng quan</Link></li>
            <li><Link href="/scan" className={getClassName("/scan")}><Icon path="/scan" /> Kiểm tra & Quét URL</Link></li>
            <li><Link href="/history" className={getClassName("/history")}><Icon path="/history" /> Lịch sử kiểm tra</Link></li>
            <li><Link href="/metrics" className={getClassName("/metrics")}><Icon path="/metrics" /> Kiến trúc & Đánh giá</Link></li>
            <li><Link href="/training" className={getClassName("/training")}><Icon path="/training" /> Huấn luyện mô hình</Link></li>
            <li><Link href="/feedback" className={getClassName("/feedback")}><Icon path="/feedback" /> Duyệt phản hồi mẫu</Link></li>
            <li><Link href="/settings" className={getClassName("/settings")}><Icon path="/settings" /> Cài đặt hệ thống</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-3 uppercase tracking-wider">
            Tài liệu & Tiện ích
          </h2>
          <ul className="space-y-0.5">
            <li><Link href="/login" className={getClassName("/login")}><Icon path="/login" /> Đăng nhập quản trị</Link></li>
            <li><Link href="/onboarding" className={getClassName("/onboarding")}><Icon path="/onboarding" /> Hướng dẫn cài đặt</Link></li>
            <li><Link href="/export" className={getClassName("/export")}><Icon path="/export" /> Xuất báo cáo PDF</Link></li>
          </ul>
        </div>
      </div>

      {/* STICKY FOOTER: THEME TOGGLE & VERSION */}
      <div className="p-3 pb-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-[#0f172a]">
        
        {/* Compact Segmented Pill Toggle */}
        <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-lg flex items-center justify-between text-xs font-medium border border-slate-300/50 dark:border-slate-700/50 shadow-inner">
          
          {/* Light mode option */}
          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
              !isDark
                ? "bg-white text-slate-800 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            title="Kích hoạt chế độ sáng"
          >
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span className="text-xs">Sáng</span>
          </button>

          {/* Dark mode option */}
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isDark
                ? "bg-[#111827] text-white shadow-xs font-semibold border border-slate-700/50"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            title="Kích hoạt chế độ tối"
          >
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span className="text-xs">Tối</span>
          </button>
        </div>

        {/* User Session Badge */}
        <div className="mt-2.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.email || "admin@phisharmor.vn"}
              </p>
              <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium leading-none">
                {currentUser?.role || "Super Admin"}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[10px] text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-medium shrink-0 ml-1.5 transition-colors"
            title="Đổi tài khoản đăng nhập"
          >
            Đổi
          </Link>
        </div>

        {/* Small System Status line below */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hệ thống an toàn
          </span>
          <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
        </div>

      </div>

    </aside>
  );
}
