import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './ProfileForm.css'; 

const ProfileForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [debugMsg, setDebugMsg] = useState(""); // Thêm state để hiện lỗi lên màn hình

  const [profileData, setProfileData] = useState({
    fullName: 'Học sinh ẩn danh', className: 'Chưa cập nhật', schoolName: 'Chưa cập nhật', 
    block: 'A00', examScore: '-', 
    gpa10: '-', gpa11: '-', gpa12: '-',
    dgnlScore: '-', satScore: '-', ielts: '-',
    prizeLevel: 'none', hasPortfolio: false,
    location: 'Toàn quốc',
    tuitionLimit: 0, livingCost: 0,
    workEnv: 'Chưa xác định'
  });

  useEffect(() => {
    // 1. Lấy Tên, Lớp, Trường từ LocalStorage
    const savedUser = localStorage.getItem("user");
    let currentUserId = 1; 
    let personalInfo = {};
    
    if (savedUser) {
      try { 
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.id) {
          currentUserId = userObj.id; 
        }
        personalInfo = {
          fullName: userObj.fullName || 'Học sinh ẩn danh',
          className: userObj.className || '...',
          schoolName: userObj.schoolName || '...'
        };
      } catch(e){
        console.error("Lỗi đọc LocalStorage:", e);
      }
    }

    // 2. Lấy dữ liệu học thuật từ Database
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/orientation/${currentUserId}`);
        
        if (res.ok) {
          const data = await res.json();
          setHasData(true);
          setProfileData({
            ...personalInfo,
            block: data.target_block || 'A00',
            examScore: data.exam_score != null ? data.exam_score : '-',
            gpa10: data.gpa_10 != null ? data.gpa_10 : '-', 
            gpa11: data.gpa_11 != null ? data.gpa_11 : '-', 
            gpa12: data.gpa_12 != null ? data.gpa_12 : '-',
            dgnlScore: data.dgnl_score != null ? data.dgnl_score : '-', 
            satScore: data.sat_score != null ? data.sat_score : '-',
            ielts: (data.ielts_score && data.ielts_score !== '0') ? data.ielts_score : '-',
            prizeLevel: data.prize_level || 'none', 
            hasPortfolio: data.has_portfolio === true || data.has_portfolio === 'true',
            location: data.study_location || 'Toàn quốc',
            tuitionLimit: data.tuition_limit || 0, 
            livingCost: data.living_cost_monthly || 0,
            workEnv: data.work_environment || 'Chưa xác định'
          });
        } else {
          // HIỆN THẲNG LỖI LÊN MÀN HÌNH ĐỂ DỄ FIX
          setDebugMsg(`React đã gửi yêu cầu tìm ID = ${currentUserId}, nhưng Backend trả về mã lỗi: ${res.status}`);
          setHasData(false);
        }
      } catch (error) {
        setDebugMsg(`Mất kết nối tới Backend! Hãy kiểm tra xem Server Python đã chạy chưa.`);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const formatMoney = (val) => {
    if (!val || val === 0) return 'Chưa xác định';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const g10 = parseFloat(profileData.gpa10) || 0;
  const g11 = parseFloat(profileData.gpa11) || 0;
  const g12 = parseFloat(profileData.gpa12) || 0;
  let validY = 0, totalG = 0;
  if(g10 > 0){ totalG += g10; validY++; }
  if(g11 > 0){ totalG += g11; validY++; }
  if(g12 > 0){ totalG += g12; validY++; }
  const avgGpa = validY > 0 ? (totalG / validY).toFixed(1) : '-';

  const getPrizeLabel = (level) => {
    switch(level) {
      case 'qg': return 'Cấp Quốc Gia';
      case 'tinh': return 'Cấp Tỉnh/TP';
      case 'truong': return 'Cấp Trường';
      default: return 'Không có';
    }
  };

  if (isLoading) {
    return <div className="profile-loading"><i className="fas fa-circle-notch fa-spin"></i> Đang tải hồ sơ...</div>;
  }

  if (!hasData) {
    return (
      <div className="profile-empty-state fade-in">
        <i className="fas fa-folder-open empty-icon"></i>
        <h2>Bạn chưa có Hồ sơ học thuật</h2>
        
        {/* THANH BÁO LỖI TRỰC QUAN */}
        {debugMsg && (
          <div style={{background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold'}}>
            🛠 TRẠNG THÁI LỖI: {debugMsg}
          </div>
        )}

        <p>Hãy hoàn thành 4 bước Định hướng để hệ thống lưu trữ hồ sơ và phân tích lộ trình tốt nhất cho bạn.</p>
        <button onClick={() => navigate('/orientation')} className="btn-go-orientation">
          Bắt đầu Định hướng ngay <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="profile-dashboard-wrapper fade-in">
      <div className="profile-header-banner">
        <div className="avatar-large"><img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" /></div>
        <div className="user-titles">
          <h1>{profileData.fullName}</h1>
          <p><i className="fas fa-school"></i> Lớp {profileData.className} - {profileData.schoolName}</p>
        </div>
        <button onClick={() => navigate('/orientation')} className="btn-edit-profile">
          <i className="fas fa-pencil-alt"></i> Cập nhật (Định hướng)
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-title"><i className="fas fa-graduation-cap" style={{color: '#4338ca'}}></i> Điểm số học thuật</div>
          <div className="scores-showcase">
            <div className="score-item highlight-score">
              <span>Mục tiêu khối</span>
              <strong>{profileData.block}</strong>
            </div>
            <div className="score-item highlight-score">
              <span>Tổng THPT</span>
              <strong>{profileData.examScore}</strong>
            </div>
            <div className="score-item">
              <span>GPA Trung bình</span>
              <strong>{avgGpa}</strong>
            </div>
            <div className="score-item">
              <span>Thi ĐGNL</span>
              <strong>{profileData.dgnlScore}</strong>
            </div>
            <div className="score-item">
              <span>IELTS</span>
              <strong>{profileData.ielts}</strong>
            </div>
            <div className="score-item">
              <span>SAT</span>
              <strong>{profileData.satScore}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title"><i className="fas fa-compass" style={{color: '#059669'}}></i> Lộ trình & Nguồn lực</div>
          <ul className="info-list">
            <li>
              <div className="info-label"><i className="fas fa-map-marker-alt"></i> Khu vực mục tiêu:</div>
              <div className="info-value">{profileData.location}</div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-wallet"></i> Ngân sách Học phí:</div>
              <div className="info-value text-green">{formatMoney(profileData.tuitionLimit)} / Năm</div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-hamburger"></i> Phí sinh hoạt:</div>
              <div className="info-value">{formatMoney(profileData.livingCost)} / Tháng</div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-medal"></i> Giải thưởng HSG:</div>
              <div className="info-value">{getPrizeLabel(profileData.prizeLevel)}</div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-palette"></i> Năng khiếu đặc thù:</div>
              <div className="info-value">{profileData.hasPortfolio ? 'Có năng khiếu' : 'Không có'}</div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-building"></i> MT Làm việc yêu thích:</div>
              <div className="info-value">{profileData.workEnv}</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="ai-call-to-action" onClick={() => navigate('/ai-suggestion')}>
        <div className="ai-cta-content">
          <i className="fas fa-robot ai-icon-large"></i>
          <div>
            <h3>Kích hoạt AI Cố vấn Tuyển sinh</h3>
            <p>Hệ thống đã nhận đủ dữ liệu. Nhấn vào đây để xem ngay danh sách trường Đại học khả thi nhất với bạn.</p>
          </div>
        </div>
        <button className="btn-ai-go">Xem Phân Tích <i className="fas fa-arrow-right"></i></button>
      </div>

    </div>
  );
};

export default ProfileForm;