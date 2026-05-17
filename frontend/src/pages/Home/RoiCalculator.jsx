import React, { useState } from 'react';
import './Premium.css';

const RoiCalculator = () => {
  const [formData, setFormData] = useState({ 
    tuition: '', 
    uniLiving: '', 
    years: '4', 
    salary: '', 
    postGradLiving: '' 
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatInputNumber = (value) => {
    if (!value) return '';
    const onlyNumbers = value.toString().replace(/\D/g, '');
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleInputChange = (field, value) => {
    const rawValue = value.replace(/\./g, '');
    setFormData({ ...formData, [field]: rawValue });
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const studyYears = parseFloat(formData.years) || 4;
  const workYears = Math.max(0, 10 - studyYears); 

  const handleCalculate = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      // 🚀 ĐÃ SỬA: "Phiên dịch" lại tên biến cho khớp y chang với Backend Python
      const payloadToSend = {
        tuition_per_year: formData.tuition,
        uni_living_per_month: formData.uniLiving,
        study_years: formData.years,
        starting_salary: formData.salary,
        post_grad_living_per_month: formData.postGradLiving
      };

      // 1. GỌI API BACKEND ĐỂ TÍNH TOÁN & LƯU DATABASE
      const res = await fetch('https://gr112.onrender.com/api/roi', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSend) // Gửi cục dữ liệu đã đổi tên
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Nếu Backend trả về thành công, lấy dữ liệu show lên giao diện
        setResult(data);
      } else {
        alert("Lỗi từ server: " + data.error);
      }
    } catch (error) { 
      alert("Lỗi kết nối! Vui lòng kiểm tra xem Backend (Flask) đã bật chưa."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Dự đoán ROI Thực Tế (Kế hoạch 10 năm) 📈</h1>
        <p>Phân tích Lợi nhuận ròng sau 10 năm (Dựa trên thời giá hiện tại, không tính lạm phát).</p>
      </div>
      
      <div className="pr-card" style={{ maxWidth: '750px', margin: '0 auto', padding: '30px' }}>
        <form onSubmit={handleCalculate}>
          
          <h3 style={{fontSize: '1.1rem', color: '#10b981', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>
            <i className="fas fa-graduation-cap"></i> Giai đoạn Đại Học ({studyYears} Năm)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="pr-form-group">
              <label>Học phí 1 năm (VNĐ)</label>
              <input 
                type="text" inputMode="numeric" className="pr-input" placeholder="VD: 30,000,000" required
                value={formatInputNumber(formData.tuition)} 
                onChange={(e) => handleInputChange('tuition', e.target.value)} 
              />
            </div>
            <div className="pr-form-group">
              <label>Sinh hoạt phí ĐH 1 tháng (VNĐ)</label>
              <input 
                type="text" inputMode="numeric" className="pr-input" placeholder="VD: 4,000,000" required
                value={formatInputNumber(formData.uniLiving)} 
                onChange={(e) => handleInputChange('uniLiving', e.target.value)} 
              />
            </div>
          </div>
          <div className="pr-form-group">
            <label>Thời gian học (Năm)</label>
            <input 
              type="number" className="pr-input" value={formData.years} required
              onChange={(e) => setFormData({...formData, years: e.target.value})} 
            />
          </div>

          <h3 style={{fontSize: '1.1rem', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginTop: '20px'}}>
            <i className="fas fa-briefcase"></i> Giai đoạn Đi Làm ({workYears} Năm)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="pr-form-group">
              <label>Lương khởi điểm (VNĐ/Tháng)</label>
              <input 
                type="text" inputMode="numeric" className="pr-input" placeholder="VD: 15,000,000" required
                value={formatInputNumber(formData.salary)} 
                onChange={(e) => handleInputChange('salary', e.target.value)} 
              />
            </div>
            <div className="pr-form-group">
              <label>Sinh hoạt phí đi làm (VNĐ/Tháng)</label>
              <input 
                type="text" inputMode="numeric" className="pr-input" placeholder="VD: 6,000,000" required
                value={formatInputNumber(formData.postGradLiving)} 
                onChange={(e) => handleInputChange('postGradLiving', e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="pr-btn" style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '1.1rem', background: '#0b132b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
            {loading ? 'Đang gửi dữ liệu phân tích...' : 'TÍNH TOÁN LÃI/LỖ THỰC TẾ'}
          </button>
        </form>

        {result && (
          <div className="roi-result fade-in" style={{ marginTop: '40px', borderTop: '2px dashed #e2e8f0', paddingTop: '30px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              
              {/* Ô 1: ĐẦU TƯ */}
              <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 'bold' }}><i className="fas fa-arrow-down"></i> ĐẦU TƯ ({result.study_years} NĂM HỌC)</span>
                <span style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', marginBottom: '12px' }}>(Học phí + Ăn ở đại học)</span>
                <strong style={{ fontSize: '1.6rem', color: '#991b1b', marginTop: 'auto' }}>{formatVND(result.total_cost)}</strong>
              </div>

              {/* Ô 2: TỔNG LƯƠNG */}
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 'bold' }}><i className="fas fa-arrow-up"></i> TỔNG LƯƠNG ({result.work_years} NĂM LÀM)</span>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '4px', marginBottom: '12px' }}>(Lương không đổi)</span>
                <strong style={{ fontSize: '1.6rem', color: '#166534', marginTop: 'auto' }}>{formatVND(result.gross_earnings)}</strong>
              </div>

              {/* Ô 3: ĐỐT VÀO SINH HOẠT */}
              <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px', border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', color: '#c2410c', fontWeight: 'bold' }}><i className="fas fa-fire"></i> TIỀN SINH HOẠT ĐI LẠI</span>
                <span style={{ fontSize: '0.8rem', color: '#ea580c', marginTop: '4px', marginBottom: '12px' }}>(Ăn, ở, xăng xe {result.work_years} năm)</span>
                <strong style={{ fontSize: '1.6rem', color: '#9a3412', marginTop: 'auto' }}>{formatVND(result.total_living_work)}</strong>
              </div>
              
            </div>

            <div style={{ background: result.isPositive ? '#065f46' : '#7f1d1d', padding: '30px', borderRadius: '16px', textAlign: 'center', color: 'white', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '1rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>TỈ SUẤT HOÀN VỐN RÒNG (NET ROI)</span>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', margin: '10px 0' }}>
                {result.isPositive ? '+' : ''}{result.roi_percentage}%
              </div>
              <div style={{ fontSize: '1.2rem', color: result.isPositive ? '#a7f3d0' : '#fca5a5' }}>
                {result.isPositive ? 'Tiền dư cất tủ sau 10 năm:' : 'Khoản lỗ gánh chịu sau 10 năm:'} <strong>{formatVND(Math.abs(result.real_surplus))}</strong>
              </div>
            </div>

            {/* CÔNG THỨC VÀ CÁCH TÍNH */}
            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-calculator" style={{ color: '#8b5cf6', marginRight: '8px' }}></i> Minh bạch Thuật toán & Công thức:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <li><strong>Tổng Đầu Tư:</strong> = (Học phí 1 năm + Trọ ĐH 1 năm) × <span style={{color: '#0f172a'}}>{result.study_years} năm</span></li>
                <li><strong>Tổng Lương :</strong> = (Lương 1 tháng × 12) × <span style={{color: '#0f172a'}}>{result.work_years} năm</span></li>
                <li><strong>Tiền Vào Sinh Hoạt:</strong> = (Trọ đi làm 1 tháng × 12) × <span style={{color: '#0f172a'}}>{result.work_years} năm</span></li>
                <li><strong>Lãi/Lỗ Thực Tế:</strong> = Tổng Lương - Sinh Hoạt Đi Làm - Tổng Đầu Tư</li>
                <li><strong style={{color: '#0b132b'}}>NET ROI (%):</strong> = (Lãi/Lỗ Thực Tế ÷ Tổng Đầu Tư) × 100</li>
              </ul>
              <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                * Ghi chú: Dữ liệu này đã được lưu vào hệ thống máy chủ thông minh. Các phép tính được cố định dựa trên giá trị tiền tệ ở thời điểm hiện tại.
              </div>
            </div>

            {/* KẾT LUẬN TỪ AI */}
            <div className="roi-breakdown" style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-balance-scale" style={{ color: '#3b82f6', marginRight: '8px' }}></i> Kết Luận Bức Tranh 10 Năm:
              </h4>
              
              {result.isPositive ? (
                <div style={{ background: '#ecfdf5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981', color: '#065f46' }}>
                  <strong><i className="fas fa-check-circle"></i> ĐẦU TƯ CÓ LỜI (ROI DƯƠNG +):</strong><br/><br/>
                  Tuyệt vời! Thời gian cày cuốc <strong>{result.work_years} năm</strong> của bạn đã mang lại đủ thu nhập để tự nuôi sống bản thân, ĐỒNG THỜI trả đứt toàn bộ chi phí <strong>{formatVND(result.total_cost)}</strong> mà gia đình đã đập vào cho bạn học {result.study_years} năm Đại học.<br/><br/>
                  Cuối chặng đường 10 năm (tính từ lúc nhập học), bạn vẫn đang để ra được một số tiền ròng là <strong>{formatVND(result.real_surplus)}</strong>. Đây là con đường học vấn sinh lời rất tốt!
                </div>
              ) : (
                <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ef4444', color: '#991b1b' }}>
                  <strong><i className="fas fa-exclamation-triangle"></i> BÁO ĐỘNG ĐỎ (ROI ÂM -):</strong><br/><br/>
                  Bạn đang bị lỗ vốn! Mức lương trong <strong>{result.work_years} năm</strong> ra trường chỉ vừa đủ trang trải tiền ăn ở. Nó <strong>KHÔNG ĐỦ</strong> để hoàn lại số vốn đắt đỏ <strong>{formatVND(result.total_cost)}</strong> đã ném vào thời gian {result.study_years} năm đi học.<br/><br/>
                  Nói cách khác, sau 10 năm tính từ lúc nhập học, bạn đang bị âm <strong>{formatVND(Math.abs(result.real_surplus))}</strong>. <br/>
                  <strong>💡 Giải pháp:</strong> Cần chọn trường có học phí thấp hơn, học các chứng chỉ ngắn hạn (chỉ 2-3 năm thay vì 4 năm) để ra trường kiếm tiền sớm, hoặc nhắm tới ngành có mức lương khởi điểm cao hơn!
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default RoiCalculator;