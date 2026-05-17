import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

export default function BookingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('https://gr112.onrender.com/api/user/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.bookings) {
          setHistory(data.bookings);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải lịch sử:", err);
        setLoading(false);
      });
  }, []);

  const handleReportUser = (mentorId, mentorName) => {
    if (!mentorId) {
      alert("❌ Lỗi hệ thống: Không xác định được ID của Cố vấn này để báo cáo.");
      return;
    }

    const userReason = window.prompt(`Vui lòng cho biết lý do bạn báo cáo Cố vấn [${mentorName}]:`);
    
    if (userReason) {
      const token = localStorage.getItem('token');
      fetch('https://gr112.onrender.com/api/user/report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          reported_user_id: mentorId, 
          reason: userReason
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          alert("❌ Lỗi: " + data.error);
        } else {
          alert("✅ Đã gửi báo cáo thành công! Quản trị viên sẽ xem xét sớm nhất.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("❌ Có lỗi xảy ra khi gửi báo cáo.");
      });
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">⏳ Đang chờ duyệt</span>;
      case 'confirmed':
        return <span className="status-badge confirmed">✅ Đã chốt lịch</span>;
      case 'rejected':
        return <span className="status-badge rejected">❌ Đã từ chối</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) return <div className="history-container"><p>Đang tải lịch sử...</p></div>;

  return (
    <div className="history-container">
      <h2>Lịch sử tư vấn của tôi</h2>
      
      {history.length === 0 ? (
        <p className="empty-history">Bạn chưa đặt lịch hẹn nào.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Cố vấn</th>
              <th>Thời gian</th>
              <th>Chủ đề</th>
              <th>Trạng thái & Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => {
              // 🚀 1. TẠO URL CHUẨN XÁC ĐỂ TRUYỀN VÀO NÚT BẤM (KHÔNG DÙNG WINDOW.OPEN Ở ĐÂY)
              const roomName = `MindConnect_Room_${item.id}`;
              const url = `https://meet.jit.si/${roomName}`;              
              
              // Lấy ID cố vấn (phòng hờ API trả về tên biến khác nhau)
              const realMentorId = item.mentorId || item.mentor_id || item.consultant_id || 2;

              return (
                <tr key={item.id}>
                  <td><strong>{item.mentorName}</strong></td>
                  <td>
                    <div className="time-text">{item.time}</div>
                    <div className="date-text">{item.date}</div>
                  </td>
                  <td>{item.topic}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      {renderStatus(item.status)}
                      
                      {/* CHỈ HIỆN NÚT VÀO PHÒNG KHI ĐÃ CONFIRMED */}
                      {item.status === 'confirmed' && (
                        <a 
                          href={url} /* 🚀 2. GẮN ĐÚNG CÁI LINK VỪA TẠO VÀO ĐÂY */
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="join-meet-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          📹 Vào phòng tư vấn
                        </a>
                      )}

                      {/* NÚT BÁO CÁO VI PHẠM */}
                      <button 
                        onClick={() => handleReportUser(realMentorId, item.mentorName)}
                        style={{ 
                          background: '#fee2e2', 
                          color: '#ef4444', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Báo cáo nếu cố vấn có hành vi không phù hợp"
                      >
                        🚩 Báo cáo vi phạm
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}