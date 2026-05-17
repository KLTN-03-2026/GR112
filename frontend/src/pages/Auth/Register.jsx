import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"; // 🚀 Thêm icon
import Swal from "sweetalert2"; // 🚀 Thêm thư viện thông báo xịn
import "./Register.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // 🚀 State cho ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'https://gr112.onrender.com';

  // 🚀 Hàm kiểm tra Email chuẩn
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setMessage("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password || !confirm) {
      setMessage("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setMessage("Định dạng email không hợp lệ!");
      return;
    }

    // 🚀 BẮT ĐẦU: BẢO MẬT CHUẨN NGÂN HÀNG 🚀
    const hasUpperCase = /[A-Z]/.test(password); 
    const hasLowerCase = /[a-z]/.test(password); 
    const hasNumber = /[0-9]/.test(password);    
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<> ]/.test(password); 

    if (password.length < 8 || password.length > 20) {
      setMessage("Mật khẩu phải từ 8 đến 20 ký tự!");
      return;
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu chưa đủ mạnh',
        text: 'Để an toàn, mật khẩu phải bao gồm: Chữ hoa, chữ thường, số và ký tự đặc biệt (!@#...).',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    // 🚀 KẾT THÚC: BẢO MẬT CHUẨN NGÂN HÀNG 🚀

    if (password !== confirm) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        setMessage(data.error || 'Email đã tồn tại hoặc lỗi đăng ký');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOtp = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDownOtp = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setTimer(60);
        setCanResend(false);
        Swal.fire('Thành công', 'OTP mới đã được gửi vào Email của bạn!', 'success');
      } else {
        setMessage(data.error || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setMessage("Vui lòng nhập đủ 6 số");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      if (response.ok) {
        setStep(3);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Mã OTP không đúng');
      }
    } catch (error) {
      setMessage('Lỗi xác thực.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="box-header-blue">
          <h1>🎓ConsulTing</h1>
          <p>Hệ thống tư vấn chọn trường Đại học</p>
        </div>

        <div className="stepper-wrapper">
          <div className={`step-circle ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`step-circle ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`line ${step >= 3 ? "active" : ""}`}></div>
          <div className={`step-circle ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        {message && <div className="error-alert">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="fade-in">
            <h2 className="title-left">Đăng ký tài khoản</h2>
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
            </div>
            
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <input type="text" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
            </div>
            
            {/* 🚀 CẬP NHẬT: Input Mật khẩu có nút Tắt/Mở */}
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Nhập mật khẩu của bạn..." 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={loading} 
                  required 
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            
            {/* 🚀 CẬP NHẬT: Input Xác nhận Mật khẩu có nút Tắt/Mở */}
            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Nhập lại mật khẩu..." 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                  disabled={loading} 
                  required 
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="submit-btn purple" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 className="spinner" size={20} /> Đang xử lý...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link to="/" style={{ color: "#f97316", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                ← Quay lại trang chủ
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="otp-container fade-in">
            <Mail size={60} color="#f97316" className="icon-center" />
            <h2 className="text-center">Xác thực Email</h2>
            <p className="text-center">Mã OTP đã gửi đến <b>{email}</b></p>
            
            <div className="otp-input-group">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="otp-field"
                  value={data}
                  ref={(el) => (otpRefs.current[index] = el)}
                  onChange={(e) => handleChangeOtp(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDownOtp(e, index)}
                  disabled={loading}
                />
              ))}
            </div>

            {timer > 0 ? (
              <p className="timer-text">Gửi lại mã sau <b>{timer}s</b></p>
            ) : (
              <button className="btn-resend" onClick={handleResendOtp} disabled={!canResend || loading}>Gửi lại mã</button>
            )}

            <button className="submit-btn purple" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>
            <button className="btn-back" onClick={() => setStep(1)} disabled={loading}>
              <ArrowLeft size={16}/> Quay lại thông tin
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="success-container fade-in">
            <CheckCircle size={80} color="#28a745" className="icon-center" />
            <h2>Thành công!</h2>
            <p>Tài khoản đã sẵn sàng để sử dụng.</p>
            <button className="submit-btn green" onClick={() => navigate("/login")}>Đăng nhập ngay</button>
          </div>
        )}
      </div>
    </div>
  );
}