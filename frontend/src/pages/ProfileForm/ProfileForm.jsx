import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm import này
import './ProfileForm.css';

const ProfileForm = () => {
  const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng

  // --- State dữ liệu ---
  const [personal, setPersonal] = useState({ fullName: '', className: '', schoolName: '', targetBlock: 'A00' });
  const [scores, setScores] = useState({ toan: '', ly: '', hoa: '', sinh: '', van: '', su: '', dia: '', gdcd: '', anh: '', ielts: '', ve1: '', ve2: '' });
  const [strengths, setStrengths] = useState({ logic: 50, giai_quyet_van_de: 50, lam_viec_nhom: 50, giao_tiep: 50, sang_tao: 50 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  // --- Cấu hình khối thi ---
  const blockSubjectsMapping = {
    "A00": ["toan", "ly", "hoa"], "A01": ["toan", "ly", "anh"], "B00": ["toan", "hoa", "sinh"],
    "C00": ["van", "su", "dia"], "D01": ["toan", "van", "anh"], "D07": ["toan", "hoa", "anh"],
    "V00": ["toan", "ly", "ve1"], "H00": ["van", "ve1", "ve2"],
  };

  const allSubjectKeys = ["toan", "ly", "hoa", "sinh", "van", "su", "dia", "gdcd", "anh", "ve1", "ve2"];
  const subjectNames = {
    toan: "Toán học", ly: "Vật lý", hoa: "Hóa học", sinh: "Sinh học", van: "Ngữ văn", su: "Lịch sử", 
    dia: "Địa lý", gdcd: "Giáo dục công dân", anh: "Tiếng Anh", ve1: "Năng khiếu 1", ve2: "Năng khiếu 2"
  };

  // --- Xử lý thay đổi ---
  const handlePersonalChange = (e) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
    if (e.target.name === 'targetBlock') setShowAllSubjects(false); 
  };
  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) setScores({ ...scores, [name]: value });
  };
  const handleStrengthChange = (e) => setStrengths({ ...strengths, [e.target.name]: Number(e.target.value) });

  // --- Lưu hồ sơ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const savedUser = localStorage.getItem("user");
    let currentUserId = null;
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      currentUserId = userObj.id;
    }

    if (!currentUserId) {
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để lưu hồ sơ.");
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      userId: currentUserId,
      personalInfo: personal,
      scores: scores,
      strengths: strengths
    };

    try {
      const response = await fetch('http://localhost:8000/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      if(response.ok) {
         alert("🎉 Hồ sơ của bạn đã được cập nhật tự động!");
      } else {
         alert("Lỗi lưu dữ liệu!");
      }
    } catch (error) {
      alert("Không kết nối được với Server!");
    } finally {
      setIsLoading(false);
    }
  };

  const currentSubjectsToDisplay = showAllSubjects || personal.targetBlock === "Khác" ? allSubjectKeys : (blockSubjectsMapping[personal.targetBlock] || []);

  return (
    <div className="profile-page-wrapper fade-in">
      
      {/* ======================= CỘT TRÁI: FORM NHẬP LIỆU ======================= */}
      <div className="form-left-side">
        <h2><i className="fas fa-id-card"></i> Cập Nhật Hồ Sơ Học Tập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><i className="fas fa-user-circle"></i> Thông tin & Mục tiêu</h3>
            <div className="personal-grid">
              <div className="input-group">
                <label>Họ và Tên</label>
                <input type="text" name="fullName" value={personal.fullName} onChange={handlePersonalChange} placeholder="VD: Trần Minh Quân" required />
              </div>
              <div className="school-class-grid">
                <div className="input-group"><label>Lớp</label><input type="text" name="className" value={personal.className} onChange={handlePersonalChange} placeholder="VD: 12A1" required /></div>
                <div className="input-group"><label>Trường THPT</label><input type="text" name="schoolName" value={personal.schoolName} onChange={handlePersonalChange} placeholder="VD: THPT Chuyên" required /></div>
              </div>
              <div className="input-group" style={{marginTop: '5px'}}>
                <label style={{color: '#e63946'}}>Khối xét tuyển mục tiêu</label>
                <select name="targetBlock" value={personal.targetBlock} onChange={handlePersonalChange}>
                  <option value="A00">Khối A00 (Toán, Lý, Hóa)</option>
                  <option value="A01">Khối A01 (Toán, Lý, Anh)</option>
                  <option value="B00">Khối B00 (Toán, Hóa, Sinh)</option>
                  <option value="C00">Khối C00 (Văn, Sử, Địa)</option>
                  <option value="D01">Khối D01 (Toán, Văn, Anh)</option>
                  <option value="D07">Khối D07 (Toán, Hóa, Anh)</option>
                  <option value="V00">Khối V00 (Toán, Lý, Vẽ)</option>
                  <option value="H00">Khối H00 (Văn, Vẽ 1, Vẽ 2)</option>
                  <option value="Khác">Khối khác...</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0}}><i className="fas fa-graduation-cap"></i> Điểm các môn xét tuyển</h3>
              {personal.targetBlock !== "Khác" && (
                <button type="button" onClick={() => setShowAllSubjects(!showAllSubjects)} style={{background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline'}}>
                  {showAllSubjects ? "Chỉ hiện môn của khối" : "+ Nhập thêm môn khác"}
                </button>
              )}
            </div>
            <div className="grid-inputs">
              {currentSubjectsToDisplay.map((subjKey) => (
                <div className="input-group fade-in" key={subjKey}>
                  <label>{subjectNames[subjKey]}</label>
                  <input type="number" step="0.1" name={subjKey} value={scores[subjKey]} onChange={handleScoreChange} placeholder={`Điểm ${subjectNames[subjKey]}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3><i className="fas fa-chart-bar"></i> Đánh giá năng lực (%)</h3>
            <div className="grid-inputs">
              <div className="input-group slider-group"><label>Tư duy logic <span className="percent-value">{strengths.logic}%</span></label><input type="range" name="logic" min="0" max="100" value={strengths.logic} onChange={handleStrengthChange} /></div>
              <div className="input-group slider-group"><label>Giải quyết vấn đề <span className="percent-value">{strengths.giai_quyet_van_de}%</span></label><input type="range" name="giai_quyet_van_de" min="0" max="100" value={strengths.giai_quyet_van_de} onChange={handleStrengthChange} /></div>
              <div className="input-group slider-group"><label>Làm việc nhóm <span className="percent-value">{strengths.lam_viec_nhom}%</span></label><input type="range" name="lam_viec_nhom" min="0" max="100" value={strengths.lam_viec_nhom} onChange={handleStrengthChange} /></div>
              <div className="input-group slider-group"><label>Giao tiếp <span className="percent-value">{strengths.giao_tiep}%</span></label><input type="range" name="giao_tiep" min="0" max="100" value={strengths.giao_tiep} onChange={handleStrengthChange} /></div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            {isLoading ? ' Đang lưu dữ liệu...' : ' LƯU HỒ SƠ'}
          </button>
        </form>
      </div>

      {/* ======================= CỘT PHẢI: LIVE PREVIEW ======================= */}
      <div className="preview-right-side">
        <h3>Hồ sơ xem trước</h3>
        
        <div className="profile-header-card">
          <div className="avatar"><img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" /></div>
          <div>
            <h3>{personal.fullName || "Tên học sinh"}</h3>
            <p>{personal.className || "Lớp"} - {personal.schoolName || "Trường THPT"}</p>
          </div>
        </div>

        <div className="score-grid">
          {currentSubjectsToDisplay.map(key => (
            <div className="score-box" key={key}>
              <span>{subjectNames[key]}</span>
              <strong>{scores[key] ? scores[key] : "-"}</strong>
            </div>
          ))}
        </div>

        <div className="chat-panel-section">
          {/* Progress bars... */}
          <div className="strength-item">
            <span>Tư duy logic</span>
            <div className="progress-wrapper"><div className="progress-fill" style={{width: `${strengths.logic}%`}}></div></div>
          </div>
          <div className="strength-item">
            <span>Giải quyết vấn đề</span>
            <div className="progress-wrapper"><div className="progress-fill" style={{width: `${strengths.giai_quyet_van_de}%`}}></div></div>
          </div>
        </div>

        {/* 3. SỬA NÚT CHUYỂN SANG GỢI Ý Ở ĐÂY */}
        <div 
            className="ai-status-card" 
            onClick={() => navigate('/ai-suggestion')} 
            style={{ cursor: 'pointer', marginTop: '20px' }}
        >
          <div className="ai-label">
            <i className="fas fa-robot"></i> 
            <span>Trợ lý AI</span>
          </div>
          <h4 className="ai-message">
            Sẵn sàng tư vấn khối {personal.targetBlock}
          </h4>
          <small style={{ color: '#15803d', fontStyle: 'italic', marginTop: '5px' }}>
            (Nhấn để xem gợi ý ngay)
          </small>
        </div>

      </div>
    </div>
  );
};

export default ProfileForm;