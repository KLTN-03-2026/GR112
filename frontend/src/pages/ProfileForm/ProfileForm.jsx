import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2'; 
import './ProfileForm.css'; 

const ProfileForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [debugMsg, setDebugMsg] = useState(""); 
  
  // Trạng thái bật/tắt chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(1);

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

  // State chứa dữ liệu đang chỉnh sửa
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    let currentUserId = 1; 
    let personalInfo = {};
    
    if (savedUser) {
      try { 
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.id) {
          currentUserId = userObj.id; 
          setCurrentId(currentUserId);
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

    const fetchProfile = async () => {
      try {
        const res = await fetch(`https://gr112.onrender.com/api/orientation/${currentUserId}`);
        
        if (res.ok) {
          const data = await res.json();
          setHasData(true);
          const formattedData = {
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
          };
          setProfileData(formattedData);
          setFormData(formattedData); // Đổ dữ liệu vào form nháp để sửa
        } else {
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

  // Hàm xử lý khi người dùng nhập liệu
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Hàm lưu dữ liệu lên server
  const handleSaveProfile = async () => {
    try {
      const payload = {
        target_block: formData.block,
        exam_score: formData.examScore === '-' ? null : parseFloat(formData.examScore),
        gpa_10: formData.gpa10 === '-' ? null : parseFloat(formData.gpa10),
        gpa_11: formData.gpa11 === '-' ? null : parseFloat(formData.gpa11),
        gpa_12: formData.gpa12 === '-' ? null : parseFloat(formData.gpa12),
        dgnl_score: formData.dgnlScore === '-' ? null : parseInt(formData.dgnlScore),
        sat_score: formData.satScore === '-' ? null : parseInt(formData.satScore),
        ielts_score: formData.ielts === '-' ? null : formData.ielts,
        prize_level: formData.prizeLevel,
        has_portfolio: formData.hasPortfolio,
        study_location: formData.location,
        tuition_limit: parseInt(formData.tuitionLimit),
        living_cost_monthly: parseInt(formData.livingCost),
      };

      const res = await fetch(`https://gr112.onrender.com/api/orientation/${currentId}`, {
        method: 'PUT', // Hoặc 'POST' tùy theo thiết kế backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire({
          title: 'Cập nhật thành công!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setProfileData(formData);
        setIsEditing(false); 
      } else {
        Swal.fire('Lỗi!', 'Không thể lưu hồ sơ, vui lòng thử lại.', 'error');
      }
    } catch (error) {
      Swal.fire('Lỗi kết nối!', 'Mất kết nối đến Server.', 'error');
    }
  };

  const g10 = parseFloat(isEditing ? formData.gpa10 : profileData.gpa10) || 0;
  const g11 = parseFloat(isEditing ? formData.gpa11 : profileData.gpa11) || 0;
  const g12 = parseFloat(isEditing ? formData.gpa12 : profileData.gpa12) || 0;
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

  const inputStyle = { width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px' };

  if (isLoading) return <div className="profile-loading"><i className="fas fa-circle-notch fa-spin"></i> Đang tải hồ sơ...</div>;

  if (!hasData) {
    return (
      <div className="profile-empty-state fade-in">
        <i className="fas fa-folder-open empty-icon"></i>
        <h2>Bạn chưa có Hồ sơ học thuật</h2>
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
        
        {/* 🚀 ĐÃ FIX BỌC WRAPPER ĐỂ HAI NÚT KHÔNG ĐÈ NHAU MÀ XẾP NGANG */}
        <div style={{ position: 'absolute', right: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isEditing ? (
            <>
              <button onClick={handleSaveProfile} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#10b981', color: 'white', fontWeight: 'bold' }}>
                <i className="fas fa-save"></i> Lưu Thay Đổi
              </button>
              <button onClick={() => {setIsEditing(false); setFormData(profileData);}} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#ef4444', color: 'white', fontWeight: 'bold' }}>
                <i className="fas fa-times"></i> Hủy
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', backdropFilter: 'blur(5px)' }}>
                <i className="fas fa-edit"></i> Sửa nhanh
              </button>
              <button onClick={() => navigate('/orientation')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#4f46e5', color: 'white', fontWeight: 'bold' }}>
                <i className="fas fa-redo"></i> Định hướng lại
              </button>
            </>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-title"><i className="fas fa-graduation-cap" style={{color: '#4338ca'}}></i> Điểm số học thuật</div>
          <div className="scores-showcase">
            <div className="score-item highlight-score">
              <span>Mục tiêu khối</span>
              {isEditing ? <input style={inputStyle} value={formData.block} onChange={e => handleInputChange('block', e.target.value)} /> : <strong>{profileData.block}</strong>}
            </div>
            <div className="score-item highlight-score">
              <span>Tổng THPT</span>
              {isEditing ? <input type="number" style={inputStyle} value={formData.examScore} onChange={e => handleInputChange('examScore', e.target.value)} /> : <strong>{profileData.examScore}</strong>}
            </div>
            
            <div className="score-item">
              <span>GPA Lớp 10</span>
              {isEditing ? <input type="number" step="0.1" style={inputStyle} value={formData.gpa10} onChange={e => handleInputChange('gpa10', e.target.value)} /> : <strong>{profileData.gpa10}</strong>}
            </div>
            <div className="score-item">
              <span>GPA Lớp 11</span>
              {isEditing ? <input type="number" step="0.1" style={inputStyle} value={formData.gpa11} onChange={e => handleInputChange('gpa11', e.target.value)} /> : <strong>{profileData.gpa11}</strong>}
            </div>
            <div className="score-item">
              <span>GPA Lớp 12</span>
              {isEditing ? <input type="number" step="0.1" style={inputStyle} value={formData.gpa12} onChange={e => handleInputChange('gpa12', e.target.value)} /> : <strong>{profileData.gpa12}</strong>}
            </div>
             <div className="score-item">
              <span>GPA Trung bình</span>
              <strong>{avgGpa}</strong>
            </div>
            <div className="score-item">
              <span>Thi ĐGNL</span>
              {isEditing ? <input type="number" style={inputStyle} value={formData.dgnlScore} onChange={e => handleInputChange('dgnlScore', e.target.value)} /> : <strong>{profileData.dgnlScore}</strong>}
            </div>
            <div className="score-item">
              <span>IELTS</span>
              {isEditing ? <input style={inputStyle} value={formData.ielts} onChange={e => handleInputChange('ielts', e.target.value)} /> : <strong>{profileData.ielts}</strong>}
            </div>
            <div className="score-item">
              <span>SAT</span>
              {isEditing ? <input type="number" style={inputStyle} value={formData.satScore} onChange={e => handleInputChange('satScore', e.target.value)} /> : <strong>{profileData.satScore}</strong>}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title"><i className="fas fa-compass" style={{color: '#059669'}}></i> Lộ trình & Nguồn lực</div>
          <ul className="info-list">
            <li>
              <div className="info-label"><i className="fas fa-map-marker-alt"></i> Khu vực:</div>
              <div className="info-value">
                {isEditing ? <input style={inputStyle} value={formData.location} onChange={e => handleInputChange('location', e.target.value)} /> : profileData.location}
              </div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-wallet"></i> Học phí (Năm):</div>
              <div className="info-value text-green">
                {isEditing ? <input type="number" style={inputStyle} value={formData.tuitionLimit} onChange={e => handleInputChange('tuitionLimit', e.target.value)} /> : `${formatMoney(profileData.tuitionLimit)} / Năm`}
              </div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-hamburger"></i> Sinh hoạt (Tháng):</div>
              <div className="info-value">
                {isEditing ? <input type="number" style={inputStyle} value={formData.livingCost} onChange={e => handleInputChange('livingCost', e.target.value)} /> : `${formatMoney(profileData.livingCost)} / Tháng`}
              </div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-medal"></i> Giải thưởng:</div>
              <div className="info-value">
                {isEditing ? (
                  <select style={inputStyle} value={formData.prizeLevel} onChange={e => handleInputChange('prizeLevel', e.target.value)}>
                    <option value="none">Không có</option>
                    <option value="truong">Cấp Trường</option>
                    <option value="tinh">Cấp Tỉnh/TP</option>
                    <option value="qg">Cấp Quốc Gia</option>
                  </select>
                ) : getPrizeLabel(profileData.prizeLevel)}
              </div>
            </li>
            <li>
              <div className="info-label"><i className="fas fa-palette"></i> Năng khiếu:</div>
              <div className="info-value">
                {isEditing ? (
                  <select style={inputStyle} value={formData.hasPortfolio} onChange={e => handleInputChange('hasPortfolio', e.target.value === 'true')}>
                    <option value="false">Không có</option>
                    <option value="true">Có năng khiếu</option>
                  </select>
                ) : (profileData.hasPortfolio ? 'Có năng khiếu' : 'Không có')}
              </div>
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