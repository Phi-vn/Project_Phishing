"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportPage() {
  const [currentDate, setCurrentDate] = useState("21/09/2026 - 10:40");
  const [dateRange, setDateRange] = useState("15/09/2026 - 21/09/2026");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const today = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setCurrentDate(`${today} - ${time}`);
    setDateRange(`${lastWeekStr} - ${today}`);
  }, []);

  const [isExporting, setIsExporting] = useState(false);
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Bao_Cao_PhishArmor.pdf');
    } catch (e) {
      console.error(e);
    }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 font-sans flex">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto sticky top-0 shrink-0 print:hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00897b] rounded-xl flex justify-center items-center text-white text-xl shadow-lg">🛡️</div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight text-slate-900 dark:text-white">PhishArmor AI</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hệ thống chống lừa đảo</p>
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
              <li><Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🔧</span> Cài đặt</Link></li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 uppercase tracking-widest">Trải nghiệm khác</h2>
            <ul className="space-y-1">
              <li><Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">👤</span> Đăng nhập Admin</Link></li>
              <li><Link href="/onboarding" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"><span className="text-lg">🚀</span> Onboarding cài đặt</Link></li>
              <li><Link href="/export" className="flex items-center gap-3 px-3 py-2.5 bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b] rounded-xl text-sm font-semibold transition-colors"><span className="text-lg">📄</span> Xuất báo cáo PDF</Link></li>
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
      <main className="flex-1 p-10 print:p-0 overflow-y-auto h-screen bg-[#f4f7f6] dark:bg-[#0b1120] print:bg-white dark:print:bg-white print:h-auto print:overflow-visible">
        <div className="max-w-4xl mx-auto print:max-w-none print:w-full print:m-0">

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 print:hidden">Xem trước báo cáo xuất PDF</h1>

          {/* PDF Preview Container */}
          <div className="flex flex-col items-center mb-12">
            <div ref={reportRef} className="bg-white dark:bg-[#111827] rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] p-12 w-full max-w-[800px] min-h-[900px] border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:min-h-0">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-10 border-b border-slate-100 dark:border-slate-800/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#00897b] rounded-lg"></div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">PhishArmor AI</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Báo cáo hoạt động</div>
                  <div className="text-[12px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">{currentDate}</div>
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Báo cáo giám sát mối đe dọa lừa đảo</h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 dark:text-slate-500">Khoảng thời gian: {dateRange} · Tự động tạo bởi hệ thống</p>
              </div>

              {/* 3 Summary Boxes */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-slate-100 dark:border-slate-800/50">
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">128,940</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">Lượt quét</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-slate-100 dark:border-slate-800/50">
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">3,214</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">Mối đe dọa bị chặn</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-slate-100 dark:border-slate-800/50">
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">98.4%</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">Độ chính xác (F1)</div>
                </div>
              </div>

              {/* Table Section */}
              <div className="mb-10">
                <h3 className="text-[12px] font-bold text-[#00897b] uppercase tracking-widest mb-4">Top mối đe dọa phát hiện</h3>
                <div className="border border-slate-100 dark:border-slate-800/50 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">Domain</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">Loại</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">Confidence</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-3 text-[12px] font-mono text-slate-700 dark:text-slate-300">yourbnk-secure-login.net</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 dark:text-slate-500">Phishing ngân hàng</td>
                        <td className="px-4 py-3 text-[12px] font-bold text-slate-800 dark:text-slate-200">96%</td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono text-right">21/09 09:14</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-[12px] font-mono text-slate-700 dark:text-slate-300">facebook-gift-claim.top</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 dark:text-slate-500">Đánh cắp danh tính</td>
                        <td className="px-4 py-3 text-[12px] font-bold text-slate-800 dark:text-slate-200">91%</td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono text-right">21/09 08:52</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-[12px] font-mono text-slate-700 dark:text-slate-300">shopee-voucher-vip.click</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 dark:text-slate-500">Quà tặng giả mạo</td>
                        <td className="px-4 py-3 text-[12px] font-bold text-slate-800 dark:text-slate-200">88%</td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono text-right">20/09 22:03</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="mb-auto">
                <h3 className="text-[12px] font-bold text-[#00897b] uppercase tracking-widest mb-3">Nhận xét</h3>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-loose">
                  Tỷ lệ mối đe dọa liên quan mạo danh ngân hàng chiếm phần lớn trong tuần, tăng nhẹ so với kỳ trước.<br/>
                  Đề xuất mở rộng tập huấn luyện với các mẫu tên miền đồng hình mới xuất hiện.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-10 border-t border-slate-100 dark:border-slate-800/50 pt-6 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  PhishArmor AI - Báo cáo được tạo tự động, chỉ phục vụ mục đích giám sát nội bộ
                </p>
              </div>
            </div>
            
            {/* Download Button */}
            <div className="flex justify-center mt-8 print:hidden">
              <button 
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className={`bg-[#00897b] hover:bg-[#00695c] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#00897b]/30 transition-all flex items-center gap-2 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isExporting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang tạo PDF...
                  </>
                ) : (
                  <>
                    <span className="text-xl">⬇</span> Tải xuống PDF
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
