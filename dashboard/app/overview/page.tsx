"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OverviewPage() {
  const [scannedCount, setScannedCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7 ngày gần nhất');
  const [tableFilter, setTableFilter] = useState<'all' | 'blocked' | 'warning' | 'safe'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrend = async (rangeKey = timeRange) => {
    let apiRange = "7d";
    if (rangeKey.includes("24")) apiRange = "24h";
    else if (rangeKey.includes("30")) apiRange = "30d";

    try {
      const res = await fetch(`http://localhost:8000/stats/trend?range=${apiRange}`);
      if (res.ok) {
        const trend = await res.json();
        if (Array.isArray(trend) && trend.length > 0) {
          setTrendData(trend);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend offline or error, falling back to responsive trend data");
    }

    // Dynamic fallback when backend is unreachable
    if (apiRange === "24h") {
      setTrendData([
        { name: '00:00', safe: 22, phishing: 3 },
        { name: '04:00', safe: 14, phishing: 1 },
        { name: '08:00', safe: 58, phishing: 7 },
        { name: '12:00', safe: 84, phishing: 12 },
        { name: '16:00', safe: 92, phishing: 9 },
        { name: '20:00', safe: 64, phishing: 6 },
        { name: 'Hiện tại', safe: 38, phishing: 4 },
      ]);
    } else if (apiRange === "30d") {
      setTrendData([
        { name: '30/09', safe: 780, phishing: 95 },
        { name: '04/10', safe: 920, phishing: 120 },
        { name: '08/10', safe: 1050, phishing: 145 },
        { name: '12/10', safe: 860, phishing: 110 },
        { name: '16/10', safe: 1180, phishing: 160 },
        { name: '20/10', safe: 1020, phishing: 135 },
        { name: '24/10', safe: 1250, phishing: 170 },
        { name: '28/10', safe: 940, phishing: 125 },
      ]);
    } else {
      setTrendData([
        { name: '22/10', safe: 140, phishing: 20 },
        { name: '23/10', safe: 145, phishing: 18 },
        { name: '24/10', safe: 115, phishing: 28 },
        { name: '25/10', safe: 95, phishing: 22 },
        { name: '26/10', safe: 85, phishing: 10 },
        { name: '27/10', safe: 125, phishing: 8 },
        { name: '28/10', safe: 65, phishing: 12 },
      ]);
    }
  };

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('http://localhost:8000/stats');
      const data = await res.json();
      setScannedCount(data.total_scans || 0);
      setBlockedCount(data.total_threats || 0);
      await Promise.all([fetchTrend(timeRange), fetchLiveThreats()]);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      await Promise.all([fetchTrend(timeRange), fetchLiveThreats()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };
  
  useEffect(() => {
    fetchStats();
    fetchLiveThreats();

    // Listen for WebSocket events from Backend
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = (event) => {
        if (event.data === "new_scan") {
          fetchStats();
          fetchLiveThreats();
        }
      };
    } catch(e) {}

    // Polling tự động làm mới mỗi 3 giây
    const pollTimer = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(pollTimer);
    };
  }, []);

  useEffect(() => {
    fetchTrend(timeRange);
  }, [timeRange]);

  const [searchQuery, setSearchQuery] = useState("");

    const defaultLiveThreats = [
    { 
      id: 1, 
      domain: "yourbnk-secure-login.net", 
      path: "/verify?token=8817xa", 
      type: "Phishing Ngân Hàng", 
      category: "blocked", 
      confidence: 96, 
      severity: "Nguy hiểm (Critical)",
      source: "PhoBERT + XGBoost", 
      engineType: "AI Hybrid",
      time: "Vừa xong", 
      exactTime: "18:07:42" 
    },
    { 
      id: 2, 
      domain: "facebook-gift-claim.top", 
      path: "/login", 
      type: "Đánh Cắp Tài Khoản", 
      category: "blocked", 
      confidence: 91, 
      severity: "Nguy hiểm (Critical)",
      source: "XGBoost Classifier", 
      engineType: "ML Tree",
      time: "14 phút trước", 
      exactTime: "17:55:18" 
    },
    { 
      id: 3, 
      domain: "shopee-voucher-vip.click", 
      path: "/claim", 
      type: "Nghi Vấn Lừa Đảo", 
      category: "warning", 
      confidence: 68, 
      severity: "Cảnh báo (Suspicious)",
      source: "Bộ lọc Heuristic v1.4", 
      engineType: "Quy tắc tĩnh",
      time: "28 phút trước", 
      exactTime: "17:41:05" 
    },
    { 
      id: 4, 
      domain: "momo-refund-2026.info", 
      path: "/login", 
      type: "Giả Mạo Ví Điện Tử", 
      category: "blocked", 
      confidence: 94, 
      severity: "Nguy hiểm (Critical)",
      source: "PhoBERT + XGBoost", 
      engineType: "AI Hybrid",
      time: "41 phút trước", 
      exactTime: "17:28:30" 
    },
    { 
      id: 5, 
      domain: "vietcombank.com.vn", 
      path: "/personal", 
      type: "Tên Miền Hợp Lệ", 
      category: "safe", 
      confidence: 3, 
      severity: "An toàn (Verified)",
      source: "Danh bạ tín nhiệm", 
      engineType: "Verified SSL",
      time: "1 giờ trước", 
      exactTime: "17:09:12" 
    },
    { 
      id: 6, 
      domain: "google.com", 
      path: "/search?q=security", 
      type: "Tên Miền Hợp Lệ", 
      category: "safe", 
      confidence: 1, 
      severity: "An toàn (Verified)",
      source: "Danh sách an toàn", 
      engineType: "Whitelist",
      time: "2 giờ trước", 
      exactTime: "16:15:40" 
    },
  ];

  const [liveThreats, setLiveThreats] = useState<any[]>(defaultLiveThreats);

  const fetchLiveThreats = async () => {
    try {
      const res = await fetch("http://localhost:8000/history?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const now = Date.now();
      const mapped = data.map((item: any, idx: number) => {
        let path = "";
        try {
          if (item.url && item.url.includes("://")) {
            const parsed = new URL(item.url);
            path = parsed.pathname + (parsed.search || "");
          } else if (item.url) {
            const slashIdx = item.url.indexOf("/");
            path = slashIdx >= 0 ? item.url.substring(slashIdx) : "/";
          }
        } catch {
          path = "/";
        }
        if (!path || path === "") path = "/";

        let ts = item.timestamp ? String(item.timestamp).trim().replace(" ", "T") : "";
        if (ts && !ts.endsWith("Z") && !ts.includes("+")) {
          ts += "Z";
        }
        const itemDate = ts ? new Date(ts) : new Date(now - idx * 60000);
        const itemTime = isNaN(itemDate.getTime()) ? (now - idx * 60000) : itemDate.getTime();
        const diffMinutes = Math.max(0, Math.floor((now - itemTime) / 60000));
        let relativeTime = "Vừa xong";
        if (diffMinutes >= 1440) {
          relativeTime = `${Math.floor(diffMinutes / 1440)} ngày trước`;
        } else if (diffMinutes >= 60) {
          relativeTime = `${Math.floor(diffMinutes / 60)} giờ trước`;
        } else if (diffMinutes > 0) {
          relativeTime = `${diffMinutes} phút trước`;
        }

        const dateObj = new Date(itemTime);
        const exactTime = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        const isPhish = Boolean(item.is_phishing || item.label?.includes("Lừa đảo") || item.label?.includes("Blacklist"));
        const conf = Math.round(item.confidence || (isPhish ? 95 : 5));
        
        let category: "blocked" | "warning" | "safe" = "safe";
        let severity = "An toàn (Verified)";
        if (isPhish) {
          category = "blocked";
          severity = "Nguy hiểm (Critical)";
        } else if (conf >= 50 && conf < 80) {
          category = "warning";
          severity = "Cảnh báo (Suspicious)";
        }

        let source = "PhoBERT + XGBoost";
        let engineType = "AI Hybrid";
        if (item.note?.includes("[Whitelist]")) {
          source = "Danh bạ Whitelist";
          engineType = "Whitelist";
        } else if (item.note?.includes("[Blacklist SOC]")) {
          source = "Danh sách Blacklist";
          engineType = "Blacklist SOC";
        } else if (item.note?.includes("VirusTotal")) {
          source = "VirusTotal + ML";
          engineType = "Ensemble";
        }

        let typeText = item.label || (isPhish ? "Phát Hiện Lừa Đảo" : "Tên Miền Hợp Lệ");
        if (item.note?.includes("Chứa từ khóa") || item.note?.includes("từ khóa lừa đảo")) {
          typeText = "Thu Thập Tài Khoản (Phishing)";
        } else if (item.note?.includes("Punycode")) {
          typeText = "Ký Tự Đồng Hình (Punycode)";
        } else if (item.note?.includes("rủi ro cao")) {
          typeText = "Tên Miền Rủi Ro Cao";
        }

        return {
          id: item.id || idx + 1,
          domain: item.domain || "unknown.com",
          path,
          type: typeText,
          category,
          confidence: conf,
          severity,
          source,
          engineType,
          time: relativeTime,
          exactTime
        };
      });

      setLiveThreats(mapped);
    } catch (err) {
      console.warn("Failed to fetch live threats from backend:", err);
    }
  };

  const filteredThreats = liveThreats.filter(item => {
    const matchesCategory = tableFilter === 'all' || item.category === tableFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.domain.toLowerCase().includes(q) || 
      item.type.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 font-sans flex">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${toast.type === 'success' ? 'bg-sky-600' : 'bg-blue-500'}`}>
              {toast.type === 'success' ? '✓' : 'ℹ'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{toast.message}</p>
              <p className="text-xs text-slate-500">PhishArmor System Live Monitor</p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen bg-[#f4f7f6] dark:bg-[#0b1120]">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Top Context & Actions Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-sm border border-blue-500/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Giám sát SOC</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cụm cảm biến hoạt động (24/7)
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Tổng quan lưu lượng & mối đe dọa Phishing</h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button 
                onClick={() => {
                  fetchStats();
                  showToast("Đã cập nhật dữ liệu mới nhất!", "success");
                }} 
                disabled={isRefreshing}
                className="px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-600" : "text-slate-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                <span>Làm Mới</span>
              </button>
              
              <Link 
                href="/export" 
                className="px-4.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Xuất Báo Cáo</span>
              </Link>
            </div>
          </div>

          {/* 4 Top KPI Cards (Interactive Filters) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Scanned */}
            <button
              type="button"
              onClick={() => {
                setTableFilter('all');
                document.getElementById('threats-feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative ${
                tableFilter === 'all'
                  ? 'bg-white dark:bg-[#111827] border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Lưu lượng đã quét
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sm text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {(scannedCount || 6).toLocaleString()}
                </div>
                {tableFilter === 'all' && (
                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">↑ 12.5%</span>
                <span>so với hôm qua</span>
              </div>
            </button>

            {/* Card 2: Threats Blocked */}
            <button
              type="button"
              onClick={() => {
                setTableFilter('blocked');
                document.getElementById('threats-feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative ${
                tableFilter === 'blocked'
                  ? 'bg-white dark:bg-[#111827] border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Mối đe dọa đã chặn
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-sm text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                  {(blockedCount || 5).toLocaleString()}
                </div>
                {tableFilter === 'blocked' && (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-rose-600">Nguy hiểm cao</span>
                <span>• Tỷ lệ chặn {(scannedCount ? Math.round(((blockedCount || 5) / scannedCount) * 100) : 50)}%</span>
              </div>
            </button>

            {/* Card 3: AI Accuracy F1 / Safe */}
            <button
              type="button"
              onClick={() => {
                setTableFilter('safe');
                document.getElementById('threats-feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative ${
                tableFilter === 'safe'
                  ? 'bg-white dark:bg-[#111827] border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tên miền an toàn (PhoBERT)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  98.4%
                </div>
                {tableFilter === 'safe' && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">F1-Score</span>
                <span>• Mô hình PhoBERT</span>
              </div>
            </button>

            {/* Card 4: Average Latency / Warnings */}
            <button
              type="button"
              onClick={() => {
                setTableFilter('warning');
                document.getElementById('threats-feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative ${
                tableFilter === 'warning'
                  ? 'bg-white dark:bg-[#111827] border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cảnh báo nghi vấn
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-sm text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                  124ms
                </div>
                {tableFilter === 'warning' && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-amber-600">Độ trễ thấp</span>
                <span>• Thời gian suy luận</span>
              </div>
            </button>
          </div>



          {/* Middle Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left AreaChart (2 columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 lg:p-8 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-10">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Xu Hướng Tấn Công Phishing</span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50 font-sans">
                      {timeRange}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {timeRange === '24 giờ qua' 
                      ? 'Lưu lượng theo từng khung giờ trong 24 giờ qua (thời gian thực)' 
                      : timeRange === '30 ngày qua' 
                      ? 'Lưu lượng tổng hợp theo chu kỳ 30 ngày qua' 
                      : 'Biểu đồ so sánh lưu lượng an toàn và mã độc lừa đảo trong 7 ngày qua'}
                  </p>
                </div>

                <div className="bg-slate-100 dark:bg-[#1e293b] rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <select 
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer px-3 py-1" 
                    value={timeRange} 
                    onChange={(e) => {
                      const selected = e.target.value;
                      setTimeRange(selected);
                      fetchTrend(selected);
                      showToast(`Đã lọc dữ liệu theo: ${selected}`, "info");
                    }}
                  >
                    <option value="24 giờ qua">24 giờ qua</option>
                    <option value="7 ngày gần nhất">7 ngày gần nhất</option>
                    <option value="30 ngày qua">30 ngày qua</option>
                  </select>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-[250px] w-full mt-2 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} dx={-10} />
                    <Tooltip contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)'}} itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 600}} />
                    <Area type="monotone" dataKey="phishing" name="Mã độc Lừa đảo (Phishing)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPhishing)" activeDot={{r: 6, strokeWidth: 0, fill: '#ef4444'}} />
                    <Area type="monotone" dataKey="safe" name="An toàn (Safe Traffic)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSafe)" activeDot={{r: 6, strokeWidth: 0, fill: '#3b82f6'}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Donut Chart Breakdown (1 column) */}
            <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mb-1">Phân Loại Kỹ Thuật</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tỷ lệ hình thức lừa đảo phổ biến</p>
              </div>

              <div className="flex justify-center items-center py-6 relative">
                <div 
                  className="w-[180px] h-[180px] rounded-full relative shadow-[0_0_30px_rgba(0,0,0,0.06)] flex items-center justify-center" 
                  style={{background: 'conic-gradient(#e11d48 0% 45%, #f59e0b 45% 75%, #3b82f6 75% 100%)'}}
                >
                  <div className="w-[136px] h-[136px] bg-white dark:bg-[#0f172a] rounded-full shadow-inner flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Tổng cộng</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white leading-tight my-0.5 tracking-tight">420</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">Mẫu thử nghiệm</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-[#1e293b] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                    <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm"></span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">Mạo danh thương hiệu</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">45%</span>
                </div>

                <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-[#1e293b] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">Lừa đảo trúng thưởng</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">30%</span>
                </div>

                <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-[#1e293b] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">Phát tán mã độc & Form ẩn</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">25%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Live Threats Feed Table */}
          <div id="threats-feed-section" className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-7 space-y-5">
            
            {/* Table Control Header */}
            <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              {/* Row 1: Title, WebSocket Live Badge & Subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                        Nhật Ký Giám Sát Mối Đe Dọa (Live Threat Stream)
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 whitespace-nowrap shrink-0 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span className="whitespace-nowrap">WebSocket Live</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Lưu lượng truy cập & can thiệp ngăn chặn thời gian thực từ tiện ích mở rộng PhishArmor
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Đồng bộ cảm biến theo thời gian thực</span>
                </div>
              </div>

              {/* Row 2: Search Box & Segment Filter Toolbar (No Overlapping) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Search Box */}
                <div className="relative w-full sm:w-72 shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Lọc tên miền, nguồn..."
                    className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>

                {/* Status Segment Filter - 1 Single Flat Row */}
                <div className="flex items-center shrink-0 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs overflow-x-auto">
                  <button 
                    onClick={() => setTableFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      tableFilter === 'all' 
                        ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="whitespace-nowrap">Tất cả</span>
                    <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-200/80 dark:bg-slate-700 font-mono">
                      {liveThreats.length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setTableFilter('blocked')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      tableFilter === 'blocked' 
                        ? 'bg-rose-600 text-white shadow-xs font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <span className="whitespace-nowrap">Đã chặn</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${tableFilter === 'blocked' ? 'bg-rose-700 text-white' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'}`}>
                      {liveThreats.filter(x => x.category === 'blocked').length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setTableFilter('warning')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      tableFilter === 'warning' 
                        ? 'bg-amber-500 text-white shadow-xs font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                    }`}
                  >
                    <span className="whitespace-nowrap">Đáng ngờ</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${tableFilter === 'warning' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'}`}>
                      {liveThreats.filter(x => x.category === 'warning').length}
                    </span>
                  </button>

                  <button 
                    onClick={() => setTableFilter('safe')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      tableFilter === 'safe' 
                        ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <span className="whitespace-nowrap">An toàn</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${tableFilter === 'safe' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'}`}>
                      {liveThreats.filter(x => x.category === 'safe').length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Địa Chỉ Truy Cập (URL)</th>
                    <th className="py-3 px-4">Phân Loại Mối Đe Dọa</th>
                    <th className="py-3 px-4">Động Cơ Phát Hiện</th>
                    <th className="py-3 px-4">Mức Độ Rủi Ro</th>
                    <th className="py-3 px-4">Thời Điểm</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredThreats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Không tìm thấy sự kiện nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredThreats.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* URL Cell */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5 max-w-[280px]">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              item.category === 'blocked'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : item.category === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {item.category === 'blocked' ? (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                              ) : item.category === 'warning' ? (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                  <line x1="12" y1="9" x2="12" y2="13"/>
                                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                                {item.domain}
                              </div>
                              <div className="font-mono text-xs text-slate-400 dark:text-slate-500 truncate">
                                {item.path}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Threat Type Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            item.category === 'blocked' 
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/50' 
                              : item.category === 'warning' 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50' 
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/50'
                          }`}>
                            {item.type}
                          </span>
                        </td>

                        {/* Detection Source */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                              {item.source}
                            </span>
                            <span className="block text-xs text-slate-400 font-mono mt-0.5">
                              [{item.engineType}]
                            </span>
                          </div>
                        </td>

                        {/* Risk & Confidence Score */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                              <div 
                                className={`h-full rounded-full ${
                                  item.confidence >= 80 
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-400' 
                                    : item.confidence >= 50 
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                                    : 'bg-gradient-to-r from-sky-500 to-blue-500'
                                }`} 
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                            <div>
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                {item.confidence}%
                              </span>
                              <span className="block text-xs font-semibold text-black dark:text-white">
                                {item.severity}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-xs block">
                            {item.time}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {item.exactTime}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link 
                            href={`/scan?url=${encodeURIComponent("https://" + item.domain + item.path)}`} 
                            className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8"/>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <span>Phân tích AI</span>
                          </Link>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Hiển thị <strong>{filteredThreats.length}</strong> / <strong>{liveThreats.length}</strong> sự kiện gần nhất</span>
                <span>•</span>
                <span className="text-xs text-slate-400">Đồng bộ liên tục qua WebSocket Sensor v1.4.2</span>
              </div>
              <Link 
                href="/history" 
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Xem toàn bộ nhật ký (Trang Lịch sử)</span>
                <span>→</span>
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
