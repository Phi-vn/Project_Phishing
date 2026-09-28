import re

with open('app/metrics/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add use client and state
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
    
    state_vars = """
  const [isRetraining, setIsRetraining] = useState(false);
  const [metrics, setMetrics] = useState({
    ensemble: [0.984, 0.979, 0.981, 0.993],
    cm: [1842, 31, 24, 1103]
  });
  const [activeStep, setActiveStep] = useState(null);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setMetrics({
        ensemble: [0.989, 0.983, 0.986, 0.996],
        cm: [1855, 18, 12, 1115]
      });
      setIsRetraining(false);
    }, 2000);
  };
"""
    content = content.replace("export default function MetricsPage() {", "export default function MetricsPage() {\n" + state_vars)

# Interactive Steps
step1 = r'<div className="flex-1 bg-white dark:bg-\[#111827\] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-start w-full">'
new_step1 = """<div onClick={() => setActiveStep(1)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 1 ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300'} p-6 flex flex-col items-start w-full`}>"""
content = re.sub(step1, new_step1, content, count=1)

step2 = r'<div className="flex-1 bg-white dark:bg-\[#111827\] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-start w-full">'
new_step2 = """<div onClick={() => setActiveStep(2)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 2 ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300'} p-6 flex flex-col items-start w-full`}>"""
content = re.sub(step2, new_step2, content, count=1)

step3 = r'<div className="flex-1 bg-white dark:bg-\[#111827\] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-start w-full">'
new_step3 = """<div onClick={() => setActiveStep(3)} className={`cursor-pointer transition-all flex-1 bg-white dark:bg-[#111827] rounded-2xl border ${activeStep === 3 ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300'} p-6 flex flex-col items-start w-full`}>"""
content = re.sub(step3, new_step3, content, count=1)


# Retrain Button
header_regex = r'<div className="flex justify-between items-center mb-8">\s*<h3 className="font-extrabold text-\[16px\] text-slate-900 dark:text-white">Evaluation Metrics</h3>\s*<span className="text-\[11px\] text-slate-400 dark:text-slate-500 font-medium">Tập kiểm thử PhishTank / PhishStats</span>\s*</div>'
new_header = """<div className="flex justify-between items-center mb-8">
                  <h3 className="font-extrabold text-[16px] text-slate-900 dark:text-white">Evaluation Metrics</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tập kiểm thử PhishTank / PhishStats</span>
                    <button onClick={handleRetrain} disabled={isRetraining} className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {isRetraining ? 'Đang huấn luyện...' : 'Tái huấn luyện mô hình'}
                    </button>
                  </div>
                </div>"""
content = re.sub(header_regex, new_header, content, flags=re.DOTALL)


# Update Ensemble Metrics
ensemble_regex = r'<td className="py-5 text-\[13px\] text-slate-700 dark:text-slate-300 font-medium">Kết hợp đa tầng \(Ensemble\)</td>.*?</tr>'
new_ensemble = """<td className="py-5 text-[13px] text-slate-700 dark:text-slate-300 font-medium">Kết hợp đa tầng (Ensemble)</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[0]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[1]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[2]}</td>
                      <td className="py-5 text-[13px] font-black text-rose-600 text-center">{metrics.ensemble[3]}</td>
                    </tr>"""
content = re.sub(ensemble_regex, new_ensemble, content, flags=re.DOTALL)


# Update CM
cm_regex = r'<div className="grid grid-cols-2 gap-3 mb-6">.*?</div>\s*<p className="text-center'
new_cm = """<div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#059669] mb-1">{metrics.cm[0].toLocaleString()}</span>
                  <span className="text-[10px] text-[#047857] font-bold uppercase tracking-wide">True Safe</span>
                </div>
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#d97706] mb-1">{metrics.cm[1].toLocaleString()}</span>
                  <span className="text-[10px] text-[#b45309] font-bold uppercase tracking-wide">False Phishing</span>
                </div>
                <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#ea580c] mb-1">{metrics.cm[2].toLocaleString()}</span>
                  <span className="text-[10px] text-[#c2410c] font-bold uppercase tracking-wide">False Safe</span>
                </div>
                <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-xl p-5 flex flex-col items-center justify-center text-center h-28 shadow-sm transition-all duration-500">
                  <span className="text-[20px] font-black text-[#e11d48] mb-1">{metrics.cm[3].toLocaleString()}</span>
                  <span className="text-[10px] text-[#be123c] font-bold uppercase tracking-wide">True Phishing</span>
                </div>
              </div>
              <p className="text-center"""
content = re.sub(cm_regex, new_cm, content, flags=re.DOTALL)


with open('app/metrics/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
