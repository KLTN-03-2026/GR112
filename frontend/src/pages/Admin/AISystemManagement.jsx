import React, { useState, useEffect } from 'react';
import './AISystemManagement.css';
import { 
  Activity, Database, CheckCircle2, Globe, 
  RotateCcw, Sparkles, Send, Zap,
  Edit3, Trash2, Plus // 🚀 Đã import thêm 3 Icon cho Thêm, Sửa, Xóa
} from 'lucide-react';
import Swal from 'sweetalert2'; 

const AISystemManagement = () => {
  const token = localStorage.getItem('token');
  
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

  const fetchDashboardData = () => {
    fetch('https://gr112.onrender.com/api/admin/ai/dashboard', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if(data && !data.error && data.stats) {
        setDashboardData(data); 
      }
    })
    .catch(err => console.error("⚠️ Lỗi kết nối Dashboard AI:", err));
  };

  const fetchSystemStats = () => {
    fetch('https://gr112.onrender.com/api/admin/ai/system-stats', {
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

  useEffect(() => {
    fetchDashboardData();
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTestGemini = async () => {
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

    if (!promptText) return; 

    setIsTesting(true);

    Swal.fire({
      title: 'AI đang suy nghĩ...',
      text: 'Vui lòng đợi trong giây lát!',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    fetch('https://gr112.onrender.com/api/admin/ai/test-gemini', {
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
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến Backend!', 'error');
    });
  };

  // ===================== XỬ LÝ NÚT ĐỒNG BỘ THẬT =====================
  const handleSyncData = async () => {
    Swal.fire({
      title: 'Đang nạp dữ liệu vào AI...',
      html: 'Hệ thống đang đồng bộ dữ liệu Trường Đại học mới nhất.<br/>Vui lòng không đóng trang!',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const res = await fetch('https://gr112.onrender.com/api/admin/ai/sync-data', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if(data.error) throw new Error(data.error);

      Swal.fire({
        title: 'Hoàn tất!',
        text: 'Dữ liệu đã được đồng bộ thành công vào mô hình AI.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      fetchDashboardData(); 

    } catch(err) {
      Swal.fire('Lỗi đồng bộ!', err.message || 'Không thể kết nối Server', 'error');
    }
  };

  // ===================== CRUD LOGS THỦ CÔNG (TẠO ẢO) =====================
  const handleAddLogManual = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm Nhật ký mới',
      html: `
        <div style="text-align: left;">
          <label style="font-size: 13px; font-weight: bold; color: #64748b;">Tên tác vụ</label>
          <input id="swal-task" class="swal2-input" style="margin-top: 5px;" placeholder="VD: Nạp Vector mới">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Nguồn dữ liệu</label>
          <input id="swal-source" class="swal2-input" style="margin-top: 5px;" placeholder="VD: DB: university_data">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Trạng thái</label>
          <select id="swal-status" class="swal2-select" style="width: 100%; margin-top: 5px;">
            <option value="Hoàn tất">Hoàn tất</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Lỗi">Báo Lỗi</option>
          </select>
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Dung lượng (Nếu có)</label>
          <input id="swal-size" class="swal2-input" style="margin-top: 5px;" placeholder="VD: 15.5MB">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu lại',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        return {
          task: document.getElementById('swal-task').value || 'Không tên',
          source: document.getElementById('swal-source').value || 'Không rõ',
          status: document.getElementById('swal-status').value,
          size: document.getElementById('swal-size').value || '0MB'
        }
      }
    });

    if (formValues) {
      fetch('https://gr112.onrender.com/api/admin/ai/logs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      }).then(res => res.json()).then(() => {
        Swal.fire('Thành công!', 'Đã thêm 1 dòng nhật ký.', 'success');
        fetchDashboardData();
      }).catch(() => Swal.fire('Lỗi', 'Không thể thêm nhật ký', 'error'));
    }
  };

  const handleEditLog = async (log) => {
    const { value: formValues } = await Swal.fire({
      title: 'Sửa Nhật ký',
      html: `
        <div style="text-align: left;">
          <label style="font-size: 13px; font-weight: bold; color: #64748b;">Tên tác vụ</label>
          <input id="swal-task" class="swal2-input" style="margin-top: 5px;" value="${log.task}">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Nguồn dữ liệu</label>
          <input id="swal-source" class="swal2-input" style="margin-top: 5px;" value="${log.source}">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Trạng thái</label>
          <select id="swal-status" class="swal2-select" style="width: 100%; margin-top: 5px;">
            <option value="Hoàn tất" ${log.status === 'Hoàn tất' ? 'selected' : ''}>Hoàn tất</option>
            <option value="Đang xử lý" ${log.status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
            <option value="Lỗi" ${log.status === 'Lỗi' ? 'selected' : ''}>Báo Lỗi</option>
          </select>
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 15px; display: block;">Dung lượng</label>
          <input id="swal-size" class="swal2-input" style="margin-top: 5px;" value="${log.size}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        return {
          task: document.getElementById('swal-task').value,
          source: document.getElementById('swal-source').value,
          status: document.getElementById('swal-status').value,
          size: document.getElementById('swal-size').value
        }
      }
    });

    if (formValues) {
      fetch(`https://gr112.onrender.com/api/admin/ai/logs/${log.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      }).then(res => res.json()).then(() => {
        Swal.fire('Thành công!', 'Đã sửa thông tin nhật ký.', 'success');
        fetchDashboardData();
      }).catch(() => Swal.fire('Lỗi', 'Không thể sửa nhật ký', 'error'));
    }
  };

  const handleDeleteLog = (id) => {
    Swal.fire({
      title: 'Xóa dòng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://gr112.onrender.com/api/admin/ai/logs/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(() => {
          fetchDashboardData();
        }).catch(() => Swal.fire('Lỗi', 'Không thể xóa', 'error'));
      }
    });
  };

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

      {/* 🚀 BẢNG LOGS ĐÃ ĐƯỢC ĐỘ FULL CHỨC NĂNG */}
      <div className="ai-training-table-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
          <h3 style={{margin: 0}}>Nhật ký Đồng bộ Dữ liệu</h3>
          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={handleAddLogManual} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16}/> Thêm thủ công
            </button>
            <button onClick={handleSyncData} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16}/> Chạy Auto Sync
            </button>
          </div>
        </div>
        
        <table className="ai-table">
          <thead>
            <tr>
              <th>TÁC VỤ</th>
              <th>THỜI GIAN</th>
              <th>TRẠNG THÁI</th>
              <th>CỠ FILE</th>
              <th style={{textAlign: 'center'}}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Chưa có dữ liệu đồng bộ nào. Hãy bấm "Thêm thủ công"!</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.task}</strong><br/>
                    <small>{log.source}</small>
                  </td>
                  <td>{log.time}</td>
                  <td>
                    <span style={{ color: log.status === 'Lỗi' ? '#ef4444' : (log.status === 'Đang xử lý' || log.isRunning ? '#3b82f6' : '#10b981'), fontWeight: 'bold' }}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.size}</td>
                  <td style={{textAlign: 'center'}}>
                    <button onClick={() => handleEditLog(log)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '10px'}} title="Sửa"><Edit3 size={18}/></button>
                    <button onClick={() => handleDeleteLog(log.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}} title="Xóa"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AISystemManagement;