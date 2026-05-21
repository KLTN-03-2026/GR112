import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FULL_BLOCKS = [
  { id: 'A00', sub: 'Toán, Lý, Hóa', desc: 'Khối Công nghệ & Kỹ thuật' },
  { id: 'A01', sub: 'Toán, Lý, Anh', desc: 'Khối Kỹ thuật & Kinh tế' },
  { id: 'A02', sub: 'Toán, Lý, Sinh', desc: 'Khối Kỹ thuật y sinh' },
  { id: 'A03', sub: 'Toán, Lý, Sử', desc: 'Khối Sư phạm Lý' },
  { id: 'A04', sub: 'Toán, Lý, Địa', desc: 'Khối Xây dựng, Vận tải' },
  { id: 'A09', sub: 'Toán, Địa, GDCD', desc: 'Khối Sư phạm Địa, KHXH' },
  { id: 'B00', sub: 'Toán, Hóa, Sinh', desc: 'Khối Y Dược, Sinh học' },
  { id: 'B03', sub: 'Toán, Sinh, Văn', desc: 'Khối Nông Lâm, Y tế' },
  { id: 'B04', sub: 'Toán, Sinh, GDCD', desc: 'Khối Tâm lý học, KHXH' },
  { id: 'B08', sub: 'Toán, Sinh, Anh', desc: 'Khối Công nghệ sinh học' },
  { id: 'C00', sub: 'Văn, Sử, Địa', desc: 'Khối Báo chí, Luật, KHXH' },
  { id: 'C01', sub: 'Văn, Toán, Lý', desc: 'Khối Sư phạm, Cơ bản' },
  { id: 'C02', sub: 'Văn, Toán, Hóa', desc: 'Khối Công nghệ thực phẩm' },
  { id: 'C03', sub: 'Văn, Toán, Sử', desc: 'Khối An ninh, Cảnh sát' },
  { id: 'C04', sub: 'Văn, Toán, Địa', desc: 'Khối Địa lý, Du lịch' },
  { id: 'C14', sub: 'Văn, Toán, GDCD', desc: 'Khối Luật, Quản trị' },
  { id: 'C15', sub: 'Văn, Toán, KHXH', desc: 'Khối Kinh tế, Báo chí' },
  { id: 'C19', sub: 'Văn, Sử, GDCD', desc: 'Khối Sư phạm, KHXH' },
  { id: 'C20', sub: 'Văn, Địa, GDCD', desc: 'Khối Quản lý văn hóa' },
  { id: 'D01', sub: 'Văn, Toán, Anh', desc: 'Khối Kinh tế & Ngôn ngữ' },
  { id: 'D02', sub: 'Văn, Toán, Nga', desc: 'Ngôn ngữ Nga' },
  { id: 'D03', sub: 'Văn, Toán, Pháp', desc: 'Ngôn ngữ Pháp' },
  { id: 'D04', sub: 'Văn, Toán, Trung', desc: 'Ngôn ngữ Trung Quốc' },
  { id: 'D06', sub: 'Văn, Toán, Nhật', desc: 'Ngôn ngữ Nhật Bản' },
  { id: 'D07', sub: 'Toán, Hóa, Anh', desc: 'Khối Kỹ thuật & Kinh tế' },
  { id: 'D14', sub: 'Văn, Sử, Anh', desc: 'Khối KHXH & Ngôn ngữ' },
  { id: 'D15', sub: 'Văn, Địa, Anh', desc: 'Khối KHXH & Du lịch' },
  { id: 'D66', sub: 'Văn, GDCD, Anh', desc: 'Khối Luật & Kinh doanh' },
  { id: 'D78', sub: 'Văn, KHXH, Anh', desc: 'Khối Ngôn ngữ & KHXH' },
  { id: 'D84', sub: 'Toán, GDCD, Anh', desc: 'Khối Kinh tế & Quản lý' },
  { id: 'D90', sub: 'Toán, KHTN, Anh', desc: 'Khối CNTT & Kinh tế' },
  { id: 'H00', sub: 'Văn, Vẽ NT1, Vẽ NT2', desc: 'Khối Thiết kế, Đồ họa' },
  { id: 'H01', sub: 'Toán, Văn, Vẽ Trang trí', desc: 'Khối Thiết kế Đồ họa' },
  { id: 'M00', sub: 'Văn, Toán, Hát/Đọc', desc: 'Khối Giáo dục Mầm non' },
  { id: 'N00', sub: 'Văn, Âm nhạc 1, 2', desc: 'Khối Thanh nhạc, SP Âm nhạc' },
  { id: 'T00', sub: 'Toán, Sinh, Năng khiếu', desc: 'Khối Giáo dục Thể chất' },
  { id: 'V00', sub: 'Toán, Lý, Vẽ Hình họa', desc: 'Khối Kiến trúc, Quy hoạch' },
  { id: 'V01', sub: 'Toán, Văn, Vẽ Hình họa', desc: 'Khối Thiết kế Nội thất' }
];

const Step2 = ({ formData, setFormData, onNext }) => {
  const [allUnis, setAllUnis] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const blocks = FULL_BLOCKS; 

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axios.get('https://gr112.onrender.com/api/universities');
        setAllUnis(res.data);
      } catch (e) {
        console.error("Lỗi tải dữ liệu trường Step 2:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  const updateFieldAndMethod = (field, value, methodStr) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      admissionMethod: methodStr
    }));
  };

  // ==========================================
  // THUẬT TOÁN KIỂM TRA ĐIỂM (BẮT TEST CASE)
  // ==========================================
  const validateScore = (value, maxScore) => {
    if (!value) return ''; // Bỏ trống thì không lỗi
    // Bắt lỗi: Có chữ cái HOẶC dấu trừ (âm)
    if (/[a-zA-Z]/.test(value) || value.includes('-')) {
      return 'Điểm không hợp lệ';
    }
    // Bắt lỗi: Quá điểm tối đa (VD: > 10)
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num < 0 || num > maxScore) {
      return 'Điểm không hợp lệ';
    }
    return '';
  };

  const handleScoreChange = (field, value, methodStr, maxScore) => {
    updateFieldAndMethod(field, value, methodStr); // Cập nhật state gốc
    // Validate ngay lập tức để lấy lỗi
    const errorMsg = validateScore(value, maxScore);
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    
    // ĐẨY TRẠNG THÁI LỖI LÊN FILE CHA (ORIENTATION) - NẾU CẦN
    // Cái này hơi nâng cao, tạm thời cứ kệ nó, ở đây mình dùng để đỏ ô input là đủ
  };

  const hasErrors = Object.values(errors).some(err => err !== null && err !== '');

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      gpa10: '', gpa11: '', gpa12: '',
      examScore: '', dgnlScore: '', ielts: '0', satScore: '',
      prizeLevel: 'none', hasPortfolio: false, block: '', admissionMethod: ''
    }));
    setErrors({}); // Xóa luôn lỗi khi reset
  };

  const isAptitudeBlock = formData.block && ['V', 'H', 'M', 'N', 'T'].some(char => formData.block.startsWith(char));

  const parseVNScore = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(',', '.')) || 0;
  };

  const calculateEstimatedScore = () => {
    const g10 = parseVNScore(formData.gpa10);
    const g11 = parseVNScore(formData.gpa11);
    const g12 = parseVNScore(formData.gpa12);
    let validYears = 0, totalScore = 0;
    
    if (g10 > 0 && g10 <= 10) { totalScore += g10; validYears++; }
    if (g11 > 0 && g11 <= 10) { totalScore += g11; validYears++; }
    if (g12 > 0 && g12 <= 10) { totalScore += g12; validYears++; }
    
    const avgGpa = validYears > 0 ? (totalScore / validYears) * 3 : 0;
    const thptScore = parseVNScore(formData.examScore);

    const ieltsVal = parseVNScore(formData.ielts);
    const bonus = ieltsVal >= 6.5 ? 1.5 : (ieltsVal >= 5.5 ? 0.5 : 0);
    
    return {
      hocBa: (avgGpa > 0 ? avgGpa + bonus : 0).toFixed(2).replace('.', ','),
      thpt: (thptScore > 0 && thptScore <= 30 ? thptScore + bonus : 0).toFixed(2).replace('.', ','),
      hasHocBa: avgGpa > 0,
      hasTHPT: thptScore > 0,
      hasData: avgGpa > 0 || thptScore > 0 || parseInt(formData.dgnlScore) > 0 || (formData.prizeLevel && formData.prizeLevel !== 'none') || parseInt(formData.satScore) > 0 || parseFloat(formData.ielts) > 0 || formData.hasPortfolio
    };
  };

  const scoreData = calculateEstimatedScore();

  const getQuickSuggestions = () => {
    if (!scoreData.hasData || allUnis.length === 0 || !formData.block || hasErrors) return [];
    
    const userHocBa = parseFloat(scoreData.hocBa.replace(',', '.'));
    const userTHPT = parseFloat(scoreData.thpt.replace(',', '.'));
    
    const userDgnl = parseInt(formData.dgnlScore) || 0;
    const userSat = parseInt(formData.satScore) || 0;
    const userIelts = parseVNScore(formData.ielts);
    const hasDirectAdmission = formData.prizeLevel && formData.prizeLevel !== 'none';
    const hasAptitude = formData.hasPortfolio;

    let suitableUnis = allUnis.map(uni => {
      const uBlock = (uni.subject_block || uni.block || "").toUpperCase();
      if (!uBlock.includes(formData.block.toUpperCase())) return null;
      if (isAptitudeBlock && !hasAptitude) return null;

      const uName = uni.school_name || uni.name;
      const uMajor = uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || "");
      
      const uHocBaReq = parseFloat(uni.base_score) || 0; 
      const uThptReq = parseFloat(uni.score_thpt_last_year) || 0; 
      const uDgnlReq = parseInt(uni.score_dgnl) || 0;
      const uCombo = uni.combo_cert || "";

      let reqIelts = 99;
      const matchIelts = uCombo.match(/IELTS\s*(\d+(\.\d+)?)/i);
      if (matchIelts) reqIelts = parseFloat(matchIelts[1]);
      
      let reqSat = 9999;
      const matchSat = uCombo.match(/SAT\s*(\d+)/i);
      if (matchSat) reqSat = parseInt(matchSat[1]);

      let passedMethod = null;
      let displayScore = 0;

      if (hasDirectAdmission) {
        passedMethod = " Đủ đk Tuyển thẳng";
        displayScore = "TT";
      } else if (userDgnl > 0 && uDgnlReq > 0 && userDgnl >= uDgnlReq) {
        passedMethod = ` Đậu ĐGNL (Cần ${uDgnlReq}+)`;
        displayScore = uDgnlReq;
      } else if (userSat > 0 && userSat >= reqSat) {
        passedMethod = ` Đậu SAT (Cần ${reqSat}+)`;
        displayScore = `SAT ${reqSat}`;
      } else if (userIelts > 0 && userIelts >= reqIelts) {
        passedMethod = ` Đậu IELTS (Cần ${reqIelts}+)`;
        displayScore = `IELTS ${reqIelts}`;
      } else if (hasAptitude && isAptitudeBlock) {
        if ((uThptReq > 0 && userTHPT >= uThptReq) || (uHocBaReq > 0 && userHocBa >= uHocBaReq)) {
          passedMethod = " Đậu Năng khiếu + Văn hóa";
          displayScore = String(Math.max(uThptReq, uHocBaReq)).replace('.', ',');
        } else {
          passedMethod = " Đạt Năng khiếu (Cần bổ sung Văn hóa)";
          displayScore = String(Math.max(uThptReq, uHocBaReq)).replace('.', ',');
        }
      } 
      else if (uThptReq > 0 && userTHPT >= uThptReq) {
        passedMethod = " Đậu bằng điểm THPT";
        displayScore = String(uThptReq).replace('.', ',');
      } else if (uHocBaReq > 0 && userHocBa >= uHocBaReq) {
        passedMethod = " Đậu bằng điểm Học bạ";
        displayScore = String(uHocBaReq).replace('.', ',');
      }

      if (passedMethod) return { ...uni, uName, uMajor, passedMethod, displayScore, uThptReq, uHocBaReq };
      return null;
    }).filter(item => item !== null);
    
    suitableUnis.sort((a, b) => Math.max(b.uThptReq, b.uHocBaReq) - Math.max(a.uThptReq, a.uHocBaReq));
    return suitableUnis.slice(0, 3);
  };

  const quickSuggestions = getQuickSuggestions();

  const getInputStyle = (errorField) => ({
    width: '100%', 
    padding: '12px 15px', 
    border: errors[errorField] ? '2px solid #ef4444' : '1.5px solid #cbd5e1', 
    borderRadius: '8px', 
    outline: 'none', 
    fontSize: '1rem', 
    marginTop: '6px', 
    boxSizing: 'border-box', 
    transition: 'border-color 0.2s',
    backgroundColor: '#fff'
  });

  return (
    <div className="fade-step">
      <div className="ori-header">
        <span className="ori-step-number">02</span>
        <h2 className="ori-title">Năng lực & Phương thức xét tuyển</h2>
        <p className="ori-subtitle">Nhập các thông số bạn có để AI phân tích cơ hội trúng tuyển qua 6 phương thức chính.</p>
      </div>
      <div className="ori-progress-container"><span className="ori-progress-text">BƯỚC 2/4</span><div className="ori-progress-bar"><div className="ori-progress-fill" style={{ width: '50%' }}></div></div></div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: 1.5, minWidth: '400px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>Nhập điểm hiện tại của bạn</h3>
            <button 
              onClick={handleReset} 
              style={{
                background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', 
                padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
            >
              <i className="fas fa-undo-alt"></i> Làm mới
            </button>
          </div>

          <div className="ori-card" style={{ marginBottom: '20px', borderLeft: '4px solid #10b981', padding: '20px' }}>
            <h3 style={{fontSize: '1.1rem', margin: '0 0 15px 0'}}><i className="fas fa-book-open"></i> 1. Xét Học bạ (GPA)</h3>
            
            <div className="gpa-grid" style={{ display: 'flex', gap: '15px' }}>
              <div style={{flex: 1}}>
                <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>LỚP 10</span>
                <input 
                  type="text" inputMode="decimal" placeholder="VD: 8,5" 
                  style={getInputStyle('gpa10')} value={formData.gpa10 || ''} 
                  onChange={e => handleScoreChange('gpa10', e.target.value, 'Học bạ', 10)} 
                  onBlur={e => handleScoreChange('gpa10', e.target.value, 'Học bạ', 10)}
                />
                {errors.gpa10 && <div style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '5px'}}>{errors.gpa10}</div>}
              </div>

              <div style={{flex: 1}}>
                <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>LỚP 11</span>
                <input 
                  type="text" inputMode="decimal" placeholder="VD: 8,5" 
                  style={getInputStyle('gpa11')} value={formData.gpa11 || ''} 
                  onChange={e => handleScoreChange('gpa11', e.target.value, 'Học bạ', 10)} 
                  onBlur={e => handleScoreChange('gpa11', e.target.value, 'Học bạ', 10)}
                />
                {errors.gpa11 && <div style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '5px'}}>{errors.gpa11}</div>}
              </div>

              <div style={{flex: 1}}>
                <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>LỚP 12 (DỰ KIẾN)</span>
                <input 
                  type="text" inputMode="decimal" placeholder="VD: 8,5" 
                  style={getInputStyle('gpa12')} value={formData.gpa12 || ''} 
                  onChange={e => handleScoreChange('gpa12', e.target.value, 'Học bạ', 10)}
                  onBlur={e => handleScoreChange('gpa12', e.target.value, 'Học bạ', 10)} 
                />
                {errors.gpa12 && <div style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '5px'}}>{errors.gpa12}</div>}
              </div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
            <div className="ori-card" style={{ flex: 1, borderLeft: '4px solid #f59e0b', padding: '20px' }}>
              <h3 style={{fontSize: '1.1rem', margin: '0 0 10px 0'}}><i className="fas fa-pencil-alt"></i> 2. Thi THPT</h3>
              <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>TỔNG 3 MÔN</span>
              <input 
                type="text" inputMode="decimal" placeholder="VD: 25,5" 
                style={getInputStyle('examScore')} value={formData.examScore || ''} 
                onChange={e => handleScoreChange('examScore', e.target.value, 'THPT', 30)} 
                onBlur={e => handleScoreChange('examScore', e.target.value, 'THPT', 30)}
              />
              {errors.examScore && <div style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '5px'}}>{errors.examScore}</div>}
            </div>

            <div className="ori-card" style={{ flex: 1, borderLeft: '4px solid #3b82f6', padding: '20px' }}>
              <h3 style={{fontSize: '1.1rem', margin: '0 0 10px 0'}}><i className="fas fa-brain"></i> 3. Điểm ĐGNL</h3>
              <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>ĐIỂM (VNU / HUST)</span>
              <input 
                type="number" min="0" max="1200" placeholder="VD: 850" 
                style={getInputStyle('dgnlScore')} value={formData.dgnlScore || ''} 
                onChange={e => updateFieldAndMethod('dgnlScore', e.target.value, 'ĐGNL')} 
              />
            </div>
          </div>

          <div className="ori-card" style={{ marginBottom: '20px', borderLeft: '4px solid #8b5cf6', padding: '20px' }}>
            <h3 style={{fontSize: '1.1rem', margin: '0 0 15px 0'}}><i className="fas fa-globe"></i> 4. Chứng chỉ Quốc tế</h3>
            <div style={{display: 'flex', gap: '20px'}}>
              <div style={{flex: 1}}>
                <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>IELTS BAND</span>
                <select style={{...getInputStyle(), marginTop: '6px'}} value={formData.ielts || '0'} onChange={e => updateFieldAndMethod('ielts', e.target.value, 'Chứng chỉ')}>
                  <option value="0">Không có</option>
                  <option value="5.5">5.5 IELTS</option>
                  <option value="6.0">6.0 IELTS</option>
                  <option value="6.5">6.5 IELTS</option>
                  <option value="7.0">7.0+ IELTS</option>
                </select>
              </div>
              <div style={{flex: 1}}>
                <span className="ori-input-label" style={{fontSize: '0.8rem', fontWeight: 600}}>ĐIỂM SAT (NẾU CÓ)</span>
                <input type="number" min="0" max="1600" placeholder="VD: 1400" style={{...getInputStyle(), marginTop: '6px'}} value={formData.satScore || ''} onChange={e => updateFieldAndMethod('satScore', e.target.value, 'Chứng chỉ')} />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
            <div className="ori-card" style={{ flex: 1, borderLeft: '4px solid #ef4444', padding: '20px' }}>
              <h3 style={{fontSize: '1.1rem', margin: '0 0 10px 0'}}><i className="fas fa-medal"></i> 5. Tuyển thẳng</h3>
              <select style={{...getInputStyle(), marginTop: '6px'}} value={formData.prizeLevel || 'none'} onChange={e => updateFieldAndMethod('prizeLevel', e.target.value, 'Tuyển thẳng')}>
                <option value="none">Không có giải thưởng</option>
                <option value="qg">Giải HSG Quốc Gia</option>
                <option value="tinh">Giải HSG Tỉnh/TP</option>
              </select>
            </div>
            
            <div className="ori-card" style={{ flex: 1, borderLeft: '4px solid #ec4899', padding: '20px' }}>
              <h3 style={{fontSize: '1.1rem', margin: '0 0 10px 0'}}><i className="fas fa-palette"></i> 6. Năng khiếu</h3>
              <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#f8fafc', padding: '12px 15px', borderRadius: '8px', border: '1.5px solid #e2e8f0', marginTop: '6px', boxSizing: 'border-box'}}>
                <input type="checkbox" checked={formData.hasPortfolio || false} onChange={e => updateFieldAndMethod('hasPortfolio', e.target.checked, 'Năng khiếu')} style={{width: '18px', height: '18px', marginRight: '10px'}} />
                <span style={{fontSize: '0.9rem', fontWeight: 600, color: '#334155'}}>Điểm NK đạt {">="} 5,0</span>
              </label>
            </div>
          </div>

          <h3 style={{fontSize: '1.2rem', color: formData.block ? '#0f172a' : '#b45309'}}>
            {formData.block ? "Khối thi mục tiêu (Vui lòng chọn 1 khối)" : "⚠️ Vui lòng chọn Khối thi mục tiêu"}
          </h3>
          <div className="block-grid" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
            {blocks.map(b => (
              <div 
                key={b.id} 
                className={`block-card ${formData.block === b.id ? 'selected' : ''}`} 
                onClick={() => setFormData({...formData, block: b.id})}
                style={{ cursor: 'pointer' }}
              >
                <h2 style={{margin: '0', fontSize: '1.6rem', color: formData.block === b.id ? '#065f46' : '#0b132b'}}>{b.id}</h2>
                <span className="block-tag">{b.sub}</span>
                <p style={{fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.3}}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: AI PHÂN TÍCH */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="ori-dark-card" style={{position: 'sticky', top: '20px'}}>
            <h3 style={{fontSize: '1.3rem', margin: '0 0 20px 0'}}><i className="fas fa-sparkles" style={{color: '#a7f3d0'}}></i> AI Phân tích Tổng hợp</h3>
            
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '15px'}}>
              <div style={{flex: 1, borderRight: '1px dashed rgba(255,255,255,0.2)'}}>
                <p style={{margin: '0 0 5px 0', fontSize: '0.7rem', color: '#94a3b8'}}>HỌC BẠ (Hệ 30)</p>
                <h2 style={{fontSize: '2rem', margin: 0, color: scoreData.hasHocBa && !hasErrors ? '#10b981' : '#ef4444'}}>{scoreData.hasHocBa && !hasErrors ? scoreData.hocBa : 'LỖI'}</h2>
              </div>
              <div style={{flex: 1}}>
                <p style={{margin: '0 0 5px 0', fontSize: '0.7rem', color: '#94a3b8'}}>THI THPT</p>
                <h2 style={{fontSize: '2rem', margin: 0, color: scoreData.hasTHPT && !hasErrors ? '#f59e0b' : '#ef4444'}}>{scoreData.hasTHPT && !hasErrors ? scoreData.thpt : 'LỖI'}</h2>
              </div>
            </div>
            {parseFloat(formData.ielts) >= 5.5 && (
              <div style={{fontSize: '0.75rem', color: '#a7f3d0', marginTop: '10px', textAlign: 'center'}}>
                <i className="fas fa-info-circle"></i> Điểm trên đã được cộng ưu tiên IELTS ({String(formData.ielts).replace('.', ',')})
              </div>
            )}
            
            <div style={{marginTop: '25px', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
               <h4 style={{fontSize: '1.1rem', color: '#a7f3d0', margin: '0 0 15px 0'}}><i className="fas fa-bolt" style={{color: '#f59e0b', marginRight: '5px'}}></i> AI Gợi ý xét tuyển:</h4>
               
               {hasErrors ? (
                 <p style={{fontSize: '0.85rem', color: '#ef4444', margin: 0, textAlign: 'center', fontWeight: 'bold'}}>
                   <i className="fas fa-exclamation-triangle"></i> Điểm nhập vào không hợp lệ. Vui lòng kiểm tra lại các ô bị báo đỏ!
                 </p>
               ) : !formData.block ? (
                 <p style={{fontSize: '0.85rem', color: '#fca5a5', margin: 0, textAlign: 'center'}}>
                   Vui lòng chọn <strong>Khối thi mục tiêu</strong> bên trái để AI có dữ liệu chạy trường cho bạn!
                 </p>
               ) : isAptitudeBlock && !formData.hasPortfolio ? (
                 <p style={{fontSize: '0.85rem', color: '#fca5a5', margin: 0, textAlign: 'center'}}>
                   Khối <strong>{formData.block}</strong> yêu cầu thi Năng khiếu. Vui lòng check vào ô Năng khiếu!
                 </p>
               ) : !scoreData.hasData ? (
                 <p style={{fontSize: '0.85rem', color: '#fca5a5', margin: 0, textAlign: 'center'}}>
                   Bạn đã chọn khối <strong>{formData.block}</strong>. Hãy nhập các loại điểm để xem bạn đậu trường nào nhé!
                 </p>
               ) : isLoading ? (
                 <p style={{fontSize: '0.85rem', color: '#94a3b8', margin: 0, textAlign: 'center'}}>Đang phân tích dữ liệu...</p>
               ) : quickSuggestions.length > 0 ? (
                 <ul style={{paddingLeft: '0', listStyle: 'none', margin: 0}}>
                   {quickSuggestions.map((uni, idx) => (
                     <li key={idx} style={{background: 'rgba(11, 19, 43, 0.5)', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem', borderLeft: '4px solid #10b981'}}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div style={{flex: 1, paddingRight: '10px'}}>
                            <strong style={{color: 'white', display: 'block', marginBottom: '3px', fontSize: '0.9rem'}}>{uni.uName}</strong> 
                            <span style={{fontSize: '0.75rem', color: '#94a3b8', display: 'block'}}>{uni.uMajor}</span>
                         </div>
                         <div style={{background: '#0b132b', padding: '5px 10px', borderRadius: '6px', textAlign: 'center', minWidth: '50px'}}>
                            <span style={{fontSize: '0.65rem', color: '#64748b', display: 'block'}}>CHUẨN</span>
                            <span style={{color: '#ef4444', fontWeight: 'bold', fontSize: '1rem'}}>{uni.displayScore}</span>
                         </div>
                       </div>
                       <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.8rem', color: '#a7f3d0', fontWeight: '500' }}>
                         {uni.passedMethod}
                       </div>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p style={{fontSize: '0.85rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '8px', margin: 0, textAlign: 'center'}}>
                   Chưa tìm thấy trường nào khớp với mức điểm hiện tại của bạn ở khối <strong>{formData.block}</strong>.
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;