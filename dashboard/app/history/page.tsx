"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";

export default function HistoryPage() {

  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");

  useEffect(() => {
    // Basic Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history');
        const data = await res.json();
        
        const formattedLogs = data.map((item: any) => {
          const date = new Date(item.timestamp);
          const timeStr = date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) + ' - ' + date.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
          
          let level = "An toàn";
          if (item.label === "Lừa đảo" || item.is_phishing) level = "Độc hại";
          else if (item.confidence > 50 && item.confidence < 80) level = "Đáng ngờ";
          
          return {
            domain: item.domain,
            ip: "—", 
            type: item.note || "—",
            level: level,
            time: timeStr
          };
        });
        setLogs(formattedLogs);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    
    fetchHistory(); // Fetch initially

    // Listen for WebSocket events from Backend
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      if (event.data === "new_scan") {
        fetchHistory(); // Update immediately when new scan happens
      }
    };

    return () => ws.close();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.domain.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "Tất cả" || log.level === filter;
    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers = ["Domain", "IP", "Loại đe dọa", "Mức độ", "Thời gian"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => `${log.domain},${log.ip},${log.type},${log.level},${log.time}`)
    ].join("\\n");
    
    const blob = new Blob(["\\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "phisharmor_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
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
              <li><Link href="/history" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">📊</span> Lịch sử & Báo cáo</Link></li>
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

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Lịch sử & Báo cáo</h1>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">🔍</span>
              <input type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Tìm theo domain, IP, loại đe dọa..." 
                     className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] outline-none focus:border-[#00897b] transition-colors shadow-sm" />
            </div>
            <div className="flex gap-2 items-center overflow-x-auto">
              <button onClick={() => setFilter(filter === 'An toàn' ? 'Tất cả' : 'An toàn')} className={`px-4 py-2 border rounded-full text-[12px] font-bold whitespace-nowrap ${filter === 'An toàn' ? 'bg-[#00897b] text-white border-[#00897b]' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>An toàn</button>
              <button onClick={() => setFilter(filter === 'Đáng ngờ' ? 'Tất cả' : 'Đáng ngờ')} className={`px-4 py-2 border rounded-full text-[12px] font-bold whitespace-nowrap ${filter === 'Đáng ngờ' ? 'bg-[#00897b] text-white border-[#00897b]' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>Đáng ngờ</button>
              <button onClick={() => setFilter(filter === 'Độc hại' ? 'Tất cả' : 'Độc hại')} className={`px-4 py-2 border rounded-full text-[12px] font-bold whitespace-nowrap ${filter === 'Độc hại' ? 'bg-[#00897b] text-white border-[#00897b]' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>Độc hại</button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <button onClick={exportCSV} className="px-5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[12px] font-bold shadow-sm whitespace-nowrap transition-colors">Export CSV</button>
              <button onClick={exportPDF} className="px-5 py-2.5 bg-[#00897b] text-white rounded-xl text-[12px] font-bold shadow-md hover:bg-[#00695c] whitespace-nowrap transition-colors">Generate PDF Report</button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Domain</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">IP</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loại đe dọa</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mức độ</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">{log.domain}</td>
                      <td className="px-6 py-4 text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">{log.ip}</td>
                      <td className="px-6 py-4 text-[13px] text-slate-700 dark:text-slate-300 font-medium">{log.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 border rounded-full text-[11px] font-bold whitespace-nowrap inline-block ${log.level === 'An toàn' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : log.level === 'Đáng ngờ' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">{log.time}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => window.location.href = `/scan`} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-sky-600 hover:bg-sky-50 shadow-sm transition-colors">Xem</button>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-slate-500">Không tìm thấy kết quả phù hợp.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
