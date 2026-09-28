# -*- coding: utf-8 -*-
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

toggle_new = """<div onClick={() => { document.documentElement.classList.toggle("dark"); if (document.documentElement.classList.contains("dark")) { localStorage.setItem("theme", "dark"); } else { localStorage.setItem("theme", "light"); } }} className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-medium cursor-pointer transition-colors">
            <span className="text-lg block dark:hidden">🌙</span><span className="text-lg hidden dark:block">☀️</span> <span className="block dark:hidden">Chế độ tối</span><span className="hidden dark:block">Chế độ sáng</span>
          </div>"""

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r'<div onClick=\{\(\) => document\.documentElement\.classList\.toggle\("dark"\)\} className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-medium cursor-pointer transition-colors">\s*<span className="text-lg block dark:hidden">🌙</span><span className="text-lg hidden dark:block">☀️</span> <span className="block dark:hidden">Chế độ tối</span><span className="hidden dark:block">Chế độ sáng</span>\s*</div>', toggle_new, content)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
print("Done")
