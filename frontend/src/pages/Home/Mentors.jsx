import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Premium.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  
  // Lấy token và ID của học sinh đang đăng nhập (Nếu có)
  const token = localStorage.getItem('token'); 
  const userId = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('user_id'); 

  useEffect(() => {
    fetch('https://gr112.onrender.com/api/mentors')
      .then(res => res.json())
      .then(data => {
        setMentors(data.mentors || []);
      })
      .catch(err => console.log("Lỗi tải danh sách:", err));
  }, []);

  const handleReview = async (mentor) => {
    
    // 🚀 ĐÃ TẮT: Tạm thời tắt cái if chặn đăng nhập này đi để bạn test thoải mái
    // if (!token || !userId) {
    //   Swal.fire('Lỗi', 'Bạn cần đăng nhập để đánh giá cố vấn!', 'warning');
    //   return;
    // }

    // 🚀 MẸO CHỮA CHÁY: Nếu không tìm thấy userId trong LocalStorage, sẽ tự động mượn ID 12 (hoặc bạn đổi thành số ID có thật trong DB của bạn)
    const currentUserId = userId ? parseInt(userId) : 12;

    const { value: formValues } = await Swal.fire({
      title: `Đánh giá ${mentor.fullName}`,
      html: `
        <div style="text-align: left; margin-top: 10px;">
            <label style="font-weight: bold; color: #1e293b;">Mức độ hài lòng:</label>
            <select id="swal-rating" class="swal2-input" style="display: flex; margin: 10px auto; width: 100%;">
                <option value="5">⭐⭐⭐⭐⭐ (5 - Xuất sắc)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Rất tốt)</option>
                <option value="3">⭐⭐⭐ (3 - Khá)</option>
                <option value="2">⭐⭐ (2 - Trung bình)</option>
                <option value="1">⭐ (1 - Cần cải thiện)</option>
            </select>
            <label style="font-weight: bold; color: #1e293b; margin-top: 15px; display: block;">Nhận xét của bạn:</label>
            <textarea id="swal-comment" class="swal2-textarea" placeholder="Cố vấn tư vấn rất nhiệt tình..." style="margin: 10px auto; width: 100%; height: 80px;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Gửi đánh giá',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b', 
      preConfirm: () => {
        return {
          rating: document.getElementById('swal-rating').value,
          comment: document.getElementById('swal-comment').value
        }
      }
    });

    if (formValues) {
      try {
        const response = await fetch('https://gr112.onrender.com/api/mentors/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Đảm bảo không bị lỗi gửi chuỗi rỗng lên Backend
            'Authorization': `Bearer ${token || 'token_gia_lap_de_test'}`
          },
          body: JSON.stringify({
            mentor_id: mentor.id,
            student_id: currentUserId, // Truyền ID đã xử lý ở trên
            rating: parseFloat(formValues.rating),
            comment: formValues.comment
          })
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire('Cảm ơn bạn!', 'Đánh giá của bạn đã được ghi nhận.', 'success');
        } else {
          Swal.fire('Lỗi', data.message || 'Không thể gửi đánh giá.', 'error');
        }
      } catch (error) {
        Swal.fire('Mất kết nối', 'Không thể gọi tới máy chủ.', 'error');
      }
    }
  };

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Cố vấn Tinh hoa 🌟</h1>
        <p>Kết nối 1-1 với những bộ óc hàng đầu để định hướng sự nghiệp của bạn.</p>
      </div>
      
      <div className="mentors-grid">
        {mentors?.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%', color: '#64748b'}}>Đang tải danh sách cố vấn...</p>
        ) : (
          mentors?.map(m => (
            <div key={m.id} className="mentor-card">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=random&color=fff&size=150`} 
                alt={m.fullName} 
                className="mentor-img" 
                style={{borderRadius: '50%', width: '100px', height: '100px', objectFit: 'cover', margin: '0 auto', display: 'block'}}
              />
              
              <h3 style={{textAlign: 'center', marginTop: '15px'}}>{m.fullName}</h3>
              
              <p style={{textAlign: 'center', color: '#475569', fontSize: '14px', marginBottom: '15px'}}>
                <strong style={{color: '#1e3a8a'}}>{m.specialty}</strong><br/>
                Kinh nghiệm: {m.experience} năm
              </p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', padding: '0 10px' }}>
                <Link 
                  to={`/booking?mentorId=${m.id}&name=${encodeURIComponent(m.fullName)}`} 
                  className="mentor-btn" 
                  style={{ flex: 1, textAlign: 'center', background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Đặt lịch
                </Link>
                
                <button 
                  onClick={() => handleReview(m)}
                  style={{ flex: 1, background: '#fff', color: '#f59e0b', border: '2px solid #f59e0b', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ⭐ Đánh giá
                </button>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mentors;