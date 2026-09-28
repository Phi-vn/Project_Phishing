"use client";
import React, { useState } from 'react';
import Link from "next/link";

export default function MetricsPage() {

  const [isRetraining, setIsRetraining] = useState(false);
  const [metrics, setMetrics] = useState({
    ensemble: [0.984, 0.979, 0.981, 0.993],
    cm: [1842, 31, 24, 1103]
  });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setMetrics({
        ensemble: [0.989, 0.983, 0.986, 0.996],
        cm: [1855, 18, 12, 1115]
      });
      setIsRetraining(false);
    }, 2000);
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
              <li><Link href="/metrics" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">⚙️</span> Kiến trúc & Metrics</Link></li>
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

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Kiến trúc & Chỉ số mô hình</h1>

          {/* Architecture Pipeline */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            {/* Step 1 */}
            <div onClick={() => setActiveStep(1)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 1 ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300'} p-6 flex flex-col items-start w-full`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-[14px] mb-4 shadow-sm">1</div>
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-2">Rule + XGBoost</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-6">
                Whitelist/Blacklist nội bộ, trích xuất 16 đặc trưng URL. Nếu an toàn tuyệt đối → cho qua ngay
              </p>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold mt-auto border border-emerald-100">~10ms</span>
            </div>

            {/* Arrow */}
            <div className="text-slate-300 hidden lg:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>

            {/* Step 2 */}
            <div onClick={() => setActiveStep(2)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 2 ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300'} p-6 flex flex-col items-start w-full`}>
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-[14px] mb-4 shadow-sm">2</div>
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-2">DistilBERT / PhoBERT</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-6">
                Trích xuất cấu trúc HTML (form giả, action lạ, iframe ẩn) kết hợp phân tích nội dung text khi có nghi ngờ
              </p>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-md text-[10px] font-bold mt-auto border border-sky-100">~150ms</span>
            </div>

            {/* Arrow */}
            <div className="text-slate-300 hidden lg:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>

            {/* Step 3 */}
            <div onClick={() => setActiveStep(3)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 3 ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300'} p-6 flex flex-col items-start w-full`}>
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-[14px] mb-4 shadow-sm">3</div>
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-2">Gemini XAI (Async)</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-6">
                Chỉ kích hoạt khi is_phishing = true, sinh bản tóm tắt nguyên nhân dễ hiểu cho người dùng
              </p>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold mt-auto border border-rose-100">Async</span>
            </div>
          </div>

          {/* Grid Layout for Metrics & Confusion Matrix */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Evaluation Metrics */}
            <div className="xl:col-span-2 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-extrabold text-[16px] text-slate-900 dark:text-white">Evaluation Metrics</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tập kiểm thử PhishTank / PhishStats</span>
                    <button onClick={handleRetrain} disabled={isRetraining} className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {isRetraining ? 'Đang huấn luyện...' : 'Tái huấn luyện mô hình'}
                    </button>
                  </div>
                </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                      <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500">Model</th>
                      <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">Precision</th>
                      <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">Recall</th>
                      <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">F1-Score</th>
                      <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">ROC-AUC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-5 text-[13px] text-slate-700 dark:text-slate-300 font-medium">URL Classifier (XGBoost)</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.971</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.958</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.964</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.986</td>
                    </tr>
                    <tr>
                      <td className="py-5 text-[13px] text-slate-700 dark:text-slate-300 font-medium">Text Classifier (PhoBERT)</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.949</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.937</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.943</td>
                      <td className="py-5 text-[13px] font-black text-slate-800 dark:text-slate-200 text-center">0.971</td>
                    </tr>
                    <tr>
                      <td className="py-5 text-[13px] text-slate-700 dark:text-slate-300 font-medium">Kết hợp đa tầng (Ensemble)</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[0]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[1]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[2]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[3]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col">
              <h3 className="font-extrabold text-[16px] text-slate-900 dark:text-white mb-8">Confusion Matrix</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#059669] mb-1">{metrics.cm[0].toLocaleString()}</span>
                  <span className="text-[10px] text-[#047857] font-bold uppercase tracking-wide">True Safe</span>
                </div>
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#d97706] mb-1">{metrics.cm[1].toLocaleString()}</span>
                  <span className="text-[10px] text-[#b45309] font-bold uppercase tracking-wide">False Phishing</span>
                </div>
                <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#ea580c] mb-1">{metrics.cm[2].toLocaleString()}</span>
                  <span className="text-[10px] text-[#c2410c] font-bold uppercase tracking-wide">False Safe</span>
                </div>
                <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#e11d48] mb-1">{metrics.cm[3].toLocaleString()}</span>
                  <span className="text-[10px] text-[#be123c] font-bold uppercase tracking-wide">True Phishing</span>
                </div>
              </div>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-auto font-medium">
                Tập kiểm thử n = 3,000 mẫu (cân bằng 60/40)
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
