import re

with open('app/block/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add use client and state
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
    
    state_vars = """  const [url, setUrl] = useState("yourbnk-secure-login.net/verify");
  const [isBypassed, setIsBypassed] = useState(false);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
       setIsBypassed(false);
    }
  };
"""
    content = content.replace("export default function BlockPage() {", "export default function BlockPage() {\n" + state_vars)

# 1. Fix URL Bar
url_bar_regex = r'<div className="flex-1 bg-white dark:bg-\[#111827\] border border-red-200 rounded-lg px-4 py-2 text-xs text-red-500 flex items-center gap-2 shadow-sm font-medium">\s*<span className="text-red-500 font-bold">Shield</span> yourbnk-secure-login.net/verify\s*</div>'
new_url_bar = """<div className={`flex-1 bg-white dark:bg-[#111827] border rounded-lg px-4 py-2 text-xs flex items-center gap-2 shadow-sm font-medium ${isBypassed ? "border-slate-200 dark:border-slate-800 text-slate-500" : "border-red-200 text-red-500"}`}>
                    <span className={`font-bold ${isBypassed ? "text-[#00897b]" : "text-red-500"}`}>Shield</span>
                    <input type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300"
                    />
                  </div>"""
content = re.sub(url_bar_regex, new_url_bar, content, flags=re.DOTALL)

# 2. Fix Shield Icon in browser header
shield_regex = r'<div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">🛡️</div>'
new_shield = '<div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm shadow-md ${isBypassed ? "bg-[#00897b]" : "bg-red-600"}`}>🛡️</div>'
content = content.replace(shield_regex, new_shield)

# 3. Dynamic domain name in block card
content = content.replace('<p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6 font-mono text-center">yourbnk-secure-login.net</p>', '<p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6 font-mono text-center">{url}</p>')

# 4. Make "Quay lại trang an toàn" work
btn_safe = r'<button className="w-full bg-\[#0f172a\] hover:bg-\[#1e293b\] text-white py-3.5 rounded-xl font-bold text-sm transition-colors mb-4">\s*Quay lại trang an toàn\s*</button>'
new_btn_safe = '<button onClick={() => {setUrl("google.com"); setIsBypassed(true);}} className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3.5 rounded-xl font-bold text-sm transition-colors mb-4">Quay lại trang an toàn</button>'
content = re.sub(btn_safe, new_btn_safe, content, flags=re.DOTALL)

# 5. Make "Tôi hiểu rủi ro..." work
btn_risk = r'<Link href="#" className="text-\[11px\] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium underline underline-offset-2">\s*Tôi hiểu rủi ro và vẫn muốn truy cập \(không khuyến nghị\)\s*</Link>'
new_btn_risk = '<button onClick={() => setIsBypassed(true)} className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium underline underline-offset-2">Tôi hiểu rủi ro và vẫn muốn truy cập (không khuyến nghị)</button>'
content = re.sub(btn_risk, new_btn_risk, content, flags=re.DOTALL)


# 6. Conditionally render the block card or a fake website
block_card_start = r'<div className="bg-white dark:bg-\[#111827\] rounded-3xl w-full max-w-\[420px\] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 z-10 p-8 flex flex-col items-center">'
fake_website = """{isBypassed ? (
  <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-[420px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 z-10 p-8 flex flex-col items-center">
    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 font-bold text-2xl">🏦</div>
    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 text-center">Đăng nhập tài khoản</h2>
    <div className="w-full space-y-4">
      <input type="text" placeholder="Tên đăng nhập" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900" />
      <input type="password" placeholder="Mật khẩu" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900" />
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">Đăng nhập ngay</button>
    </div>
  </div>
) : (
<div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-[420px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 z-10 p-8 flex flex-col items-center">
"""
content = content.replace(block_card_start, fake_website)

# Close the ternary operator at the end of the block card
block_card_end = r'Tôi hiểu rủi ro và vẫn muốn truy cập \(không khuyến nghị\)</button>\s*</div>'
content = re.sub(block_card_end, 'Tôi hiểu rủi ro và vẫn muốn truy cập (không khuyến nghị)</button>\n                  </div>\n)}', content)

# ensure "use client" is at top
if "use client" not in content:
    content = '"use client";\n' + content
    
with open('app/block/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
