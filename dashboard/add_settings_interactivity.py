import re

with open('app/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

    state_vars = """
  const [trustScore, setTrustScore] = useState(75);
  const [usePhobert, setUsePhobert] = useState(true);
  const [useGemini, setUseGemini] = useState(true);
  const [sendLogs, setSendLogs] = useState(false);

  const [whitelist, setWhitelist] = useState(["vietcombank.com.vn", "yourbank.com", "gov.vn"]);
  const [blacklist, setBlacklist] = useState(["yourbnk-secure-login.net", "facebook-gift-claim.top"]);
  const [newWhite, setNewWhite] = useState("");
  const [newBlack, setNewBlack] = useState("");

  const handleAddWhite = (e) => {
    if (e.key === 'Enter' && newWhite.trim()) {
      setWhitelist([...whitelist, newWhite.trim()]);
      setNewWhite("");
    }
  };

  const handleAddBlack = (e) => {
    if (e.key === 'Enter' && newBlack.trim()) {
      setBlacklist([...blacklist, newBlack.trim()]);
      setNewBlack("");
    }
  };
"""
    content = content.replace("export default function SettingsPage() {", "export default function SettingsPage() {\n" + state_vars)


# Replace Slider
slider_regex = r'<div className="w-full h-1\.5 bg-slate-100 dark:bg-slate-800 rounded-full relative">.*?</div>\s*</div>'
new_slider = """<div className="w-full relative flex items-center gap-4">
                  <input type="range" min="0" max="100" value={trustScore} onChange={(e) => setTrustScore(Number(e.target.value))} className="w-full accent-[#00897b] cursor-pointer" />
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 w-8">{trustScore}%</span>
                </div>"""
content = re.sub(slider_regex, new_slider, content, flags=re.DOTALL)

# Replace PhoBERT toggle
phobert_regex = r'<h3 className="text-\[14px\] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 2 — PhoBERT/DistilBERT</h3>.*?<div className="w-12 h-6 bg-\[#00897b\] rounded-full relative cursor-pointer shadow-inner">.*?</div>'
new_phobert = """<h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 2 — PhoBERT/DistilBERT</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Phân tích nội dung HTML & văn bản khi có nghi ngờ</p>
                </div>
                <div>
                  <div onClick={() => setUsePhobert(!usePhobert)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${usePhobert ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${usePhobert ? 'left-7' : 'left-1'}`}></div>
                  </div>"""
content = re.sub(phobert_regex, new_phobert, content, flags=re.DOTALL)


# Replace Gemini toggle
gemini_regex = r'<h3 className="text-\[14px\] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 3 — Gemini Explainable AI</h3>.*?<div className="w-12 h-6 bg-\[#00897b\] rounded-full relative cursor-pointer shadow-inner">.*?</div>'
new_gemini = """<h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Kích hoạt tầng 3 — Gemini Explainable AI</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Sinh lời giải thích tự nhiên khi phát hiện lừa đảo</p>
                </div>
                <div>
                  <div onClick={() => setUseGemini(!useGemini)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${useGemini ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${useGemini ? 'left-7' : 'left-1'}`}></div>
                  </div>"""
content = re.sub(gemini_regex, new_gemini, content, flags=re.DOTALL)


# Replace Logs toggle
logs_regex = r'<h3 className="text-\[14px\] font-bold text-slate-900 dark:text-white mb-1">Gửi log ẩn danh để cải thiện mô hình</h3>.*?<div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer shadow-inner">.*?</div>'
new_logs = """<h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">Gửi log ẩn danh để cải thiện mô hình</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Không thu thập nội dung mật khẩu hay dữ liệu cá nhân</p>
                </div>
                <div>
                  <div onClick={() => setSendLogs(!sendLogs)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${sendLogs ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#111827] rounded-full shadow-sm transition-all ${sendLogs ? 'left-7' : 'left-1'}`}></div>
                  </div>"""
content = re.sub(logs_regex, new_logs, content, flags=re.DOTALL)


# Replace Whitelist block
whitelist_regex = r'<h3 className="text-\[15px\] font-extrabold text-slate-900 dark:text-white mb-6">Danh sách tin cậy \(Whitelist\)</h3>\s*<div className="flex flex-wrap gap-2">.*?</div>'
new_whitelist = """<h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-6">Danh sách tin cậy (Whitelist)</h3>
              <input type="text" value={newWhite} onChange={e => setNewWhite(e.target.value)} onKeyDown={handleAddWhite} placeholder="Thêm domain (Enter)..." className="w-full mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[12px] outline-none" />
              <div className="flex flex-wrap gap-2">
                {whitelist.map((domain, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[12px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    {domain} <span onClick={() => setWhitelist(whitelist.filter(d => d !== domain))} className="text-slate-400 hover:text-rose-500 cursor-pointer font-bold">&times;</span>
                  </span>
                ))}
              </div>"""
content = re.sub(whitelist_regex, new_whitelist, content, flags=re.DOTALL)


# Replace Blacklist block
blacklist_regex = r'<h3 className="text-\[15px\] font-extrabold text-slate-900 dark:text-white mb-6">Danh sách chặn \(Blacklist\)</h3>\s*<div className="flex flex-wrap gap-2">.*?</div>'
new_blacklist = """<h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-6">Danh sách chặn (Blacklist)</h3>
              <input type="text" value={newBlack} onChange={e => setNewBlack(e.target.value)} onKeyDown={handleAddBlack} placeholder="Thêm domain (Enter)..." className="w-full mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[12px] outline-none" />
              <div className="flex flex-wrap gap-2">
                {blacklist.map((domain, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[12px] font-mono text-rose-600 flex items-center gap-2">
                    {domain} <span onClick={() => setBlacklist(blacklist.filter(d => d !== domain))} className="text-rose-400 hover:text-rose-600 cursor-pointer font-bold">&times;</span>
                  </span>
                ))}
              </div>"""
content = re.sub(blacklist_regex, new_blacklist, content, flags=re.DOTALL)


with open('app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
