import React from 'react';
import './UniversityManagement.css';
import { 
  Plus, Search, Filter, Edit3, ChevronLeft, 
  ChevronRight, Zap, ListTree
} from 'lucide-react';

const UniversityManagement = () => {
  const universities = [
    { id: 1, name: 'Đại học Bách Khoa Hà Nội', location: 'Hai Bà Trưng, Hà Nội • Công lập', code: 'BKA', updated: '2 giờ trước', status: 'Đã đồng bộ AI', logo: 'https://upload.wikimedia.org/wikipedia/vi/e/e5/Logo_Đại_học_Bách_khoa_Hà_Nội.svg' },
    { id: 2, name: 'Đại học Ngoại Thương', location: 'Đống Đa, Hà Nội • Công lập', code: 'NTH', updated: 'Hôm qua', status: 'Đang quét website', isScanning: true, logo: 'https://upload.wikimedia.org/wikipedia/vi/a/a2/Logo_FTU.png' },
    { id: 3, name: 'Đại học RMIT Việt Nam', location: 'Quận 7, TP.HCM • Quốc tế', code: 'RMU', updated: '5 ngày trước', status: 'Dữ liệu cũ', isWarning: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/RMIT_University_logo.svg/2560px-RMIT_University_logo.svg.png' },
  ];

  return (
    <div className="uni-mgmt-content">
      {/* BREADCRUMB & TITLE */}
      <div className="page-header-uni">
        <div className="title-text-uni">
          <span className="badge-ai-active"><Zap size={12}/> AI ANALYTICS ACTIVE</span>
          <h2>Quản lý Dữ liệu Trường & Ngành</h2>
          <p>Tối ưu hóa dữ liệu ngành học bằng trí tuệ nhân tạo EduGuide AI.</p>
        </div>
        <div className="title-actions-uni">
          <button className="btn-add-major"><Plus size={16}/> Thêm ngành học</button>
          <button className="btn-add-uni"><Plus size={16}/> Thêm trường mới</button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="filter-row-uni">
        <div className="search-uni">
          <Search size={18} />
          <input type="text" placeholder="Tìm kiếm trường, mã ngành..." />
        </div>
        <div className="select-groups">
          <select className="uni-select"><option>VÙNG MIỀN: Tất cả</option></select>
          <select className="uni-select"><option>LOẠI HÌNH: Tất cả</option></select>
          <button className="btn-advanced-filter"><Filter size={16}/> Bộ lọc</button>
        </div>
      </div>

      <div className="uni-grid-layout">
        {/* Table Area (Left) */}
        <div className="uni-table-container">
          <table className="uni-table">
            <thead>
              <tr>
                <th>TRƯỜNG ĐẠI HỌC</th>
                <th>MÃ</th>
                <th>CẬP NHẬT</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(uni => (
                <tr key={uni.id}>
                  <td>
                    <div className="uni-info-cell">
                      <img src={uni.logo} alt="logo" />
                      <div>
                        <p className="uni-name">{uni.name}</p>
                        <span className="uni-loc">{uni.location}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="uni-code-badge">{uni.code}</span></td>
                  <td>
                    <div className="uni-update-cell">
                      <p>{uni.updated}</p>
                      <span className={uni.isWarning ? 'status-warn' : 'status-sync'}>
                        {uni.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-btns-uni">
                      <button className="btn-edit-small"><Edit3 size={14}/></button>
                      <button className="btn-view-detail">Ngành học</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="uni-pagination">
            <span>Hiển thị 3/450 trường</span>
            <div className="page-btns-uni">
              <button className="p-nav"><ChevronLeft size={16}/></button>
              <button className="p-num active">1</button>
              <button className="p-nav"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>

        {/* Sidebar Info Area (Right) */}
        <aside className="uni-info-aside">
          <div className="ai-assist-card-uni">
            <div className="ai-icon-circle"><Zap size={20}/></div>
            <h4>Smart Curator</h4>
            <div className="ai-msg-box">
              "Tìm thấy 12 mô tả ngành mới từ Bách Khoa HN. Duyệt ngay?"
            </div>
            <button className="btn-ai-confirm">Duyệt Tất Cả</button>
          </div>

          <div className="majors-cat-card">
            <div className="cat-card-header">
              <h4>Danh mục Ngành</h4>
              <span className="add-link">+ Mới</span>
            </div>
            <div className="cat-item-uni">
              <div className="cat-main"><ListTree size={16}/> Kỹ thuật - CNTT</div>
              <div className="cat-subs">
                <span>• Trí tuệ nhân tạo (AI)</span>
                <span>• An toàn thông tin</span>
              </div>
            </div>
          </div>

          <div className="alert-card-uni">
             <div className="alert-item-uni red">
               <span className="dot"></span> 8 trường thiếu học phí 2024
             </div>
             <div className="alert-item-uni blue">
               <span className="dot"></span> 24 ngành được AI đề xuất
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UniversityManagement;