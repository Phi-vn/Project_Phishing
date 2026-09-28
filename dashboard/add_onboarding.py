import re

with open('app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useState
if "useState" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

# Replace the component body with state
state_code = """
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/overview';
    }, 1500);
  };
"""
content = re.sub(r'export default function OnboardingPage\(\) \{', state_code, content)


# Replace the main content block
main_regex = r'<h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Onboarding cài đặt tiện ích</h1>.*?</main>'
new_main = """<h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Onboarding cài đặt tiện ích</h1>

          {/* Progress Bar */}
          <div className="w-full flex gap-2 mb-12">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-[#00897b]' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          </div>

          {/* Onboarding Card */}
          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 w-full max-w-2xl flex flex-col items-center mb-8 min-h-[400px] justify-center transition-all">
              
              {step === 1 && (
                <div className="flex flex-col items-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-[#00897b] rounded-3xl flex justify-center items-center text-white text-4xl shadow-xl mb-8 transform -rotate-6">
                    🛡️
                  </div>
                  <h2 className="text-[24px] font-extrabold text-slate-900 dark:text-white mb-4">Chào mừng đến với PhishArmor AI</h2>
                  <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-md leading-relaxed">
                    Hệ thống bảo vệ bạn khỏi các cuộc tấn công lừa đảo trực tuyến (Phishing) bằng công nghệ Trí tuệ nhân tạo (AI) theo thời gian thực.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full text-left">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-xl mb-2">⚡</div>
                      <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1">Tốc độ miligiây</h4>
                      <p className="text-[11px] text-slate-500">Phân tích ngay khi trang web vừa tải xong.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="text-xl mb-2">🧠</div>
                      <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1">AI 3 Tầng</h4>
                      <p className="text-[11px] text-slate-500">Từ học máy cổ điển đến mô hình ngôn ngữ lớn.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center text-center animate-fade-in w-full">
                  <div className="w-16 h-16 bg-[#e0f2f1] dark:bg-[#00897b]/20 rounded-2xl flex justify-center items-center text-[#00897b] text-3xl mb-6 border border-teal-100 dark:border-[#00897b]/30">
                    🔑
                  </div>
                  <h2 className="text-[20px] font-extrabold text-slate-900 dark:text-white mb-4">Cấp quyền để bắt đầu bảo vệ</h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-lg leading-relaxed">
                    PhishArmor AI cần các quyền sau để phân tích trang web theo thời gian thực. Dữ liệu được xử lý cục bộ — không thu thập mật khẩu hay nội dung nhạy cảm.
                  </p>

                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl">
                      <div className="mt-0.5 text-[#00897b]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">Đọc địa chỉ trang đang truy cập</h4>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400">Để đối chiếu URL với mô hình phát hiện lừa đảo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl">
                      <div className="mt-0.5 text-[#00897b]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">Đọc cấu trúc nội dung trang (DOM)</h4>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400">Để phát hiện form đăng nhập giả mạo và iframe ẩn</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex justify-center items-center text-emerald-600 dark:text-emerald-400 text-4xl mb-8 relative">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20 animate-ping"></div>
                  </div>
                  <h2 className="text-[24px] font-extrabold text-slate-900 dark:text-white mb-4">Hoàn tất cài đặt!</h2>
                  <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
                    Hệ thống PhishArmor AI đã được tích hợp thành công vào trình duyệt của bạn. Bạn đã được bảo vệ.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="w-full max-w-2xl flex justify-between items-center px-2">
              <button 
                onClick={handleBack} 
                className={`px-6 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                ← Quay lại
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={handleNext} 
                  className="px-6 py-2.5 bg-[#00897b] text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#00695c] transition-colors"
                >
                  Tiếp tục →
                </button>
              ) : (
                <button 
                  onClick={handleFinish} 
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Đang xử lý...
                    </>
                  ) : 'Truy cập Dashboard'}
                </button>
              )}
            </div>
            
          </div>

        </div>
      </main>"""
content = re.sub(main_regex, new_main, content, flags=re.DOTALL)


with open('app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
