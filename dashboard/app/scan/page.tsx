"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";

export default function ScanPage() {
  const [url, setUrl] = useState("https://yourbnk-secure-login.net/verify?token=8817xa");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Lỗi kết nối Backend. Hãy đảm bảo API đang chạy ở cổng 8000.");
    } finally {
      setIsScanning(false);
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
              <li><Link href="/scan" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">🔍</span> Quét thủ công</Link></li>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Quét thủ công</h1>



          {/* Input Box */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 mb-8 flex flex-col gap-4">
            <input type="text" 
                   value={url} onChange={e => setUrl(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') handleScan();}}
                   className="w-full text-[13px] font-mono p-2 px-3 outline-none text-slate-700 dark:text-slate-300 bg-transparent" />
            <div className="w-full border-t border-slate-100 dark:border-slate-800/50 flex justify-end pt-4">
              <button onClick={handleScan} disabled={isScanning} className="px-6 py-2.5 bg-[#00897b] text-white rounded-xl text-[13px] font-bold hover:bg-[#00695c] transition-colors shadow-md flex items-center gap-2 disabled:opacity-70">
                {isScanning ? 'Đang phân tích...' : 'Phân tích ngay →'}
              </button>
            </div>
          </div>

          {/* Grid Layout for Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Machine Learning Deep Dive */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-8">Machine Learning Deep Dive</h3>
              
              {/* Radar Chart Mock */}
              <div className="h-[260px] w-full flex justify-center items-center relative mb-8">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-sm">
                  {/* Grid */}
                  <polygon points="100,20 176,75 147,166 53,166 24,75" fill="none" stroke="#f1f5f9" strokeWidth="2"/>
                  <polygon points="100,40 157,81 135,150 65,150 43,81" fill="none" stroke="#f1f5f9" strokeWidth="2"/>
                  <polygon points="100,60 138,87 123,133 77,133 62,87" fill="none" stroke="#f1f5f9" strokeWidth="2"/>
                  <polygon points="100,80 119,94 112,116 88,116 81,94" fill="none" stroke="#f1f5f9" strokeWidth="2"/>
                  
                  {/* Axes */}
                  <line x1="100" y1="100" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="2"/>
                  <line x1="100" y1="100" x2="176" y2="75" stroke="#f1f5f9" strokeWidth="2"/>
                  <line x1="100" y1="100" x2="147" y2="166" stroke="#f1f5f9" strokeWidth="2"/>
                  <line x1="100" y1="100" x2="53" y2="166" stroke="#f1f5f9" strokeWidth="2"/>
                  <line x1="100" y1="100" x2="24" y2="75" stroke="#f1f5f9" strokeWidth="2"/>
                  
                  {/* Labels */}
                  <text x="100" y="8" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="600">Độ dài URL</text>
                  <text x="186" y="75" fontSize="8" fill="#64748b" textAnchor="start" fontWeight="600">Số chấm</text>
                  <text x="155" y="176" fontSize="8" fill="#64748b" textAnchor="start" fontWeight="600">Entropy</text>
                  <text x="45" y="176" fontSize="8" fill="#64748b" textAnchor="end" fontWeight="600">Từ khóa nhạy cảm</text>
                  <text x="14" y="75" fontSize="8" fill="#64748b" textAnchor="end" fontWeight="600">Ký tự lạ</text>
                  
                  {/* Data Polygon */}
                  <polygon points="100,45 130,95 90,140 75,130 65,70" fill="#f43f5e" fillOpacity="0.15" stroke="#e11d48" strokeWidth="2.5" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Data Table */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">do_dai_url</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">{result && !result.is_phishing ? "0.12" : "0.83"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">so_dau_cham</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">0.71</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">entropy_ky_tu</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">0.64</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">chua_ip_truc_tiep</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">0.22</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">duoi_ten_mien_la</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">0.58</span>
                </div>
              </div>
            </div>

            {/* Cognitive & Explainable AI */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-6">Cognitive & Explainable AI</h3>
              
              {result && !result.is_phishing ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold w-fit mb-6 tracking-wide shadow-sm">
                  <span>✓</span> TRANG WEB AN TOÀN
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold w-fit mb-6 tracking-wide shadow-sm">
                  <span>⚠</span> {result ? `NGUY HIỂM CỰC CAO (${result.confidence}%)` : "NGUY HIỂM CỰC CAO"}
                </div>
              )}

              <div className="bg-[#f8f9fa] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-[13px] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-loose font-medium">
                  {result && !result.is_phishing ? (
                    "Đây là một trang web hợp lệ và được xác minh an toàn. Không phát hiện yếu tố thao túng tâm lý hoặc đánh cắp dữ liệu."
                  ) : (
                    <>
                      "Kính gửi quý khách, tài khoản của bạn <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200 shadow-sm mx-0.5">sẽ bị khóa trong vòng 24 giờ</span> nếu không xác minh ngay. Vui lòng <span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 shadow-sm mx-0.5">nhấp vào liên kết bên dưới và nhập mật khẩu</span> để tránh gián đoạn dịch vụ..."
                    </>
                  )}
                </p>
              </div>

              <p className="text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                Các cụm từ được tô sáng thể hiện kỹ thuật thao túng tâm lý: tạo cảm giác khẩn cấp (urgency) và nỗi sợ hãi (fear).
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
