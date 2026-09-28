import re

with open('app/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect and Toast state
if "useEffect" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

# Add toast state and effect
state_vars = """
  const [showToast, setShowToast] = useState(false);

  // Trigger toast on setting change
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [trustScore, usePhobert, useGemini, sendLogs, whitelist, blacklist]);
"""
# Insert after the existing states
content = re.sub(r'const \[newBlack, setNewBlack\] = useState\(""\);', r'const [newBlack, setNewBlack] = useState("");' + "\n" + state_vars, content)

# Add Toast UI at the bottom of the page before the closing tag of the main wrapper
toast_ui = """
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl font-bold text-[13px] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 dark:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          Đã lưu cấu hình hệ thống
        </div>
      </div>
    </div>
  );
}
"""

content = re.sub(r'    </div>\s*</div>\s*\);\s*}\s*$', toast_ui, content)

with open('app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
