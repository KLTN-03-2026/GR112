import React, { useState, useEffect } from 'react';
import './AISystemManagement.css';
import { 
  Activity, Database, CheckCircle2, Globe, 
  RotateCcw, Sparkles, Send, Zap
} from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2

const AISystemManagement = () => {
  const token = localStorage.getItem('token');
  
  // 1. STATE BẢO VỆ: Luôn có dữ liệu mặc định để không bị Crash Web
  const [dashboardData, setDashboardData] = useState({ 
    stats: { 
      total_tokens: '0.00M', 
      total_sessions: '0', 
      response_time: '0ms', 
      success_rate: '0%', 
      token_trend: 'Đang kết nối...' 
    }, 
    logs: [] 
  });
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0, status: 'ĐANG TẢI...' });
  const [isTesting, setIsTesting] = useState(false);

  // 2. GỌI API LẤY DATA (Có bọc lỗi try-catch)
  const fetchDashboardData = () => {
    fetch('http://localhost:8000/api/admin/ai/dashboard', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      // Chỉ cập nhật nếu backend trả về đúng cấu trúc và không có lỗi
      if(data && !data.error && data.stats) {
        setDashboardData(data); 
      }
    })
    .catch(err => console.error("⚠️ Lỗi kết nối Dashboard AI:", err));
  };

  const fetchSystemStats = () => {
    fetch('http://localhost:8000/api/admin/ai/system-stats', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if(data && !data.error) setSysStats(data);
    })
    .catch(err => console.error("⚠️ Lỗi kết nối Server Stats:", err));
  };

  // Tự động load khi vào trang
  useEffect(() => {
    fetchDashboardData();
    fetchSystemStats();
    // Mỗi 10 giây quét CPU/RAM 1 lần
    const interval = setInterval(fetchSystemStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // 3. GỌI API TEST GEMINI (🚀 ĐÃ ĐỘ LẠI BẰNG SWEETALERT2)
  const handleTestGemini = async () => {
    // 🚀 Dùng Swal có input thay vì window.prompt xấu xí
    const { value: promptText } = await Swal.fire({
      title: 'Trò chuyện với AI',
      input: 'text',
      inputLabel: 'Bạn muốn hỏi Gemini 2.5 Flash điều gì?',
      inputPlaceholder: 'Nhập câu hỏi của bạn vào đây...',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Gửi câu hỏi <i class="fas fa-paper-plane"></i>',
      cancelButtonText: 'Hủy',
      borderRadius: '16px'
    });

    if (!promptText) return; // Người dùng bấm Hủy hoặc không nhập gì

    setIsTesting(true);

    // Có thể hiện thêm 1 Swal loading cho nó chuyên nghiệp
    Swal.fire({
      title: 'AI đang suy nghĩ...',
      text: 'Vui lòng đợi trong giây lát!',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    fetch('http://localhost:8000/api/admin/ai/test-gemini', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ prompt: promptText })
    })
    .then(res => res.json())
    .then(data => {
      setIsTesting(false);
      if (data.error) {
        Swal.fire('Lỗi AI!', data.error, 'error');
      } else {
        // 🚀 Hiện kết quả trả về bằng Swal siêu đẹp
        Swal.fire({
          title: `🤖 [${data.model_used}]`,
          text: data.reply,
          icon: 'info',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Tuyệt vời!',
          borderRadius: '16px'
        });
      }
    })
    .catch(() => { 
      setIsTesting(false); 
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến Backend! Hãy chắc chắn Server Python đang chạy.', 'error');
    });
  };

  // 🛡️ LỚP GIÁP CUỐI CÙNG: Đảm bảo biến luôn tồn tại, không bị undefined
  const stats = dashboardData?.stats || {};
  const logs = dashboardData?.logs || [];

  return (
    <div className="ai-mgmt-content fade-in">
      {/* HEADER */}
      <div className="ai-header-row">
        <div className="ai-title-area">
          <h2>Quản lý Hệ thống AI</h2>
          <p>Bảng điều khiển chuyên biệt cho mô hình lõi Gemini 2.5 Flash.</p>
        </div>
        <div className="ai-system-status">
           <span className="status-label-top">HỆ THỐNG LÕI:</span>
           <span className="status-value-top" style={{ color: sysStats.status === 'QUÁ TẢI' ? '#ef4444' : '#10b981' }}>
             <span className="dot-live" style={{ background: sysStats.status === 'QUÁ TẢI' ? '#ef4444' : '#10b981' }}></span> 
             {sysStats.status || 'MẤT KẾT NỐI'}
           </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="ai-stats-grid">
        <div className="ai-stat-card">
          <div className="ai-card-head"><span>TỔNG TOKEN (24H)</span><Zap size={16} /></div>
          <div className="ai-card-body">
            <h3>{stats.total_tokens || '0.00M'}</h3>
            <div className="ai-progress"><div className="ai-fill" style={{width: '20%', background: '#3b82f6'}}></div></div>
            <span className="ai-trend">{stats.token_trend || '...'}</span>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-card-head"><span>TỐC ĐỘ PHẢN HỒI</span><Activity size={16} /></div>
          <div className="ai-card-body">
            <h3>{stats.response_time || '0ms'}</h3>
            <div className="ai-mini-chart">
              {[30, 40, 20, 50, 35, 25].map((h, i) => <div key={i} className="ai-bar" style={{height: `${h}%`, background: '#10b981'}}></div>)}
            </div>
            <span className="ai-trend-stable" style={{color: '#10b981'}}>Siêu tốc (Flash Model)</span>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-card-head"><span>TỶ LỆ THÀNH CÔNG</span><CheckCircle2 size={16} /></div>
          <div className="ai-card-body">
            <h3>{stats.success_rate || '0%'}</h3>
            <p className="ai-sub-text">Đã xử lý {stats.total_sessions || '0'} phiên tư vấn</p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="ai-main-grid">
        <div className="ai-llm-section">
          <div className="section-head-ai">
            <h3>Cấu hình Mô hình Lõi</h3>
            <button className="btn-refresh-ai" onClick={handleTestGemini} disabled={isTesting} style={{ background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isTesting ? 'Đang suy nghĩ...' : <><Send size={14}/> Trò chuyện với Gemini</>}
            </button>
          </div>
          <div className="ai-model-list">
            <div className="ai-model-item active" style={{ border: '2px solid #3b82f6', background: '#f8fafc' }}>
              <div className="ai-model-icon" style={{ background: '#eff6ff' }}><Sparkles size={24} color="#3b82f6"/></div>
              <div className="ai-model-info">
                <h4 style={{ color: '#1e293b', fontSize: '18px' }}>Gemini 2.5 Flash</h4>
                <p style={{ color: '#475569' }}>Cung cấp bởi Google - Tốc độ siêu tốc, xử lý đa phương tiện</p>
              </div>
              <div className="ai-model-actions"><span className="ai-tag using" style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', fontSize: '13px' }}>Đang hoạt động</span></div>
            </div>
          </div>
        </div>

        <div className="ai-server-section">
          <div className="ai-server-card">
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <h4><Globe size={14}/> Trạng thái Máy chủ Local</h4>
              <button onClick={fetchSystemStats} style={{background: 'none', border:'none', cursor:'pointer', color:'#64748b'}}><RotateCcw size={14}/></button>
            </div>
            <div className="ai-res-item">
              <div className="ai-res-info"><span>CPU USAGE</span> <span>{sysStats.cpu || 0}%</span></div>
              <div className="ai-res-bar"><div className="ai-res-fill" style={{width: `${sysStats.cpu || 0}%`, background: sysStats.cpu > 80 ? '#ef4444' : '#3b82f6', transition: 'width 0.5s'}}></div></div>
            </div>
            <div className="ai-res-item">
              <div className="ai-res-info"><span>RAM USAGE</span> <span>{sysStats.ram || 0}%</span></div>
              <div className="ai-res-bar danger"><div className="ai-res-fill" style={{width: `${sysStats.ram || 0}%`, background: sysStats.ram > 80 ? '#ef4444' : '#f59e0b', transition: 'width 0.5s'}}></div></div>
            </div>
            <div className="ai-server-foot">Node: ASIA-SOUTHEAST-1</div>
          </div>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="ai-training-table-card">
        <h3>Nhật ký Đồng bộ Dữ liệu</h3>
        <table className="ai-table">
          <thead>
            <tr><th>TÁC VỤ</th><th>THỜI GIAN</th><th>TRẠNG THÁI</th><th>CỠ FILE</th></tr>
          </thead>
          <tbody>
  {logs.map(log => (
    <tr key={log.id}>
      <td>
        <strong>{log.task}</strong><br/>
        <small>{log.source}</small>
      </td>
      <td>{log.time}</td>
      <td>
        {/* Nếu isRunning là true (giá trị 1 từ DB), hiện màu xanh dương */}
        <span style={{ color: log.isRunning ? '#3b82f6' : '#10b981', fontWeight: 'bold' }}>
          {log.status}
        </span>
      </td>
      <td>{log.size}</td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default AISystemManagement;