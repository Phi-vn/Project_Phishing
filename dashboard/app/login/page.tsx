"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("admin@phisharmor.vn");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // State cho Modal "Quên mật khẩu"
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt mật khẩu mới
  const [forgotEmail, setForgotEmail] = useState("admin@phisharmor.vn");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("882194");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [otpTimer, setOtpTimer] = useState(180); // 3 phút countdown

  const showToast = (message: string, type: "success" | "info" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Đếm ngược OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isForgotOpen && forgotStep === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isForgotOpen, forgotStep, otpTimer]);

  const openForgotModal = () => {
    setForgotEmail(email.trim() || "admin@phisharmor.vn");
    setForgotStep(1);
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setOtpTimer(180);
    setIsForgotOpen(true);
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setForgotStep(1);
    setForgotError("");
  };

  // Bước 1: Gửi mã OTP
  const handleSendOtp = () => {
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setForgotError("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    setForgotLoading(true);
    setForgotError("");

    setTimeout(() => {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);
      setForgotLoading(false);
      setForgotStep(2);
      setOtpTimer(180);
      showToast(`Mã xác thực OTP đã được gửi đến: ${forgotEmail}`, "success");
    }, 700);
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.trim().length < 6) {
      setForgotError("Vui lòng nhập đủ mã OTP 6 chữ số!");
      return;
    }
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== "882194" && otpCode.trim() !== "123456") {
      setForgotError("Mã OTP không chính xác hoặc đã hết hạn! Vui lòng thử lại.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");

    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep(3);
      showToast("Xác thực OTP thành công! Mời bạn thiết lập mật khẩu mới.", "success");
    }, 500);
  };

  // Bước 3: Đổi mật khẩu mới
  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setForgotError("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");

    setTimeout(() => {
      // Lưu mật khẩu mới vào localStorage để hỗ trợ đăng nhập ngoại tuyến
      try {
        localStorage.setItem(`pwd_${forgotEmail.trim().toLowerCase()}`, newPassword);
      } catch {}

      setEmail(forgotEmail.trim());
      setPassword(newPassword);
      setForgotLoading(false);
      closeForgotModal();
      showToast("Khôi phục mật khẩu thành công! Mật khẩu mới đã được cập nhật.", "success");
    }, 700);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim(), password: password.trim() })
      });

      if (response && response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        if (data.user) {
          localStorage.setItem("user_email", data.user.email);
          localStorage.setItem("user_name", data.user.name);
          localStorage.setItem("user_role", data.user.role);
        }
        showToast(`Đăng nhập thành công! Vai trò: ${data.user?.role || "Quản trị viên"}`, "success");
        setTimeout(() => {
          window.location.href = "/overview";
        }, 700);
        return;
      } else {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.detail || "Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.";
        setError(errMsg);
        showToast(errMsg, "warning");
      }
    } catch {
      const offlineValidUsers: Record<string, { role: string; name: string }> = {
        "admin@phisharmor.vn": { role: "Super Admin", name: "Nguyễn Quản Trị (Admin)" },
        "admin@phisharmor.ai": { role: "Super Admin", name: "Nguyễn Quản Trị (Admin)" },
        "admin": { role: "Super Admin", name: "Nguyễn Quản Trị (Admin)" },
        "analyst@phisharmor.vn": { role: "SOC Analyst", name: "Trần Chuyên Viên SOC" },
        "demo@phisharmor.vn": { role: "Guest Auditor", name: "Khách Đánh Giá" }
      };
      const cleanEmail = email.trim().toLowerCase();
      const foundUser = offlineValidUsers[cleanEmail];
      const savedUserPassword = typeof window !== "undefined" ? localStorage.getItem(`pwd_${cleanEmail}`) : null;

      const isValidPassword = 
        password.trim() === "123456" || 
        password.trim() === "admin123" || 
        (savedUserPassword && password.trim() === savedUserPassword);

      if (foundUser && isValidPassword) {
        localStorage.setItem("token", "phisharmor_offline_session_token");
        localStorage.setItem("user_email", email.trim());
        localStorage.setItem("user_name", foundUser.name);
        localStorage.setItem("user_role", foundUser.role);
        showToast(`Đăng nhập thành công! Vai trò: ${foundUser.role}`, "success");
        setTimeout(() => {
          window.location.href = "/overview";
        }, 700);
      } else {
        setError("Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.");
        showToast("Tài khoản hoặc mật khẩu không chính xác!", "warning");
      }
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleQuickLoginAs = (userEmail: string, userPass: string, roleName: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
    showToast(`Đang đăng nhập nhanh với vai trò: ${roleName}...`, "info");
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: userEmail.trim(), password: userPass.trim() })
        });

        if (response && response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.access_token);
          if (data.user) {
            localStorage.setItem("user_email", data.user.email);
            localStorage.setItem("user_name", data.user.name);
            localStorage.setItem("user_role", data.user.role);
          }
          showToast(`Đăng nhập thành công! Vai trò: ${data.user?.role || roleName}`, "success");
          setTimeout(() => { window.location.href = "/overview"; }, 600);
          return;
        }
      } catch {}

      // Fallback offline
      const offlineValidUsers: Record<string, { role: string; name: string }> = {
        "admin@phisharmor.vn": { role: "Super Admin", name: "Nguyễn Quản Trị (Admin)" },
        "analyst@phisharmor.vn": { role: "SOC Analyst", name: "Trần Chuyên Viên SOC" },
        "demo@phisharmor.vn": { role: "Guest Auditor", name: "Khách Đánh Giá" }
      };
      const foundUser = offlineValidUsers[userEmail.trim()];
      if (foundUser) {
        localStorage.setItem("token", "phisharmor_offline_session_token");
        localStorage.setItem("user_email", userEmail.trim());
        localStorage.setItem("user_name", foundUser.name);
        localStorage.setItem("user_role", foundUser.role);
        showToast(`Đăng nhập thành công! Vai trò: ${foundUser.role}`, "success");
        setTimeout(() => { window.location.href = "/overview"; }, 600);
      }
    }, 350);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
              toast.type === "success" ? "bg-emerald-600" : toast.type === "warning" ? "bg-amber-500" : "bg-sky-600"
            }`}>
              {toast.type === "success" ? "✓" : toast.type === "warning" ? "!" : "ℹ"}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative flex flex-col justify-center items-center">
        
        <div className="w-full max-w-md my-auto">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-7 sm:p-8">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white shadow-sm mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Đăng Nhập Quản Trị Hệ Thống
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                PhishArmor - Nền tảng phát hiện & phòng vệ website lừa đảo
              </p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tài khoản email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="admin@phisharmor.vn"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium hover:underline cursor-pointer transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 pr-12 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    placeholder="Nhập mật khẩu..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      /* Mắt mở khi mật khẩu đang hiện */
                      <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      /* Mắt gạch chéo khi mật khẩu đang ẩn */
                      <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Ghi nhớ đăng nhập trên máy này</span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng Nhập</span>
                )}
              </button>

              {/* Demo Account Roles Box */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chọn nhanh tài khoản mẫu thử nghiệm:
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">1-Click Login</span>
                </div>
                
                <div className="space-y-2">
                  {/* Super Admin Card */}
                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    email === "admin@phisharmor.vn"
                      ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}>
                    <div 
                      onClick={() => {
                        setEmail("admin@phisharmor.vn");
                        setPassword("123456");
                        setError("");
                        showToast("Đã điền thông tin Quản trị viên (Super Admin)", "info");
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          👑 Quản trị viên (Super Admin)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold">
                          Toàn quyền
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        admin@phisharmor.vn • 123456
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLoginAs("admin@phisharmor.vn", "123456", "Super Admin")}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      Đăng nhập ↗
                    </button>
                  </div>

                  {/* SOC Analyst Card */}
                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    email === "analyst@phisharmor.vn"
                      ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}>
                    <div 
                      onClick={() => {
                        setEmail("analyst@phisharmor.vn");
                        setPassword("123456");
                        setError("");
                        showToast("Đã điền thông tin Chuyên viên SOC", "info");
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🛡️ Chuyên viên SOC (SOC Analyst)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                          Giám sát & Quét
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        analyst@phisharmor.vn • 123456
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLoginAs("analyst@phisharmor.vn", "123456", "SOC Analyst")}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      Đăng nhập ↗
                    </button>
                  </div>

                  {/* Guest Auditor Card */}
                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    email === "demo@phisharmor.vn"
                      ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}>
                    <div 
                      onClick={() => {
                        setEmail("demo@phisharmor.vn");
                        setPassword("123456");
                        setError("");
                        showToast("Đã điền thông tin Khách tham quan (Guest Auditor)", "info");
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          👤 Khách tham quan (Auditor)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold">
                          Chỉ đọc
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        demo@phisharmor.vn • 123456
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLoginAs("demo@phisharmor.vn", "123456", "Guest Auditor")}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      Đăng nhập ↗
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            PhishArmor Enterprise: Hệ thống giám sát & phát hiện website lừa đảo trực tuyến sử dụng PhoBERT & XGBoost
          </div>
        </div>

      </main>

      {/* ================= MODAL KHÔI PHỤC MẬT KHẨU ================= */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng modal */}
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              title="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Chỉ báo các bước (Steps Indicator) */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[
                { step: 1, label: "Nhập Email" },
                { step: 2, label: "Nhập OTP" },
                { step: 3, label: "Đặt mật khẩu" }
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                      forgotStep === item.step
                        ? "bg-sky-600 text-white shadow-xs"
                        : forgotStep > item.step
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {forgotStep > item.step ? "✓" : item.step}
                    </div>
                    <span className={`text-[11px] font-medium hidden sm:inline ${
                      forgotStep === item.step
                        ? "text-sky-600 dark:text-sky-400 font-bold"
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`w-8 h-0.5 transition-colors ${
                      forgotStep > item.step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error Message trong Modal */}
            {forgotError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                {forgotError}
              </div>
            )}

            {/* ---------------- BƯỚC 1: NHẬP EMAIL ---------------- */}
            {forgotStep === 1 && (
              <div>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Quên Mật Khẩu Truy Cập?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Nhập địa chỉ email quản trị hệ thống để nhận mã xác thực OTP khôi phục quyền đăng nhập.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ email đăng ký
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotError("");
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="admin@phisharmor.vn"
                      autoFocus
                    />
                  </div>

                  {/* Danh sách email mẫu gợi ý */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Gợi ý tài khoản demo:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {["admin@phisharmor.vn", "analyst@phisharmor.vn", "demo@phisharmor.vn"].map((sampleEmail) => (
                        <button
                          key={sampleEmail}
                          type="button"
                          onClick={() => {
                            setForgotEmail(sampleEmail);
                            setForgotError("");
                          }}
                          className={`px-2 py-0.8 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            forgotEmail === sampleEmail
                              ? "bg-sky-600 text-white font-bold"
                              : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {sampleEmail}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleSendOtp}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang tạo mã OTP...</span>
                      </>
                    ) : (
                      <span>Tiếp Tục & Gửi Mã OTP →</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- BƯỚC 2: NHẬP MÃ OTP ---------------- */}
            {forgotStep === 2 && (
              <div>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nhập Mã Xác Thực OTP
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Mã xác thực 6 số đã được gửi tới hộp thư: <strong className="text-slate-700 dark:text-slate-300 font-mono">{forgotEmail}</strong>
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Ô nhập mã OTP 6 số */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mã OTP (6 chữ số)
                      </label>
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                        Hết hạn sau: {formatTimer(otpTimer)}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        setForgotError("");
                      }}
                      className="w-full text-center tracking-[0.45em] text-lg font-mono font-bold py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="••••••"
                      autoFocus
                    />
                  </div>

                  {/* Demo auto-fill banner */}
                  <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex items-center justify-between text-[11px]">
                    <span className="text-sky-700 dark:text-sky-300">
                      Mã OTP thử nghiệm: <strong className="font-mono text-sky-800 dark:text-sky-200">{generatedOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(generatedOtp);
                        setForgotError("");
                      }}
                      className="text-[10px] px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold cursor-pointer transition-colors"
                    >
                      Điền nhanh ⚡
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ← Đổi email
                    </button>
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleVerifyOtp}
                      className="flex-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {forgotLoading ? "Đang kiểm tra..." : "Xác Thực OTP →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- BƯỚC 3: ĐẶT MẬT KHẨU MỚI ---------------- */}
            {forgotStep === 3 && (
              <div>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Thiết Lập Mật Khẩu Mới
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Nhập mật khẩu an toàn mới cho tài khoản: <strong className="text-slate-700 dark:text-slate-300 font-mono">{forgotEmail}</strong>
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setForgotError("");
                        }}
                        className="w-full px-3.5 pr-10 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Tối thiểu 6 ký tự..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                        title={showNewPassword ? "Ẩn" : "Hiện"}
                      >
                        {showNewPassword ? (
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Xác nhận lại mật khẩu mới
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setForgotError("");
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </div>

                  {/* Chỉ báo độ mạnh mật khẩu */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span className={newPassword.length >= 6 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}>
                      Tối thiểu 6 ký tự
                    </span>
                    {newPassword && confirmPassword && (
                      <span className={`ml-auto font-medium ${newPassword === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {newPassword === confirmPassword ? "✓ Khớp mật khẩu" : "✗ Chưa khớp"}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleResetPassword}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {forgotLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu & Đăng Nhập ✓"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
