// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react'; 
import { themeColors } from '../../utils/data';

import './Header.css';

const Header = () => {
  const [currentAccentColor, setCurrentAccentColor] = useState(themeColors[0]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-accent-color', currentAccentColor);
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try { 
        setUser(JSON.parse(savedUser)); 
      } catch (error) { 
        localStorage.removeItem("user"); 
      }
    }
  }, [currentAccentColor, location]);

  const toggleDropdown = (menuName) => setActiveDropdown(activeDropdown === menuName ? null : menuName);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); 
    setUser(null);
    setActiveDropdown(null);
    alert("Đã đăng xuất");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getLinkStyle = (path) => ({
    color: isActive(path) ? '#fff' : '',
    background: isActive(path) ? 'rgba(255,255,255,0.2)' : ''
  });

  // 🚀 LẤY TÊN HIỂN THỊ ĐỂ LÀM SEED TẠO AVATAR
  const username = user?.email ? user.email.split('@')[0] : "User";

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>ConsulTing</Link>
      
      <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/" style={getLinkStyle('/')}>Trang chủ</Link>
        <Link to="/search" style={getLinkStyle('/search')}>Tìm kiếm trường</Link>
        <Link to="/compare" style={getLinkStyle('/compare')}>So sánh</Link>
        <Link to="/quiz" style={getLinkStyle('/quiz')}>Trắc nghiệm</Link>
        <Link to="/chatbot" style={getLinkStyle('/chatbot')}>Chatbot AI</Link>
        
        <button 
          onClick={() => navigate('/ai-suggestion')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isActive('/ai-suggestion') ? '#ffffff' : 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            color: '#3b5998', border: 'none', padding: '6px 14px', borderRadius: '20px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Sparkles size={16} color="#6366f1" />
          <span>Gợi ý AI</span>
          <span style={{ background: '#3b5998', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' }}>Mới</span>
        </button>
      </nav>
      
      <div className="nav-actions">
        {/* Dropdown Chủ đề */}
        <div className="custom-dropdown">
          <button className="pill-btn" type="button" onClick={() => toggleDropdown('theme')}><i className="fas fa-palette"></i> Chủ đề</button>
          <div className={`dropdown-menu ${activeDropdown === 'theme' ? 'show' : ''}`}>
            <div className="theme-grid">
              {themeColors.map((color, index) => (
                <div key={index} className="theme-item" style={{ backgroundColor: color }} onClick={() => { setCurrentAccentColor(color); setActiveDropdown(null); }}>
                  {color === currentAccentColor && <i className="fas fa-check"></i>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dropdown Ngôn ngữ */}
        <div className="custom-dropdown">
          <button className="pill-btn" type="button" onClick={() => toggleDropdown('language')}><i className="fas fa-globe"></i> Ngôn ngữ</button>
          <div className={`dropdown-menu ${activeDropdown === 'language' ? 'show' : ''}`}>
            <a href="#vi" onClick={(e) => { 
              e.preventDefault(); 
              document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
              setActiveDropdown(null); 
              window.location.reload(); 
            }}>🇻🇳 Tiếng Việt</a>
            
            <a href="#en" onClick={(e) => { 
              e.preventDefault(); 
              document.cookie = "googtrans=/vi/en; path=/";
              document.cookie = `googtrans=/vi/en; domain=${window.location.hostname}; path=/`;
              setActiveDropdown(null); 
              window.location.reload();
            }}>🇬🇧 English</a>
          </div>
        </div>
        
        {/* Khung User / Đăng nhập */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            {/* NÚT DÀNH CHO ADMIN */}
            {user.role === 'admin' && (
              <button 
                className="pill-btn" 
                onClick={() => navigate('/admin')}
                style={{ background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)', color: 'white', border: 'none', fontWeight: 'bold' }}
              >
                <i className="fas fa-user-shield" style={{marginRight: '5px'}}></i> Quản trị
              </button>
            )}

            {/* NÚT DÀNH CHO CỐ VẤN */}
            {user.role === 'mentor' && (
              <button 
                className="pill-btn" 
                onClick={() => navigate('/mentor')}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: 'white', border: 'none', fontWeight: 'bold' }}
              >
                <i className="fas fa-calendar-check" style={{marginRight: '5px'}}></i> Cố vấn
              </button>
            )}

            {/* DROPDOWN USER ẨN TÊN, CHỈ ĐỂ AVATAR */}
            <div className="custom-dropdown">
              <button 
                className="pill-btn user-logged-btn" 
                type="button" 
                onClick={() => toggleDropdown('user')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px 4px 4px', borderRadius: '30px' }} 
              >
                {/* 🚀 AVATAR TỰ ĐỘNG GENERATE (Phóng to lên xíu cho đẹp) */}
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`} 
                  alt="Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', objectFit: 'cover' }} 
                />
                <i className="fas fa-chevron-down" style={{fontSize: '12px', color: '#64748b', marginRight: '2px'}}></i>
              </button>
              
              <div className={`dropdown-menu ${activeDropdown === 'user' ? 'show' : ''}`}>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', marginBottom: '5px' }}>
                   <strong style={{ display: 'block', color: '#2c3e50', fontSize: '15px' }}>
                      {user.fullName || username}
                   </strong>
                   <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {user.role === 'mentor' 
                        ? (user.specialty ? `Chuyên gia ${user.specialty}` : "Cố vấn học thuật")
                        : (user.className && user.schoolName ? `${user.className} - ${user.schoolName}` : "")}
                   </span>
                </div>

                {/* CHỈ HIỆN CÁC MỤC NÀY NẾU KHÔNG PHẢI LÀ CỐ VẤN/ADMIN */}
                {user.role !== 'mentor' && user.role !== 'admin' && (
                  <>
                    <Link to="/profile" onClick={() => setActiveDropdown(null)}>
                      <i className="far fa-id-card"></i> Hồ sơ cá nhân
                    </Link>
                    <Link to="/update-profile" onClick={() => setActiveDropdown(null)}>
                      <i className="fas fa-graduation-cap"></i> Hồ sơ học tập
                    </Link>
                    <Link to="/favorites" onClick={() => setActiveDropdown(null)}>
                      <i className="fas fa-heart"></i> Trường yêu thích
                    </Link>
                    <Link to="/booking-history" onClick={() => setActiveDropdown(null)}>
                      <i className="fas fa-history" style={{color: '#3b82f6'}}></i> Lịch sử đặt lịch
                    </Link>
                  </>
                )}

                <Link to="/change-password" onClick={() => setActiveDropdown(null)}>
                  <i className="fas fa-key"></i> Đổi mật khẩu
                </Link>
                
                <hr />
                
                <a href="#logout" onClick={handleLogout} style={{color: '#e74c3c', fontWeight: 'bold'}}>
                   <i className="fas fa-sign-out-alt"></i> Đăng xuất
                </a>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Đăng nhập</Link>
            <Link to="/register" className="btn-register">Đăng ký</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;