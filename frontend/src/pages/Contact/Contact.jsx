// src/pages/Contact/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // ĐỔI SANG PORT 8000
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Cảm ơn ${formData.name}! Tin nhắn của bạn đã được gửi thành công.`);
        setFormData({ name: '', email: '', message: '' }); 
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      alert("Lỗi: Không thể kết nối đến Server Python (cổng 8000)!");
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', display: 'flex', gap: '40px' }}>
      {/* Thông tin liên hệ */}
      <div style={{ flex: 1 }}>
        <h1 style={{ color: '#3b5998', marginBottom: '20px' }}>Liên hệ với chúng tôi</h1>
        <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>
          Bạn có thắc mắc về các tính năng AI, cách chọn trường, hay cần hỗ trợ kỹ thuật? Đừng ngần ngại để lại lời nhắn nhé!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin color="#3b5998"/> Đà Nẵng, Việt Nam</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone color="#3b5998"/> 0359610617</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail color="#3b5998"/> vanlinhpham03@gmail.com</div>
        </div>
      </div>

      {/* Form gửi tin */}
      <div style={{ flex: 1, background: '#f8fafc', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Họ và tên của bạn" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <input 
            type="email" placeholder="Email liên hệ" required
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <textarea 
            placeholder="Bạn cần hỗ trợ gì?" rows="5" required
            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
          ></textarea>
          <button type="submit" style={{ padding: '12px', background: '#3b5998', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}>
            <Send size={18} /> Gửi tin nhắn
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;