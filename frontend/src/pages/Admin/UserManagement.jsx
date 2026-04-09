import React from 'react';
import './UserManagement.css';
import { 
  UserPlus, FileText, Search, Filter, 
  MoreVertical, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';

const UserManagement = () => {
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'HỌC SINH', joined: '24 Th05, 2024', lastActive: 'Đang online', status: 'Active', online: true },
    { id: 2, name: 'Trần Thị B', email: 'tranthib.consult@eduguide.ai', role: 'TƯ VẤN VIÊN', joined: '23 Th05, 2024', lastActive: '15:30 Hôm qua', status: 'Pending', online: false },
    { id: 3, name: 'Lê Duy', email: 'leduy.admin@eduguide.ai', role: 'ADMIN', joined: '12 Th01, 2024', lastActive: 'Vừa xong', status: 'Active', online: false },
    { id: 4, name: 'Phạm Hoàng C', email: 'phamhoangc@hotmail.com', role: 'HỌC SINH', joined: '10 Th04, 2024', lastActive: '3 tuần trước', status: 'Blocked', online: false, deleted: true },
  ];

  return (
    <div className="user-mgmt-content">
      {/* PAGE TITLE & ACTIONS */}
      <div className="page-header-um">
        <div className="title-area-um">
          <h2>Quản lý Người dùng</h2>
          <p>Giám sát, phân quyền và quản lý hồ sơ người dùng trong hệ sinh thái.</p>
        </div>
        <div className="header-actions-um">
          <button className="btn-export-um"><FileText size={16}/> Xuất báo cáo</button>
          <button className="btn-add-um"><UserPlus size={16}/> Thêm người dùng mới</button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-row-um">
        <div className="um-card">
          <span>TOTAL USERS</span>
          <h3>12,482 <small className="trend-up">+12%</small></h3>
        </div>
        <div className="um-card">
          <span>ACTIVE TODAY</span>
          <h3>1,893 <small className="live">Live</small></h3>
        </div>
        <div className="um-card">
          <span>PENDING REQUESTS</span>
          <h3>42 <small className="action">Cần xử lý</small></h3>
        </div>
        <div className="um-card danger-card">
          <span className="danger-text">REPORTED</span>
          <h3 className="danger-text">07 <small>Khẩn cấp</small></h3>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="filter-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input type="text" placeholder="Tìm kiếm tên, email..." />
        </div>
        <div className="filters-right">
          <select className="filter-select"><option>Vai trò: Tất cả</option></select>
          <select className="filter-select"><option>Trạng thái: Tất cả</option></select>
          <button className="btn-filter-icon"><Filter size={16}/></button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-wrapper-um">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{width: '40px'}}><input type="checkbox" /></th>
              <th>NGƯỜI DÙNG</th>
              <th>VAI TRÒ</th>
              <th>NGÀY THAM GIA</th>
              <th>HOẠT ĐỘNG</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div className="user-info-cell">
                    <div className="avatar-small">{user.name.charAt(0)}</div>
                    <div>
                      <p className={user.deleted ? 'text-deleted' : 'user-name'}>{user.name}</p>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td><span className={`badge-role ${user.role.toLowerCase().replace(' ', '-')}`}>{user.role}</span></td>
                <td><span className="text-date">{user.joined}</span></td>
                <td>
                  <div className="activity-cell">
                    {user.online && <span className="dot-online"></span>}
                    <span className={user.online ? 'text-online' : ''}>{user.lastActive}</span>
                  </div>
                </td>
                <td><span className={`status-pill ${user.status.toLowerCase()}`}>{user.status}</span></td>
                <td><MoreVertical size={16} className="cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination-um">
          <span>Hiển thị 1-10 trên 12,482</span>
          <div className="page-btns">
            <button className="p-nav"><ChevronLeft size={16}/></button>
            <button className="p-num active">1</button>
            <button className="p-num">2</button>
            <button className="p-nav"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* AI INSIGHT BANNER */}
      <div className="ai-insight-banner">
        <div className="ai-icon-bg"><Sparkles size={20}/></div>
        <div className="ai-content">
          <h4>AI INSIGHT: Phân tích cộng đồng</h4>
          <p>Tỷ lệ đăng ký 'Học sinh' tăng 18% trong tuần qua. Hệ thống khuyên bạn nên điều phối thêm Tư vấn viên vào khung giờ tối.</p>
        </div>
        <button className="btn-ai-view">Chi tiết</button>
      </div>
    </div>
  );
};

export default UserManagement;