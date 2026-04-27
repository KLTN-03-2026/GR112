import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, School, Database, 
  MessageSquare, BrainCircuit, Layers, Cpu, 
  Settings, Bell, Search, Menu, LogOut, ChevronRight, Sparkles,
  UserCheck, Calendar ,Building2// <-- Import thêm 2 icon mới ở đây
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { group: "HỆ THỐNG", items: [
      { path: '/admin', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { path: '/admin/ai-system', icon: <Cpu size={18}/>, label: 'Hệ thống AI' },
    ]},
    { group: "DỮ LIỆU CỐT LÕI", items: [
      { path: '/admin/users', icon: <Users size={18}/>, label: 'Người dùng' },
      { path: '/admin/university', icon: <School size={18}/>, label: 'Trường học' }, 
      { path: '/admin/admission', icon: <Database size={18}/>, label: 'Tuyển sinh' },
      { path: '/admin/exam-block', icon: <Layers size={18}/>, label: 'Khối thi' }, 
    ]},
    
      { group: "NỘI DUNG", items: [
    { path: '/admin/admincontent', icon: <Building2 size={18}/>, label: 'Quản lí nội dung' },
    { path: '/admin/content', icon: <BrainCircuit size={18}/>, label: 'Trắc nghiệm & Review' },
    { path: '/admin/consultation-history', icon: <MessageSquare size={18}/>, label: 'Lịch sử Chat AI' },
  ]},
    
    // --- THÊM NHÓM QUẢN LÝ MỚI VÀO ĐÂY ---
    { group: "TƯ VẤN 1-1 (PREMIUM)", items: [
      { path: '/admin/mentors', icon: <UserCheck size={18}/>, label: 'Quản lý Cố vấn' },
      { path: '/admin/bookings', icon: <Calendar size={18}/>, label: 'Quản lý Đặt lịch' },
    ]},
  ];

  return (
    <div className="master-layout">
      {/* SIDEBAR */}
      <aside className={`main-sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <Sparkles className="logo-icon" fill="currentColor" size={24} />
            {isSidebarOpen && <span>ConsulTing <small>Admin</small></span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((group, idx) => (
            <div key={idx} className="nav-group">
              {isSidebarOpen && <label>{group.group}</label>}
              {group.items.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {isSidebarOpen && (
                    <div className="nav-label">
                      {item.label}
                    </div>
                  )}
                  {location.pathname === item.path && <ChevronRight className="active-arrow" size={14} />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/settings" className="nav-item">
            <Settings size={18} /> {isSidebarOpen && <span>Cài đặt</span>}
          </Link>
          <Link to="/" className="nav-item logout">
            <LogOut size={18} /> {isSidebarOpen && <span>Về trang chủ</span>}
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="main-viewport">
        <header className="master-header">
          <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="header-search">
            <Search size={16} />
            <input type="text" placeholder="Tìm kiếm nhanh hệ thống..." />
          </div>

          <div className="header-user-actions">
            <div className="notif-bell">
              <Bell size={20} />
              <span className="badge">3</span>
            </div>
            <div className="admin-profile-pill">
              <div className="text-right">
                <strong>Admin EduGuide</strong>
                <span>Super Admin</span>
              </div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        <main className="content-render">
          <div className="fade-in-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;