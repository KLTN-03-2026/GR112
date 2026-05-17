// src/pages/Mentor/MentorSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, Video } from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2
import './MentorSchedule.css';

const MentorSchedule = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]); 
  
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://gr112.onrender.com/api/mentor/slots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSlots(data.slots || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giờ rảnh:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://gr112.onrender.com/api/mentor/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (error) {
      console.error("Lỗi khi tải lịch hẹn:", error);
    }
  };

  // 🚀 ĐÃ THAY BẰNG SWEETALERT2
  const handleAddSlot = async () => {
    if (!newDate || !newTime) {
      return Swal.fire({
        title: 'Thiếu thông tin!',
        text: 'Vui lòng chọn đầy đủ ngày và giờ rảnh.',
        icon: 'warning',
        confirmButtonColor: '#fbbf24'
      });
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://gr112.onrender.com/api/mentor/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate, time: newTime })
      });
      const data = await res.json();
      
      if (res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã mở khung giờ rảnh mới.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setNewDate(''); 
        setNewTime('');
        fetchSlots(); 
      } else {
        Swal.fire('Lỗi!', data.error || "Có lỗi xảy ra!", 'error');
      }
    } catch (error) {
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
    }
  };

  // 🚀 ĐÃ THAY BẰNG SWEETALERT2
  const handleDeleteSlot = async (slotId) => {
    Swal.fire({
      title: 'Xóa khung giờ?',
      text: "Bạn chắc chắn muốn đóng khung giờ rảnh này chứ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      borderRadius: '16px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://gr112.onrender.com/api/mentor/slots/${slotId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            Swal.fire({
              title: 'Đã xóa!',
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });
            setSlots(slots.filter(slot => slot.id !== slotId));
          } else {
            Swal.fire('Lỗi!', "Không thể xóa khung giờ này.", 'error');
          }
        } catch (error) {
          Swal.fire('Lỗi!', 'Lỗi kết nối máy chủ.', 'error');
        }
      }
    });
  };

  // 🚀 ĐÃ THAY BẰNG SWEETALERT2
  const handleUpdateBooking = async (bookingId, status) => {
    const isConfirming = status === 'confirmed';
    const actionText = isConfirming ? "Chấp nhận" : "Từ chối";
    const actionColor = isConfirming ? '#10b981' : '#ef4444';

    Swal.fire({
      title: `${actionText} lịch hẹn?`,
      text: `Bạn chắc chắn muốn ${actionText.toLowerCase()} buổi tư vấn này chứ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#94a3b8',
      confirmButtonText: actionText,
      cancelButtonText: 'Quay lại',
      borderRadius: '16px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://gr112.onrender.com/api/mentor/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
          });
          const data = await res.json();

          if (res.ok) {
            Swal.fire({
              title: 'Thành công!',
              text: data.message,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchBookings(); 
            fetchSlots();    
          } else {
            Swal.fire('Lỗi!', data.error || "Có lỗi xảy ra!", 'error');
          }
        } catch (error) {
          Swal.fire('Lỗi!', 'Lỗi kết nối máy chủ.', 'error');
        }
      }
    });
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
                    {item.status === 'pending' ? (
                      <>
                        <button className="ms-btn-confirm" onClick={() => handleUpdateBooking(item.id, 'confirmed')}>
                          <CheckCircle size={16}/> Chấp nhận
                        </button>
                        <button className="ms-btn-deny" onClick={() => handleUpdateBooking(item.id, 'rejected')}>
                          <XCircle size={16}/> Từ chối
                        </button>
                      </>
                    ) : item.status === 'confirmed' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <span className="ms-status-confirmed" style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14}/> Đã chốt lịch
                        </span>
                        
                        <button 
                          className="ms-btn-enter-room"
                          onClick={() => {
                            const roomName = `MindConnect_Room_${item.id}`;
                            const url = `https://meet.jit.si/${roomName}`;
                            window.open(url, '_blank');
                          }}
                          style={{ 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          <Video size={16}/> Vào phòng tư vấn
                        </button>
                      </div>
                    ) : (
                      <span className="ms-status-rejected" style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={14}/> Đã từ chối
                      </span>
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