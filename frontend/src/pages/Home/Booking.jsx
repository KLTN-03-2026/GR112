import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Premium.css';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedMentorId = queryParams.get('mentorId') || '';
  const preSelectedMentorName = queryParams.get('name') || '';

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    role: '', 
    topic: '', 
    needs: '', 
    mentorId: preSelectedMentorId, 
    slotId: '' // 🚀 THAY VÌ NHẬP DATE/TIME, TA LƯU SLOT ID
  });
  
  const [success, setSuccess] = useState('');
  const [mentorsList, setMentorsList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]); // 🚀 CHỨA GIỜ RẢNH CỦA CỐ VẤN
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  // 1. TẢI DANH SÁCH CỐ VẤN
  useEffect(() => {
    if (!preSelectedMentorName) {
      const fetchMentors = async () => {
        setIsLoadingMentors(true);
        try {
          const res = await fetch('https://gr112.onrender.com/api/mentors'); 
          const data = await res.json();
          if (res.ok) setMentorsList(data.mentors || []); 
        } catch (error) {
          console.error("Không thể tải danh sách cố vấn:", error);
        } finally {
          setIsLoadingMentors(false);
        }
      };
      fetchMentors();
    }
  }, [preSelectedMentorName]);

  // 2. KHI CHỌN CỐ VẤN -> TẢI LỊCH RẢNH CỦA NGƯỜI ĐÓ
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.mentorId) {
        try {
          const res = await fetch(`https://gr112.onrender.com/api/mentors/${formData.mentorId}/slots`);
          const data = await res.json();
          if (res.ok) setAvailableSlots(data.slots || []);
        } catch (error) {
          console.error("Không thể tải giờ rảnh:", error);
        }
      } else {
        setAvailableSlots([]); // Reset nếu chưa chọn ai
      }
    };
    fetchSlots();
  }, [formData.mentorId]);

  // 3. GỬI YÊU CẦU ĐẶT LỊCH
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚀 LẤY TOKEN CỦA HỌC SINH TỪ BỘ NHỚ
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Bạn cần Đăng nhập trước khi đặt lịch!");
        navigate('/login');
        return;
    }

    try {
      const res = await fetch('https://gr112.onrender.com/api/bookings', { // 🚀 CHỈNH LẠI ĐÚNG LINK API
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Gửi vé qua cho Server
        },
        body: JSON.stringify({
            mentor_id: formData.mentorId,
            slot_id: formData.slotId, // Mã của khung giờ học sinh chọn
            topic: `${formData.topic} - ${formData.needs}` // Nối 2 cái này làm 1 để gửi cho Cố vấn đọc
        })
      });
      
      const data = await res.json();
      if(res.ok) {
          setSuccess(data.message || "Đặt lịch thành công!");
      } else {
          alert("Lỗi: " + data.error);
      }
    } catch (err) { alert("Lỗi kết nối máy chủ!"); }
  };

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Tư vấn Định hướng Chọn trường Đại học 🎓</h1>
        <p>Kết nối 1-1 với chuyên gia để tìm ra ngành học và ngôi trường phù hợp nhất với năng lực của bạn.</p>
      </div>

      <div className="pr-card">
        {success ? (
          <div className="success-message">
            <i className="fas fa-check-circle" style={{fontSize: '48px', color: '#10b981'}}></i>
            <h2>{success}</h2>
            <p>Hệ thống đã ghi nhận lịch hẹn và gửi thông tin cho Cố vấn. Vui lòng chờ phản hồi!</p>
            <button className="pr-btn" style={{marginTop: '30px', width: 'auto', padding: '12px 30px'}} onClick={() => window.location.href='/'}>
              Về trang chủ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="pr-form-group">
                <label>Họ & tên</label>
                <input type="text" className="pr-input" placeholder="Viết tại đây..." required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="pr-form-group">
                <label>Email liên hệ</label>
                <input type="email" className="pr-input" placeholder="vi-du@gmail.com" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="pr-form-group">
              <label>Bạn hiện đang là...</label>
              <select 
                className="pr-input" 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                required
              >
                <option value="" disabled>Select...</option>
                <option value="hs_12">Học sinh lớp 12 chuẩn bị xét tuyển Đại học</option>
                <option value="hs_10_11">Học sinh lớp 10, 11 cần định hướng khối/ngành sớm</option>
                <option value="sinh_vien">Sinh viên muốn cân nhắc chuyển ngành/thi lại</option>
                <option value="phu_huynh">Phụ huynh muốn đồng hành tìm trường cho con</option>
              </select>
            </div>

            <div className="pr-form-group">
              <label>Chủ đề bạn muốn tư vấn nhất?</label>
              <select 
                className="pr-input" 
                value={formData.topic} 
                onChange={e => setFormData({...formData, topic: e.target.value})} 
                required
              >
                <option value="" disabled>Select...</option>
                <option value="chon_nganh">Khám phá bản thân, tìm ra ngành học phù hợp</option>
                <option value="chon_truong">Tư vấn chọn trường ĐH theo mức điểm và năng lực</option>
                <option value="xet_tuyen">Chiến lược xét tuyển, làm hồ sơ (Học bạ, ĐGNL, IELTS...)</option>
                <option value="viec_lam">Cơ hội việc làm và Lộ trình phát triển của ngành nghề</option>
              </select>
            </div>

            <div className="pr-form-group">
              <label>Ghi chú thêm về học lực/vấn đề của bạn (Không bắt buộc)</label>
              <textarea 
                className="pr-input" 
                placeholder="Ví dụ: Em học giỏi khối A1, đang phân vân giữa Kinh tế Quốc dân và Ngoại thương..." 
                rows="2"
                style={{ resize: 'vertical' }}
                value={formData.needs} 
                onChange={e => setFormData({...formData, needs: e.target.value})} 
              ></textarea>
            </div>
            
            <div className="form-row">
                <div className="pr-form-group">
                  <label>Chuyên gia Cố vấn</label>
                  {preSelectedMentorName ? (
                     <input type="text" className="pr-input" value={preSelectedMentorName} disabled />
                  ) : (
                     <select 
                       className="pr-input" 
                       value={formData.mentorId} 
                       onChange={e => setFormData({...formData, mentorId: e.target.value, slotId: ''})} // Reset slot khi đổi Mentor
                       required
                       disabled={isLoadingMentors}
                     >
                       <option value="">{isLoadingMentors ? 'Đang tải danh sách...' : '-- Chọn Cố vấn --'}</option>
                       {mentorsList.map((mentor) => (
                         <option key={mentor.id} value={mentor.id}>
                           {mentor.fullName} ({mentor.specialty})
                         </option>
                       ))}
                     </select>
                  )}
                </div>

                {/* 🚀 ĐÃ SỬA LẠI: HIỂN THỊ DANH SÁCH GIỜ RẢNH CỦA CỐ VẤN */}
                <div className="pr-form-group">
                  <label>Khung giờ hẹn rảnh</label>
                  <select 
                     className="pr-input" 
                     value={formData.slotId} 
                     onChange={e => setFormData({...formData, slotId: e.target.value})} 
                     required
                     disabled={!formData.mentorId || availableSlots.length === 0}
                   >
                     <option value="">
                        {!formData.mentorId ? '-- Vui lòng chọn Cố vấn trước --' 
                         : availableSlots.length === 0 ? 'Cố vấn này hiện đã kín lịch' 
                         : '-- Chọn giờ rảnh của Cố vấn --'}
                     </option>
                     {availableSlots.map((slot) => (
                       <option key={slot.id} value={slot.id}>
                         Ngày {slot.date.split('-').reverse().join('/')} | Lúc {slot.time}
                       </option>
                     ))}
                   </select>
                </div>
            </div>

            <button type="submit" className="pr-btn" style={{backgroundColor: '#fbbf24', backgroundImage: 'none', color: '#fff', width: '100%', marginTop: '15px'}}>
              XÁC NHẬN ĐẶT LỊCH TƯ VẤN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Booking;