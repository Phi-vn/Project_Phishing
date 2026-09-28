
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

replacements = {
    r"bg-\[\#f8fcfb\]": "bg-[#f8fcfb] dark:bg-[#0b1120]",
    r"bg-\[\#f4f7f6\]": "bg-[#f4f7f6] dark:bg-[#0b1120]",
    r"bg-white": "bg-white dark:bg-[#111827]",
    r"border-slate-200": "border-slate-200 dark:border-slate-800",
    r"border-slate-100": "border-slate-100 dark:border-slate-800/50",
    r"text-slate-900": "text-slate-900 dark:text-white",
    r"text-slate-800": "text-slate-800 dark:text-slate-200",
    r"text-slate-700": "text-slate-700 dark:text-slate-300",
    r"text-slate-600": "text-slate-600 dark:text-slate-400",
    r"text-slate-500": "text-slate-500 dark:text-slate-400",
    r"text-slate-400": "text-slate-400 dark:text-slate-500",
    r"bg-slate-50": "bg-slate-50 dark:bg-slate-800/50",
    r"bg-slate-100": "bg-slate-100 dark:bg-slate-800",
    r"bg-slate-200": "bg-slate-200 dark:bg-slate-800",
    r"bg-\[\#e0f2f1\] text-\[\#00695c\]": "bg-[#e0f2f1] text-[#00695c] dark:bg-[#00897b]/20 dark:text-[#00897b]"
}

# The toggle button itself needs to be interactive.
# We will replace the static toggle button with an interactive one that calls a function.
# Oh wait, we cant easily add React state to all 10 pages if they are not client components.
# But page.tsx in Next.js defaults to Server Component! We cant use onClick unless we add "use client"!

# Let us add "use client" to the top of every file.
for file in files:
    if not os.path.exists(file):
        continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "\"use client\";" not in content and "\x27use client\x27;" not in content:
        content = "\"use client\";\n" + content
        
    for k, v in replacements.items():
        # Only replace if not already replaced
        # Wait, simple string replace might duplicate dark classes if run twice, 
        # but we only run once.
        # Use regex to replace only if dark: variant doesnt follow immediately
        # Actually a simpler way: just replace k with v.
        content = re.sub(k + r"(?! dark:)", v, content)
        
    # Replace the dark mode toggle button
    toggle_old = r"<div className=\"flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium cursor-pointer transition-colors\">\s*<span className=\"text-lg\">??</span> Ch? d? t?i\s*</div>"
    toggle_new = """<div onClick={() => document.documentElement.classList.toggle("dark")} className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-medium cursor-pointer transition-colors">
            <span className="text-lg block dark:hidden">??</span><span className="text-lg hidden dark:block">??</span> <span className="block dark:hidden">Ch? d? t?i</span><span className="hidden dark:block">Ch? d? sáng</span>
          </div>"""
    content = re.sub(toggle_old, toggle_new, content)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
print("Done")

