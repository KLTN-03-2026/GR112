import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, School, Database, 
  MessageSquare, BrainCircuit, Layers, Cpu, 
  Settings, Bell, Search, Menu, LogOut, ChevronRight, Sparkles,
  UserCheck, Calendar, Building2, X, Component, CheckCheck,
  Clock, CheckCircle // 🚀 Thêm 2 icon này cho màn hình Full Thông báo
} from 'lucide-react';
import Swal from 'sweetalert2'; 
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // 🚀 CÔNG TẮC BẬT/TẮT MÀN HÌNH FULL THÔNG BÁO
  const [showFullNotifs, setShowFullNotifs] = useState(false);
  
  const [adminName, setAdminName] = useState('Admin');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const menuItems = [
    { group: "HỆ THỐNG", items: [
      { path: '/admin', icon: <LayoutDashboard size={18}/>, label: 'Báo cáo và thống kê' },
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
    { group: "TƯ VẤN 1-1 (PREMIUM)", items: [
      { path: '/admin/mentors', icon: <UserCheck size={18}/>, label: 'Quản lý Cố vấn' },
      { path: '/admin/bookings', icon: <Calendar size={18}/>, label: 'Quản lý Đặt lịch' },
    ]},
    { group: "HỆ THỐNG CÁ NHÂN", items: [
      { path: '/admin/settings', icon: <Settings size={18}/>, label: 'Cài đặt' },
    ]}
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        const user = JSON.parse(savedUser);
        if (user.name) setAdminName(user.name);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('https://gr112.onrender.com/api/admin/notifications');
        if (res.ok) {
          const data = await res.json();
          // Cập nhật mảng nếu API sếp có trả về mảng rỗng thì dùng [] 
          setNotifications(data.data || []);
          setUnreadCount(data.unread_count || 0);
        }
      } catch (error) {}
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ĐÁNH DẤU TẤT CẢ LÀ ĐÃ ĐỌC
  const handleMarkAllAsRead = async (e) => {
    if(e) e.stopPropagation(); 
    try {
      // Gọi API xuống backend (sếp có thể thêm sau)
      // await fetch('http://localhost:8000/api/admin/notifications/read-all', { method: 'POST' });
      
      setNotifications(notifications.map(n => ({...n, is_read: true})));
      setUnreadCount(0);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Đã đánh dấu tất cả là đã đọc.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        setSearchResults(null);
        return;
      }
      
      setIsSearching(true);
      
      const allMenuItems = menuItems.flatMap(group => group.items);
      const localMatches = allMenuItems
        .filter(item => item.label.toLowerCase().includes(query))
        .map(item => ({
          type: 'Chức năng Menu',
          id: item.path,
          name: item.label,
          description: `Đi đến trang ${item.label}`,
          link: item.path,
          isMenu: true
        }));

      setSearchResults(localMatches);
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất hệ thống?',
      text: "Bạn có chắc chắn muốn đăng xuất khỏi Admin?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Đăng xuất ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        navigate("/");
      }
    });
  };

  return (
    <div className="master-layout">
      <aside className={`main-sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <Sparkles className="logo-icon" fill="currentColor" size={24} />
            {isSidebarOpen && <span>ConsulTing <small>Admin</small></span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.filter(g => g.group !== "HỆ THỐNG CÁ NHÂN").map((group, idx) => (
            <div key={idx} className="nav-group">
              {isSidebarOpen && <label>{group.group}</label>}
              {group.items.map((item) => (
                <Link 
                  key={item.path} to={item.path} 
                  className={`nav-item ${location.pathname === item.path && !showFullNotifs ? 'active' : ''}`}
                  onClick={() => setShowFullNotifs(false)} /* 🚀 Đóng màn hình thông báo khi bấm menu khác */
                >
                  <span className="icon">{item.icon}</span>
                  {isSidebarOpen && <div className="nav-label">{item.label}</div>}
                  {location.pathname === item.path && !showFullNotifs && <ChevronRight className="active-arrow" size={14} />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/settings" className="nav-item" onClick={() => setShowFullNotifs(false)}>
            <Settings size={18} /> {isSidebarOpen && <span>Cài đặt</span>}
          </Link>
          <button onClick={handleLogout} className="nav-item logout" style={{background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            <LogOut size={18} /> {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="main-viewport">
        <header className="master-header">
          <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="header-search" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm Menu chức năng... (Nhấn Enter)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ width: '300px' }}
            />
            {isSearching && <span style={{position: 'absolute', right: '15px', top: '10px', fontSize: '12px'}}>Đang tìm...</span>}
            {searchQuery && <button onClick={() => {setSearchQuery(''); setSearchResults(null)}} style={{position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '2px'}}><X size={16} color="#94a3b8"/></button>}

            {/* BẢNG KẾT QUẢ TÌM KIẾM */}
            {searchResults !== null && (
              <div style={{
                position: 'absolute', top: '45px', left: 0, width: '100%', background: 'white', 
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', 
                zIndex: 9999, overflow: 'hidden', animation: 'fadeInDown 0.2s ease-out'
              }}>
                <div style={{ padding: '12px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{fontSize: '0.9rem', color: '#334155'}}>Kết quả cho: "{searchQuery}"</strong>
                  <span style={{fontSize: '0.8rem', color: '#64748b'}}>{searchResults.length} Menu</span>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy Menu nào phù hợp.</div>
                  ) : (
                    searchResults.map((item, index) => (
                      <div key={index} 
                        style={{ padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '15px' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          setSearchResults(null);
                          setSearchQuery('');
                          setShowFullNotifs(false); // 🚀 Tắt màn hình thông báo nếu đang mở
                          navigate(item.link); 
                        }}
                      >
                        <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '10px', borderRadius: '8px' }}>
                          <Component size={20}/>
                        </div>
                        <div>
                          <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>{item.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="header-user-actions">
            
            <div className="notif-bell" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="badge" style={{ background: '#ef4444', color: 'white', position: 'absolute', top: '-5px', right: '-5px', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: '2px solid white' }}>{unreadCount}</span>}
              
              {isNotifOpen && (
                <div style={{
                  position: 'absolute', top: '45px', right: '-10px', width: '380px',
                  background: 'white', borderRadius: '16px', boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden',
                  animation: 'fadeInDown 0.2s ease-out', cursor: 'default'
                }} onClick={(e) => e.stopPropagation()}>
                  
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <strong style={{fontSize: '1.05rem', color: '#0f172a'}}>Thông báo hệ thống</strong>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{fontSize: '0.8rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <CheckCheck size={16}/> Đã đọc tất cả
                        </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{textAlign: 'center', padding: '40px 20px', color: '#94a3b8'}}>
                        <Bell size={40} style={{opacity: 0.2, marginBottom: '10px'}}/>
                        <p>Bạn không có thông báo nào mới.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(notif => ( // Chỉ hiện 5 cái mới nhất ở dropdown
                        <div key={notif.id} style={{
                           padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px',
                           background: notif.is_read ? 'white' : '#f0fdf4', 
                           transition: '0.2s', cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : '#f0fdf4'}
                        >
                           <div style={{ 
                             width: '45px', height: '45px', borderRadius: '50%', flexShrink: 0,
                             background: notif.is_read ? '#f1f5f9' : '#dcfce7', 
                             color: notif.is_read ? '#64748b' : '#16a34a', 
                             display: 'flex', alignItems: 'center', justifyContent: 'center'
                           }}>
                              <Bell size={20}/>
                           </div>
                           <div style={{flex: 1}}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                                 <strong style={{color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.3'}}>{notif.title}</strong>
                                 {!notif.is_read && <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px', flexShrink: 0}}></span>}
                              </div>
                              <p style={{fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5}}>{notif.message}</p>
                              <span style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', display: 'block'}}>{notif.created_at || 'Vừa cập nhật'}</span>
                           </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                     <button 
                       onClick={() => {
                         setShowFullNotifs(true); // 🚀 BẬT CÔNG TẮC HIỆN FULL TRANG THÔNG BÁO
                         setIsNotifOpen(false);   // Tắt cái dropdown nhỏ đi
                       }} 
                       style={{fontSize: '0.85rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700'}}
                     >
                       Xem tất cả {notifications.length} thông báo
                     </button>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-profile-pill" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}>
              <div className="text-right">
                <strong>{adminName}</strong>
                <span>Super Admin</span>
              </div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
              {isProfileOpen && (
                <div className="header-dropdown profile-dropdown fade-in" onClick={(e) => e.stopPropagation()}>
                  <Link to="/admin/settings" className="profile-menu-item" onClick={() => setShowFullNotifs(false)}>
                    <Settings size={16} /> Cài đặt hệ thống
                  </Link>
                  <button onClick={handleLogout} className="profile-menu-item logout-btn" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content-render">
          <div className="fade-in-container">
            {/* =========================================================================
                🚀 ĐÂY LÀ ĐOẠN MA THUẬT: HIỆN OUTLET HOẶC HIỆN TRANG FULL THÔNG BÁO
                ========================================================================= */}
            {showFullNotifs ? (
              <div className="fade-in" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={24} color="#4f46e5" /> Quản lý thông báo
                    </h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Xem lịch sử các hoạt động và cảnh báo hệ thống.</p>
                  </div>
                  
                  <button 
                    onClick={handleMarkAllAsRead}
                    style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                  >
                    <CheckCheck size={18} /> Đánh dấu đã đọc tất cả
                  </button>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <Bell size={48} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                      <h3 style={{ color: '#475569', margin: '0 0 5px 0' }}>Không có thông báo nào</h3>
                      <p style={{ color: '#94a3b8', margin: 0 }}>Hệ thống hiện tại chưa ghi nhận hoạt động mới.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          style={{ 
                            display: 'flex', gap: '20px', padding: '20px', borderBottom: '1px solid #f1f5f9',
                            background: notif.is_read ? 'white' : '#f0fdf4',
                            transition: '0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : '#f0fdf4'}
                        >
                          <div style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                            background: notif.is_read ? '#f1f5f9' : '#dcfce7',
                            color: notif.is_read ? '#64748b' : '#16a34a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {notif.is_read ? <CheckCircle size={24} /> : <Bell size={24} />}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{notif.title}</strong>
                              <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} /> {notif.created_at || 'Vừa xong'}
                              </span>
                            </div>
                            <p style={{ color: '#475569', margin: '0 0 10px 0', lineHeight: '1.5' }}>{notif.message}</p>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                                background: notif.is_read ? '#f1f5f9' : '#fee2e2',
                                color: notif.is_read ? '#64748b' : '#ef4444'
                              }}>
                                {notif.is_read ? 'Đã đọc' : 'Chưa đọc'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Outlet /> /* TRẠNG THÁI BÌNH THƯỜNG: HIỆN CÁC TRANG CỦA ADMIN */
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;