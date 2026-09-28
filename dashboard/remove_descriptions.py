import os
import glob
import re

files = glob.glob("app/**/*.tsx", recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Change <h1 className="... mb-3"> to mb-8
    # 2. Match the following <p> and remove it completely.
    # The <p> has classes like: text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-10 max-w-2xl text-[13px] leading-relaxed
    
    # Let's use re.sub with a custom function or just complex regex.
    # The regex: (<h1[^>]*mb-3[^>]*>.*?</h1>)\s*<p[^>]*mb-10[^>]*>.*?</p>
    
    pattern = re.compile(r'(<h1[^>]*mb-3[^>]*>.*?</h1>)\s*<p[^>]*mb-10[^>]*>.*?</p>', re.DOTALL)
    
    def replacer(match):
        h1 = match.group(1)
        h1 = h1.replace('mb-3', 'mb-8')
        return h1
        
    new_content = pattern.sub(replacer, content)
    
    # Also some might have "mb-3 print:hidden", we should replace it to "mb-8 print:hidden"
    # Actually `mb-3` is captured in `h1` so `h1.replace('mb-3', 'mb-8')` works perfectly!
    
    if new_content != content:
        with open(file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {file}")
