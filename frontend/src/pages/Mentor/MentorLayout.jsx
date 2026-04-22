import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CalendarClock, User, Settings, Bell, Search, Menu, LogOut, ChevronRight, Sparkles 
} from 'lucide-react';
import './MentorLayout.css'; // ĐÃ ĐỔI SANG FILE CSS RIÊNG

const MentorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : { name: 'Mentor' };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { group: "CÔNG VIỆC CỦA TÔI", items: [
      { path: '/mentor/schedule', icon: <CalendarClock size={18}/>, label: 'Lịch trình cá nhân' },
    ]},
    { group: "TÀI KHOẢN", items: [
      { path: '/mentor/profile', icon: <User size={18}/>, label: 'Hồ sơ chuyên gia' }, // <--- SỬA LINK Ở ĐÂY
    ]}
  ];

  return (
    <div className="mentor-master-layout">
      {/* SIDEBAR CỦA CỐ VẤN */}
      <aside className={`mentor-sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="mentor-sidebar-header">
          <div className="mentor-logo-box">
            <Sparkles className="mentor-logo-icon" fill="#fbbf24" size={24} />
            {isSidebarOpen && <span>ConsulTing <small>Mentor</small></span>}
          </div>
        </div>

        <nav className="mentor-sidebar-nav">
          {menuItems.map((group, idx) => (
            <div key={idx} className="mentor-nav-group">
              {isSidebarOpen && <label>{group.group}</label>}
              {group.items.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`mentor-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="mentor-icon">{item.icon}</span>
                  {isSidebarOpen && <div className="mentor-nav-label">{item.label}</div>}
                  {location.pathname === item.path && <ChevronRight className="mentor-active-arrow" size={14} />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="mentor-sidebar-footer">
          <Link to="/settings" className="mentor-nav-item">
            <Settings size={18} /> {isSidebarOpen && <span>Cài đặt</span>}
          </Link>
          <button onClick={handleLogout} className="mentor-nav-item logout-btn">
            <LogOut size={18} /> {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="mentor-main-viewport">
        <header className="mentor-master-header">
          <button className="mentor-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="mentor-header-search">
            <Search size={16} />
            <input type="text" placeholder="Tìm kiếm phiên tư vấn..." />
          </div>

          <div className="mentor-header-user-actions">
            <div className="mentor-notif-bell">
              <Bell size={20} />
              <span className="mentor-badge">1</span>
            </div>
            <div className="mentor-profile-pill">
              <div className="mentor-text-right">
                <strong>{currentUser.name || 'Cố vấn'}</strong>
                <span>Chuyên gia tư vấn</span>
              </div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor" alt="avatar" />
            </div>
          </div>
        </header>

        <main className="mentor-content-render">
          <div className="mentor-fade-in-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;