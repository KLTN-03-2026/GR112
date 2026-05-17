import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 
import Swal from "sweetalert2"; // 🚀 Thêm thư viện thông báo xịn
import "./ChangePassWord.css";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();
  const API_URL = 'https://gr112.onrender.com';

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
    
    // 1. KIỂM TRA RỖNG
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    // 🚀 2. BẢO MẬT CHUẨN NGÂN HÀNG (Dành cho mật khẩu mới)
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<> ]/.test(newPassword);

    if (newPassword.length < 8 || newPassword.length > 20) {
      Swal.fire("Cảnh báo", "Mật khẩu mới phải từ 8 đến 20 ký tự!", "warning");
      return;
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu chưa đủ mạnh',
        text: 'Mật khẩu mới phải bao gồm: Chữ hoa, chữ thường, số và ký tự đặc biệt (!@#...).',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // 3. KIỂM TRA LOGIC CƠ BẢN
    if (newPassword !== confirmPassword) {
      Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp!", "error");
      return;
    }
    
    if (oldPassword === newPassword) {
      Swal.fire("Cảnh báo", "Mật khẩu mới phải khác mật khẩu cũ!", "warning");
      return;
    }

    setLoading(true);

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
        Swal.fire("Thành công!", "Đổi mật khẩu thành công!", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowOldPass(false); setShowNewPass(false); setShowConfirmPass(false);
      } else {
        Swal.fire("Lỗi", data.error || "Đổi mật khẩu thất bại, sai mật khẩu cũ!", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Không thể kết nối máy chủ. Vui lòng thử lại sau!", "error");
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
          <div className="cp-form-group">
            <label>Tài khoản Email</label>
            <input type="text" value={userEmail} disabled className="disabled-input" />
          </div>

          <div className="cp-form-group">
            <label>Mật khẩu hiện tại</label>
            <div className="cp-input-wrapper">
              <input 
                type={showOldPass ? "text" : "password"} 
                placeholder="••••••••" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <button type="button" className="cp-password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="cp-btn-submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 className="spinner" size={20} /> Đang xử lý...
              </span>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </button>
        </form>

        <div className="cp-footer">
          <Link to="/">Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}