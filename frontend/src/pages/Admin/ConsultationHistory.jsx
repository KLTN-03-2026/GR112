import React, { useState, useEffect } from 'react';
import './ConsultationHistory.css';
import { Search, User, Bot, Clock, ShieldCheck, AlertTriangle, ChevronRight, Download, Trash2, MessageSquare } from 'lucide-react';

const ConsultationHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🚀 State cho tính năng tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem('token');

  // 1. Tải danh sách phiên chat khi mở trang
  const fetchSessions = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/admin/chat-sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
          if (data.length > 0) handleSelectSession(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Lấy chi tiết tin nhắn
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setMessages([]); // Clear tin nhắn cũ
    
    fetch(`http://localhost:8000/api/admin/chat-sessions/${session.id}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error("Lỗi tải tin nhắn:", err));
  };

  // 🚀 3. Hàm Xuất Lịch sử ra file CSV (Excel)
  const handleExportCSV = () => {
    if (sessions.length === 0) return alert("Không có dữ liệu để xuất!");
    
    // Tạo tiêu đề cột
    const headers = ["ID", "Học sinh", "Email", "Thời gian", "Nội dung tóm tắt"];
    // Map dữ liệu
    const rows = sessions.map(s => [
      s.id, 
      `"${s.user}"`, 
      s.email, 
      s.time, 
      `"${s.preview ? s.preview.replace(/"/g, '""') : ''}"` // Tránh lỗi dấu ngoặc kép trong nội dung
    ]);
    
    // Gộp thành chuỗi CSV (Thêm BOM \uFEFF để Excel không bị lỗi font tiếng Việt)
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    // Tự động tải xuống
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ThongKe_LichSuChat_AI.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 🚀 4. Lọc danh sách theo thanh tìm kiếm
  const filteredSessions = sessions.filter(s => 
    (s.user && s.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.id && s.id.toString().includes(searchTerm))
  );

  return (
    <div className="history-inner-content fade-in">
      {/* HEADER NỘI BỘ */}
      <div className="history-header-row">
        <div className="history-title">
          <div className="history-icon-bg"><MessageSquare size={20} /></div>
          <div>
            <h2>Quản lý lịch sử Tư vấn AI</h2>
            <p>Giám sát và phân tích hội thoại giữa người dùng và Chatbot.</p>
          </div>
        </div>
        <div className="history-actions">
           <div className="search-box-history">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Tìm tên, email hoặc ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Bắt sự kiện gõ phím
              />
           </div>
           <button className="btn-export-history" onClick={handleExportCSV}>
             <Download size={16} /> Xuất CSV
           </button>
        </div>
      </div>

      <div className="history-split-view">
        {/* --- DANH SÁCH PHIÊN BÊN TRÁI --- */}
        <div className="history-list-panel">
          <div className="list-label">DANH SÁCH PHIÊN ({filteredSessions.length})</div>
          <div className="list-scroll custom-scrollbar">
            {loading ? <p style={{padding: 15, textAlign: 'center'}}>Đang tải dữ liệu...</p> : null}
            
            {!loading && filteredSessions.length === 0 ? (
              <p style={{padding: 15, textAlign: 'center', color: '#888'}}>Không tìm thấy phiên nào phù hợp.</p>
            ) : null}

            {/* --- TRONG PHẦN DANH SÁCH BÊN TRÁI --- */}
{filteredSessions.map((s) => (
  <div 
    key={s.id} 
    className={`session-item ${selectedSession?.id === s.id ? 'active' : ''}`}
    onClick={() => handleSelectSession(s)}
  >
    <div className="session-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="session-id">#S-{s.id}</span>
      
      {/* 🚀 Thêm đoạn này: Nếu is_flagged = true thì hiện icon cờ đỏ */}
      {s.is_flagged && (
        <AlertTriangle size={14} color="#ef4444" fill="#fee2e2" />
      )}
    </div>
    
    <h4>{s.user}</h4>
    <p>{s.preview}</p>
    
    <div className="session-bottom">
      <span><Clock size={12} /> {s.time}</span>
      <ChevronRight size={14} />
    </div>
  </div>
))}
          </div>
        </div>

        {/* --- CHI TIẾT HỘI THOẠI BÊN PHẢI --- */}
        <div className="history-chat-panel">
          {selectedSession ? (
            <>
              <div className="chat-detail-header">
                <div className="user-info-chat">
                  <div className="user-avatar-placeholder"><User size={18} /></div>
                  <div>
                    <strong>{selectedSession.user}</strong>
                    <span>{selectedSession.email}</span>
                  </div>
                </div>
                <div className="model-info-pill">
                  <Bot size={14} /> <span>Gemini AI</span>
                </div>
              </div>

              {/* KHUNG HIỂN THỊ TIN NHẮN */}
              <div className="chat-messages-box custom-scrollbar">
                {messages.length === 0 ? <p style={{textAlign: 'center', marginTop: 20}}>Đang tải tin nhắn...</p> : null}
                
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-row ${msg.sender}`}>
                    {msg.sender === 'bot' && <div className="bot-ico"><Bot size={14} /></div>}
                    
                    <div className="bubble">
                      {/* Hiển thị văn bản (Nếu có) */}
                      {msg.content && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                      
                      {/* 🚀 Hiển thị Hình ảnh (Nếu có và khác Null) */}
                      {msg.image_data && msg.image_data !== "(Null)" && msg.image_data !== "null" && (
                        <div style={{ marginTop: msg.content ? '10px' : '0' }}>
                          <img 
                            src={msg.image_data} 
                            alt="Ảnh đính kèm" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px',
                              borderRadius: '8px', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              objectFit: 'contain'
                            }} 
                          />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {/* AI INSIGHTS FOOTER */}
              <div className="chat-analysis-footer">
                <div className="insights-card">
                  <div className="insight-head"><ShieldCheck size={14} /> <span>AI INSIGHTS</span></div>
                  <div className="insight-grid">
                    <div className="insight-item"><span>Phiên bản:</span> <strong>Gemini 1.5 Flash</strong></div>
                    <div className="insight-item"><span>Tổng tin nhắn:</span> <strong>{messages.length}</strong></div>
                  </div>
                </div>
                <div className="chat-action-btns">
                  <button 
  // Nếu đã gắn cờ thì thêm class 'active-flag' để đổi màu đỏ
  className={`btn-flag ${selectedSession.is_flagged ? 'active-flag' : ''}`} 
  onClick={() => {
    fetch(`http://localhost:8000/api/admin/chat-sessions/${selectedSession.id}/flag`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        // 1. Cập nhật giao diện bên phải ngay lập tức
        setSelectedSession({...selectedSession, is_flagged: data.is_flagged});
        
        // 2. Cập nhật lại danh sách bên trái để có dấu hiệu nhận biết
        fetchSessions(); 
      }
    })
    .catch(err => console.error("Lỗi gắn cờ:", err));
  }}
>
  <AlertTriangle size={14} /> 
  {selectedSession.is_flagged ? "Đã Gắn cờ" : "Gắn cờ"}
</button>
                  <button 
  className="btn-del" 
  onClick={() => {
    // 1. Hỏi lại cho chắc chắn tránh lỡ tay bấm nhầm
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử của phiên chat này không? Dữ liệu không thể khôi phục.")) {
      
      // 2. Gọi API Xóa
      fetch(`http://localhost:8000/api/admin/chat-sessions/${selectedSession.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          alert("✅ Đã xóa thành công!");
          setSelectedSession(null); // Ẩn khung chat bên phải đi
          fetchSessions();          // Load lại danh sách bên trái
        } else {
          alert("❌ Có lỗi xảy ra khi xóa!");
        }
      })
      .catch(err => console.error("Lỗi xóa:", err));
    }
  }}
>
  <Trash2 size={14} /> Xóa log
</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888'}}>
              Vui lòng chọn một phiên chat để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistory;