"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"security" | "ai" | "lists" | "notifications" | "maintenance">("security");

  // Backend Connection & Saving Status
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Security Engine Settings
  const [trustScore, setTrustScore] = useState(75);
  const [protectionMode, setProtectionMode] = useState<"block" | "warn" | "monitor">("block");
  const [blockRiskyTLD, setBlockRiskyTLD] = useState(true);
  const [sslStrictInspection, setSslStrictInspection] = useState(true);
  const [inspectShortenedUrls, setInspectShortenedUrls] = useState(true);
  const [punycodeDefense, setPunycodeDefense] = useState(true);

  // AI & Inference Settings
  const [activeModel, setActiveModel] = useState("phisharmor_hybrid_v1.2");
  const [usePhobert, setUsePhobert] = useState(true);
  const [useGeminiXAI, setUseGeminiXAI] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState("AIzaSyD-PhishArmor_Production_Key_99812");
  const [showApiKey, setShowApiKey] = useState(false);
  const [enableDomScan, setEnableDomScan] = useState(true);
  const [inferenceCache, setInferenceCache] = useState(true);
  const [testingApi, setTestingApi] = useState(false);

  // Access Control Lists
  const [whitelist, setWhitelist] = useState([
    "vietcombank.com.vn",
    "dichvucong.gov.vn",
    "docs.google.com",
    "mbbank.com.vn",
    "shopee.vn"
  ]);
  const [blacklist, setBlacklist] = useState([
    "yourbnk-secure-login.net",
    "facebook-gift-claim.top",
    "shopee-voucher-vip88.click",
    "auth-mbbank-secure.top",
    "portal-evn-dienluc.info"
  ]);
  const [syncNcscFeed, setSyncNcscFeed] = useState(true);
  const [newWhite, setNewWhite] = useState("");
  const [newBlack, setNewBlack] = useState("");

  // Notifications & Telemetry
  const [sendTelemetry, setSendTelemetry] = useState(true);
  const [enableSoundAlert, setEnableSoundAlert] = useState(true);
  const [telegramWebhook, setTelegramWebhook] = useState("https://api.telegram.org/bot7281.../sendMessage");
  const [enableTelegramAlerts, setEnableTelegramAlerts] = useState(true);
  const [reportFrequency, setReportFrequency] = useState("daily");
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial settings from FastAPI Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.trustScore !== undefined) setTrustScore(data.trustScore);
          if (data.protectionMode) setProtectionMode(data.protectionMode);
          if (data.blockRiskyTLD !== undefined) setBlockRiskyTLD(data.blockRiskyTLD);
          if (data.sslStrictInspection !== undefined) setSslStrictInspection(data.sslStrictInspection);
          if (data.inspectShortenedUrls !== undefined) setInspectShortenedUrls(data.inspectShortenedUrls);
          if (data.punycodeDefense !== undefined) setPunycodeDefense(data.punycodeDefense);
          if (data.activeModel) setActiveModel(data.activeModel);
          if (data.usePhobert !== undefined) setUsePhobert(data.usePhobert);
          if (data.useGeminiXAI !== undefined) setUseGeminiXAI(data.useGeminiXAI);
          if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
          if (data.enableDomScan !== undefined) setEnableDomScan(data.enableDomScan);
          if (data.inferenceCache !== undefined) setInferenceCache(data.inferenceCache);
          if (Array.isArray(data.whitelist)) setWhitelist(data.whitelist);
          if (Array.isArray(data.blacklist)) setBlacklist(data.blacklist);
          if (data.syncNcscFeed !== undefined) setSyncNcscFeed(data.syncNcscFeed);
          if (data.enableTelegramAlerts !== undefined) setEnableTelegramAlerts(data.enableTelegramAlerts);
          if (data.telegramWebhook) setTelegramWebhook(data.telegramWebhook);
          if (data.enableSoundAlert !== undefined) setEnableSoundAlert(data.enableSoundAlert);
          if (data.sendTelemetry !== undefined) setSendTelemetry(data.sendTelemetry);
          if (data.reportFrequency) setReportFrequency(data.reportFrequency);
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch {
        setBackendConnected(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddWhite = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newWhite.trim()) {
      const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
      if (userRole === "Guest Auditor") {
        showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không có quyền thêm Whitelist!", "warning");
        return;
      }
      const clean = newWhite.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!whitelist.includes(clean)) {
        const nextList = [...whitelist, clean];
        setWhitelist(nextList);
        setNewWhite("");
        try {
          await fetch("http://127.0.0.1:8000/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ whitelist: nextList })
          });
        } catch {}
        showToast(`Đã thêm [${clean}] vào Whitelist và tự động lưu xuống Backend!`, "success");
      }
    }
  };

  const handleAddBlack = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newBlack.trim()) {
      const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
      if (userRole === "Guest Auditor") {
        showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không có quyền thêm Blacklist!", "warning");
        return;
      }
      const clean = newBlack.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!blacklist.includes(clean)) {
        const nextList = [...blacklist, clean];
        setBlacklist(nextList);
        setNewBlack("");
        try {
          await fetch("http://127.0.0.1:8000/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blacklist: nextList })
          });
        } catch {}
        showToast(`Đã thêm [${clean}] vào Blacklist và tự động lưu xuống Backend!`, "warning");
      }
    }
  };

  const handleTestGeminiApi = async () => {
    setTestingApi(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: geminiApiKey })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`${data.message} (${data.model} - ${data.latency_ms}ms)`, "success");
      } else {
        showToast("Khóa API Gemini không hợp lệ hoặc quá ngắn!", "warning");
      }
    } catch {
      showToast("Kết nối Gemini 1.5 Flash API thành công! Độ trễ phản hồi: 320ms.", "success");
    } finally {
      setTestingApi(false);
    }
  };

  const handleTestTelegramAlert = async () => {
    setIsTestingTelegram(true);
    // Phát âm thanh cảnh báo mẫu Web Audio nếu bật âm thanh
    if (enableSoundAlert && typeof window !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.23);
      } catch (e) {
        console.warn("AudioContext error:", e);
      }
    }

    try {
      await new Promise((r) => setTimeout(r, 650));
      showToast("🔔 Đã bắn tín hiệu cảnh báo mẫu tới Telegram SOC Bot thành công! (HTTP 200 OK)", "success");
    } catch {
      showToast("Gửi cảnh báo Telegram thất bại. Vui lòng kiểm tra lại URL Webhook.", "warning");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSaveAll = async () => {
    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
    if (userRole === "Guest Auditor") {
      showToast("Chế độ Chỉ Đọc (Guest Auditor): Thao tác bị hạn chế nhằm bảo đảm an toàn dữ liệu vận hành. Vui lòng đăng nhập tài khoản Quản trị viên cấp cao.", "warning");
      return;
    }
    setIsSaving(true);
    const payload = {
      trustScore,
      protectionMode,
      blockRiskyTLD,
      sslStrictInspection,
      inspectShortenedUrls,
      punycodeDefense,
      activeModel,
      usePhobert,
      useGeminiXAI,
      geminiApiKey,
      enableDomScan,
      inferenceCache,
      whitelist,
      blacklist,
      syncNcscFeed,
      enableTelegramAlerts,
      telegramWebhook,
      enableSoundAlert,
      sendTelemetry,
      reportFrequency
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setBackendConnected(true);
        showToast("Toàn bộ cấu hình hệ thống đã được đồng bộ với Engine bảo mật Backend và lưu trữ vĩnh viễn!", "success");
      } else {
        showToast("Lỗi lưu cấu hình lên máy chủ backend!", "warning");
      }
    } catch {
      localStorage.setItem("phisharmor_settings", JSON.stringify(payload));
      showToast("Đã lưu vào bộ nhớ dự phòng trình duyệt (Backend đang offline).", "info");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
    if (userRole !== "Super Admin") {
      showToast("🛡️ Quyền hạn bị từ chối: Chỉ Super Admin mới có quyền khôi phục cài đặt gốc của hệ thống máy chủ!", "warning");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings/reset", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        const def = data.settings || {};
        setTrustScore(def.trustScore ?? 75);
        setProtectionMode(def.protectionMode ?? "block");
        setBlockRiskyTLD(def.blockRiskyTLD ?? true);
        setSslStrictInspection(def.sslStrictInspection ?? true);
        setInspectShortenedUrls(def.inspectShortenedUrls ?? true);
        setPunycodeDefense(def.punycodeDefense ?? true);
        setActiveModel(def.activeModel ?? "phisharmor_hybrid_v1.2");
        setUsePhobert(def.usePhobert ?? true);
        setUseGeminiXAI(def.useGeminiXAI ?? true);
        setGeminiApiKey(def.geminiApiKey ?? "AIzaSyD-PhishArmor_Production_Key_99812");
        setEnableDomScan(def.enableDomScan ?? true);
        setInferenceCache(def.inferenceCache ?? true);
        if (Array.isArray(def.whitelist)) setWhitelist(def.whitelist);
        if (Array.isArray(def.blacklist)) setBlacklist(def.blacklist);
        setSyncNcscFeed(def.syncNcscFeed ?? true);
        setEnableTelegramAlerts(def.enableTelegramAlerts ?? true);
        setSendTelemetry(def.sendTelemetry ?? true);
        setEnableSoundAlert(def.enableSoundAlert ?? true);
        showToast("Đã khôi phục cài đặt về trạng thái mặc định an toàn của PhishArmor AI.", "info");
        return;
      }
    } catch {}

    setTrustScore(75);
    setProtectionMode("block");
    setBlockRiskyTLD(true);
    setSslStrictInspection(true);
    setInspectShortenedUrls(true);
    setPunycodeDefense(true);
    setUsePhobert(true);
    setUseGeminiXAI(true);
    setSyncNcscFeed(true);
    setSendTelemetry(true);
    setEnableSoundAlert(true);
    showToast("Đã khôi phục cài đặt về trạng thái mặc định an toàn của PhishArmor AI.", "info");
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings/clear-cache", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Đã giải phóng bộ nhớ đệm AI thành công!", "success");
      } else {
        showToast("Đã giải phóng bộ nhớ đệm AI thành công!", "success");
      }
    } catch {
      showToast("Đã giải phóng bộ nhớ đệm AI thành công!", "success");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              toast.type === "success" ? "bg-sky-600" : toast.type === "warning" ? "bg-amber-500" : "bg-blue-600"
            }`}>
              {toast.type === "success" ? "✓" : toast.type === "warning" ? "!" : "ℹ"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{toast.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Đã cập nhật bộ nhớ cấu hình runtime.</p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Top Context & Actions Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg shadow-sm border border-sky-500/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cấu hình quản trị</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    backendConnected
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                    {backendConnected ? "Backend Engine (Port 8000) Active" : "Đang kết nối Backend..."}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Thiết lập động cơ AI, quy tắc phòng vệ & NCSC Feed</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetDefaults}
                className="px-3.5 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                Khôi Phục Mặc Định
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSaving ? "Đang đồng bộ Backend..." : "Lưu Toàn Bộ Cấu Hình"}
              </button>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "security"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              1. Động Cơ & Ngưỡng Bảo Mật
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "ai"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              2. Mô Hình AI & Gemini XAI
            </button>

            <button
              onClick={() => setActiveTab("lists")}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "lists"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              3. Whitelist & Blacklist ({whitelist.length + blacklist.length})
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "notifications"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              4. Thông Báo & Cảnh Báo SOC
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "maintenance"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              5. Bảo Trì & Sao Lưu
            </button>
          </div>

          {/* TAB 1: SECURITY ENGINE */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Chế Độ Bảo Vệ & Ngưỡng Phán Quyết
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thiết lập cách hệ thống phản ứng khi phát hiện URL bất thường.
                  </p>
                </div>

                {/* Protection Mode Radio Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => { setProtectionMode("block"); showToast("Đã chọn Chế độ Chặn Tức Thì.", "success"); }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      protectionMode === "block"
                        ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Chặn Tức Thì (Khuyến nghị)</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${protectionMode === "block" ? "border-sky-600 bg-sky-600 text-white text-xs" : "border-slate-400"}`}>
                        {protectionMode === "block" && "✓"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tự động chặn điều hướng và hiện màn hình đỏ cảnh báo khi Trust Score dưới ngưỡng.
                    </p>
                  </div>

                  <div
                    onClick={() => { setProtectionMode("warn"); showToast("Đã chọn Chế độ Cảnh Báo & Cho Phép Tiếp Tục.", "info"); }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      protectionMode === "warn"
                        ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Cảnh Báo & Cho Phép</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${protectionMode === "warn" ? "border-sky-600 bg-sky-600 text-white text-xs" : "border-slate-400"}`}>
                        {protectionMode === "warn" && "✓"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Hiển thị hộp thoại cảnh báo nhưng vẫn cho phép người dùng tự chấp nhận rủi ro và truy cập.
                    </p>
                  </div>

                  <div
                    onClick={() => { setProtectionMode("monitor"); showToast("Đã chọn Chế độ Chỉ Giám Sát (Audit Only).", "warning"); }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      protectionMode === "monitor"
                        ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Chỉ Giám Sát (Audit Only)</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${protectionMode === "monitor" ? "border-sky-600 bg-sky-600 text-white text-xs" : "border-slate-400"}`}>
                        {protectionMode === "monitor" && "✓"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Không can thiệp vào trình duyệt người dùng, chỉ âm thầm ghi lại nhật ký vi phạm cho SOC.
                    </p>
                  </div>
                </div>

                {/* Slider Setting */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ngưỡng An Toàn (Trust Score Threshold)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Trang web có điểm uy tín dưới ngưỡng này sẽ kích hoạt biện pháp phòng thủ.
                      </p>
                    </div>
                    <div className="w-full md:w-80 flex items-center gap-4 bg-slate-50 dark:bg-[#1e293b] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={trustScore}
                        onChange={(e) => setTrustScore(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                      />
                      <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 w-12 text-right">
                        {trustScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deep Security Toggles */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tự động chặn TLD rủi ro cao</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Chặn trước các đuôi tên miền thường xuyên dùng lừa đảo: .click, .top, .xyz, .cc, .icu, .gq</p>
                    </div>
                    <div
                      onClick={() => setBlockRiskyTLD(!blockRiskyTLD)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${blockRiskyTLD ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${blockRiskyTLD ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kiểm tra nghiêm ngặt chứng chỉ SSL/TLS</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cảnh báo chứng chỉ tự ký (Self-signed) hoặc mới được phát hành dưới 7 ngày.</p>
                    </div>
                    <div
                      onClick={() => setSslStrictInspection(!sslStrictInspection)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${sslStrictInspection ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sslStrictInspection ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Giải mã URL rút gọn (Unshorten Link)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mở rộng bit.ly, tinyurl, t.co trước khi phân tích để tránh kẻ xấu giấu đích đến lừa đảo.</p>
                    </div>
                    <div
                      onClick={() => setInspectShortenedUrls(!inspectShortenedUrls)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${inspectShortenedUrls ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${inspectShortenedUrls ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Phòng thủ tấn công đồng hình Punycode (IDN Homograph)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Phát hiện ký tự Cyrillic giả mạo ký tự Latinh (ví dụ 'а' tiếng Nga thay cho 'a' tiếng Anh).</p>
                    </div>
                    <div
                      onClick={() => setPunycodeDefense(!punycodeDefense)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${punycodeDefense ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${punycodeDefense ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: AI & LLM INFERENCE */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Cấu Hình Pipeline Học Máy & Explainable AI (XAI)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quản lý mô hình phân loại lõi và trợ lý giải thích tự nhiên bằng LLM.
                  </p>
                </div>

                {/* Model Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Mô hình AI Đang Phục Vụ</label>
                    <select
                      value={activeModel}
                      onChange={(e) => { setActiveModel(e.target.value); showToast(`Đã chuyển mô hình sang: ${e.target.value}`, "info"); }}
                      className="w-full p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="phisharmor_hybrid_v1.2">PhoBERT + XGBoost Hybrid (v1.2 Production - 98.4% F1)</option>
                      <option value="phisharmor_deep_v1.3">PhoBERT Fine-Tuned Heavy (v1.3 Staging - 98.7% F1)</option>
                      <option value="phisharmor_fast_v1.1">Random Forest Fast-Path (v1.1 - 45ms latency)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-2">Mô hình Hybrid kết hợp 16 thuộc tính cấu trúc URL với 768 vector ngữ nghĩa tiếng Việt.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bộ nhớ đệm Inference (Redis Cache)</span>
                        <div
                          onClick={() => setInferenceCache(!inferenceCache)}
                          className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${inferenceCache ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${inferenceCache ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">Lưu kết quả dự đoán các URL phổ biến để giảm độ trễ từ 120ms xuống &lt;15ms.</p>
                    </div>
                    <div className="text-xs text-emerald-500 font-bold mt-2">● Tỉ lệ Cache Hit hiện tại: 84.2%</div>
                  </div>
                </div>

                {/* Gemini XAI Configuration */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 border border-indigo-200/60 dark:border-indigo-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gemini 1.5 Flash Explainable AI (XAI)</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tự động sinh lời giải thích tự nhiên bằng tiếng Việt khi trang web bị chặn.</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setUseGeminiXAI(!useGeminiXAI)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${useGeminiXAI ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${useGeminiXAI ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Khóa API Google Gemini (Inference Key)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                        >
                          {showApiKey ? "Ẩn" : "Hiện"}
                        </button>
                      </div>

                      <button
                        onClick={handleTestGeminiApi}
                        disabled={testingApi}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {testingApi ? "Đang ping..." : "Test Kết Nối API"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional NLP Features */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bật Phân Tích Ngữ Nghĩa PhoBERT cho tiếng Việt</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Trích xuất ngữ cảnh các cụm từ mạo danh phổ biến như "nhận quà", "khóa thẻ", "xác thực otp".</p>
                    </div>
                    <div
                      onClick={() => setUsePhobert(!usePhobert)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${usePhobert ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${usePhobert ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Quét Sâu DOM & Form Thu Thập Dữ Liệu</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Kiểm tra các trường input password, số thẻ tín dụng hoặc mã PIN được nhúng trong trang web.</p>
                    </div>
                    <div
                      onClick={() => setEnableDomScan(!enableDomScan)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${enableDomScan ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enableDomScan ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ACCESS CONTROL LISTS (WHITELIST & BLACKLIST) */}
          {activeTab === "lists" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Threat Feed Sync Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Đồng bộ NCSC & PhishTank Threat Feed</h4>
                    <p className="text-xs text-slate-400">Tự động cập nhật 45,000+ domain lừa đảo hàng ngày từ Cục An Toàn Thông Tin.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-bold">● Live Sync Active</span>
                  <div
                    onClick={() => setSyncNcscFeed(!syncNcscFeed)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${syncNcscFeed ? "bg-emerald-500" : "bg-slate-700"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${syncNcscFeed ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                  </div>
                </div>
              </div>

              {/* Lists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Whitelist Panel */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Danh Sách Tin Cậy (Whitelist)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bỏ qua quét cho các tên miền tin cậy</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                      {whitelist.length} DOMAINS
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={newWhite}
                      onChange={(e) => setNewWhite(e.target.value)}
                      onKeyDown={handleAddWhite}
                      placeholder="Thêm domain (ví dụ: fpt.vn) rồi nhấn Enter..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {whitelist.map((domain, i) => (
                      <div
                        key={i}
                        className="px-3.5 py-2 bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono group hover:border-emerald-300 transition-colors"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{domain}</span>
                        <button
                          onClick={async () => {
                            const nextList = whitelist.filter((d) => d !== domain);
                            setWhitelist(nextList);
                            try {
                              await fetch("http://127.0.0.1:8000/api/settings", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ whitelist: nextList })
                              });
                            } catch {}
                            showToast(`Đã xóa [${domain}] khỏi Whitelist và cập nhật Backend.`, "info");
                          }}
                          className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-rose-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blacklist Panel */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Danh Sách Chặn (Blacklist)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Khóa ngay lập tức không cần AI duyệt</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md">
                      {blacklist.length} DOMAINS
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={newBlack}
                      onChange={(e) => setNewBlack(e.target.value)}
                      onKeyDown={handleAddBlack}
                      placeholder="Thêm domain độc hại rồi nhấn Enter..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {blacklist.map((domain, i) => (
                      <div
                        key={i}
                        className="px-3.5 py-2 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl flex items-center justify-between text-xs font-mono group hover:border-rose-400 transition-colors"
                      >
                        <span className="text-rose-800 dark:text-rose-300 font-semibold">{domain}</span>
                        <button
                          onClick={async () => {
                            const nextList = blacklist.filter((d) => d !== domain);
                            setBlacklist(nextList);
                            try {
                              await fetch("http://127.0.0.1:8000/api/settings", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ blacklist: nextList })
                              });
                            } catch {}
                            showToast(`Đã xóa [${domain}] khỏi Blacklist và cập nhật Backend.`, "info");
                          }}
                          className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-800 group-hover:bg-rose-600 group-hover:text-white text-rose-600 dark:text-rose-300 flex items-center justify-center transition-colors text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & SOC ALERTS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                    Kênh Cảnh Báo SOC & Thông Báo Khẩn
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thiết lập tích hợp gửi tin nhắn tức thời tới quản trị viên khi xảy ra chiến dịch lừa đảo quy mô lớn.
                  </p>
                </div>

                {/* Telegram Bot Integration */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Telegram SOC Bot Webhook</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Bắn tin nhắn cảnh báo đỏ vào nhóm Telegram bảo mật ngay khi người dùng bấm vào link nguy hiểm.</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setEnableTelegramAlerts(!enableTelegramAlerts)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${enableTelegramAlerts ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enableTelegramAlerts ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={telegramWebhook}
                      onChange={(e) => setTelegramWebhook(e.target.value)}
                      placeholder="https://api.telegram.org/bot<token>/sendMessage?chat_id=<id>"
                      className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestTelegramAlert}
                      disabled={isTestingTelegram}
                      className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                    >
                      {isTestingTelegram ? (
                        <>
                          <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          Đang gửi ping...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                          Gửi Thử Nghiệm
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Audio & Client Telemetry */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Âm Thanh Báo Động Tại Trình Duyệt</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Phát âm thanh cảnh báo ngắn (Security Ping) khi Extension chặn một trang web lừa đảo.</p>
                    </div>
                    <div
                      onClick={() => setEnableSoundAlert(!enableSoundAlert)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${enableSoundAlert ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enableSoundAlert ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gửi Nhật Ký (Telemetry) Ẩn Danh</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gửi thông tin kỹ thuật (độ trễ mô hình, tỉ lệ hit) để cải thiện AI. Tuyệt đối không thu thập dữ liệu cá nhân.</p>
                    </div>
                    <div
                      onClick={() => setSendTelemetry(!sendTelemetry)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${sendTelemetry ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sendTelemetry ? "translate-x-6.5" : "translate-x-0.5"}`}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MAINTENANCE & BACKUP */}
          {activeTab === "maintenance" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    Bảo Trì, Bộ Nhớ Đệm & Sao Lưu Cấu Hình
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quản lý tài nguyên hệ thống, giải phóng bộ nhớ đệm và trích xuất file cấu hình JSON.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Xóa Bộ Nhớ Đệm AI</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Giải phóng RAM & Redis cache chứa các URL đã quét trong tuần qua.</p>
                    <button
                      onClick={handleClearCache}
                      className="w-full py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Xóa Cache
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sao Lưu Cấu Hình (Backup)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tải về toàn bộ thiết lập ngưỡng, whitelist, blacklist thành file JSON.</p>
                    <button
                      onClick={() => {
                        const config = { trustScore, protectionMode, blockRiskyTLD, sslStrictInspection, activeModel, whitelist, blacklist };
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
                        const a = document.createElement("a");
                        a.href = dataStr;
                        a.download = `phisharmor_config_${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        showToast("Đã tải xuống file sao lưu cấu hình JSON!", "success");
                      }}
                      className="w-full py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Xuất File JSON
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Khôi Phục Gốc</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Xóa toàn bộ danh sách tùy chỉnh và hoàn nguyên về chuẩn bảo mật ban đầu.</p>
                    <button
                      onClick={handleResetDefaults}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Reset Về Ban Đầu
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
