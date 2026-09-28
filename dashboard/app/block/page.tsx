"use client";
import React, { useState } from 'react';
import Link from "next/link";

export default function BlockPage() {
  const [url, setUrl] = useState("yourbnk-secure-login.net/verify");
  const [isBypassed, setIsBypassed] = useState(false);
  
  // Customization states
  const [allowBypass, setAllowBypass] = useState(true);
  const [showXAI, setShowXAI] = useState(true);
  const [warningTitle, setWarningTitle] = useState("Trang này có dấu hiệu lừa đảo");
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
       setIsBypassed(false);
    }
  };

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
              <p className="text-xs text-slate-500">Hệ thống đã ghi nhận cập nhật.</p>
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
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                  <span className="text-lg">📱</span> Popup tiện ích
                </Link>
              </li>
              <li>
                <Link href="/block" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors">
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
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Trang chặn truy cập</h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Cấu hình cảnh báo và hành vi chặn người dùng khi phát hiện lừa đảo.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => showToast("Đã lưu cấu hình lên máy chủ!", "info")} className="px-5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
                Lưu cấu hình
              </button>
              <button onClick={() => showToast("Đã đẩy cấu hình mới xuống Extension!", "success")} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-rose-700 transition-colors flex items-center gap-2">
                <span>🚀</span> Phát tệp chặn
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Mockup Area (2 columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex justify-center items-center shadow-sm">
              {/* Fake Browser Window */}
              <div className="w-full h-[620px] bg-white dark:bg-[#111827] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
                {/* Browser Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className={`flex-1 bg-white dark:bg-[#111827] border rounded-lg px-4 py-2 text-xs flex items-center gap-2 shadow-sm font-medium ${isBypassed ? "border-slate-200 dark:border-slate-800 text-slate-500" : "border-red-200 text-red-500"}`}>
                    <span className={`font-bold ${isBypassed ? "text-[#00897b]" : "text-red-500"}`}>Shield</span>
                    <input type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm shadow-md ${isBypassed ? "bg-[#00897b]" : "bg-red-600"}`}>🛡️</div>
                </div>
                {/* Browser Body -> Contains the Blocking UI */}
                <div className="flex-1 flex justify-center items-center relative overflow-hidden bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(#1e293b_1px,transparent_1px),linear-gradient(90deg,#1e293b_1px,transparent_1px)] bg-[size:20px_20px]">
                  
                  {isBypassed ? (
                    <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-[420px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 z-10 p-8 flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 font-bold text-2xl">🏦</div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 text-center">Đăng nhập tài khoản</h2>
                      <div className="w-full space-y-4">
                        <input type="text" placeholder="Tên đăng nhập" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900" />
                        <input type="password" placeholder="Mật khẩu" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900" />
                        <button onClick={() => setIsBypassed(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">Trở về trang chặn</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-[420px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 z-10 p-8 flex flex-col items-center">
                      
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                      </div>

                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 text-center">{warningTitle}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6 font-mono text-center">{url}</p>

                      {showXAI && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 w-full mb-6 border border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">✨ Phân tích bởi Gemini Explainable AI</span>
                          </div>
                          <ul className="space-y-3">
                            <li className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed pl-3 relative">
                              <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Dấu hiệu 1:</span> Tên miền nhái dạng ký tự đồng hình (Typosquatting / Homograph attack).
                            </li>
                            <li className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed pl-3 relative">
                              <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Dấu hiệu 2:</span> Form nhập liệu yêu cầu mật khẩu nhưng gửi dữ liệu tới máy chủ lạ, không khớp domain gốc.
                            </li>
                          </ul>

                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-amber-600 font-medium leading-relaxed">
                              <span className="font-bold">⚠ Đề xuất:</span> Không nhập mã OTP hoặc thông tin ngân hàng trên trang này.
                            </p>
                          </div>
                        </div>
                      )}

                      <button onClick={() => {setUrl("google.com"); setIsBypassed(true);}} className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3.5 rounded-xl font-bold text-sm transition-colors mb-4">Quay lại trang an toàn</button>
                      
                      {allowBypass && (
                        <button onClick={() => setIsBypassed(true)} className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium underline underline-offset-2">Tôi hiểu rủi ro và vẫn muốn truy cập (không khuyến nghị)</button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Info Cards */}
            <div className="space-y-6">
              {/* Tùy chỉnh Panel */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm">Tùy chỉnh giao diện chặn</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề cảnh báo</label>
                    <input 
                      type="text" 
                      value={warningTitle}
                      onChange={(e) => setWarningTitle(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <div>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Hiển thị nút Bỏ qua</span>
                      <span className="text-[10px] text-slate-500">Cho phép người dùng vượt rào</span>
                    </div>
                    <div onClick={() => setAllowBypass(!allowBypass)} className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-colors ${allowBypass ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${allowBypass ? "translate-x-4" : "translate-x-0"}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <div>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tích hợp XAI (Gemini)</span>
                      <span className="text-[10px] text-slate-500">Hiển thị lời giải thích chi tiết</span>
                    </div>
                    <div onClick={() => setShowXAI(!showXAI)} className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-colors ${showXAI ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showXAI ? "translate-x-4" : "translate-x-0"}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm">Điều kiện kích hoạt</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Mức độ nguy hiểm</span><span className="font-mono font-bold text-rose-500">Độc hại (0-49)</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Nguồn quyết định</span><span className="font-mono font-bold text-slate-800 dark:text-slate-200">Tầng 1 + Tầng 2</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Ghi log vi phạm</span><span className="font-mono font-bold text-emerald-600">Có (Tự động)</span></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
