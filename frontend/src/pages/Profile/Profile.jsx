// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { translations } from '../../utils/data';
import './Profile.css'; // Đảm bảo import file CSS cho trang Profile
const Profile = () => {
  // Tạm fix cứng tiếng Việt ở trang này, bạn có thể truyền context từ Header sang nếu cần đa ngôn ngữ
  const t = translations['vi']; 
  
  const [formData, setFormData] = useState({
    fullName: '', username: '', role: 'user', phone: '', dob: '', email: '', address: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      const user = JSON.parse(savedUser);
      setFormData({ 
        fullName: user.fullName || '', username: user.username || user.name || '', 
        role: user.role || 'user', phone: user.phone || user.phone_number || '', 
        dob: user.dob || '', email: user.email || '', address: user.address || '' 
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try {
        const res = await fetch("http://localhost:8000/api/update-profile", {
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
            alert("Đã lưu thay đổi thành công!");
            localStorage.setItem("user", JSON.stringify(data.user)); 
        } else { 
            alert("Lỗi: " + data.error); 
        }
    } catch (err) { 
        alert("Không thể kết nối đến server"); 
    }
  };

  return (
    <main className="container fade-in">
      <h1 className="page-title">{t.pageTitle}</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>{t.fullName} <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder={t.fullNamePlaceholder} />
            </div>
            <div className="form-group">
              <label>{t.username} <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder={t.usernamePlaceholder} />
            </div>
            <div className="form-group">
              <label>{t.role}</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">{t.roleUser}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.phone}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t.phonePlaceholder} />
            </div>
            <div className="form-group">
              <label>{t.dob}</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>{t.email} <span style={{color: 'red'}}>*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder={t.emailPlaceholder} disabled={true}/>
            </div>
            <div className="form-group full-width">
              <label>{t.address}</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder={t.addressPlaceholder} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setFormData({fullName: '', username: '', role: 'user', phone: '', dob: '', address: ''})}>{t.clearForm}</button>
            <button type="submit" className="btn-save"><i className="far fa-save"></i> {t.save}</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;