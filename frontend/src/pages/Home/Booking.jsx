import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Premium.css';

const Booking = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedMentorId = queryParams.get('mentorId') || '';
  const preSelectedMentorName = queryParams.get('name') || '';

  const [formData, setFormData] = useState({
    name: '', email: '', mentorId: preSelectedMentorId, date: '', time: ''
  });
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(res.ok) setSuccess(data.message);
      else alert("Lỗi: " + data.error);
    } catch (err) { alert("Lỗi kết nối máy chủ!"); }
  };

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Đặt lịch Tư vấn Trực tiếp 📅</h1>
        <p>Sắp xếp cuộc gọi video 45 phút với chuyên gia bạn đã chọn.</p>
      </div>
      <div className="pr-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {success ? (
          <div style={{textAlign: 'center', padding: '30px'}}>
            <i className="fas fa-check-circle" style={{fontSize: '4rem', color: '#10b981', marginBottom: '20px'}}></i>
            <h2>{success}</h2>
            <p>Vui lòng kiểm tra email để lấy link tham gia phòng họp ảo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="pr-form-group">
              <label>Họ và Tên của bạn</label>
              <input type="text" className="pr-input" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="pr-form-group">
              <label>Email liên hệ</label>
              <input type="email" className="pr-input" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="pr-form-group">
              <label>Chuyên gia Cố vấn</label>
              {/* Nếu đi từ trang Mentors qua thì khóa cứng tên luôn */}
              {preSelectedMentorName ? (
                 <input type="text" className="pr-input" value={preSelectedMentorName} disabled style={{background: '#e2e8f0'}} />
              ) : (
                 <select className="pr-input" value={formData.mentorId} onChange={e => setFormData({...formData, mentorId: e.target.value})} required>
                   <option value="">-- Chọn Cố vấn --</option>
                   <option value="m1">PGS.TS Nguyễn Văn A</option>
                   <option value="m2">ThS. Trần Thị B</option>
                   <option value="m3">Dr. Lê Minh C</option>
                 </select>
              )}
            </div>
            <div style={{display: 'flex', gap: '20px'}}>
              <div className="pr-form-group" style={{flex: 1}}>
                <label>Ngày hẹn</label>
                <input type="date" className="pr-input" required
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="pr-form-group" style={{flex: 1}}>
                <label>Giờ hẹn</label>
                <input type="time" className="pr-input" required
                  value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="pr-btn">Xác nhận Đặt lịch</button>
          </form>
        )}
      </div>
    </div>
  );
};
export default Booking;