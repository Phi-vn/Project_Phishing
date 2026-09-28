import os
import glob
import re

files = glob.glob("app/**/*.tsx", recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Remove Top badges block
    # Looks like:
    # {/* Top badages */} (or similar)
    # <div className="flex items-center gap-2 mb-4[^\"]*">
    #   <span ...
    # </div>
    
    # We will just remove the whole div that has mb-4 and contains badges
    content = re.sub(r'\s*\{\/\*\s*Top badages\s*\*\/\}\s*<div className="flex items-center gap-2 mb-4[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'\s*\{\/\*\s*Top badges\s*\*\/\}\s*<div className="flex items-center gap-2 mb-4[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    
    # And maybe there's `<div className="flex items-center gap-2 mb-6 print:hidden">`
    content = re.sub(r'\s*\{\/\*\s*Top badages\s*\*\/\}\s*<div className="flex items-center gap-2 mb-6[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'\s*\{\/\*\s*Top badges\s*\*\/\}\s*<div className="flex items-center gap-2 mb-6[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    
    # What about `<div className="flex flex-wrap items-center gap-2 mb-4">` ?
    content = re.sub(r'\s*\{\/\*\s*Top badages\s*\*\/\}\s*<div className="[^"]*mb-4[^"]*">.*?</div>', '', content, flags=re.DOTALL)
    
    # Also I notice the user had text like "Cho phép dán trực tiếp..." which is in <p> tag?
    # I'll just manually check if any description text is left.
    
    if content:
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Processed {file}")
