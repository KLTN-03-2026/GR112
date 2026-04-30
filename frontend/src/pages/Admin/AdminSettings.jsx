import React, { useState, useEffect } from 'react';
import { User, Globe, Bell, Shield, Save } from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(true);

  // State chứa toàn bộ dữ liệu Cài đặt
  const [settings, setSettings] = useState({
    site_name: '', support_email: '', hotline: '',
    maintenance_mode: false, notify_new_review: true,
    notify_new_booking: true, two_factor_auth: false
  });

  // 1. TỰ ĐỘNG LẤY DỮ LIỆU TỪ BACKEND KHI MỞ TRANG
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Lỗi lấy cấu hình:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. HÀM LƯU DỮ LIỆU XUỐNG BACKEND KHI BẤM NÚT "LƯU CÀI ĐẶT"
  // 🚀 ĐÃ THAY THẾ BẰNG THÔNG BÁO CỦA SWEETALERT2
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã lưu cấu hình cài đặt thành công vào Database!',
          icon: 'success',
          timer: 1500, // Tự động đóng sau 1.5s
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Có lỗi xảy ra!',
          text: 'Không thể lưu cài đặt, vui lòng thử lại.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Lỗi kết nối!',
        text: 'Không thể kết nối tới Server!',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Hàm cập nhật state khi người dùng gõ phím hoặc gạt công tắc
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải cấu hình hệ thống...</div>;

  return (
    <div className="admin-settings-page fade-in">
      <div className="as-header">
        <h1>Cài đặt Hệ thống</h1>
        <p>Quản lý cấu hình, phân quyền và các tính năng cốt lõi của hệ thống.</p>
      </div>

      <div className="as-layout">
        {/* THANH MENU BÊN TRÁI */}
        <div className="as-sidebar">
          <button className={`as-tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
            <Globe size={18} /> Cấu hình chung
          </button>
          <button className={`as-tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <User size={18} /> Tài khoản Admin
          </button>
          <button className={`as-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <Bell size={18} /> Thông báo
          </button>
          <button className={`as-tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Shield size={18} /> Bảo mật
          </button>
        </div>

        {/* KHU VỰC NỘI DUNG BÊN PHẢI */}
        <div className="as-content">
          <form onSubmit={handleSave}>
            
            {/* TAB: HỆ THỐNG */}
            {activeTab === 'system' && (
              <div className="fade-in">
                <h2>Cấu hình chung hệ thống</h2>
                <div className="as-form-group">
                  <label>Tên Website</label>
                  <input type="text" className="as-input" value={settings.site_name} onChange={e => handleChange('site_name', e.target.value)} />
                </div>
                <div className="as-form-group">
                  <label>Email liên hệ hỗ trợ</label>
                  <input type="email" className="as-input" value={settings.support_email} onChange={e => handleChange('support_email', e.target.value)} />
                </div>
                <div className="as-form-group">
                  <label>Số điện thoại Hotline</label>
                  <input type="text" className="as-input" value={settings.hotline} onChange={e => handleChange('hotline', e.target.value)} />
                </div>

                <div className="as-switch-item" style={{marginTop: '30px'}}>
                  <div className="as-switch-info">
                    <h4>Chế độ bảo trì (Maintenance Mode)</h4>
                    <p>Tạm thời đóng website đối với người dùng để nâng cấp hệ thống.</p>
                  </div>
                  <label className="as-switch">
                    <input type="checkbox" checked={settings.maintenance_mode} onChange={e => handleChange('maintenance_mode', e.target.checked)} />
                    <span className="as-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: TÀI KHOẢN (Tạm thời là form cứng, có thể nối API User sau) */}
            {activeTab === 'account' && (
              <div className="fade-in">
                <h2>Thông tin Quản trị viên</h2>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="as-form-group" style={{flex: 1}}>
                    <label>Họ và tên</label>
                    <input type="text" className="as-input" defaultValue="Admin KLTN" />
                  </div>
                  <div className="as-form-group" style={{flex: 1}}>
                    <label>Chức vụ</label>
                    <input type="text" className="as-input" defaultValue="Super Admin" disabled style={{background: '#e2e8f0'}} />
                  </div>
                </div>
                <div className="as-form-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" className="as-input" placeholder="Để trống nếu không muốn đổi..." />
                </div>
              </div>
            )}

            {/* TAB: THÔNG BÁO */}
            {activeTab === 'notifications' && (
              <div className="fade-in">
                <h2>Cài đặt thông báo tự động</h2>
                <div className="as-switch-item">
                  <div className="as-switch-info">
                    <h4>Có bài Đánh giá (Review) mới</h4>
                    <p>Gửi email cho Admin khi có sinh viên gửi đánh giá trường/mentor cần duyệt.</p>
                  </div>
                  <label className="as-switch">
                    <input type="checkbox" checked={settings.notify_new_review} onChange={e => handleChange('notify_new_review', e.target.checked)} />
                    <span className="as-slider"></span>
                  </label>
                </div>
                <div className="as-switch-item">
                  <div className="as-switch-info">
                    <h4>Có Lịch hẹn tư vấn mới</h4>
                    <p>Thông báo khi có học sinh đặt lịch tư vấn 1-1 thành công.</p>
                  </div>
                  <label className="as-switch">
                    <input type="checkbox" checked={settings.notify_new_booking} onChange={e => handleChange('notify_new_booking', e.target.checked)} />
                    <span className="as-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: BẢO MẬT */}
            {activeTab === 'security' && (
              <div className="fade-in">
                <h2>Cài đặt Bảo mật</h2>
                <div className="as-switch-item">
                  <div className="as-switch-info">
                    <h4>Xác thực 2 bước (2FA)</h4>
                    <p>Yêu cầu nhập mã OTP khi đăng nhập vào trang Quản trị Admin.</p>
                  </div>
                  <label className="as-switch">
                    <input type="checkbox" checked={settings.two_factor_auth} onChange={e => handleChange('two_factor_auth', e.target.checked)} />
                    <span className="as-slider"></span>
                  </label>
                </div>
              </div>
            )}

            <button type="submit" className="as-btn-save">
              <Save size={18} /> Lưu Cài Đặt
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;