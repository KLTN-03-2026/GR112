import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CalendarClock, User, Settings, Bell, Search, Menu, LogOut, 
  ChevronRight, Sparkles, X, CheckCheck, UserCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import './MentorLayout.css'; 

const MentorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // States quản lý giao diện
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // States dữ liệu
  const [currentUser, setCurrentUser] = useState({ name: 'Cố vấn', role: 'Mentor' });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // States tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const searchRef = useRef(null);

  const token = localStorage.getItem('token');

  // Lấy thông tin user từ LocalStorage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString && userString !== "undefined") {
      try {
        setCurrentUser(JSON.parse(userString));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Lấy thông báo từ Backend
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('https://gr112.onrender.com/api/mentor/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
          setUnreadCount(data.unread_count || 0);
        }
      } catch (error) { console.error("Lỗi lấy thông báo:", error); }
    };
    fetchNotifs();
  }, [token]);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { group: "CÔNG VIỆC CỦA TÔI", items: [
      { path: '/mentor/schedule', icon: <CalendarClock size={18}/>, label: 'Lịch trình cá nhân', desc: 'Quản lý giờ rảnh và phiên tư vấn' },
    ]},
    { group: "TÀI KHOẢN", items: [
      { path: '/mentor/profile', icon: <User size={18}/>, label: 'Hồ sơ chuyên gia', desc: 'Cập nhật thông tin và chuyên môn' },
    ]}
  ];

  // 🚀 ĐÃ SỬA: Tìm kiếm Real-time (Gõ là tìm ngay, không cần nhấn Enter)
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) { 
      setSearchResults(null); 
      return; 
    }

    const allItems = menuItems.flatMap(g => g.items);
    const matches = allItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
    setSearchResults(matches);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất hệ thống?',
      text: "Bạn có chắc chắn muốn thoát khỏi tài khoản Cố vấn?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đăng xuất ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  // 🚀 ĐÃ THÊM: Gọi API cập nhật trạng thái "Đã đọc" xuống Backend
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await fetch('https://gr112.onrender.com/api/mentor/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) { 
      console.error(error); 
    }
  };

  return (
    <div className="mentor-master-layout">
      {/* SIDEBAR */}
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
          <button onClick={handleLogout} className="mentor-nav-item logout-btn" style={{width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer'}}>
            <LogOut size={18} /> {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* VIEWPORT CHÍNH */}
      <div className="mentor-main-viewport">
        <header className="mentor-master-header">
          <button className="mentor-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          
          {/* TÌM KIẾM CHỨC NĂNG */}
          <div className="mentor-header-search" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm chức năng..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchResults && (
              <div className="mentor-search-results" style={{ position: 'absolute', top: '45px', left: 0, width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy</div>
                ) : (
                  searchResults.map(item => (
                    <div key={item.path} onClick={() => { navigate(item.path); setSearchResults(null); setSearchQuery(''); }} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.desc}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mentor-header-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* 🚀 ĐÃ SỬA: CHUÔNG THÔNG BÁO CHUẨN CSS */}
            <div onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} style={{ position: 'relative', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
              <Bell size={22} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ef4444', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 'bold', border: '2px solid white'
                }}>
                  {unreadCount}
                </span>
              )}
              
              {isNotifOpen && (
                <div style={{ position: 'absolute', top: '45px', right: '-10px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100, border: '1px solid #e2e8f0', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Thông báo</strong>
                    <button onClick={handleMarkAllRead} style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>Đã đọc tất cả</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Không có thông báo mới</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '12px 15px', borderBottom: '1px solid #f8fafc', background: n.is_read ? 'white' : '#f0fdf4' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>{n.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 🚀 ĐÃ SỬA: PROFILE CHUẨN THEO HÌNH CỦA SẾP */}
            <div onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{currentUser.name || 'Cố vấn'}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Chuyên gia tư vấn</div>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name || 'Mentor'}`} 
                alt="avatar" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #e2e8f0', background: '#f8fafc', objectFit: 'cover' }} 
              />
              
              {isProfileOpen && (
                <div style={{ position: 'absolute', top: '55px', right: 0, width: '200px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                  <Link to="/mentor/profile" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', textDecoration: 'none', color: '#334155', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <UserCircle size={18} /> Hồ sơ của tôi
                  </Link>
                  <Link to="/mentor/schedule" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', textDecoration: 'none', color: '#334155', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <CalendarClock size={18} /> Lịch trình
                  </Link>
                  <div style={{ borderTop: '1px solid #e2e8f0' }}></div>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', width: '100%', border: 'none', background: 'white', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontWeight: '600', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              )}
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