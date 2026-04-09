// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react'; 
import { translations, themeColors } from '../../utils/data';
import './Header.css';

const Header = () => {
  const [lang, setLang] = useState('vi');
  const t = translations[lang];
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
    localStorage.removeItem("userRole"); // Xóa thêm userRole nếu có lưu
    setUser(null);
    setActiveDropdown(null);
    alert("Đã đăng xuất");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Hàm helper để render style cho Link
  const getLinkStyle = (path) => ({
    color: isActive(path) ? '#fff' : '',
    background: isActive(path) ? 'rgba(255,255,255,0.2)' : ''
  });

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>{t.brand}</Link>
      
      <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/" style={getLinkStyle('/')}>{t.home}</Link>
        <Link to="/search" style={getLinkStyle('/search')}>{t.search}</Link>
        <Link to="/compare" style={getLinkStyle('/compare')}>{t.compare}</Link>
        <Link to="/quiz" style={getLinkStyle('/quiz')}>{t.quiz}</Link>
        <Link to="/chatbot" style={getLinkStyle('/chatbot')}>{t.chatbot}</Link>
        
        {/* NÚT TƯ VẤN AI LẤP LÁNH */}
        <button 
          onClick={() => navigate('/ai-suggestion')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isActive('/ai-suggestion') ? '#ffffff' : 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            color: '#3b5998',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Sparkles size={16} color="#6366f1" />
          <span>{t.aiSuggestion}</span>
          <span style={{
            background: '#3b5998', color: '#fff', fontSize: '10px', 
            padding: '2px 6px', borderRadius: '10px', marginLeft: '4px'
          }}>Mới</span>
        </button>
      </nav>
      
      <div className="nav-actions">
        {/* Dropdown Đổi Màu */}
        <div className="custom-dropdown">
          <button className="pill-btn" type="button" onClick={() => toggleDropdown('theme')}><i className="fas fa-palette"></i> {t.theme}</button>
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
          <button className="pill-btn" type="button" onClick={() => toggleDropdown('language')}><i className="fas fa-globe"></i> {t.language}</button>
          <div className={`dropdown-menu ${activeDropdown === 'language' ? 'show' : ''}`}>
            <a href="#vi" onClick={(e) => { e.preventDefault(); setLang('vi'); setActiveDropdown(null); }}>🇻🇳 Tiếng Việt</a>
            <a href="#en" onClick={(e) => { e.preventDefault(); setLang('en'); setActiveDropdown(null); }}>🇬🇧 English</a>
          </div>
        </div>
        
        {/* Khung User / Đăng nhập */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            {/* ĐÂY LÀ ĐOẠN CODE MỚI THÊM: NÚT ADMIN DASHBOARD */}
            {user.role === 'admin' && (
              <button 
                className="pill-btn" 
                onClick={() => navigate('/admin')}
                style={{ 
                  background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)', 
                  color: 'white', 
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-user-shield" style={{marginRight: '5px'}}></i> Quản trị
              </button>
            )}

            <div className="custom-dropdown">
              <button className="pill-btn user-logged-btn" type="button" onClick={() => toggleDropdown('user')}>
                <span>{user.email ? user.email.split('@')[0] : "User"}</span>
                <i className="fas fa-chevron-down" style={{marginLeft: '4px'}}></i>
              </button>
              <div className={`dropdown-menu ${activeDropdown === 'user' ? 'show' : ''}`}>
                <Link to="/profile" onClick={() => setActiveDropdown(null)}><i className="far fa-id-card"></i> {t.userInfo}</Link>
                <Link to="/update-profile" onClick={() => setActiveDropdown(null)}><i className="fas fa-graduation-cap"></i> Hồ sơ học tập</Link>
                <Link to="/change-password" onClick={() => setActiveDropdown(null)}><i className="fas fa-key"></i> {t.changePass}</Link>
                <Link to="/favorites" onClick={() => setActiveDropdown(null)}>Trường yêu thích</Link>
                <hr style={{margin: '5px 0', opacity: 0.2}} />
                <a href="#logout" onClick={handleLogout} style={{color: '#e74c3c'}}><i className="fas fa-sign-out-alt"></i> {t.logout}</a>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">{t.login}</Link>
            <Link to="/register" className="btn-register">{t.register}</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;