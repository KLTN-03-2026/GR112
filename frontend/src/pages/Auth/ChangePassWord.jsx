import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // ĐÃ THÊM: Import icon con mắt
import "./ChangePassWord.css";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // ĐÃ THÊM: State quản lý ẩn/hiện mật khẩu cho từng ô
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      setUserEmail(parsedUser.email);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    if (oldPassword === newPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới phải khác mật khẩu cũ!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_URL}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          old_password: oldPassword, 
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Reset lại icon về ẩn sau khi đổi thành công
        setShowOldPass(false); setShowNewPass(false); setShowConfirmPass(false);
      } else {
        setMessage({ type: "error", text: data.error || "Đổi mật khẩu thất bại" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-wrapper">
      <div className="cp-card">
        <div className="cp-header">
          <h2>Đổi Mật Khẩu</h2>
          <p>Thiết lập lại bảo mật tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="cp-body">
          {message.text && (
            <div className={`cp-alert ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="cp-form-group">
            <label>Tài khoản Email</label>
            <input type="text" value={userEmail} disabled />
          </div>

          <div className="cp-form-group">
            <label>Mật khẩu hiện tại</label>
            <div className="cp-input-wrapper">
              <input 
                type={showOldPass ? "text" : "password"} 
                placeholder="••••••••" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
              />
              <button type="button" className="cp-password-toggle" onClick={() => setShowOldPass(!showOldPass)}>
                {showOldPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="cp-form-group">
            <label>Mật khẩu mới</label>
            <div className="cp-input-wrapper">
              <input 
                type={showNewPass ? "text" : "password"} 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
              <button type="button" className="cp-password-toggle" onClick={() => setShowNewPass(!showNewPass)}>
                {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="cp-form-group">
            <label>Xác nhận mật khẩu mới</label>
            <div className="cp-input-wrapper">
              <input 
                type={showConfirmPass ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <button type="button" className="cp-password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="cp-btn-submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        <div className="cp-footer">
          <Link to="/">Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}