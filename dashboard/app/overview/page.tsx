"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OverviewPage() {
  const [scannedCount, setScannedCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7 ngày gần nhất');
  
  useEffect(() => {
    // Basic Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/stats');
        const data = await res.json();
        setScannedCount(data.total_scans);
        setBlockedCount(data.total_threats);

        const trendRes = await fetch('http://localhost:8000/stats/trend');
        const trend = await trendRes.json();
        setTrendData(trend);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats(); // Fetch initially

    // Listen for WebSocket events from Backend
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      if (event.data === "new_scan") {
        fetchStats(); // Update immediately when new scan happens
      }
    };

    return () => ws.close();
  }, []);

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
              <li><Link href="/overview" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">⊞</span> Tổng quan</Link></li>
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

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Tổng quan hệ thống</h1>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Lưu lượng đã quét</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{scannedCount.toLocaleString()}</div>
              </div>
              <div className="mt-5 h-10 flex items-end">
                 <svg viewBox="0 0 100 20" className="w-full h-full stroke-[#00897b] stroke-[2px] fill-none stroke-linecap-round stroke-linejoin-round"><polyline points="0,15 10,12 20,16 30,10 40,14 50,5 60,8 70,0 80,4 90,0 100,5"></polyline></svg>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Mối đe dọa bị chặn</div>
                <div className="text-3xl font-black text-rose-500">{blockedCount.toLocaleString()}</div>
              </div>
              <div className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">↑ 6.2% so với tuần trước</div>
            </div>
            {/* Card 3 */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Tỷ lệ chính xác</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">98.4%</div>
              </div>
              <div className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">F1-Score trên tập kiểm thử</div>
            </div>
            {/* Card 4 */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Độ trễ trung bình</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">124ms</div>
              </div>
              <div className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tầng 1 + 2 kết hợp</div>
            </div>
          </div>

          {/* Middle Row (Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-7 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white">Xu hướng tấn công giả mạo</h3>
                <select className="text-[11px] text-slate-500 bg-transparent font-medium outline-none cursor-pointer" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}><option>24 giờ qua</option><option>7 ngày gần nhất</option><option>30 ngày qua</option></select>
              </div>
              {/* Recharts Area Chart */}
              <div className="h-[220px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="phishing" name="Lừa đảo" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPhishing)" />
                    <Area type="monotone" dataKey="safe" name="An toàn" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSafe)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-7 flex flex-col">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white mb-8">Phân loại kỹ thuật</h3>
              <div className="flex-1 flex justify-center items-center py-4">
                {/* Donut chart simulation using conic-gradient */}
                <div className="w-[140px] h-[140px] rounded-full relative" 
                     style={{background: 'conic-gradient(#e11d48 0% 50%, #d97706 50% 80%, #00897b 80% 100%)'}}>
                  <div className="absolute inset-[25%] bg-white dark:bg-[#111827] rounded-full shadow-inner"></div>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center text-[12px]">
                  <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Mạo danh ngân hàng</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">50%</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Đánh cắp danh tính MXH</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">30%</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <div className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00897b]"></span><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Quà tặng tri ân</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Table */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-7">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white">Live Threats Feed</h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Cập nhật thời gian thực</span>
            </div>
            
            <div className="flex gap-3 mb-8">
              <button className="px-5 py-2 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-full text-[12px] font-bold">Bình thường</button>
              <button className="px-5 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-full text-[12px] font-bold hover:bg-slate-50 dark:bg-slate-800/50">Đang tải</button>
              <button className="px-5 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-full text-[12px] font-bold hover:bg-slate-50 dark:bg-slate-800/50">Trống</button>
              <button className="px-5 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-full text-[12px] font-bold hover:bg-slate-50 dark:bg-slate-800/50">Lỗi</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">URL</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phân loại</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Confidence</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-[#f8fcfb] dark:bg-[#0b1120] transition-colors">
                    <td className="py-5 pl-2 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">yourbnk-secure-login.net</td>
                    <td className="py-5"><span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold whitespace-nowrap inline-block">Phishing ngân hàng</span></td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="w-[96%] h-full bg-rose-600 rounded-full"></div></div>
                        <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">96%</span>
                      </div>
                    </td>
                    <td className="py-5 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">2 phút trước</td>
                    <td className="py-5 text-right pr-2"><button onClick={() => window.location.href = "/scan"} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-transform active:scale-95">Chi tiết</button></td>
                  </tr>
                  <tr className="group hover:bg-[#f8fcfb] dark:bg-[#0b1120] transition-colors">
                    <td className="py-5 pl-2 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">facebook-gift-claim.top</td>
                    <td className="py-5"><span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold whitespace-nowrap inline-block">Đánh cắp danh tính</span></td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="w-[91%] h-full bg-rose-600 rounded-full"></div></div>
                        <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">91%</span>
                      </div>
                    </td>
                    <td className="py-5 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">14 phút trước</td>
                    <td className="py-5 text-right pr-2"><button onClick={() => window.location.href = "/scan"} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-transform active:scale-95">Chi tiết</button></td>
                  </tr>
                  <tr className="group hover:bg-[#f8fcfb] dark:bg-[#0b1120] transition-colors">
                    <td className="py-5 pl-2 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">momo-refund-2026.info</td>
                    <td className="py-5"><span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-bold whitespace-nowrap inline-block">Nghi vấn</span></td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="w-[58%] h-full bg-amber-500 rounded-full"></div></div>
                        <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">58%</span>
                      </div>
                    </td>
                    <td className="py-5 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">41 phút trước</td>
                    <td className="py-5 text-right pr-2"><button onClick={() => window.location.href = "/scan"} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-transform active:scale-95">Chi tiết</button></td>
                  </tr>
                  <tr className="group hover:bg-[#f8fcfb] dark:bg-[#0b1120] transition-colors">
                    <td className="py-5 pl-2 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">vietcombank.com.vn</td>
                    <td className="py-5"><span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-bold whitespace-nowrap inline-block">An toàn</span></td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="w-[3%] h-full bg-[#00897b] rounded-full"></div></div>
                        <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">3%</span>
                      </div>
                    </td>
                    <td className="py-5 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">1 giờ trước</td>
                    <td className="py-5 text-right pr-2"><button onClick={() => window.location.href = "/scan"} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-transform active:scale-95">Chi tiết</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
