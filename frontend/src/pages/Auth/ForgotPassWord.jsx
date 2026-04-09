import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; 
import './ForgotPassWord.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      setMessage("Vui lòng nhập tài khoản email!");
      return;
    }

    setMessage("Đang gửi mã..."); 
    try {
      const res = await fetch("http://localhost:8000/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gửi OTP thất bại");
        return;
      }

      setMessage(data.message);
    } catch (err) {
      setMessage("Không kết nối được server");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !otp || !newPass || !confirmPass) {
      setMessage("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPass !== confirmPass) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Đổi mật khẩu thất bại");
        return;
      }

      setMessage("🎉 Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
      setOtp("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      setMessage("Không kết nối được server");
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-box" onSubmit={handleReset}>
        
        <div className="box-header">
          <div className="logo">
            🎓 <span>ConsulTing</span>
          </div>
          <p className="header-sub">
            Hệ thống tư vấn chọn trường Đại học
          </p>
        </div>

        <h2>Khôi phục mật khẩu</h2>

        <div className="step">
          <div className="step-circle">1</div>
          <span>Xác thực tài khoản</span>
        </div>

        <div className="form-group">
          <label>Tài khoản Email</label>
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mã OTP</label>
          <input
            type="text"
            placeholder="Nhập mã OTP (6 số)"
            value={otp}
            maxLength="6"
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {/* ĐÃ SỬA: Nút gửi mã OTP đứng độc lập, class mới */}
        <button type="button" onClick={handleSendOTP} className="otp-btn-large">
          Gửi mã OTP
        </button>

        <div className="step">
          <div className="step-circle">2</div>
          <span>Thiết lập lại bảo mật</span>
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="input-wrapper">
            <input
              type={showNewPass ? "text" : "password"}
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <button type="button" className="password-toggle" onClick={() => setShowNewPass(!showNewPass)}>
              {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPass ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>
              {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {message && <div className="message-box">{message}</div>}

        <button type="submit" className="submit-btn">
          Xác nhận thay đổi →
        </button>

        <p className="back-link">
          ← <Link to="/login">Quay lại đăng nhập</Link>
        </p>

      </form>
    </div>
  );
}