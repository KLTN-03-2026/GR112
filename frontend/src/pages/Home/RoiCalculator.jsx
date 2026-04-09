import React, { useState } from 'react';
import './Premium.css';

const RoiCalculator = () => {
  const [formData, setFormData] = useState({ tuition: '', years: '4', salary: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/roi', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (error) { alert("Lỗi kết nối!"); } finally { setLoading(false); }
  };

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Dự đoán ROI Học thuật 📈</h1>
        <p>Tính toán lợi nhuận đầu tư cho tấm bằng đại học của bạn sau 10 năm ra trường.</p>
      </div>
      <div className="pr-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleCalculate}>
          <div className="pr-form-group">
            <label>Học phí ước tính 1 năm (VNĐ)</label>
            <input type="number" className="pr-input" placeholder="VD: 30000000" required
              value={formData.tuition} onChange={(e) => setFormData({...formData, tuition: e.target.value})} />
          </div>
          <div className="pr-form-group">
            <label>Thời gian học (Năm)</label>
            <input type="number" className="pr-input" value={formData.years} required
              onChange={(e) => setFormData({...formData, years: e.target.value})} />
          </div>
          <div className="pr-form-group">
            <label>Lương khởi điểm mong muốn (VNĐ/tháng)</label>
            <input type="number" className="pr-input" placeholder="VD: 15000000" required
              value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
          </div>
          <button type="submit" className="pr-btn">{loading ? 'Đang tính toán AI...' : 'Phân tích ROI'}</button>
        </form>

        {result && (
          <div className="roi-result fade-in">
            <h3>{result.message}</h3>
            <div className="roi-stat"><span>Tổng chi phí học tập:</span> <strong>{result.total_cost}</strong></div>
            <div className="roi-stat"><span>Thu nhập 10 năm:</span> <strong>{result.ten_year_earnings}</strong></div>
            <div className="roi-stat"><span>Tỉ suất hoàn vốn (ROI):</span> <strong style={{color: '#059669', fontSize: '1.6rem'}}>{result.roi_percentage}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RoiCalculator;