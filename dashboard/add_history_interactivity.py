import re

with open('app/history/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add use client and state
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
    
    state_vars = """
  const initialLogs = [
    { domain: "yourbnk-secure-login.net", ip: "185.220.x.x", type: "Phishing ngân hàng", level: "Độc hại", time: "21/09 - 09:14" },
    { domain: "facebook-gift-claim.top", ip: "45.61.x.x", type: "Đánh cắp danh tính", level: "Độc hại", time: "21/09 - 08:52" },
    { domain: "momo-refund-2026.info", ip: "103.9.x.x", type: "Chưa xác định", level: "Đáng ngờ", time: "21/09 - 08:19" },
    { domain: "vietcombank.com.vn", ip: "210.245.x.x", type: "—", level: "An toàn", time: "21/09 - 07:55" },
    { domain: "shopee-voucher-vip.click", ip: "198.51.x.x", type: "Quà tặng giả mạo", level: "Độc hại", time: "20/09 - 22:03" }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");

  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch = log.domain.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "Tất cả" || log.level === filter;
    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    alert("Đã xuất file lịch sử quét ra định dạng CSV!");
  };

  const exportPDF = () => {
    alert("Đang tạo báo cáo PDF chuyên sâu...");
  };
"""
    content = content.replace("export default function HistoryPage() {", "export default function HistoryPage() {\n" + state_vars)


# Replace the Action Bar
action_bar_regex = r'<div className="flex flex-col md:flex-row gap-4 mb-8">.*?</button>\s*</div>\s*</div>'
new_action_bar = """<div className="flex flex-col md:flex-row gap-4 mb-8">
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
          </div>"""
content = re.sub(action_bar_regex, new_action_bar, content, flags=re.DOTALL)


# Replace tbody
tbody_regex = r'<tbody className="divide-y divide-slate-100">.*?</tbody>'
new_tbody = """<tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">{log.domain}</td>
                      <td className="px-6 py-4 text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">{log.ip}</td>
                      <td className="px-6 py-4 text-[13px] text-slate-700 dark:text-slate-300 font-medium">{log.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 border rounded-full text-[10px] font-bold ${log.level === 'An toàn' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : log.level === 'Đáng ngờ' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>{log.level}</span>
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
                </tbody>"""
content = re.sub(tbody_regex, new_tbody, content, flags=re.DOTALL)


with open('app/history/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
