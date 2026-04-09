import React, { useState } from 'react';
import './ConsultationHistory.css';
import { 
  Search, Filter, User, Bot, Clock, 
  ShieldCheck, AlertTriangle, ChevronRight,
  Download, Trash2, MessageSquare
} from 'lucide-react';

const ConsultationHistory = () => {
  const [selectedSession, setSelectedSession] = useState(1);

  const sessions = [
    { id: 1, user: 'Nguyễn Minh Tú', email: 'tunm@gmail.com', time: '10:45 - 06/04/2026', preview: 'Tư vấn về ngành AI và Khoa học máy tính...', status: 'Hoàn thành', sentiment: 'Tích cực' },
    { id: 2, user: 'Lê Thùy Chi', email: 'chilt@yahoo.com', time: '09:20 - 06/04/2026', preview: 'Học phí trường Đại học Bách Khoa...', status: 'Đang chat', sentiment: 'Trung tính' },
    { id: 3, user: 'Trần Hoàng Nam', email: 'namth@hotmail.com', time: 'Hôm qua', preview: 'So sánh Ngoại thương và Kinh tế quốc dân...', status: 'Hoàn thành', sentiment: 'Tích cực' },
  ];

  return (
    <div className="history-inner-content">
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
              <input type="text" placeholder="Tìm tên, email hoặc ID..." />
           </div>
           <button className="btn-export-history"><Download size={16} /> Xuất CSV</button>
        </div>
      </div>

      <div className="history-split-view">
        {/* DANH SÁCH PHIÊN BÊN TRÁI */}
        <div className="history-list-panel">
          <div className="list-label">TẤT CẢ PHIÊN (128)</div>
          <div className="list-scroll custom-scrollbar">
            {sessions.map((s) => (
              <div 
                key={s.id} 
                className={`session-item ${selectedSession === s.id ? 'active' : ''}`}
                onClick={() => setSelectedSession(s.id)}
              >
                <div className="session-top">
                  <span className="session-id">#S-{s.id}902</span>
                  <span className={`status-dot ${s.status === 'Đang chat' ? 'online' : ''}`}></span>
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

        {/* CHI TIẾT HỘI THOẠI BÊN PHẢI */}
        <div className="history-chat-panel">
          <div className="chat-detail-header">
            <div className="user-info-chat">
              <div className="user-avatar-placeholder"><User size={18} /></div>
              <div>
                <strong>Nguyễn Minh Tú</strong>
                <span>Học sinh • tunm@gmail.com</span>
              </div>
            </div>
            <div className="model-info-pill">
              <Bot size={14} /> <span>Claude 3.5 Sonnet</span>
            </div>
          </div>

          <div className="chat-messages-box custom-scrollbar">
            <div className="chat-row user">
              <div className="bubble">Chào bạn, mình muốn hỏi về ngành Trí tuệ nhân tạo (AI) tại ĐH Bách Khoa Hà Nội. Điểm chuẩn năm ngoái là bao nhiêu ạ?</div>
            </div>
            <div className="chat-row bot">
              <div className="bot-ico"><Bot size={14} /></div>
              <div className="bubble">
                Chào Tú! Ngành Trí tuệ nhân tạo (IT-E10) tại ĐH Bách Khoa HN có điểm chuẩn năm 2023 là 28.29 điểm. 
                Bạn có cần mình tư vấn thêm về tổ hợp môn không?
              </div>
            </div>
            <div className="chat-row user">
              <div className="bubble">Học phí ngành này có cao không bạn?</div>
            </div>
            <div className="chat-row bot">
              <div className="bot-ico"><Bot size={14} /></div>
              <div className="bubble">Học phí chương trình Elitech rơi vào khoảng 35-40 triệu đồng/năm học bạn nhé.</div>
            </div>
          </div>

          <div className="chat-analysis-footer">
            <div className="insights-card">
              <div className="insight-head"><ShieldCheck size={14} /> <span>AI INSIGHTS</span></div>
              <div className="insight-grid">
                <div className="insight-item"><span>Thái độ:</span> <strong className="text-green">Tích cực</strong></div>
                <div className="insight-item"><span>Độ chính xác:</span> <strong>98%</strong></div>
                <div className="insight-item"><span>Thời gian:</span> <strong>4m 12s</strong></div>
              </div>
            </div>
            <div className="chat-action-btns">
              <button className="btn-flag"><AlertTriangle size={14} /> Gắn cờ</button>
              <button className="btn-del"><Trash2 size={14} /> Xóa log</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistory;