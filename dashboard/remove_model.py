import os
import re

files = [
    "app/page.tsx",
    "app/block/page.tsx",
    "app/overview/page.tsx",
    "app/scan/page.tsx",
    "app/history/page.tsx",
    "app/metrics/page.tsx",
    "app/settings/page.tsx",
    "app/login/page.tsx",
    "app/onboarding/page.tsx",
    "app/export/page.tsx"
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove the Model v1.2 div
    content = re.sub(r'<div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl text-sm font-semibold cursor-pointer">\s*<span className="w-2 h-2 rounded-full bg-emerald-500"></span> Model v1\.2 - Hoạt động\s*</div>', '', content)
    
    # Remove the paragraph
    content = re.sub(r'<p className="text-\[10px\] text-slate-400 dark:text-slate-500 mt-2 px-2 leading-relaxed">\s*Kiến trúc 3 tầng: Rule/XGBoost →<br/>PhoBERT → Gemini XAI\s*</p>', '', content)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
print("Done")
