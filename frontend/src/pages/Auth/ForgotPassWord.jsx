import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 
import Swal from "sweetalert2";
import './ForgotPassWord.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Swal.fire("Lỗi", "Vui lòng nhập email tài khoản!", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gửi OTP thất bại");
      
      Swal.fire("Thành công", "Mã OTP đã được gửi đến email của bạn!", "success");
    } catch (err) {
      Swal.fire("Lỗi", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    // 🚀 BẮT ĐẦU: BẢO MẬT CHUẨN NGÂN HÀNG 🚀
    const hasUpperCase = /[A-Z]/.test(newPass);
    const hasLowerCase = /[a-z]/.test(newPass);
    const hasNumber = /[0-9]/.test(newPass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<> ]/.test(newPass);

    if (newPass.length < 8 || newPass.length > 20) {
      setMessage("Mật khẩu phải từ 8 đến 20 ký tự!");
      return;
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      Swal.fire("Cảnh báo", "Mật khẩu phải bao gồm: Chữ hoa, thường, số và ký tự đặc biệt!", "warning");
      return;
    }

    if (newPass !== confirmPass) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

      Swal.fire("Thành công!", "Đổi mật khẩu thành công! Bạn có thể đăng nhập.", "success");
      setOtp(""); setNewPass(""); setConfirmPass("");
    } catch (err) {
      Swal.fire("Lỗi", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-box" onSubmit={handleReset}>
        <div className="box-header">
          <div className="logo">🎓 <span>ConsulTing</span></div>
        </div>

        <h2>Khôi phục mật khẩu</h2>

        <div className="form-group">
          <label>Tài khoản Email</label>
          <input type="email" placeholder="Nhập email..." value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>

        <button type="button" onClick={handleSendOTP} className="otp-btn-large" disabled={isLoading}>
          {isLoading ? <Loader2 className="spinner" size={18} /> : "Gửi mã OTP"}
        </button>

        <div className="form-group">
          <label>Mã OTP</label>
          <input type="text" placeholder="Nhập 6 số OTP" value={otp} maxLength="6" onChange={(e) => setOtp(e.target.value)} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="input-wrapper">
            <input type={showNewPass ? "text" : "password"} placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} disabled={isLoading} />
            <button type="button" className="password-toggle" onClick={() => setShowNewPass(!showNewPass)}><Eye size={18} /></button>
          </div>
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <input type={showConfirmPass ? "text" : "password"} placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} disabled={isLoading} />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}><Eye size={18} /></button>
          </div>
        </div>

        {message && <div className="message-box" style={{ color: 'red', fontSize: '13px' }}>{message}</div>}

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Xác nhận thay đổi →"}
        </button>

        <p className="back-link"><Link to="/login">← Quay lại đăng nhập</Link></p>
      </form>
    </div>
  );
}