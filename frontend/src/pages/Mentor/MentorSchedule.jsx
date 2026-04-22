// src/pages/Mentor/MentorSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import './MentorSchedule.css';

const MentorSchedule = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]); // 🚀 Thêm state chứa lịch hẹn
  
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // 1. TẢI DỮ LIỆU KHI MỞ TRANG (Tải cả giờ rảnh lẫn lịch hẹn)
  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/mentor/slots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSlots(data.slots || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giờ rảnh:", error);
    }
  };

  // 🚀 KÉO DANH SÁCH LỊCH HẸN TỪ BACKEND
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/mentor/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (error) {
      console.error("Lỗi khi tải lịch hẹn:", error);
    }
  };

  // 2. HÀM THÊM GIỜ RẢNH
  const handleAddSlot = async () => {
    if (!newDate || !newTime) return alert("Vui lòng chọn đầy đủ ngày và giờ!");

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/mentor/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate, time: newTime })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Đã thêm giờ rảnh thành công!");
        setNewDate(''); 
        setNewTime('');
        fetchSlots(); 
      } else {
        alert(data.error || "Có lỗi xảy ra!");
      }
    } catch (error) {
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  // 3. HÀM XÓA GIỜ RẢNH
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/mentor/slots/${slotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setSlots(slots.filter(slot => slot.id !== slotId));
      } else {
        alert(data.error || "Không thể xóa khung giờ này.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  // 🚀 4. HÀM XỬ LÝ CHẤP NHẬN / TỪ CHỐI LỊCH HẸN
  const handleUpdateBooking = async (bookingId, status) => {
    const actionName = status === 'confirmed' ? "chấp nhận" : "từ chối";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} lịch hẹn này?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/mentor/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchBookings(); // Cập nhật lại danh sách booking
        fetchSlots();    // Cập nhật lại danh sách slot (để đổi màu viên thuốc sang Xanh lá nếu accept)
      } else {
        alert(data.error || "Có lỗi xảy ra!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="ms-container fade-in">
      <div className="ms-header">
        <h2>Lịch trình của tôi 🗓️</h2>
        <p>Quản lý các phiên tư vấn và thiết lập thời gian biểu cá nhân của bạn.</p>
      </div>

      <div className="ms-tabs">
        <button 
          className={activeTab === 'upcoming' ? 'active' : ''} 
          onClick={() => setActiveTab('upcoming')}
        >
          Lịch hẹn sắp tới
        </button>
        <button 
          className={activeTab === 'setup' ? 'active' : ''} 
          onClick={() => setActiveTab('setup')}
        >
          Thiết lập giờ rảnh
        </button>
      </div>

      <div className="ms-content">
        {activeTab === 'upcoming' ? (
          <div className="ms-booking-list">
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#78716c' }}>
                <p>Hiện chưa có học sinh nào đặt lịch hẹn với bạn.</p>
              </div>
            ) : (
              bookings.map(item => (
                <div key={item.id} className="ms-booking-card">
                  <div className="ms-b-info">
                    <div className="ms-b-user">
                      <div className="ms-avatar">{item.student.charAt(0)}</div>
                      <div>
                        <h4>{item.student}</h4>
                        <span>{item.topic}</span>
                      </div>
                    </div>
                    <div className="ms-b-time">
                      <Calendar size={14} /> {item.date.split('-').reverse().join('/')} <span className="divider">|</span> <Clock size={14} /> {item.time}
                    </div>
                  </div>
                  <div className="ms-b-actions">
                    {/* 🚀 GẮN SỰ KIỆN CHO 2 NÚT NÀY */}
                    {item.status === 'pending' ? (
                      <>
                        <button className="ms-btn-confirm" onClick={() => handleUpdateBooking(item.id, 'confirmed')}>
                          <CheckCircle size={16}/> Chấp nhận
                        </button>
                        <button className="ms-btn-deny" onClick={() => handleUpdateBooking(item.id, 'rejected')}>
                          <XCircle size={16}/> Từ chối
                        </button>
                      </>
                    ) : (
                      <span className="ms-status-confirmed"><CheckCircle size={14}/> Đã xác nhận</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="ms-setup-container">
            <div className="ms-setup-form">
              <h3>Thêm khung giờ mới</h3>
              <p>Học sinh chỉ có thể đặt lịch vào những khung giờ bạn đã mở ở đây.</p>
              <div className="ms-input-row">
                <input 
                  type="date" 
                  className="ms-input" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <input 
                  type="time" 
                  className="ms-input" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <button className="ms-btn-add" onClick={handleAddSlot}>
                  <Plus size={18}/> Thêm vào lịch
                </button>
              </div>
            </div>

            <div className="ms-active-slots">
              <h3>Giờ rảnh đã đăng ký</h3>
              <div className="ms-slots-grid">
                {slots.length === 0 ? (
                  <p style={{ color: '#78716c', fontStyle: 'italic' }}>Bạn chưa thiết lập khung giờ rảnh nào.</p>
                ) : (
                  slots.map(slot => (
                    <div key={slot.id} className="ms-slot-pill" style={slot.is_booked ? { borderColor: '#10b981', backgroundColor: '#ecfdf5', color: '#047857' } : {}}>
                      {slot.date.split('-').reverse().join('/')} - {slot.time} 
                      
                      {!slot.is_booked && (
                        <button onClick={() => handleDeleteSlot(slot.id)} title="Xóa giờ này">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSchedule;