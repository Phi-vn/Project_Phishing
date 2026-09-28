import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useState import
content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

# Add State variables
state_vars = """  const [url, setUrl] = useState("yourbank.com/login");
  const [isActive, setIsActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState(92);
  
  const handleScan = (e) => {
    if (e.key && e.key !== 'Enter') return;
    if (!isActive) return;
    setIsScanning(true);
    setTimeout(() => {
      // Logic mock Trust Score based on url
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("facebook-login") || lowerUrl.includes("free-gift")) {
        setScore(12);
      } else if (lowerUrl.includes("shopee-voucher")) {
        setScore(45);
      } else if (lowerUrl.includes("facebook.com") || lowerUrl.includes("google.com")) {
        setScore(99);
      } else {
        setScore(Math.floor(Math.random() * (95 - 50 + 1) + 50));
      }
      setIsScanning(false);
    }, 800);
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
"""

content = content.replace("export default function Dashboard() {", "export default function Dashboard() {\n" + state_vars)

# Fix input to use state
input_regex = r'<input type="text" [^>]*?defaultValue="yourbank.com/login"[^>]*?>'
new_input = """<input type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleScan}
                            disabled={!isActive}
                            className="w-full text-sm font-medium outline-none text-slate-700 dark:text-slate-300 bg-transparent" />"""
content = re.sub(input_regex, new_input, content, count=1, flags=re.DOTALL)

# Fix Trust score number
score_regex = r'<span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">92%</span>'
new_score = '{isScanning ? <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#00897b] animate-spin mb-2"></div> : <span className={`text-4xl font-black ${scoreColor} tracking-tight`}>{isActive ? score : "--"}%</span>}'
content = content.replace(score_regex, new_score)

# Fix ring color
ring_regex = r'w-\[140px\] h-\[140px\] rounded-full border-\[10px\] border-slate-100 dark:border-slate-800/50 border-t-\[#00897b\] border-r-\[#00897b\]'
new_ring = 'w-[140px] h-[140px] rounded-full border-[10px] border-slate-100 dark:border-slate-800/50 ${ringColor} transition-colors duration-500'
content = content.replace('className="' + ring_regex, 'className={`' + new_ring + '`')

# Fix status text
status_regex = r'<p className="text-center text-\[11px\] text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium px-2">Độ tin cậy cao — không phát hiện dấu hiệu bất thường</p>'
content = content.replace(status_regex, '<p className="text-center text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium px-2 h-8">{statusText}</p>')

# Fix toggle button at bottom
toggle_regex = r'<div className="w-10 h-6 bg-\[#00897b\] rounded-full p-1"><div className="w-4 h-4 bg-white dark:bg-\[#111827\] rounded-full translate-x-4"></div></div>'
new_toggle = '<div onClick={() => setIsActive(!isActive)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isActive ? "bg-[#00897b]" : "bg-slate-300 dark:bg-slate-700"}`}><div className={`w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-transform ${isActive ? "translate-x-4" : "translate-x-0"}`}></div></div>'
content = content.replace(toggle_regex, new_toggle)

# Fix yourbank.com in bottom
content = content.replace('<span className="text-[13px] font-extrabold text-slate-900 dark:text-white">yourbank.com</span>', '<span className="text-[13px] font-extrabold text-slate-900 dark:text-white max-w-[150px] truncate">{url || "yourbank.com"}</span>')

# Make deep analysis a link
content = content.replace('<span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold cursor-pointer hover:text-slate-700 dark:text-slate-300">Báo cáo phân tích chuyên sâu →</span>', '<Link href="/scan" className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold cursor-pointer hover:text-[#00897b] transition-colors">Báo cáo phân tích chuyên sâu →</Link>')

# Fix active indicator top
active_top = r'<span className="text-\[10px\] text-emerald-600 flex items-center gap-1.5 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Đang kích hoạt</span>'
new_active_top = '<span className={`text-[10px] flex items-center gap-1.5 font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}><span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span> {isActive ? "Đang kích hoạt" : "Tạm dừng"}</span>'
content = content.replace(active_top, new_active_top)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
