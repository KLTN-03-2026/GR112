// src/components/Footer/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // State lưu thông báo xịn xò
  const [isLoading, setIsLoading] = useState(false); // State chống spam click

  const handleSubscribe = async (e) => {
    e.preventDefault(); 
    
    if (!email) {
      setMessage("❌ Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    setIsLoading(true);
    setMessage(''); // Xóa thông báo cũ

    try {
      // Đã đổi endpoint thành /api/subscribe cho khớp với file router.py
      const response = await fetch('http://localhost:8000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok || result.success) {
        setMessage("🎉 Đăng ký nhận bản tin thành công!"); 
        setEmail(''); // Xóa trắng ô input
      } else {
        setMessage(`❌ Lỗi: ${result.message || result.error}`);
      }
    } catch (error) {
      setMessage("❌ Không thể kết nối tới server! Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col brand-col">
          <h3>ConsulTing</h3>
          <p>Trao quyền cho học sinh thông qua khám phá bằng AI và tuyển chọn chiến lược giáo dục đại học.</p>
        </div>
        
        <div className="footer-col">
          <h4>Tài nguyên</h4>
          <Link to="/search">Tìm kiếm trường học</Link>
          <Link to="/scholarship">Học bổng</Link>
          <Link to="/guide">Cẩm nang nghề nghiệp</Link>
        </div>
        
        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <Link to="/about">Về chúng tôi</Link>
          <Link to="/contact">Liên hệ</Link>
          <Link to="/privacy">Quyền riêng tư</Link>
        </div>
        
        <div className="footer-col newsletter-col">
          <h4>Bản tin</h4>
          <form className="newsletter-input" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading} style={{ cursor: isLoading ? 'wait' : 'pointer' }}>
              {isLoading ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>...</span> : <Send size={18} />}
            </button>
          </form>
          
          {/* 🚀 KHÚC NÀY HIỂN THỊ THÔNG BÁO SIÊU MƯỢT THAY CHO ALERT */}
          {message && (
            <p style={{ 
              marginTop: '12px', 
              fontSize: '0.85rem', 
              color: message.includes('❌') ? '#ef4444' : '#10b981', 
              fontWeight: '600' 
            }}>
              {message}
            </p>
          )}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 CONSULTING. ĐƯỢC XÂY DỰNG VỚI ĐỘ CHÍNH XÁC TỪ AI.</p>
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={20} /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;