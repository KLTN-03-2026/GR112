import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; 
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🚀 Chỉ gửi Email và Password, không cần gửi Role nữa
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Đăng nhập thất bại");
        return;
      }

      if (data.user) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.user.role) {
            localStorage.setItem("userRole", data.user.role);
        }

        // 🚀 Backend sẽ tự trả về role, React chỉ việc lấy ra dùng để chuyển trang
        if (data.user.role === 'admin') {
            alert("Đăng nhập thành công! Chào mừng Quản trị viên.");
            navigate("/admin");
        } else if (data.user.role === 'mentor') {
            alert("Đăng nhập thành công! Chào mừng Cố vấn chuyên môn.");
            navigate("/mentor");
        } else {
            alert("Đăng nhập thành công!");
            navigate("/");
        }

      } else {
        setError("Server không trả về thông tin người dùng!");
      }

    } catch (err) {
      setError("Không kết nối được server");
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
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button type="submit" className="login-btn">
          Đăng nhập →
        </button>

        <p className="register-text">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}