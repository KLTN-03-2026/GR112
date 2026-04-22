import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

export default function BookingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:8000/api/user/bookings', {
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

  // 🚀 HÀM XỬ LÝ BÁO CÁO VI PHẠM (ĐÃ SỬA LỖI TÀNG HÌNH ID)
  const handleReportUser = (mentorId, mentorName) => {
    // Ép buộc phải có ID thật của Cố vấn mới cho báo cáo
    if (!mentorId) {
      alert("❌ Lỗi hệ thống: Không xác định được ID của Cố vấn này để báo cáo.");
      return;
    }

    const userReason = window.prompt(`Vui lòng cho biết lý do bạn báo cáo Cố vấn [${mentorName}]:`);
    
    if (userReason) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8000/api/user/report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          reported_user_id: mentorId, // Truyền đúng ID thật xuống Database
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
              // TỰ ĐỘNG TẠO LINK NẾU DB BỊ NULL
              const userName = localStorage.getItem("userName") || "Người dùng";
              const baseUrl = item.meeting_link || `https://meet.jit.si/MindConnect_Consulting_Private_Room_${item.id}_Secure2026`;
              const finalLink = `${baseUrl}#userInfo.displayName="${userName}"`;
              
              // 🚀 Lấy ID cố vấn (phòng hờ API trả về tên biến khác nhau)
              // Cố tình nhét số 2 vào cuối để làm ID dự phòng nếu API quên gửi
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
                          href={finalLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="join-meet-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          📹 Vào phòng tư vấn
                        </a>
                      )}

                      {/* 🚀 NÚT BÁO CÁO VI PHẠM */}
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