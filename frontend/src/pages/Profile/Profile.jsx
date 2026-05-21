// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import './Profile.css'; 

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: '', username: '', role: 'user', phone: '', dob: '', email: '', address: '',
    // Dành cho Học sinh (User)
    className: '', schoolName: '', 
    // Dành cho Cố vấn (Mentor)
    specialty: '', experienceYears: '' 
  });

  const [needUpdate, setNeedUpdate] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('user'); 

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      const user = JSON.parse(savedUser);
      setCurrentUserRole(user.role || 'user'); 

      setFormData({ 
        fullName: user.fullName || '', 
        username: user.username || user.name || '', 
        role: user.role || 'user', 
        phone: user.phone || user.phone_number || '', 
        dob: user.dob || '', 
        email: user.email || '', 
        address: user.address || '',
        // Data riêng
        className: user.className || '', 
        schoolName: user.schoolName || '',
        // Đã xóa state khởi tạo của ielts và gpa ở đây
        specialty: user.specialty || '',
        experienceYears: user.experienceYears || ''
      });

      // CHECK NHẮC NHỞ TÙY THEO VAI TRÒ
      if (user.role === 'mentor') {
        if (!user.fullName || !user.specialty || !user.experienceYears) {
          setNeedUpdate(true);
        }
      } else {
        if (!user.fullName || !user.className || !user.schoolName) {
          setNeedUpdate(true);
        }
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'role') {
      setCurrentUserRole(value);
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault(); 

    // ==========================================
    // 1. KIỂM TRA SỐ ĐIỆN THOẠI
    // ==========================================
    if (formData.phone) {
      const phoneRegex = /^0\d{9}$/; 
      if (!phoneRegex.test(formData.phone)) {
        alert("Số điện thoại không hợp lệ");
        return; 
      }
    }

    // ==========================================
    // 2. KIỂM TRA NGÀY SINH
    // ==========================================
    if (formData.dob) {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      if (selectedDate > today) {
        alert("Ngày sinh không hợp lệ");
        return; 
      }
    }

    // Đã xóa phần kiểm tra (validate) ielts và gpa ở đây

    // ==========================================
    // GỌI API LƯU DỮ LIỆU KHI ĐÃ HỢP LỆ
    // ==========================================
    try {
        const res = await fetch("https://gr112.onrender.com/api/update-profile", {
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
            alert("Đã lưu thay đổi thành công!");
            localStorage.setItem("user", JSON.stringify(data.user)); 
            setNeedUpdate(false); 
        } else { 
            alert("Lỗi: " + data.error); 
        }
    } catch (err) { 
        alert("Không thể kết nối đến server"); 
    }
  };

  // Render Cảnh báo Động
  const renderAlertBanner = () => {
    if (!needUpdate) return null;

    if (currentUserRole === 'mentor') {
      return (
        <div className="profile-alert-banner" style={{ borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
          <i className="fas fa-exclamation-triangle alert-icon" style={{ color: '#f59e0b' }}></i>
          <div>
            <strong style={{ color: '#b45309' }}>Hồ sơ Chuyên gia của bạn chưa hoàn thiện!</strong>
            <p>Vui lòng cập nhật đầy đủ thông tin <b>Chuyên môn</b> và <b>Kinh nghiệm</b> để bắt đầu nhận lịch hẹn tư vấn.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-alert-banner">
        <i className="fas fa-exclamation-triangle alert-icon"></i>
        <div>
          <strong>Hồ sơ của bạn chưa hoàn thiện!</strong>
          <p>Vui lòng cập nhật đầy đủ thông tin <b>Lớp</b> và <b>Trường THPT</b> để hệ thống Cố vấn học thuật có thể phân tích chính xác nhất.</p>
        </div>
      </div>
    );
  };

  return (
    <main className="container fade-in">
      <h1 className="page-title">Thông tin cá nhân</h1>
      
      {renderAlertBanner()}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Họ và tên <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="VD: Nguyễn Văn A" />
            </div>
            
            <div className="form-group">
              <label>Tên đăng nhập <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="VD: nguyenvan" />
            </div>

            {/* RẼ NHÁNH: HỌC SINH */}
            {currentUserRole === 'user' && (
              <>
                <div className="form-group">
                  <label>Lớp học <span style={{color: 'red'}}>*</span></label>
                  <input type="text" name="className" value={formData.className} onChange={handleChange} required placeholder="VD: 12A1" />
                </div>
                <div className="form-group">
                  <label>Trường THPT <span style={{color: 'red'}}>*</span></label>
                  <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required placeholder="VD: THPT Nguyễn Trãi" />
                </div>
                {/* 🚀 2 Ô IELTS VÀ GPA ĐÃ BỊ LOẠI BỎ KHỎI ĐÂY */}
              </>
            )}

            {/* RẼ NHÁNH: CỐ VẤN */}
            {currentUserRole === 'mentor' && (
              <>
                <div className="form-group">
                  <label>Chuyên môn tư vấn <span style={{color: 'red'}}>*</span></label>
                  <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} required placeholder="VD: Khối ngành Kinh tế, Du học Đức..." />
                </div>
                <div className="form-group">
                  <label>Số năm kinh nghiệm <span style={{color: 'red'}}>*</span></label>
                  <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required placeholder="VD: 5" min="0" max="50" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Vai trò</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">Học sinh</option>
                <option value="admin">Quản trị viên</option>
                <option value="mentor">Cố vấn chuyên môn</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="090xxxxxxx" />
            </div>
            
            <div className="form-group">
              <label>Ngày sinh</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Email <span style={{color: 'red'}}>*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
            </div>
            
            <div className="form-group full-width">
              <label>Địa chỉ</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ của bạn" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => window.location.reload()}>
              Khôi phục
            </button>
            <button type="submit" className="btn-save"><i className="far fa-save"></i> Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;