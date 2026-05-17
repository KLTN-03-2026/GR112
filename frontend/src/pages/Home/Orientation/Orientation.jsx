import React, { useState, useEffect } from 'react';
import './Orientation.css';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

const Orientation = () => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // ĐÃ SỬA: Tự động lấy ID thật từ tài khoản đang đăng nhập
  const [currentUserId] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try { 
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.id) return userObj.id; 
      } catch(e) { console.error(e); }
    }
    return 1; // Nếu chưa đăng nhập thì tạm dùng ID 1
  });

  const [formData, setFormData] = useState({
    interests: [], 
    workEnv: '', 
    gpa10: '', 
    gpa11: '', 
    gpa12: '', 
    examScore: '', 
    dgnlScore: '', 
    ielts: '0',    
    satScore: '',  
    prizeLevel: 'none', 
    hasPortfolio: false, 
    block: 'A01', 
    location: 'TP. Hồ Chí Minh',
    tuitionLimit: 150000000, 
    livingCost: 8000000
  });

  const [allUniversities, setAllUniversities] = useState([]);
  const [suggestedUnis, setSuggestedUnis] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu cũ nếu người dùng đã từng lưu hồ sơ
    const fetchOldData = async () => {
      try {
        const res = await fetch(`https://gr112.onrender.com/api/orientation/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            interests: data.interests || [],
            workEnv: data.work_environment || '',
            gpa10: data.gpa_10 || '', 
            gpa11: data.gpa_11 || '', 
            gpa12: data.gpa_12 || '',
            examScore: data.exam_score || '',
            dgnlScore: data.dgnl_score || '',
            ielts: data.ielts_score || '0',
            satScore: data.sat_score || '',
            prizeLevel: data.prize_level || 'none',
            hasPortfolio: data.has_portfolio || false,
            block: data.target_block || 'A01',
            location: data.study_location || 'TP. Hồ Chí Minh',
            tuitionLimit: data.tuition_limit ? Number(data.tuition_limit) : 150000000,
            livingCost: data.living_cost_monthly ? Number(data.living_cost_monthly) : 8000000
          }));
        }
      } catch (e) {
        console.log("Chưa có dữ liệu định hướng cũ, sẽ dùng mặc định.");
      }
    };

    // Tải toàn bộ Database trường học để lọc ở Step 4
    const fetchUnis = async () => {
      try {
        const res = await fetch('https://gr112.onrender.com/api/universities');
        if (res.ok) {
          const data = await res.json();
          setAllUniversities(data);
        }
      } catch (e) {
        console.error("Lỗi tải danh sách trường từ DB:", e);
      }
    };

    fetchOldData();
    fetchUnis();
  }, [currentUserId]); // Cập nhật lại nếu currentUserId thay đổi

  const toggleInterest = (tag) => {
    setFormData(prev => ({
      ...prev, interests: prev.interests.includes(tag) ? prev.interests.filter(i => i !== tag) : [...prev.interests, tag]
    }));
  };

  // Tính điểm quy đổi (Học bạ / THPT + IELTS + SAT)
  const calculateUserScores = () => {
    const g10 = parseFloat(formData.gpa10) || 0;
    const g11 = parseFloat(formData.gpa11) || 0;
    const g12 = parseFloat(formData.gpa12) || 0;
    let validYears = 0, totalGpa = 0;
    if (g10 > 0) { totalGpa += g10; validYears++; }
    if (g11 > 0) { totalGpa += g11; validYears++; }
    if (g12 > 0) { totalGpa += g12; validYears++; }
    
    // Điểm Học bạ (Quy đổi thang 30)
    const hocBa = validYears > 0 ? (totalGpa / validYears) * 3 : 0;
    const thpt = parseFloat(formData.examScore) || 0;
    
    // Quy đổi điểm ưu tiên IELTS
    const ielts = parseFloat(formData.ielts) || 0;
    let bonusIelts = 0;
    if (ielts >= 8.0) bonusIelts = 2.0;
    else if (ielts >= 6.5) bonusIelts = 1.5;
    else if (ielts >= 5.5) bonusIelts = 0.5;

    // Quy đổi điểm ưu tiên SAT
    const sat = parseInt(formData.satScore) || 0;
    let bonusSat = 0;
    if (sat >= 1400) bonusSat = 2.0;
    else if (sat >= 1200) bonusSat = 1.0;

    const totalBonus = bonusIelts + bonusSat;

    return {
      hocBa: hocBa > 0 ? hocBa + totalBonus : 0,
      thpt: thpt > 0 ? thpt + totalBonus : 0
    };
  };

  // --- HÀM LỌC TRƯỜNG ---
  const generateResults = () => {
    if (!allUniversities || allUniversities.length === 0) return;

    let filtered = allUniversities.filter(uni => {
      const dbBlocks = (uni.subject_block || uni.block || "").toString().toUpperCase();
      const userBlock = (formData.block || "").toUpperCase();
      return dbBlocks.includes(userBlock);
    });

    if (filtered.length === 0) filtered = allUniversities;

    if (formData.location && formData.location !== 'Toàn quốc') {
      const searchLoc = formData.location.replace('TP. ', '').replace('Tỉnh ', '').trim().toLowerCase();
      filtered = filtered.filter(uni => {
        const uniRegion = (uni.ranking_note || uni.school_name || "").toLowerCase();
        return uniRegion.includes(searchLoc);
      });
    }

    const userScores = calculateUserScores();
    const userDgnl = parseInt(formData.dgnlScore) || 0;
    const userIelts = parseFloat(formData.ielts) || 0;
    const userSat = parseInt(formData.satScore) || 0;
    const hasPrize = formData.prizeLevel && formData.prizeLevel !== 'none';
    const hasAptitude = formData.hasPortfolio;
    
    const isAptitudeBlock = formData.block && ['V', 'H', 'M', 'N', 'T'].some(char => formData.block.startsWith(char));
    const userHasAnyScore = userScores.hocBa > 0 || userScores.thpt > 0 || userDgnl > 0 || hasPrize || userIelts > 0 || userSat > 0;

    let scoreFiltered = filtered.filter(uni => {
      const uniHocBaReq = parseFloat(uni.base_score) || 0;            
      const uniThptReq = parseFloat(uni.score_thpt_last_year) || 0;    
      const uniDgnlReq = parseInt(uni.score_dgnl) || 0;               
      const uniComboCert = uni.combo_cert || "";                        

      if (isAptitudeBlock && !hasAptitude) return false;
      if (!userHasAnyScore) return true;
      if (hasPrize || hasAptitude) return true;
      if (uniDgnlReq > 0 && userDgnl > 0 && userDgnl >= uniDgnlReq) return true;
      if (uniHocBaReq > 0 && userScores.hocBa > 0 && userScores.hocBa >= uniHocBaReq) return true;
      if (uniThptReq > 0 && userScores.thpt > 0 && userScores.thpt >= uniThptReq) return true;
      if (uniComboCert && (userIelts > 0 || userSat > 0)) {
        let reqIelts = 99;
        let reqSat = 9999;
        const matchIelts = uniComboCert.match(/IELTS\s*(\d+(\.\d+)?)/i);
        if (matchIelts) reqIelts = parseFloat(matchIelts[1]);
        const matchSat = uniComboCert.match(/SAT\s*(\d+)/i);
        if (matchSat) reqSat = parseInt(matchSat[1]);
        if (userIelts >= reqIelts) return true;
        if (userSat >= reqSat) return true;
      }
      if (uniThptReq === 0 && uniHocBaReq === 0 && uniDgnlReq === 0) return true;
      return false; 
    });

    scoreFiltered.sort((a, b) => {
      const maxA = Math.max(parseFloat(a.score_thpt_last_year || 0), parseFloat(a.base_score || 0));
      const maxB = Math.max(parseFloat(b.score_thpt_last_year || 0), parseFloat(b.base_score || 0));
      return maxB - maxA;
    });

    setSuggestedUnis(scoreFiltered);
  };

  const nextStep = () => {
    window.scrollTo(0, 0);
    if (step === 3) generateResults(); 
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => { 
    window.scrollTo(0, 0); 
    if (step > 1) setStep(step - 1); 
  };

  // --- HÀM LƯU DỮ LIỆU XUỐNG MYSQL ---
  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      // Bây giờ payload gửi đi sẽ mang chính xác currentUserId (ví dụ ID 12)
      const payload = { ...formData, userId: currentUserId };
      
      const response = await fetch('https://gr112.onrender.com/api/orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (response.ok) {
        alert("🎉 " + result.message);
      } else {
        alert("❌ Lỗi: " + result.error);
      }
    } catch (error) {
      alert("⚠️ Lỗi kết nối Server Backend! Hãy chắc chắn API Flask đang chạy.");
    }
    setIsSaving(false);
  };
  
  return (
    <div className="ori-layout">
      <div className="ori-sidebar">
        <div className="ori-sidebar-top">
          <h3>ĐỊNH HƯỚNG 4 BƯỚC</h3>
          <p>Tiến trình học thuật</p>
          <div className="ori-steps">
            <div className={`ori-step-item ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}><i className="fas fa-brain"></i> Phân tích Năng lực</div>
            <div className={`ori-step-item ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}><i className="fas fa-graduation-cap"></i> Đánh giá Học thuật</div>
            <div className={`ori-step-item ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)}><i className="fas fa-filter"></i> Lựa chọn Đại học</div>
            <div className={`ori-step-item ${step === 4 ? 'active' : ''}`} onClick={() => { if(step===3 || step < 4) generateResults(); setStep(4); }}><i className="fas fa-clipboard-list"></i> Lập Kế hoạch</div>
          </div>
        </div>
      </div>

      <div className="ori-main">
        {step === 1 && <Step1 formData={formData} setFormData={setFormData} toggleInterest={toggleInterest} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} />}
        {step === 3 && <Step3 formData={formData} setFormData={setFormData} />}
        {step === 4 && <Step4 formData={formData} suggestedUnis={suggestedUnis} handleSaveData={handleSaveData} isSaving={isSaving} />}

        <div className="ori-nav-btns">
          {step === 1 && <span className="ori-info-text"><i className="fas fa-info-circle"></i> Bạn có thể thay đổi các lựa chọn này bất cứ lúc nào.</span>}
          {step > 1 && <button className="btn-back" onClick={prevStep}>QUAY LẠI</button>}
          {step < 4 && <button className="btn-next" onClick={nextStep}>TIẾP THEO <i className="fas fa-arrow-right"></i></button>}
        </div>
      </div>
    </div>
  );
};

export default Orientation;