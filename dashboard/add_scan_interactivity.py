import re

with open('app/scan/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add use client and state
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
    
    state_vars = """  const [url, setUrl] = useState("https://yourbnk-secure-login.net/verify?token=8817xa");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
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
"""
    content = content.replace("export default function ScanPage() {", "export default function ScanPage() {\n" + state_vars)

# Input Box
input_regex = r'<input type="text"\s*defaultValue="https://yourbnk-secure-login\.net/verify\?token=8817xa"\s*className="w-full text-\[13px\] font-mono p-2 px-3 outline-none text-slate-700 dark:text-slate-300 bg-transparent" />'
new_input = """<input type="text" 
                   value={url} onChange={e => setUrl(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') handleScan();}}
                   className="w-full text-[13px] font-mono p-2 px-3 outline-none text-slate-700 dark:text-slate-300 bg-transparent" />"""
content = re.sub(input_regex, new_input, content, flags=re.DOTALL)

# Analyze button
btn_regex = r'<button className="px-6 py-2\.5 bg-\[#00897b\] text-white rounded-xl text-\[13px\] font-bold hover:bg-\[#00695c\] transition-colors shadow-md flex items-center gap-2">\s*Phân tích ngay →\s*</button>'
new_btn = """<button onClick={handleScan} disabled={isScanning} className="px-6 py-2.5 bg-[#00897b] text-white rounded-xl text-[13px] font-bold hover:bg-[#00695c] transition-colors shadow-md flex items-center gap-2 disabled:opacity-70">
                {isScanning ? 'Đang phân tích...' : 'Phân tích ngay →'}
              </button>"""
content = re.sub(btn_regex, new_btn, content, flags=re.DOTALL)

# Explainable AI Tag
tag_regex = r'<div className="inline-flex items-center gap-2 px-3 py-1\.5 border border-rose-200 bg-rose-50 text-rose-600 rounded-lg text-\[10px\] font-bold w-fit mb-6 tracking-wide shadow-sm">\s*<span>⚠</span> NGUY HIỂM CỰC CAO\s*</div>'
new_tag = """{result && !result.is_phishing ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold w-fit mb-6 tracking-wide shadow-sm">
                  <span>✓</span> TRANG WEB AN TOÀN
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold w-fit mb-6 tracking-wide shadow-sm">
                  <span>⚠</span> {result ? `NGUY HIỂM CỰC CAO (${result.confidence}%)` : "NGUY HIỂM CỰC CAO"}
                </div>
              )}"""
content = re.sub(tag_regex, new_tag, content, flags=re.DOTALL)

# Text Explanation
text_regex = r'<div className="bg-\[#f8f9fa\] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">\s*<p className="text-\[13px\] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-loose font-medium">\s*"Kính gửi quý khách.*?"\s*</p>\s*</div>'
new_text = """<div className="bg-[#f8f9fa] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-[13px] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-loose font-medium">
                  {result && !result.is_phishing ? (
                    "Đây là một trang web hợp lệ và được xác minh an toàn. Không phát hiện yếu tố thao túng tâm lý hoặc đánh cắp dữ liệu."
                  ) : (
                    <>
                      "Kính gửi quý khách, tài khoản của bạn <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200 shadow-sm mx-0.5">sẽ bị khóa trong vòng 24 giờ</span> nếu không xác minh ngay. Vui lòng <span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 shadow-sm mx-0.5">nhấp vào liên kết bên dưới và nhập mật khẩu</span> để tránh gián đoạn dịch vụ..."
                    </>
                  )}
                </p>
              </div>"""
content = re.sub(text_regex, new_text, content, flags=re.DOTALL)


# Data Table mock metrics
table_regex = r'<div className="flex justify-between items-center">\s*<span className="text-\[12px\] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">url_length</span>\s*<span className="text-\[12px\] font-black text-slate-800 dark:text-slate-200">0\.83</span>\s*</div>'
new_table_row = """<div className="flex justify-between items-center">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">url_length</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-slate-200">{result && !result.is_phishing ? "0.12" : "0.83"}</span>
                </div>"""
content = re.sub(table_regex, new_table_row, content, flags=re.DOTALL)

with open('app/scan/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
