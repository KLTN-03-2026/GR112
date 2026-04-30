import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 
import Swal from "sweetalert2"; 
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const navigate = useNavigate();

  // Hàm kiểm tra định dạng Email chuẩn 
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi cũ

    // 1. CHỐNG RÁC DỮ LIỆU & KIỂM TRA ĐẦU VÀO
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Định dạng email không hợp lệ!");
      return;
    }

    // 🚀 BẮT ĐẦU: BẢO MẬT CHUẨN NGÂN HÀNG 🚀
    const hasUpperCase = /[A-Z]/.test(password); 
    const hasLowerCase = /[a-z]/.test(password); 
    const hasNumber = /[0-9]/.test(password);    
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<> ]/.test(password); 

    if (password.length < 8 || password.length > 20) {
      setError("Mật khẩu phải từ 8 đến 20 ký tự!");
      return;
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError("Mật khẩu quá yếu!");
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu chưa đủ mạnh',
        text: 'Để an toàn, mật khẩu phải bao gồm: Chữ hoa, chữ thường, số và ký tự đặc biệt (!@#...).',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    // 🚀 KẾT THÚC: BẢO MẬT CHUẨN NGÂN HÀNG 🚀

    // 2. KHÓA NÚT SUBMIT
    setIsLoading(true);

    try {
      // 3. DỌN DẸP TOKEN CŨ 
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Tài khoản hoặc mật khẩu không chính xác!");
        setIsLoading(false);
        return;
      }

      if (data.user && data.token) {
        // 4. LƯU TRỮ AN TOÀN
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.user.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        // 5. HIỂN THỊ THÔNG BÁO VÀ CHUYỂN HƯỚNG
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: `Chào mừng ${data.user.full_name || 'bạn'} quay lại hệ thống.`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          if (data.user.role === 'admin') {
            navigate("/admin");
          } else if (data.user.role === 'mentor') {
            navigate("/mentor");
          } else {
            navigate("/");
          }
        });

      } else {
        setError("Dữ liệu Server trả về không hợp lệ!");
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        
        <div className="box-header">
          <div className="logo">
            <span>ConsulTing</span>
          </div>
          <p className="header-sub">
            Hệ thống tư vấn chọn trường Đại học
          </p>
        </div>

        <h2>Đăng nhập hệ thống</h2>
        <p className="sub-text">
          Vui lòng nhập thông tin để tiếp tục truy cập
        </p>

        <div className="form-group">
          <label style={{ fontSize: '14px', color: '#333', marginBottom: '5px', display: 'block' }}>Email</label>
          <input
            type="text" 
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading} 
          />
        </div>

        <div className="form-group">
          <div className="password-header">
            <label>Mật khẩu</label>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
          
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="spinner" size={20} /> Đang xử lý...
            </span>
          ) : (
            "Đăng nhập →"
          )}
        </button>

        <p className="register-text">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}