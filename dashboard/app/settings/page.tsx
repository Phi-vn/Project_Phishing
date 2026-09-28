"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";

export default function SettingsPage() {

  const [trustScore, setTrustScore] = useState(75);
  const [usePhobert, setUsePhobert] = useState(true);
  const [useGemini, setUseGemini] = useState(true);
  const [sendLogs, setSendLogs] = useState(false);

  const [whitelist, setWhitelist] = useState(["vietcombank.com.vn", "yourbank.com", "gov.vn"]);
  const [blacklist, setBlacklist] = useState(["yourbnk-secure-login.net", "facebook-gift-claim.top"]);
  const [newWhite, setNewWhite] = useState("");
  const [newBlack, setNewBlack] = useState("");

  const [showToast, setShowToast] = useState(false);

  // Trigger toast on setting change
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [trustScore, usePhobert, useGemini, sendLogs, whitelist, blacklist]);


  const handleAddWhite = (e: any) => {
    if (e.key === 'Enter' && newWhite.trim()) {
      setWhitelist([...whitelist, newWhite.trim()]);
      setNewWhite("");
    }
  };

  const handleAddBlack = (e: any) => {
    if (e.key === 'Enter' && newBlack.trim()) {
      setBlacklist([...blacklist, newBlack.trim()]);
      setNewBlack("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 font-sans flex">
      
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
              <li><Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">📱</span> Popup tiện ích</Link></li>
              <li><Link href="/block" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🛡️</span> Trang chặn truy cập</Link></li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 uppercase tracking-widest">Web Dashboard</h2>
            <ul className="space-y-1">
              <li><Link href="/overview" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">⊞</span> Tổng quan</Link></li>
              <li><Link href="/scan" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🔍</span> Quét thủ công</Link></li>
              <li><Link href="/history" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">📊</span> Lịch sử & Báo cáo</Link></li>
              <li><Link href="/metrics" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">⚙️</span> Kiến trúc & Metrics</Link></li>
              <li><Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">🔧</span> Cài đặt</Link></li>
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
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Cài đặt</h1>

          {/* Main Settings Panel */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mb-8">
            <div className="divide-y divide-slate-100">
              
              {/* Setting Row 1 */}
              <div className="py-6 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Ngưỡng cảnh báo (Trust Score)</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Điểm dưới ngưỡng này sẽ hiển thị trang chặn truy cập</p>
                </div>
                <div className="w-full md:w-64 flex items-center gap-3">
                  <div className="w-full relative flex items-center gap-4">
                  <input type="range" min="0" max="100" value={trustScore} onChange={(e) => setTrustScore(Number(e.target.value))} className="w-full accent-[#00897b] cursor-pointer" />
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 w-8">{trustScore}%</span>
                </div>
                </div>
              </div>

              {/* Setting Row 2 */}
              <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 2 — PhoBERT/DistilBERT</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Phân tích nội dung HTML & văn bản khi có nghi ngờ</p>
                </div>
                <div>
                  <div onClick={() => setUsePhobert(!usePhobert)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${usePhobert ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${usePhobert ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              {/* Setting Row 3 */}
              <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 3 — Gemini Explainable AI</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Sinh lời giải thích tự nhiên khi phát hiện lừa đảo</p>
                </div>
                <div>
                  <div onClick={() => setUseGemini(!useGemini)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${useGemini ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${useGemini ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              {/* Setting Row 4 */}
              <div className="py-6 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Gửi log ẩn danh để cải thiện mô hình</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Không thu thập nội dung mật khẩu hay dữ liệu cá nhân</p>
                </div>
                <div>
                  <div onClick={() => setSendLogs(!sendLogs)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${sendLogs ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${sendLogs ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Grid for Whitelist & Blacklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col h-64 overflow-y-auto">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-6">Danh sách tin cậy (Whitelist)</h3>
              <input type="text" value={newWhite} onChange={e => setNewWhite(e.target.value)} onKeyDown={handleAddWhite} placeholder="Thêm domain (Enter)..." className="w-full mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[12px] outline-none" />
              <div className="flex flex-wrap gap-3">
                {whitelist.map((domain, i) => (
                  <span key={i} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-full text-[12px] font-mono font-medium flex items-center gap-2">
                    {domain} <span onClick={() => setWhitelist(whitelist.filter(d => d !== domain))} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-rose-500">×</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col h-64 overflow-y-auto">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-6">Danh sách chặn (Blacklist)</h3>
              <input type="text" value={newBlack} onChange={e => setNewBlack(e.target.value)} onKeyDown={handleAddBlack} placeholder="Thêm domain (Enter)..." className="w-full mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[12px] outline-none" />
              <div className="flex flex-wrap gap-3">
                {blacklist.map((domain, i) => (
                  <span key={i} className="px-4 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-[12px] font-mono font-medium flex items-center gap-2">
                    {domain} <span onClick={() => setBlacklist(blacklist.filter(d => d !== domain))} className="text-rose-400 cursor-pointer hover:text-rose-600">×</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl font-bold text-[13px] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 dark:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          Đã lưu cấu hình hệ thống
        </div>
      </div>
    </div>
  );
}
