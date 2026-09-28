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

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Add import if missing
    if "import Link from" not in content:
        # insert after use client or React import
        content = re.sub(r'("use client";\s*\n(import React[^\n]*\n)?)', r'\1import Link from "next/link";\n', content)
    
    # Replace <a href=... to <Link href=...
    content = re.sub(r'<a href=', r'<Link href=', content)
    
    # Replace </a> to </Link> only for the sidebar links.
    # Actually, if we just replace all </a> with </Link> it might break other anchors?
    # Are there other anchors? Let's just replace all <a href=... and </a>
    content = re.sub(r'</a>', r'</Link>', content)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
print("Done")
