import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { 
  UserPlus, FileText, Search, Filter, 
  MoreVertical, ChevronLeft, ChevronRight, Sparkles, X, Edit3, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2'; 

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active_today: 0, pending: 0, reported: 0 });
  const [loading, setLoading] = useState(true);

  // LỌC & TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // STATE MODAL SỬA NGƯỜI DÙNG
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', role: '', verified: false });

  // STATE MODAL BÁO CÁO VI PHẠM
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState([]);

  const token = localStorage.getItem('token');

  // 1. LẤY DỮ LIỆU USER
  const fetchUsers = () => {
    setLoading(true);
    fetch('https://gr112.onrender.com/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setUsers(data.data);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. LẤY CHI TIẾT BÁO CÁO VI PHẠM
  const fetchReportDetails = () => {
    fetch('https://gr112.onrender.com/api/admin/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setReportDetails(data);
          setShowReportModal(true);
        }
      })
      .catch(err => console.error(err));
  };

  // 3. XỬ LÝ LỌC DỮ LIỆU
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'Tất cả' || user.role.toUpperCase() === roleFilter.toUpperCase();
    const matchStatus = statusFilter === 'Tất cả' || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // 4. MỞ MODAL SỬA
  const openEditModal = (user) => {
    setFormData({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role.toLowerCase(), 
      verified: user.verified 
    });
    setShowModal(true);
  };

  // 🚀 5. LƯU CẬP NHẬT (ĐÃ FIX BẮT LỖI TÊN TRỐNG & EMAIL SAI)
  const handleUpdate = (e) => {
    e.preventDefault();

    // KIỂM TRA ĐIỀU KIỆN TRƯỚC KHI LƯU
    if (!formData.name.trim()) {
      Swal.fire('Lỗi!', 'Họ và Tên không được để trống rỗng!', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      Swal.fire('Lỗi!', 'Email không hợp lệ (Ví dụ: abc@gmail.com)!', 'warning');
      return;
    }

    fetch(`https://gr112.onrender.com/api/admin/users/${formData.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if(res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã cập nhật thông tin người dùng.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowModal(false);
        fetchUsers();
      } else {
        Swal.fire('Lỗi!', 'Không thể cập nhật dữ liệu.', 'error');
      }
    }).catch(err => {
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
    });
  };

  // 6. XÓA NGƯỜI DÙNG
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa người dùng?',
      text: "CẢNH BÁO: Xóa người dùng này sẽ xóa toàn bộ dữ liệu liên quan. Bạn có chắc chắn không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://gr112.onrender.com/api/admin/users/${id}`, { 
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
        })
        .then(res => { 
          if(res.ok) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Người dùng đã bị xóa khỏi hệ thống.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchUsers(); 
          } else {
            Swal.fire('Lỗi!', 'Không thể xóa người dùng này.', 'error');
          }
        }).catch(err => {
          Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
        });
      }
    });
  };

  // 🚀 7. THÊM NGƯỜI DÙNG NHANH (ĐÃ FIX BẮT LỖI EMAIL)
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm Người Dùng Mới',
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
          <label style="font-size: 13px; font-weight: bold; color: #64748b;">Họ và Tên (*)</label>
          <input id="swal-input-name" class="swal2-input" style="margin: 0; width: auto;" placeholder="Nhập họ và tên...">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 10px;">Email đăng nhập (*)</label>
          <input id="swal-input-email" type="email" class="swal2-input" style="margin: 0; width: auto;" placeholder="Nhập email...">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 10px;">Mật khẩu</label>
          <input id="swal-input-pass" type="password" class="swal2-input" style="margin: 0; width: auto;" placeholder="Mặc định: 123456">
          
          <label style="font-size: 13px; font-weight: bold; color: #64748b; margin-top: 10px;">Vai trò hệ thống</label>
          <select id="swal-input-role" class="swal2-select" style="margin: 0; width: 100%;">
            <option value="user">USER (Học sinh)</option>
            <option value="mentor">MENTOR (Cố vấn)</option>
            <option value="admin">ADMIN (Quản trị)</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tạo tài khoản',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#0f172a',
      borderRadius: '16px',
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value.trim();
        const email = document.getElementById('swal-input-email').value.trim();
        
        // Dùng Regex để kiểm tra chuẩn email (có @ và dấu chấm)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
          Swal.showValidationMessage('Vui lòng nhập Họ Tên!');
          return false;
        }
        if (!email || !emailRegex.test(email)) {
          Swal.showValidationMessage('Email không đúng định dạng (Ví dụ: tên@gmail.com)!');
          return false;
        }

        return {
          name: name,
          email: email,
          password: document.getElementById('swal-input-pass').value || "123456",
          role: document.getElementById('swal-input-role').value
        };
      }
    });

    if (formValues) {
      fetch('https://gr112.onrender.com/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      })
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          Swal.fire('Lỗi!', data.error, 'error');
        } else {
          Swal.fire({
            title: 'Thành công!',
            text: 'Đã tạo tài khoản mới thành công!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          fetchUsers(); 
        }
      }).catch(err => {
        Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
      });
    }
  };

  // 8. KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBan = (userId, currentRole) => {
    const isBanned = currentRole.toLowerCase() === 'banned';
    const actionText = isBanned ? 'Mở khóa' : 'Khóa';
    const btnColor = isBanned ? '#10b981' : '#ef4444';

    Swal.fire({
      title: `${actionText} tài khoản?`,
      text: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} người dùng này không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Đồng ý ${actionText}`,
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://gr112.onrender.com/api/admin/users/${userId}/toggle-ban`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if(data.error) {
            Swal.fire('Lỗi!', data.error, 'error');
          } else {
            Swal.fire({
              title: 'Thành công!',
              text: data.message,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchUsers(); 
          }
        }).catch(err => {
          Swal.fire('Lỗi kết nối!', 'Không thể thao tác.', 'error');
        });
      }
    });
  };

  // 9. XUẤT FILE EXCEL
  const handleExport = async () => {
    try {
      Swal.fire({
        title: 'Đang tạo Excel...',
        text: 'Hệ thống đang trích xuất dữ liệu, vui lòng đợi!',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const res = await fetch('https://gr112.onrender.com/api/admin/users/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Lỗi xuất file");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DanhSach_NguoiDung.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();

      Swal.close();
      Swal.fire({
        title: 'Hoàn tất!',
        text: 'File báo cáo đã được tải xuống máy của bạn.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.close();
      Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xuất file báo cáo.', 'error');
    }
  };

  const getRoleStyle = (role) => {
    const r = role.toLowerCase();
    if (r === 'admin') return { bg: '#fee2e2', color: '#9f1239' };
    if (r === 'banned') return { bg: '#1e293b', color: '#f8fafc' };
    if (r === 'mentor') return { bg: '#fef3c7', color: '#b45309' };
    return { bg: '#e0f2fe', color: '#0369a1' }; 
  };

  return (
    <div className="user-mgmt-content fade-in">
      <div className="page-header-um">
        <div className="title-area-um">
          <h2>Quản lý Người dùng</h2>
          <p>Giám sát, phân quyền và quản lý hồ sơ người dùng trong hệ sinh thái.</p>
        </div>
        <div className="header-actions-um" style={{display: 'flex', gap: '10px'}}>
          <button className="btn-export-um" onClick={handleAddUser} style={{background: '#0f172a', color: 'white', border: 'none'}}>
            <UserPlus size={16}/> Thêm User
          </button>
          <button className="btn-export-um" onClick={handleExport}>
            <FileText size={16}/> Xuất Excel
          </button>
        </div>
      </div>

      <div className="stats-row-um">
        <div className="um-card">
          <span>TỔNG NGƯỜI DÙNG</span>
          <h3>{stats.total.toLocaleString()}</h3>
        </div>
        <div className="um-card">
          <span>HOẠT ĐỘNG HÔM NAY</span>
          <h3>{stats.active_today.toLocaleString()} <small className="live">Live</small></h3>
        </div>
        <div className="um-card">
          <span>CHƯA XÁC THỰC</span>
          <h3>{stats.pending} <small className="action">Cần xử lý</small></h3>
        </div>
        <div className="um-card danger-card" onClick={fetchReportDetails} style={{cursor: 'pointer'}} title="Click để xem chi tiết báo cáo">
          <span className="danger-text">BÁO CÁO VI PHẠM</span>
          <h3 className="danger-text">{stats.reported} <small>Khẩn cấp</small></h3>
        </div>
      </div>

      <div className="filter-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input type="text" placeholder="Tìm kiếm tên, email..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
        <div className="filters-right">
          <select className="filter-select" value={roleFilter} onChange={e => {setRoleFilter(e.target.value); setCurrentPage(1);}}>
            <option value="Tất cả">Vai trò: Tất cả</option>
            <option value="USER">USER</option>
            <option value="MENTOR">MENTOR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="BANNED">BANNED (Bị khóa)</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
            <option value="Tất cả">Trạng thái: Tất cả</option>
            <option value="Active">Active (Đã xác thực)</option>
            <option value="Pending">Pending (Chưa xác thực)</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper-um custom-scrollbar" style={{overflowX: 'auto'}}>
        {loading ? <p style={{textAlign: 'center', padding: '30px'}}>Đang tải dữ liệu...</p> : (
          <>
            <table className="user-table" style={{minWidth: '900px'}}>
              <thead>
                <tr>
                  <th>NGƯỜI DÙNG</th>
                  <th>VAI TRÒ</th>
                  <th>NGÀY THAM GIA</th>
                  <th>HOẠT ĐỘNG</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{textAlign: 'center', position: 'sticky', right: 0, background: '#fff'}}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy dữ liệu</td></tr> : 
                  currentUsers.map(user => {
                    const roleStyle = getRoleStyle(user.role);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="avatar-small" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="user-name" style={{ textDecoration: user.role.toLowerCase() === 'banned' ? 'line-through' : 'none' }}>{user.name}</p>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-role" style={{
                            background: roleStyle.bg, color: roleStyle.color,
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold'
                          }}>{user.role.toUpperCase()}</span>
                        </td>
                        <td><span className="text-date">{user.joined}</span></td>
                        <td>
                          <div className="activity-cell">
                            {user.online && <span className="dot-online" style={{width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block'}}></span>}
                            <span className={user.online ? 'text-online' : ''} style={{color: user.online ? '#10b981' : '#64748b', fontSize: '13px', fontWeight: user.online ? 'bold' : 'normal'}}>{user.lastActive}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill" style={{
                            background: user.status === 'Active' ? '#dcfce7' : '#fef08a',
                            color: user.status === 'Active' ? '#166534' : '#9a3412',
                            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'
                          }}>{user.status}</span>
                        </td>
                        <td style={{textAlign: 'center', position: 'sticky', right: 0, background: '#fff', borderLeft: '1px solid #f1f5f9'}}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button onClick={() => openEditModal(user)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer'}} title="Sửa quyền"><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete(user.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}} title="Xóa người dùng"><Trash2 size={18} /></button>
                            
                            <button 
                              onClick={() => handleToggleBan(user.id, user.role)}
                              style={{
                                background: user.role.toLowerCase() === 'banned' ? '#10b981' : '#475569', 
                                color: 'white', border: 'none', padding: '4px 8px', 
                                borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                              }}
                              title={user.role.toLowerCase() === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {user.role.toLowerCase() === 'banned' ? '🔓 Mở' : '🔒 Khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination-um">
                <span>Trang {currentPage} / {totalPages} (Tổng {filteredUsers.length} tài khoản)</span>
                <div className="page-btns">
                  <button className="p-nav" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="p-nav" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="ai-insight-banner">
        <div className="ai-icon-bg"><Sparkles size={20}/></div>
        <div className="ai-content">
          <h4 style={{ margin: '0 0 5px 0' }}>AI INSIGHT: Phân tích cộng đồng</h4>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
            {stats.reported > 0 
              ? `🔴 BÁO ĐỘNG: Có ${stats.reported} tài khoản bị báo cáo vi phạm quy tắc. Đề nghị Admin kiểm tra Modal "Báo cáo" và xử lý khẩn cấp!`
              : stats.pending > 0 
                ? `🟡 CẢNH BÁO NHẸ: Có ${stats.pending} tài khoản chưa được xác thực email. Khuyến nghị gửi email nhắc nhở để tăng tỷ lệ kích hoạt.`
                : `🟢 TUYỆT VỜI: Tất cả tài khoản đều đã xác thực và không có báo cáo vi phạm nào. Cộng đồng đang hoạt động rất tốt!`}
          </p>
        </div>
      </div>

      {/* 🚀 MODAL SỬA NGƯỜI DÙNG (Đã ĐỘ THÊM INPUT TÊN VÀ EMAIL) */}
      {showModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="cm-modal-content" style={{ background: '#fff', width: '400px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{margin: 0, color: '#0f172a'}}>Chỉnh sửa quyền hạn</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              
              {/* 🚀 Đã đổi từ văn bản tĩnh sang thẻ INPUT để sếp xóa/sửa được */}
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Họ và Tên (*)</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  style={{width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: 'white'}}
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Email đăng nhập (*)</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  style={{width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: 'white'}}
                  placeholder="Nhập email..."
                />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Vai trò hệ thống</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: 'white'}}>
                  <option value="user">USER (Học sinh/Sinh viên)</option>
                  <option value="mentor">MENTOR (Cố vấn chuyên môn)</option> 
                  <option value="admin">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Trạng thái xác thực</label>
                <select value={formData.verified} onChange={e => setFormData({...formData, verified: e.target.value === 'true'})} style={{width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: 'white'}}>
                  <option value="true">Active (Đã xác thực)</option>
                  <option value="false">Pending (Chưa xác thực)</option>
                </select>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 15px', background: '#f1f5f9', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Hủy</button>
                <button type="submit" style={{padding: '10px 15px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT BÁO CÁO VI PHẠM */}
      {showReportModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="cm-modal-content custom-scrollbar" style={{ background: '#fff', width: '800px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
              <h3 style={{margin: 0, color: '#e11d48'}}>Danh sách Báo cáo Vi phạm</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Người bị báo cáo</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Lý do vi phạm</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Thời gian</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {reportDetails.length === 0 ? <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Không có dữ liệu</td></tr> : reportDetails.map(report => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{report.user_name}</strong><br/>
                      <small style={{color: '#64748b'}}>{report.user_email}</small>
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>{report.reason}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{report.created_at}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        background: report.status === 'Pending' ? '#fff1f2' : '#f0fdf4',
                        color: report.status === 'Pending' ? '#e11d48' : '#16a34a'
                      }}>{report.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;