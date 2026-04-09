// src/components/Footer/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Import đầy đủ các icon từ lucide-react
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  // State để lưu trữ email người dùng nhập vào
  const [email, setEmail] = useState('');

  // Hàm xử lý khi bấm Đăng ký bản tin (Đã tích hợp API Backend)
  const handleSubscribe = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang
    
    if (!email) {
      alert("Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    try {
      // Gọi API gửi thẳng dữ liệu về Backend Flask ở cổng 8000
      const response = await fetch('http://localhost:8000/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Báo thành công (và tự động gửi email)
        setEmail(''); // Xóa trắng ô input
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      alert("Không thể kết nối tới server! Vui lòng bật backend.");
      console.error(error);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col brand-col">
          <h3>🎓ConsulTing</h3>
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
              required
            />
            <button type="submit">
              {/* Thay icon cũ bằng icon Send của lucide-react */}
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 CONSULTING. ĐƯỢC XÂY DỰNG VỚI ĐỘ CHÍNH XÁC TỪ AI.</p>
        <div className="social-links">
          {/* Đã thay toàn bộ chữ (TWITTER, LINKEDIN...) bằng Logo cực mượt */}
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