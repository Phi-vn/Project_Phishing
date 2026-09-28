import re

with open('app/overview/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add use client and state
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';")
    
    state_vars = """  const [scannedCount, setScannedCount] = useState(128940);
  const [blockedCount, setBlockedCount] = useState(3214);
  const [timeRange, setTimeRange] = useState('7 ngày gần nhất');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScannedCount(prev => prev + Math.floor(Math.random() * 5) + 1);
      if (Math.random() > 0.7) {
        setBlockedCount(prev => prev + 1);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);
"""
    content = content.replace("export default function OverviewPage() {", "export default function OverviewPage() {\n" + state_vars)

# Update Scanned Count (128,940)
content = content.replace('<div className="text-3xl font-black text-slate-900 dark:text-white">128,940</div>',
                          '<div className="text-3xl font-black text-slate-900 dark:text-white">{scannedCount.toLocaleString()}</div>')

# Update Blocked Count (3,214)
content = content.replace('<div className="text-3xl font-black text-rose-500">3,214</div>',
                          '<div className="text-3xl font-black text-rose-500">{blockedCount.toLocaleString()}</div>')

# Make the Time Range clickable
content = content.replace('<span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">7 ngày gần nhất</span>',
                          '<select className="text-[11px] text-slate-500 bg-transparent font-medium outline-none cursor-pointer" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}><option>24 giờ qua</option><option>7 ngày gần nhất</option><option>30 ngày qua</option></select>')

# Fake dynamic chart based on timeRange
chart_regex = r'<svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible z-10">.*?</svg>'
new_chart = """<svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible z-10 transition-all duration-500">
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00897b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00897b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={timeRange === '7 ngày gần nhất' ? "M0,35 L15,30 L30,35 L45,15 L60,20 L75,5 L90,10 L100,0 V50 H0 Z" : timeRange === '30 ngày qua' ? "M0,25 L15,10 L30,20 L45,15 L60,30 L75,15 L90,25 L100,10 V50 H0 Z" : "M0,15 L15,20 L30,5 L45,25 L60,10 L75,15 L90,5 L100,20 V50 H0 Z"} fill="url(#gradient)"></path>
                    <polyline points={timeRange === '7 ngày gần nhất' ? "0,35 15,30 30,35 45,15 60,20 75,5 90,10 100,0" : timeRange === '30 ngày qua' ? "0,25 15,10 30,20 45,15 60,30 75,15 90,25 100,10" : "0,15 15,20 30,5 45,25 60,10 75,15 90,5 100,20"} fill="none" stroke="#00897b" strokeWidth="1.5" strokeLinejoin="round"></polyline>
                  </svg>"""
content = re.sub(chart_regex, new_chart, content, flags=re.DOTALL)


# Replace "Chi tiết" buttons with a console log / alert effect (or just hover visual)
btn_regex = r'<button className="px-4 py-1.5 bg-white dark:bg-\[#111827\] border border-slate-200 dark:border-slate-800 rounded-lg text-\[11px\] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm">Chi tiết</button>'
new_btn = '<button onClick={() => alert("Đang tải dữ liệu báo cáo chi tiết...")} className="px-4 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-transform active:scale-95">Chi tiết</button>'
content = content.replace(btn_regex.replace('\\', ''), new_btn)

# Write back
with open('app/overview/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
