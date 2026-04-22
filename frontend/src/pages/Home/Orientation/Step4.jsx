import React from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Step4 = ({ formData, suggestedUnis, handleSaveData, isSaving }) => {
  // --- TÍNH TOÁN ĐIỂM SỐ CỦA USER ---
  const g10 = parseFloat(formData.gpa10) || 0;
  const g11 = parseFloat(formData.gpa11) || 0;
  const g12 = parseFloat(formData.gpa12) || 0;
  let validYears = 0, totalGpa = 0;
  if (g10 > 0) { totalGpa += g10; validYears++; }
  if (g11 > 0) { totalGpa += g11; validYears++; }
  if (g12 > 0) { totalGpa += g12; validYears++; }
  
  const ieltsVal = parseFloat(formData.ielts) || 0;
  const bonus = ieltsVal >= 6.5 ? 1.5 : (ieltsVal >= 5.5 ? 0.5 : 0);

  const actualUserHocBa = validYears > 0 ? (((totalGpa / validYears) * 3) + bonus).toFixed(2) : 'Chưa nhập';
  const actualUserTHPT = parseFloat(formData.examScore) ? (parseFloat(formData.examScore) + bonus).toFixed(2) : 'Chưa nhập';

  // LOGIC HIỂN THỊ CHỨNG CHỈ (IELTS & SAT)
  let actualUserCert = 'Không có';
  if (formData.ielts !== '0' && formData.satScore) {
    actualUserCert = `IELTS ${formData.ielts} & SAT ${formData.satScore}`;
  } else if (formData.ielts !== '0') {
    actualUserCert = `IELTS ${formData.ielts}`;
  } else if (formData.satScore) {
    actualUserCert = `SAT ${formData.satScore}`;
  }

  // --- TÍNH TOÁN TÀI CHÍNH ---
  const yearlyTuition = Number(formData.tuitionLimit) || 30000000;
  const monthlyLivingCost = Number(formData.livingCost) || 4000000;
  
  const totalTuition4Years = yearlyTuition * 4;
  const totalLivingCost4Years = monthlyLivingCost * 12 * 4;
  const totalCost = totalTuition4Years + totalLivingCost4Years;

  const budgetData = [
    { name: 'Học phí (4 năm)', value: totalTuition4Years },
    { name: 'Sinh hoạt phí (4 năm)', value: totalLivingCost4Years }
  ];
  const PIE_COLORS = ['#10b981', '#f59e0b']; 

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const matchPercent = Math.min(65 + ((formData.interests?.length || 0) * 5), 98);

  const analyzeInterests = () => {
    let scores = { 'KỸ THUẬT': 40, 'NGHIÊN CỨU': 35, 'SÁNG TẠO': 45, 'XÃ HỘI': 50, 'QUẢN LÝ': 40, 'NGHIỆP VỤ': 45 };
    const userInterests = formData.interests ? formData.interests.map(i => i.toLowerCase()) : [];

    userInterests.forEach(interest => {
      if (interest.includes('lập trình') || interest.includes('trí tuệ') || interest.includes('robot') || interest.includes('bảo mật') || interest.includes('điện')) scores['KỸ THUẬT'] += 25;
      if (interest.includes('toán học') || interest.includes('vật lý') || interest.includes('nghiên cứu') || interest.includes('y khoa')) scores['NGHIÊN CỨU'] += 25;
      if (interest.includes('nghệ thuật') || interest.includes('thiết kế') || interest.includes('âm nhạc') || interest.includes('viết lách')) scores['SÁNG TẠO'] += 25;
      if (interest.includes('giao tiếp') || interest.includes('giảng dạy') || interest.includes('báo chí') || interest.includes('tình nguyện')) scores['XÃ HỘI'] += 25;
      if (interest.includes('kinh doanh') || interest.includes('bán hàng') || interest.includes('quản trị')) scores['QUẢN LÝ'] += 25;
      if (interest.includes('chứng khoán') || interest.includes('tài chính') || interest.includes('kế toán') || interest.includes('pháp lý')) scores['NGHIỆP VỤ'] += 25;
    });

    return Object.keys(scores).map(key => ({ subject: key, A: Math.min(scores[key], 100) }));
  };

  const dynamicRadarData = analyzeInterests();

  const generatePremiumAIAdvice = () => {
    let score = 70; 
    const gpa = parseFloat(formData.gpa12) || parseFloat(formData.gpa11) || parseFloat(formData.gpa10) || 0;
    const thpt = parseFloat(formData.examScore) || 0;
    const familyBudget1Year = formData.familyBudget || 0;
    const familyBudget4Years = familyBudget1Year * 4;
    const balance = familyBudget4Years - totalCost;
    
    if (matchPercent >= 80) score += 5;
    if (gpa >= 8.0 || thpt >= 24) score += 10;
    else if (gpa >= 6.5 || thpt >= 18) score += 5;
    else if (gpa > 0 || thpt > 0) score -= 10;

    if (formData.hasPortfolio || (formData.prizeLevel && formData.prizeLevel !== 'none') || parseFloat(formData.ielts) >= 5.5) score += 10;

    if (familyBudget4Years >= totalCost) score += 10;
    else if (balance < -50000000) score -= 15; 
    else if (familyBudget1Year > 0) score -= 5;

    if (!suggestedUnis || suggestedUnis.length === 0) score -= 20;

    const finalScore = Math.max(10, Math.min(score, 98));

    let summaryText = "";
    if (finalScore >= 85) summaryText = "Tuyệt vời! Lộ trình của bạn có tính khả thi rất cao. Hồ sơ học thuật ấn tượng kết hợp với nền tảng tài chính vững vàng giúp bạn có lợi thế lớn trong việc định đoạt tương lai.";
    else if (finalScore >= 60) summaryText = "Lộ trình khả thi nhưng cần chiến lược thông minh. Bạn có nền tảng cơ bản tốt, tuy nhiên hãy xem xét kỹ các rủi ro bên dưới để tối ưu tỷ lệ đỗ.";
    else summaryText = "Lộ trình hiện tại đang gặp thử thách. Bạn cần xem xét lại mục tiêu điểm số hoặc cân đối lại bài toán tài chính trước khi chốt hồ sơ.";

    let academic = { icon: 'fa-graduation-cap', title: 'Học thuật & Năng lực', color: '#3b82f6', bg: '#eff6ff', status: '', pros: [], cons: [], tip: '' };
    
    if (matchPercent >= 80) academic.pros.push(`Tố chất rất khớp với khối ${formData.block || 'thi'} (${matchPercent}%).`);
    else if (matchPercent >= 70) academic.pros.push(`Sở thích khá phù hợp với định hướng khối ${formData.block || 'thi'}.`);
    else academic.cons.push("Sở thích hiện tại chưa thực sự khớp 100% với đặc thù của khối ngành đã chọn.");

    if (gpa >= 8.0) academic.pros.push(`Học bạ xuất sắc (GPA ${gpa}), chiếm ưu thế lớn khi xét tuyển sớm.`);
    else if (gpa >= 6.5) academic.pros.push(`Học bạ mức Khá (GPA ${gpa}), đủ điều kiện xét vào nhiều trường tầm trung.`);
    else if (gpa > 0) academic.cons.push(`Điểm học bạ (${gpa}) hơi thấp, khó cạnh tranh bằng phương thức này.`);

    if (thpt >= 24) academic.pros.push(`Điểm thi THPT dự kiến rất cao (${thpt}), an toàn với hầu hết trường Top.`);
    else if (thpt >= 18) academic.pros.push(`Điểm THPT mức Khá (${thpt}), có nhiều lựa chọn trường phù hợp.`);
    else if (thpt > 0) academic.cons.push(`Điểm chuẩn THPT (${thpt}) khá rủi ro, cần chú ý nâng cao điểm số.`);

    if (gpa === 0 && thpt === 0) {
      academic.cons.push("Chưa nhập điểm Học bạ hoặc THPT nên AI chưa thể đánh giá chính xác mức độ cạnh tranh.");
    }

    if (parseFloat(formData.ielts) >= 5.5) academic.pros.push(`Sở hữu IELTS ${formData.ielts}, một vũ khí mạnh để xét tuyển kết hợp.`);
    if (formData.prizeLevel && formData.prizeLevel !== 'none') academic.pros.push("Có giải thưởng học thuật, cơ hội trúng tuyển thẳng cực cao.");
    if (formData.hasPortfolio) academic.pros.push("Sở hữu năng khiếu nghệ thuật, mở rộng lựa chọn ngành nghề đặc thù.");

    if (gpa >= 8.0 || thpt >= 24) {
      academic.status = "XUẤT SẮC"; academic.tip = "Nên nộp hồ sơ Xét tuyển sớm ngay khi các trường mở cổng để khóa suất đậu đầu tiên.";
    } else if (gpa >= 6.5 || thpt >= 18) {
      academic.status = "KHÁ - AN TOÀN"; academic.color = '#f59e0b'; academic.bg = '#fff7ed';
      academic.tip = "Phát huy điểm mạnh đang có, cân nhắc thi thêm ĐGNL để gia tăng số lượng phương án dự phòng.";
    } else if (gpa === 0 && thpt === 0) {
      academic.status = "THIẾU DỮ LIỆU"; academic.color = '#64748b'; academic.bg = '#f8fafc';
      academic.tip = "Hãy quay lại Bước 2 để nhập điểm số của bạn (Học bạ hoặc THPT) để AI tư vấn chuẩn xác hơn.";
    } else {
      academic.status = "CẦN CHÚ Ý"; academic.color = '#ef4444'; academic.bg = '#fef2f2';
      academic.tip = "Nếu điểm chưa cao, hãy tìm các trường có điểm chuẩn nhẹ hơn hoặc các trường tư thục uy tín.";
    }

    let finance = { icon: 'fa-wallet', title: 'Bài toán Tài chính', color: '#10b981', bg: '#f0fdf4', status: '', pros: [], cons: [], tip: '' };
    
    if (familyBudget4Years >= totalCost && familyBudget1Year > 0) {
      finance.pros.push("Ngân sách gia đình hoàn toàn đáp ứng được chi phí 4 năm đại học.");
      if (familyBudget4Years - totalCost > 50000000) finance.pros.push("Quỹ dự phòng dồi dào, sinh viên không phải lo áp lực làm thêm.");
    }
    
    if (familyBudget1Year === 0) {
      finance.cons.push("Chưa xác định được ngân sách gia đình chu cấp hàng tháng/năm.");
    } else if (balance < 0) {
      const deficit = (Math.abs(balance) / 1000000).toFixed(1);
      finance.cons.push(`Dự kiến thiếu hụt khoảng ${deficit} triệu cho chặng đường 4 năm.`);
      if (totalTuition4Years > totalLivingCost4Years) finance.cons.push("Mức học phí của các trường đang chọn khá cao so với mặt bằng chung.");
      else finance.cons.push("Sinh hoạt phí tại khu vực bạn chọn đang chiếm tỷ trọng rất lớn.");
    }

    if (finance.cons.length === 0 && finance.pros.length > 0) {
      finance.status = "VỮNG VÀNG"; finance.tip = "Tài chính ổn định, hãy tập trung 100% vào việc phát triển kỹ năng chuyên môn.";
    } else if (familyBudget1Year === 0) {
      finance.status = "CHƯA RÕ RÀNG"; finance.color = '#64748b'; finance.bg = '#f8fafc';
      finance.tip = "Nên thảo luận cởi mở với phụ huynh để có con số cụ thể, tránh gánh nặng học phí về sau.";
    } else if (balance < -100000000) {
      finance.status = "BÁO ĐỘNG"; finance.color = '#ef4444'; finance.bg = '#fef2f2';
      finance.tip = "Nới lỏng giới hạn học phí ở Bước 3 hoặc tìm học bổng. Bắt buộc phải có kế hoạch làm thêm.";
    } else {
      finance.status = "LƯU Ý NHẸ"; finance.color = '#f59e0b'; finance.bg = '#fff7ed';
      finance.tip = "Không nên chọn trường có biên độ tăng học phí >10%/năm. Tìm hiểu ngay các học bổng đầu vào.";
    }

    let strategy = { icon: 'fa-chess-knight', title: 'Chiến lược Chọn trường', color: '#8b5cf6', bg: '#f5f3ff', status: '', pros: [], cons: [], tip: '' };
    
    if (suggestedUnis && suggestedUnis.length >= 6) {
      strategy.pros.push(`Danh mục trường phong phú (${suggestedUnis.length} trường) phù hợp với điểm và tài chính.`);
      strategy.pros.push("Đủ không gian để sắp xếp nguyện vọng theo độ khó giảm dần.");
    } else if (suggestedUnis && suggestedUnis.length > 0) {
      strategy.pros.push(`Đã khoanh vùng được ${suggestedUnis.length} trường sát với tiêu chí của bạn.`);
    }

    if (!suggestedUnis || suggestedUnis.length === 0) {
      strategy.cons.push("Bộ lọc quá khắt khe, chưa có gợi ý tối ưu.");
    } else if (suggestedUnis.length <= 2) {
      strategy.cons.push("Quá ít sự lựa chọn, rủi ro trượt đại học rất cao nếu điểm chuẩn năm nay biến động.");
    }

    if (strategy.cons.length === 0) {
      strategy.status = "ĐA DẠNG"; strategy.tip = "Áp dụng quy tắc 3 rổ: 2 nguyện vọng Top (mơ ước), 3 nguyện vọng Mid (vừa sức), và 1 an toàn.";
    } else if (!suggestedUnis || suggestedUnis.length === 0) {
      strategy.status = "BẾ TẮC"; strategy.color = '#ef4444'; strategy.bg = '#fef2f2';
      strategy.tip = "Vui lòng xem xét lại Bước 2 (Điểm số) và Bước 3 (Khu vực/Tài chính) để hạ bớt tiêu chuẩn.";
    } else {
      strategy.status = "BỊ GIỚI HẠN"; strategy.color = '#f59e0b'; strategy.bg = '#fff7ed';
      strategy.tip = "Nới lỏng giới hạn Học phí ở Bước 3 hoặc mở rộng khu vực học sang các Tỉnh/Thành lân cận.";
    }

    return { finalScore, summaryText, pillars: [academic, finance, strategy] };
  };

  const aiReport = generatePremiumAIAdvice();

  const downloadList = () => {
    if (!suggestedUnis || suggestedUnis.length === 0) {
      alert("Không có trường nào trong danh sách để tải xuống!");
      return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += "STT,Tên Trường,Ngành Học,Mã Ngành,Điểm Chuẩn THPT,Điểm ĐGNL,Yêu cầu Chứng Chỉ,Học Phí (VNĐ/Năm)\n";

    suggestedUnis.forEach((uni, index) => {
      const stt = `"${index + 1}"`;
      const tenTruong = `"${uni.school_name || 'Đang cập nhật'}"`;
      const nganhHoc = `"${uni.major_name || 'Đa ngành'}"`;
      const maNganh = `"${uni.major_code || 'N/A'}"`;
      const diemTHPT = `"${uni.score_thpt_last_year || 'N/A'}"`;
      const diemDGNL = `"${uni.score_dgnl || 'N/A'}"`;
      const chungChi = `"${uni.combo_cert || 'Không yêu cầu'}"`;
      const hocPhi = `"${uni.tuition_fee || 'Đang cập nhật'}"`;

      csvContent += `${stt},${tenTruong},${nganhHoc},${maNganh},${diemTHPT},${diemDGNL},${chungChi},${hocPhi}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `Danh_Sach_Truong_Khoi_${formData.block || 'A00'}.csv`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-step">
      <div className="ori-header" style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', background: '#d1fae5', padding: '6px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '15px' }}>BƯỚC 4: KẾT QUẢ TỔNG HỢP</span>
        <h2 className="ori-title" style={{ textTransform: 'none' }}>Lộ trình học tập & <span style={{ color: '#10b981' }}>Phân tích tài chính</span></h2>
        <p className="ori-subtitle">Hệ thống đã tổng hợp dữ liệu cá nhân của bạn để đưa ra bức tranh toàn cảnh về tương lai học thuật.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div className="ori-card" style={{ flex: 1, padding: '20px', minWidth: '350px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Phân tích Năng lực Cốt lõi</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Dựa trên {formData.interests?.length || 0} sở thích bạn đã chọn</p>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Radar name="Năng lực" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, padding: '0 20px' }}>
            <span style={{ color: '#10b981' }}><i className="fas fa-chart-pie" style={{ marginRight: '5px' }}></i> Tương thích: {matchPercent}%</span>
            <span style={{ color: '#0b132b' }}><i className="fas fa-layer-group" style={{ marginRight: '5px' }}></i> Khối: {formData.targetBlock || formData.block || 'Chưa chọn'}</span>
          </div>
        </div>

        <div className="ori-dark-card" style={{ flex: 1.2, minWidth: '350px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', color: '#fff' }}>Phân bổ ngân sách 4 năm</h3>
          <div style={{ textAlign: 'center', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>TỔNG CẦN CHUẨN BỊ</span>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '2.2rem', color: '#a7f3d0' }}>{formatCurrency(totalCost)}</h2>
          </div>
          <div style={{ flex: 1, minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '10px', background: '#0b132b', border: 'none', color: '#fff' }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '25px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0b132b' }}><i className="fas fa-table" style={{ marginRight: '8px', color: '#10b981' }}></i> Bảng kê chi phí chi tiết từng năm</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left', color: '#475569' }}>Giai đoạn</th>
              <th style={{ padding: '12px 20px', textAlign: 'right', color: '#475569' }}>Học phí dự kiến</th>
              <th style={{ padding: '12px 20px', textAlign: 'right', color: '#475569' }}>Sinh hoạt phí (Lạm phát 5%)</th>
              <th style={{ padding: '12px 20px', textAlign: 'right', color: '#0f172a', fontWeight: 'bold' }}>Tổng chi phí năm</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((year) => {
              const inflationRate = Math.pow(1.05, year - 1);
              const yearlyLiving = monthlyLivingCost * 12 * inflationRate;
              const totalYear = yearlyTuition + yearlyLiving;
              return (
                <tr key={year} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>Năm thứ {year}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>{formatCurrency(yearlyTuition)}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>{formatCurrency(yearlyLiving)}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(totalYear)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan="3" style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>TỔNG CỘNG 4 NĂM:</td>
              <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '1.1rem' }}>{formatCurrency(totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginTop: '50px', marginBottom: '30px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
        
        <div style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={aiReport.finalScore >= 75 ? '#10b981' : aiReport.finalScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${aiReport.finalScore}, 100`} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800' }}>{aiReport.finalScore}</span>
              <span style={{ fontSize: '0.6rem', display: 'block', opacity: 0.7, marginTop: '-5px' }}>ĐIỂM</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}><i className="fas fa-robot"></i> MindConnect AI</span>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem' }}>Báo cáo Cố vấn Tuyển sinh</h2>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
              "{aiReport.summaryText}"
            </p>
          </div>
        </div>

        <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', background: 'rgba(0,0,0,0.2)' }}>
          {aiReport.pillars.map((pillar, idx) => (
            <div key={idx} style={{ background: pillar.bg, borderRadius: '12px', padding: '20px', border: `1px solid ${pillar.color}40`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05, fontSize: '6rem', color: pillar.color }}>
                <i className={`fas ${pillar.icon}`}></i>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: pillar.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${pillar.icon}`}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{pillar.title}</h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: pillar.color }}>{pillar.status}</span>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                {pillar.pros.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block', marginBottom: '5px' }}><i className="fas fa-check-circle"></i> Điểm sáng:</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                      {pillar.pros.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {pillar.cons.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#b91c1c', display: 'block', marginBottom: '5px' }}><i className="fas fa-exclamation-triangle"></i> Cần lưu ý:</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                      {pillar.cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', borderLeft: `3px solid ${pillar.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginTop: 'auto' }}>
                <strong><i className="fas fa-lightbulb" style={{ color: '#f59e0b', marginRight: '5px' }}></i> Lời khuyên:</strong> {pillar.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0b132b' }}>Trường gợi ý tối ưu ({suggestedUnis?.length || 0})</h2>
        <button onClick={downloadList} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', color: '#334155', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-file-excel" style={{ color: '#10b981' }}></i> Tải danh sách (.CSV)
        </button>
      </div>

      {/* DANH SÁCH TRƯỜNG DẠNG LƯỚI NGANG (CÓ THỂ LƯỚT) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          overflowY: 'hidden', 
          paddingBottom: '20px', 
          scrollBehavior: 'smooth', 
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        {suggestedUnis && suggestedUnis.length > 0 ? suggestedUnis.map((uni, index) => {
          const badges = [
            { type: 'AN TOÀN', class: 'uni-badge-safe', color: '#10b981', probBg: 'transparent', probColor: '#64748b' },
            { type: 'VỪA SỨC', class: 'uni-badge-fit', color: '#f59e0b', probBg: '#f0fdf4', probColor: '#065f46' },
            { type: 'THỬ THÁCH', class: 'uni-badge-reach', color: '#ef4444', probBg: '#fff7ed', probColor: '#9a3412' }
          ];
          const b = badges[index % 3];

          let autoDetectedMethod = 'THPT'; 
          if (formData.admissionMethod) {
            autoDetectedMethod = formData.admissionMethod; 
          } else if (formData.prizeLevel && formData.prizeLevel !== 'none') {
            autoDetectedMethod = 'Tuyển thẳng';
          } else if (formData.hasPortfolio) {
            autoDetectedMethod = 'Năng khiếu';
          } else if (parseFloat(formData.dgnlScore) > 0) {
            autoDetectedMethod = 'ĐGNL';
          } else if (parseFloat(formData.ielts) > 0 || parseFloat(formData.satScore) > 0) {
            autoDetectedMethod = 'Chứng chỉ';
          } else if (parseFloat(formData.gpa12) > 0) {
            autoDetectedMethod = 'Học bạ';
          }

          let mainScoreLabel = 'THPT CỦA BẠN';
          let mainScoreValue = actualUserTHPT;

          if (autoDetectedMethod.includes('Học bạ')) {
            mainScoreLabel = 'HỌC BẠ CỦA BẠN';
            mainScoreValue = actualUserHocBa;
          } else if (autoDetectedMethod.includes('ĐGNL') || autoDetectedMethod.includes('Đánh giá')) {
            mainScoreLabel = 'ĐGNL CỦA BẠN';
            mainScoreValue = formData.dgnlScore || '0';
          } else if (autoDetectedMethod.includes('Tuyển thẳng')) {
            mainScoreLabel = 'GIẢI THƯỞNG';
            mainScoreValue = formData.prizeLevel === 'qg' ? 'Quốc Gia' : (formData.prizeLevel === 'tinh' ? 'Cấp Tỉnh' : 'Trường Chuyên');
          } else if (autoDetectedMethod.includes('Chứng chỉ') || autoDetectedMethod.includes('IELTS')) {
            mainScoreLabel = 'CHỨNG CHỈ CỦA BẠN';
            mainScoreValue = actualUserCert; 
          } else if (autoDetectedMethod.includes('Năng khiếu')) {
            mainScoreLabel = 'NĂNG KHIẾU';
            mainScoreValue = formData.hasPortfolio ? 'Đạt >= 5.0' : 'Không có';
          }

          return (
            <div key={uni.id || index} className="uni-suggest-card" style={{ minWidth: '320px', flexShrink: 0, margin: '0', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="uni-suggest-img" style={{ height: '140px', position: 'relative' }}>
                <span className={b.class} style={{position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', color: b.color, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>{b.type}</span>
                <img src={uni.school_logo || 'https://via.placeholder.com/300x150'} alt={uni.school_name || 'Đại học'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="uni-suggest-info" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uni.school_name}</h3>
                
                <p style={{ fontWeight: 'bold', color: '#10b981', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '5px' }}>
                  {uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành')}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                  <i className="fas fa-map-marker-alt"></i> Khu vực: {uni.ranking_note ? uni.ranking_note.split(' - ')[1] : 'Đang cập nhật'}
                </span>
                
                {/* HIGHLIGHT PHƯƠNG THỨC CHÍNH */}
                <div className="uni-prob" style={{background: b.probBg, padding: '10px', borderRadius: '8px', marginTop: '5px', marginBottom: '15px'}}>
                  <span style={{color: b.probColor}}>
                    {mainScoreLabel}: <strong>{mainScoreValue}</strong>
                  </span>
                </div>

                {/* BẢNG SO SÁNH 6 LOẠI ĐIỂM */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
                  
                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.5px' }}>TIÊU CHÍ XÉT TUYỂN</span>
                    <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.5px' }}>ĐIỂM CHUẨN</span>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-book" style={{width: '16px'}}></i> Học bạ của bạn ({actualUserHocBa})</span>
                    <strong style={{ color: '#10b981' }}>{parseFloat(uni.base_score) > 0 ? uni.base_score : 'N/A'}</strong>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-pen-alt" style={{width: '16px'}}></i> THPT của bạn ({actualUserTHPT})</span>
                    <strong style={{ color: '#f59e0b' }}>{parseFloat(uni.score_thpt_last_year) > 0 ? uni.score_thpt_last_year : 'N/A'}</strong>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-brain" style={{width: '16px'}}></i> Thi ĐGNL:</span>
                    <strong style={{ color: '#0b132b' }}>{parseInt(uni.score_dgnl) > 0 ? uni.score_dgnl : 'Không xét'}</strong>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-globe" style={{width: '16px'}}></i> Chứng chỉ:</span>
                    <strong style={{ color: '#0b132b' }}>{uni.combo_cert || 'Không xét'}</strong>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-medal" style={{width: '16px'}}></i> Tuyển thẳng:</span>
                    <strong style={{ color: '#0b132b' }}>{uni.direct_admission ? 'Có xét' : 'Không'}</strong>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569' }}><i className="fas fa-palette" style={{width: '16px'}}></i> Năng khiếu:</span>
                    <strong style={{ color: '#0b132b' }}>{uni.aptitude_test || 'Không xét'}</strong>
                  </div>

                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Học phí:</span>
                  <strong style={{color: '#0b132b'}}>{uni.tuition_fee || 'Đang cập nhật'}</strong>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ width: '100%', padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
            <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
            Không có dữ liệu phù hợp với mức điểm hoặc bộ lọc hiện tại. Hãy thử nới lỏng mức điểm hoặc mở rộng khu vực ở Bước 3.
          </div>
        )}
      </div>

      <div style={{ background: '#f1f5f9', borderRadius: '16px', padding: '30px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '60%' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0b132b' }}>Lưu trữ lộ trình này?</h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Bạn có thể lưu kết quả để xem lại sau hoặc nhận tư vấn chi tiết từ chuyên gia MindConnect.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
  onClick={handleSaveData} 
  disabled={isSaving} 
  style={{ 
    padding: '12px 24px', 
    background: '#0b132b', // Đổi sang màu tối cho nổi bật
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontWeight: 700, 
    cursor: isSaving ? 'not-allowed' : 'pointer',
    opacity: isSaving ? 0.7 : 1
  }}
>
  {isSaving ? (
    <>
      <i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i>
      Đang lưu...
    </>
  ) : (
    'Lưu kết quả lộ trình'
  )}
</button>
          <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSaveData} disabled={isSaving} style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
            {isSaving ? 'Đang xử lý...' : 'Lưu kết quả'}
          </button>
          
          {/* ĐÃ SỬA: Bọc Link để chuyển sang trang Mentors */}
          <Link to="/mentors" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '12px 24px', background: '#0b132b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Tư vấn 1-1 <i className="fas fa-arrow-right"></i>
            </button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Step4;