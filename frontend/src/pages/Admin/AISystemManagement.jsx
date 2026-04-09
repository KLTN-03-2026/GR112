import React from 'react';
import './AISystemManagement.css';
import { 
  Cpu, Activity, Database, HeartPulse, Zap, 
  BarChart3, CheckCircle2, Globe, RotateCcw, 
  MoreVertical, StopCircle, Sparkles
} from 'lucide-react';

const AISystemManagement = () => {
  const models = [
    { id: 1, name: 'GPT-4o', provider: 'OpenAI', desc: 'Đỉnh cao về lập luận & ngôn ngữ', status: 'Đang hoạt động', active: false },
    { id: 2, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Độ chính xác & an toàn cao', status: 'Đang sử dụng', active: true },
    { id: 3, name: 'Gemini 3.1 Pro', provider: 'Google', desc: 'Xử lý ngữ cảnh cực lớn', status: 'Ngoại tuyến', active: false, offline: true },
  ];

  const trainingLogs = [
    { id: 1, task: 'Cập nhật Quy chế Tuyển sinh 2024', source: 'moet.gov.vn', time: '14:20 - 24/05/2024', status: 'HOÀN TẤT', size: '2.4 MB' },
    { id: 2, task: 'Tối ưu hóa Vector Embeddings', source: 'Vector DB Nội bộ', time: '09:15 - 24/05/2024', status: 'THÀNH CÔNG', size: 'N/A' },
    { id: 3, task: 'Crawl Website ĐH Bách Khoa', source: 'hust.edu.vn', time: 'Đang chạy...', status: '65%', isRunning: true, size: '1.1 MB' },
  ];

  return (
    <div className="ai-mgmt-content">
      {/* HEADER NỘI BỘ */}
      <div className="ai-header-row">
        <div className="ai-title-area">
          <h2>Quản lý Hệ thống AI</h2>
          <p>Bảng điều khiển tập trung cho các mô hình ngôn ngữ lớn và dữ liệu huấn luyện.</p>
        </div>
        <div className="ai-system-status">
           <span className="status-label-top">HỆ THỐNG:</span>
           <span className="status-value-top"><span className="dot-live"></span> SẴN SÀNG</span>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="ai-stats-grid">
        <div className="ai-stat-card">
          <div className="ai-card-head"><span>TỔNG TOKEN (24H)</span><Zap size={16} /></div>
          <div className="ai-card-body">
            <h3>1.28M</h3>
            <div className="ai-progress"><div className="ai-fill" style={{width: '70%'}}></div></div>
            <span className="ai-trend">+12% so với hôm qua</span>
          </div>
        </div>
        <div className="ai-stat-card">
          <div className="ai-card-head"><span>PHẢN HỒI TRUNG BÌNH</span><Activity size={16} /></div>
          <div className="ai-card-body">
            <h3>840ms</h3>
            <div className="ai-mini-chart">
              {[30, 50, 40, 70, 45, 60].map((h, i) => <div key={i} className="ai-bar" style={{height: `${h}%`}}></div>)}
            </div>
            <span className="ai-trend-stable">Trạng thái: Ổn định</span>
          </div>
        </div>
        <div className="ai-stat-card">
          <div className="ai-card-head"><span>TỶ LỆ THÀNH CÔNG</span><CheckCircle2 size={16} /></div>
          <div className="ai-card-body">
            <h3>99.82%</h3>
            <p className="ai-sub-text">45,120 tư vấn thành công</p>
            <div className="ai-users-mini">
              <div className="u-circ">U</div><div className="u-circ">A</div><span className="u-more">+1k</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-main-grid">
        {/* LLM CONFIGURATION */}
        <div className="ai-llm-section">
          <div className="section-head-ai">
            <h3>Cấu hình Mô hình LLM</h3>
            <button className="btn-refresh-ai"><RotateCcw size={14}/> Làm mới</button>
          </div>
          <div className="ai-model-list">
            {models.map(model => (
              <div key={model.id} className={`ai-model-item ${model.active ? 'active' : ''}`}>
                <div className="ai-model-icon">
                  {model.id === 1 ? <Database size={18}/> : model.id === 2 ? <Sparkles size={18}/> : <BarChart3 size={18}/>}
                </div>
                <div className="ai-model-info">
                  <h4>{model.name}</h4>
                  <p>{model.provider} - {model.desc}</p>
                </div>
                <div className="ai-model-actions">
                  <span className={`ai-tag ${model.active ? 'using' : model.offline ? 'off' : 'on'}`}>{model.status}</span>
                  <button className={`ai-btn-select ${model.active ? 'selected' : ''}`}>
                    {model.active ? 'Đã chọn' : 'Chọn'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SERVER & API STATUS */}
        <div className="ai-server-section">
          <div className="ai-server-card">
            <h4><Globe size={14}/> Trạng thái Máy chủ</h4>
            <div className="ai-res-item">
              <div className="ai-res-info"><span>CPU USAGE</span> <span>42%</span></div>
              <div className="ai-res-bar"><div className="ai-res-fill" style={{width: '42%'}}></div></div>
            </div>
            <div className="ai-res-item">
              <div className="ai-res-info"><span>VRAM (MEM)</span> <span>88%</span></div>
              <div className="ai-res-bar danger"><div className="ai-res-fill" style={{width: '88%'}}></div></div>
            </div>
            <div className="ai-server-foot">Node: ASIA-SOUTHEAST-1</div>
          </div>

          <div className="ai-api-card">
            <h4>SỨC KHỎE API KEY</h4>
            <div className="api-row-item"><span>OpenAI Prod</span> <span className="api-ok">TỐT</span></div>
            <div className="api-row-item"><span>Google Vertex</span> <span className="api-warn">LIMIT</span></div>
          </div>
        </div>
      </div>

      {/* TRAINING LOGS */}
      <div className="ai-training-table-card">
        <div className="section-head-ai">
          <h3>Huấn luyện & Cơ sở kiến thức</h3>
          <button className="btn-crawl-ai"><Zap size={14}/> Crawl Thủ công</button>
        </div>
        <table className="ai-table">
          <thead>
            <tr>
              <th>NGUỒN / TÁC VỤ</th>
              <th>THỜI GIAN</th>
              <th>TRẠNG THÁI</th>
              <th>CỠ FILE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trainingLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <div className="ai-log-cell">
                    <Database size={14} />
                    <div><strong>{log.task}</strong><span>{log.source}</span></div>
                  </div>
                </td>
                <td>{log.time}</td>
                <td>
                  {log.isRunning ? (
                    <div className="ai-prog-cell">
                      <div className="ai-mini-prog"><div className="ai-mini-fill" style={{width: log.status}}></div></div>
                      {log.status}
                    </div>
                  ) : <span className="ai-done-tag">{log.status}</span>}
                </td>
                <td>{log.size}</td>
                <td><MoreVertical size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AISystemManagement;