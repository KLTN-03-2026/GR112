import React, { useState, useEffect } from 'react'; // 🚀 Thêm useState, useEffect
import { Search, Filter, MoreHorizontal, Check, X, Download } from 'lucide-react';
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

  // 3. Hàm xử lý Duyệt/Hủy cho Admin
  const handleUpdateStatus = (id, newStatus) => {
    if(!window.confirm(`Bạn có chắc muốn chuyển trạng thái sang ${newStatus}?`)) return;

    fetch(`http://localhost:8000/api/admin/bookings/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(() => {
      // Cập nhật lại giao diện ngay lập tức
      setAllBookings(allBookings.map(b => b.id === id ? {...b, status: newStatus} : b));
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
                    {b.status === 'completed' ? 'Hoàn thành' : b.status === 'pending' ? 'Chờ duyệt' : 'Đã chốt'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="action-icons">
                    {/* Bấm nút Check để Duyệt */}
                    <button 
                      className="ic-btn confirm" 
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                    >
                      <Check size={18}/>
                    </button>
                    
                    {/* Bấm nút X để Hủy */}
                    <button 
                      className="ic-btn cancel"
                      onClick={() => handleUpdateStatus(b.id, 'rejected')}
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