"use client";
import React, { useState } from 'react';
import Link from "next/link";

export default function Dashboard() {
  const [url, setUrl] = useState("yourbank.com/login");
  const [isActive, setIsActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState(92);
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const triggerScan = (testUrl: string) => {
    if (!isActive) return;
    setIsScanning(true);
    setTimeout(() => {
      // Logic mock Trust Score based on url
      const lowerUrl = testUrl.toLowerCase();
      if (lowerUrl.includes("facebook-login") || lowerUrl.includes("free-gift") || lowerUrl.includes("lừa-đảo") || lowerUrl.includes("voucher")) {
        setScore(12);
      } else if (lowerUrl.includes("shopee-voucher")) {
        setScore(45);
      } else if (lowerUrl.includes("facebook.com") || lowerUrl.includes("google.com") || lowerUrl.includes("an-toan")) {
        setScore(99);
      } else {
        setScore(Math.floor(Math.random() * (95 - 50 + 1) + 50));
      }
      setIsScanning(false);
    }, 800);
  }

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key && e.key !== 'Enter') return;
    triggerScan(url);
  };
  
  // Computed styles based on score
  let scoreColor = "text-slate-900 dark:text-white";
  let ringColor = "border-t-[#00897b] border-r-[#00897b]";
  let statusText = "Độ tin cậy cao — không phát hiện dấu hiệu bất thường";
  
  if (!isActive) {
     scoreColor = "text-slate-300 dark:text-slate-600";
     ringColor = "border-slate-200 dark:border-slate-800";
     statusText = "Tiện ích đang tạm tắt. Vui lòng bật lại để quét.";
  } else if (score >= 85) {
     scoreColor = "text-[#00897b]";
     ringColor = "border-t-[#00897b] border-r-[#00897b]";
     statusText = "Độ tin cậy cao — không phát hiện dấu hiệu bất thường";
  } else if (score >= 50) {
     scoreColor = "text-amber-500";
     ringColor = "border-t-amber-500 border-r-amber-500";
     statusText = "Tên miền đáng ngờ — vui lòng cẩn thận khi nhập thông tin";
  } else {
     scoreColor = "text-red-500";
     ringColor = "border-t-red-500 border-r-red-500";
     statusText = "CẢNH BÁO LỪA ĐẢO — đã chặn quyền truy cập!";
  }

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 font-sans flex">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${toast.type === 'success' ? 'bg-[#00897b]' : 'bg-blue-500'}`}>
              {toast.type === 'success' ? '✓' : 'ℹ'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{toast.message}</p>
              <p className="text-xs text-slate-500">Quá trình đang chạy nền...</p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto sticky top-0 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00897b] rounded-xl flex justify-center items-center text-white text-xl shadow-lg">🛡️</div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight text-slate-900 dark:text-white">PhishArmor AI</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Hệ thống chống lừa đảo</p>
          </div>
        </div>

        <div className="flex-1 px-4 mt-2">
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 uppercase tracking-widest">Trình duyệt</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors">
                  <span className="text-lg">📱</span> Popup tiện ích
                </Link>
              </li>
              <li>
                <Link href="/block" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                  <span className="text-lg">🛡️</span> Trang chặn truy cập
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 uppercase tracking-widest">Web Dashboard</h2>
            <ul className="space-y-1">
              <li><Link href="/overview" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">⊞</span> Tổng quan</Link></li>
              <li><Link href="/scan" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🔍</span> Quét thủ công</Link></li>
              <li><Link href="/history" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">📊</span> Lịch sử & Báo cáo</Link></li>
              <li><Link href="/metrics" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">⚙️</span> Kiến trúc & Metrics</Link></li>
              <li><Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🔧</span> Cài đặt</Link></li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 uppercase tracking-widest">Trải nghiệm khác</h2>
            <ul className="space-y-1">
              <li><Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">👤</span> Đăng nhập Admin</Link></li>
              <li><Link href="/onboarding" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🚀</span> Onboarding cài đặt</Link></li>
              <li><Link href="/export" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">📄</span> Xuất báo cáo PDF</Link></li>
            </ul>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
          <div onClick={() => { document.documentElement.classList.toggle("dark"); if (document.documentElement.classList.contains("dark")) { localStorage.setItem("theme", "dark"); } else { localStorage.setItem("theme", "light"); } }} className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-medium cursor-pointer transition-colors">
            <span className="text-lg block dark:hidden">🌙</span><span className="text-lg hidden dark:block">☀️</span> <span className="block dark:hidden">Chế độ tối</span><span className="hidden dark:block">Chế độ sáng</span>
          </div>
          
          
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto h-screen bg-[#f4f7f6] dark:bg-[#0b1120]">
        <div className="max-w-6xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Popup tiện ích mở rộng</h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Giả lập và tùy chỉnh giao diện Extension trước khi đóng gói.</p>
            </div>
            <button onClick={() => showToast("Đang đóng gói file PhishArmor_v1.2.zip...", "info")} className="px-5 py-2.5 bg-[#00897b] text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#00695c] whitespace-nowrap transition-colors flex items-center gap-2">
              <span>📦</span> Tải xuống Extension (.zip)
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Mockup Area (2 columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12 flex justify-center items-center shadow-sm">
              <div className="w-full max-w-[500px] flex flex-col gap-6">
                {/* Fake Browser Window */}
                <div className="w-full bg-white dark:bg-[#111827] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  {/* Browser Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 flex items-center gap-2 shadow-sm font-medium">
                      <span className="text-[#00897b] font-bold">Shield</span>
                      <input type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleScan}
                        disabled={!isActive}
                        className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300" 
                      />
                    </div>
                    <div className="w-9 h-9 bg-[#00897b] rounded-lg flex items-center justify-center text-white text-sm shadow-md">🛡️</div>
                  </div>
                  {/* Browser Body -> Contains the Popup UI */}
                  <div className="p-10 flex justify-center bg-[#f8f9fa]">
                    <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-[320px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 pb-2">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#00897b] rounded-xl"></div>
                            <span className="font-extrabold text-[15px] text-slate-900 dark:text-white">PhishArmor AI</span>
                          </div>
                          <span className={`text-[10px] flex items-center gap-1.5 font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}><span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span> {isActive ? "Đang kích hoạt" : "Tạm dừng"}</span>
                        </div>
                        
                        <div className="flex justify-center mb-6">
                          <div className={`w-[140px] h-[140px] rounded-full border-[10px] border-slate-100 dark:border-slate-800/50 ${ringColor} transition-colors duration-500 flex flex-col items-center justify-center`}>
                            {isScanning ? <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#00897b] animate-spin mb-2"></div> : <span className={`text-4xl font-black ${scoreColor} tracking-tight`}>{isActive ? score : "--"}</span>}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold mt-1">Trust Score</span>
                          </div>
                        </div>
                        
                        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium px-2 h-8 flex items-center justify-center">{statusText}</p>
                        
                        <div className="bg-[#f8fcfb] dark:bg-[#0b1120] rounded-xl p-3.5 flex justify-between items-center mb-6 border border-slate-100 dark:border-slate-800/50">
                          <span className="text-[13px] font-extrabold text-slate-900 dark:text-white max-w-[150px] truncate">{url || "yourbank.com"}</span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${score >= 85 ? 'bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b]' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{score >= 85 ? '✓ SSL hợp lệ' : score >= 50 ? '⚠ SSL Cảnh báo' : '✕ Không có SSL'}</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1.5"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">URL Pattern</span><span className="font-bold text-slate-800 dark:text-slate-200">{score >= 85 ? '0.02 · Thấp' : score >= 50 ? '0.45 · Bất thường' : '0.98 · Độc hại'}</span></div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><div className={`h-full rounded-full ${score >= 85 ? 'w-[15%] bg-[#00897b]' : score >= 50 ? 'w-[45%] bg-amber-500' : 'w-[98%] bg-red-500'}`}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] mb-1.5"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Trùng lặp thương hiệu</span><span className="font-bold text-slate-800 dark:text-slate-200">{score >= 85 ? 'Không phát hiện' : score >= 50 ? 'Nghi ngờ giả mạo' : 'Giả mạo ngân hàng'}</span></div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><div className={`h-full rounded-full ${score >= 85 ? 'w-[5%] bg-[#00897b]' : score >= 50 ? 'w-[65%] bg-amber-500' : 'w-[100%] bg-red-500'}`}></div></div>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <div onClick={() => setIsActive(!isActive)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isActive ? "bg-[#00897b]" : "bg-slate-300 dark:bg-slate-700"}`}><div className={`w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-transform ${isActive ? "translate-x-4" : "translate-x-0"}`}></div></div>
                          <Link href="/scan" className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold cursor-pointer hover:text-[#00897b] transition-colors">Báo cáo phân tích chuyên sâu →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Kiểm thử nhanh</span>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setUrl("vietcombank.com.vn"); triggerScan("vietcombank.com.vn"); }} className="w-full px-3 py-2 bg-white dark:bg-[#111827] text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left flex justify-between"><span>Safe Domain</span> <span>→</span></button>
                      <button onClick={() => { setUrl("shopee-voucher-vip.click"); triggerScan("shopee-voucher-vip.click"); }} className="w-full px-3 py-2 bg-white dark:bg-[#111827] text-rose-600 border border-rose-100 dark:border-rose-900/30 rounded-lg text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left flex justify-between"><span>Phishing Domain</span> <span>→</span></button>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Trạng thái kết nối</span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Background Script Live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Mô hình AI: Sẵn sàng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">WebSocket: Đã kết nối</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Info Cards */}
            <div className="space-y-6">
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm">Thông số Mô hình AI</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400">Kiến trúc</span><span className="font-mono font-bold text-slate-800 dark:text-slate-200">PhoBERT + XGBoost</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400">Độ chính xác (F1)</span><span className="font-mono font-bold text-[#00897b]">98.4%</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400">Độ trễ suy luận</span><span className="font-mono font-bold text-slate-800 dark:text-slate-200">~120ms</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400">Phiên bản API</span><span className="font-mono font-bold text-slate-800 dark:text-slate-200">v1.2 (Stable)</span></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm">Ngưỡng Trust Score</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">85 — 100 · <span className="text-slate-800 dark:text-slate-200">An toàn</span></span><span className="text-[#00897b] font-bold">Cho qua</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">50 — 84 · <span className="text-slate-800 dark:text-slate-200">Đáng ngờ</span></span><span className="text-amber-500 font-bold">Cảnh báo</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">0 — 49 · <span className="text-slate-800 dark:text-slate-200">Độc hại</span></span><span className="text-red-500 font-bold">Chặn</span></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm">Quy trình Xử lý</h3>
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-2 space-y-4 py-1">
                  <div className="relative pl-4">
                    <div className="absolute w-2 h-2 bg-[#00897b] rounded-full -left-[5px] top-1.5"></div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">1. Trích xuất đặc trưng</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Lọc URL, Lexical & DOM features</p>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute w-2 h-2 bg-[#00897b] rounded-full -left-[5px] top-1.5"></div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">2. Phân tích ngữ nghĩa</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">PhoBERT nhúng vector ngôn ngữ</p>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full -left-[5px] top-1.5"></div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">3. Chấm điểm rủi ro</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Mô hình XGBoost tính Trust Score</p>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute w-2 h-2 bg-red-500 rounded-full -left-[5px] top-1.5"></div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">4. Phản hồi Explainable AI</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Gemini tạo giải thích cho User</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
