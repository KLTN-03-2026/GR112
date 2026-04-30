import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Check, X, Download } from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2
import './BookingManagement.css';

const BookingManagement = () => {
  // 1. Tạo state để chứa dữ liệu
  const [allBookings, setAllBookings] = useState([]);
  const token = localStorage.getItem('token');

  // 2. Gọi API khi trang vừa load
  useEffect(() => {
    fetch('http://localhost:8000/api/admin/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.bookings) setAllBookings(data.bookings);
      })
      .catch(err => console.error("Lỗi lấy data admin:", err));
  }, []);

  // 3. Hàm xử lý Duyệt/Hủy cho Admin (🚀 ĐÃ THAY BẰNG SWEETALERT2)
  const handleUpdateStatus = (id, newStatus) => {
    const isConfirming = newStatus === 'confirmed';
    const actionText = isConfirming ? 'Duyệt' : 'Hủy';
    const actionColor = isConfirming ? '#10b981' : '#ef4444'; // Xanh lá nếu duyệt, Đỏ nếu hủy

    Swal.fire({
      title: `Xác nhận ${actionText} lịch hẹn?`,
      text: `Bạn có chắc chắn muốn chuyển trạng thái lịch hẹn này sang "${isConfirming ? 'Đã chốt' : 'Đã hủy'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Đồng ý ${actionText}`,
      cancelButtonText: 'Bỏ qua',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Gọi API cập nhật
        fetch(`http://localhost:8000/api/admin/bookings/${id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
          if (res.ok) {
            // Cập nhật lại giao diện ngay lập tức
            setAllBookings(allBookings.map(b => b.id === id ? {...b, status: newStatus} : b));
            
            // 🚀 Báo thành công
            Swal.fire({
              title: 'Thành công!',
              text: `Lịch hẹn đã được ${actionText.toLowerCase()}.`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            Swal.fire('Lỗi!', 'Không thể cập nhật trạng thái, vui lòng thử lại.', 'error');
          }
        })
        .catch(err => {
          Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
        });
      }
    });
  };

  return (
    <div className="admin-booking-container fade-in">
      {/* ... Phần Header và Filter giữ nguyên ... */}

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Học sinh</th>
              <th>Cố vấn phụ trách</th>
              <th>Ngày hẹn</th>
              <th>Trạng thái</th>
              <th className="text-right">Quản lý</th>
            </tr>
          </thead>
          <tbody>
            {allBookings.map(b => (
              <tr key={b.id}>
                <td className="id-col">#{b.id}</td>
                <td className="bold-text">{b.student}</td>
                <td>{b.mentor}</td>
                <td>{b.time} - {b.date}</td> {/* Hiện cả giờ và ngày */}
                <td>
                  <span className={`status-tag ${b.status}`}>
                    {b.status === 'completed' ? 'Hoàn thành' : b.status === 'pending' ? 'Chờ duyệt' : b.status === 'rejected' ? 'Đã hủy' : 'Đã chốt'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="action-icons">
                    {/* Bấm nút Check để Duyệt */}
                    <button 
                      className="ic-btn confirm" 
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      title="Duyệt lịch hẹn"
                    >
                      <Check size={18}/>
                    </button>
                    
                    {/* Bấm nút X để Hủy */}
                    <button 
                      className="ic-btn cancel"
                      onClick={() => handleUpdateStatus(b.id, 'rejected')}
                      title="Hủy lịch hẹn"
                    >
                      <X size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagement;