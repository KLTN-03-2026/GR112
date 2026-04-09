import React from 'react';
import './AdmissionManagement.css';
import { 
  Database, Plus, Upload, Search, Filter, 
  Edit3, Trash2, TrendingUp, BarChart2,
  ChevronLeft, ChevronRight, ArrowUpRight
} from 'lucide-react';

const AdmissionManagement = () => {
  const admissionData = [
    { id: 1, school: "Đại học Bách Khoa Hà Nội", major: "Khoa học máy tính", code: "IT1", quota: 300, score2023: 28.29, blocks: "A00, A01", method: "Thi tốt nghiệp" },
    { id: 2, school: "Đại học Kinh tế Quốc dân", major: "Logistics & Chuỗi cung ứng", code: "N01", quota: 150, score2023: 27.4, blocks: "A00, D01", method: "Xét tuyển kết hợp" },
    { id: 3, school: "Đại học Ngoại Thương", major: "Kinh tế đối ngoại", code: "NTH01", quota: 450, score2023: 28.5, blocks: "A00, A01, D01", method: "Thi tốt nghiệp" },
  ];

  return (
    <div className="adm-inner-content">
      {/* HEADER NỘI BỘ TRANG */}
      <div className="adm-header-row">
        <div className="adm-title-area">
          <div className="adm-icon-wrapper"><Database size={20} /></div>
          <div>
            <h2> Quản lý dữ liệu Tuyển sinh</h2>
            <p>Quản lý điểm chuẩn, chỉ tiêu và phương thức xét tuyển các trường.</p>
          </div>
        </div>
        <div className="adm-header-btns">
          <button className="btn-adm-secondary"><Upload size={16} /> Import Excel</button>
          <button className="btn-adm-primary"><Plus size={16} /> Thêm mới</button>
        </div>
      </div>

      {/* QUICK STATS - THIẾT KẾ LẠI GỌN HƠN */}
      <div className="adm-stats-grid">
        <div className="adm-mini-stat">
          <span className="mini-label">TỔNG SỐ NGÀNH</span>
          <div className="mini-value">1,450 <small>+24</small></div>
        </div>
        <div className="adm-mini-stat">
          <span className="mini-label">CHỈ TIÊU HỆ THỐNG</span>
          <div className="mini-value">85,200 <BarChart2 size={16} /></div>
        </div>
        <div className="adm-mini-stat highlight">
          <span className="mini-label">DỰ BÁO BIẾN ĐỘNG</span>
          <div className="mini-value">+0.5 - 1.5 <TrendingUp size={16} /></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="adm-toolbar-row">
        <div className="adm-search-wrap">
          <Search size={16} />
          <input type="text" placeholder="Tìm tên trường, mã ngành..." />
        </div>
        <div className="adm-filter-wrap">
          <select><option>Năm: 2024</option></select>
          <button className="btn-filter-icon"><Filter size={16} /></button>
        </div>
      </div>

      {/* TABLE */}
      <div className="adm-table-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>TRƯỜNG ĐẠI HỌC</th>
              <th>NGÀNH & MÃ</th>
              <th>KHỐI XÉT TUYỂN</th>
              <th>CHỈ TIÊU</th>
              <th>ĐIỂM CHUẨN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admissionData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="school-cell">
                    <strong>{item.school}</strong>
                    <span>{item.method}</span>
                  </div>
                </td>
                <td>
                  <div className="major-cell">
                    <p>{item.major}</p>
                    <span className="code-tag">{item.code}</span>
                  </div>
                </td>
                <td>
                  <div className="blocks-list">
                    {item.blocks.split(', ').map(b => <span key={b} className="b-tag">{b}</span>)}
                  </div>
                </td>
                <td className="text-bold">{item.quota}</td>
                <td>
                   <div className="score-cell">
                      <span className="score-bold">{item.score2023}</span>
                      <ArrowUpRight size={14} />
                   </div>
                </td>
                <td className="actions-cell">
                  <button className="btn-edit"><Edit3 size={16} /></button>
                  <button className="btn-del"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="adm-pagination-row">
          <span>Trang 1 / 145</span>
          <div className="adm-page-nav">
            <button><ChevronLeft size={16}/></button>
            <button className="active">1</button>
            <button>2</button>
            <button><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionManagement;