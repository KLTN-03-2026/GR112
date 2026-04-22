import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Premium.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/mentors')
      .then(res => res.json())
      .then(data => {
        // 🚀 BẮT ĐÚNG MẢNG MENTORS TỪ API TRẢ VỀ
        setMentors(data.mentors || []);
      })
      .catch(err => console.log("Lỗi tải danh sách:", err));
  }, []);

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Cố vấn Tinh hoa 🌟</h1>
        <p>Kết nối 1-1 với những bộ óc hàng đầu để định hướng sự nghiệp của bạn.</p>
      </div>
      
      <div className="mentors-grid">
        {/* 🚀 THÊM DẤU ? ĐỂ BẢO VỆ VÒNG LẶP */}
        {mentors?.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%', color: '#64748b'}}>Đang tải danh sách cố vấn...</p>
        ) : (
          mentors?.map(m => (
            <div key={m.id} className="mentor-card">
              
              {/* 🚀 DÙNG UI-AVATAR ĐỂ TẠO ẢNH TỰ ĐỘNG TỪ TÊN (Vì DB chưa có link ảnh) */}
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=random&color=fff&size=150`} 
                alt={m.fullName} 
                className="mentor-img" 
                style={{borderRadius: '50%', width: '100px', height: '100px', objectFit: 'cover', margin: '0 auto', display: 'block'}}
              />
              
              <h3 style={{textAlign: 'center', marginTop: '15px'}}>{m.fullName}</h3>
              
              {/* 🚀 LẤY ĐÚNG TRƯỜNG DỮ LIỆU TỪ BACKEND GỬI LÊN */}
              <p style={{textAlign: 'center', color: '#475569', fontSize: '14px', marginBottom: '15px'}}>
                <strong style={{color: '#1e3a8a'}}>{m.specialty}</strong><br/>
                Kinh nghiệm: {m.experience} năm
              </p>
              
              {/* Truyền ID và Tên sang trang Đặt lịch */}
              <Link to={`/booking?mentorId=${m.id}&name=${encodeURIComponent(m.fullName)}`} className="mentor-btn" style={{display: 'block', textAlign: 'center'}}>
                Đặt lịch 1-1 ngay
              </Link>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mentors;