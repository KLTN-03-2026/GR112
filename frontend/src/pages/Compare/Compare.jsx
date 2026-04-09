import React, { useState } from 'react';
import { Plus, X, Star, Download, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import './Compare.css';

// Dữ liệu mẫu mô phỏng thiết kế của bạn
const initialSchools = [
  {
    id: 1,
    name: 'Đại học Khoa học & Công nghệ Hà Nội',
    shortName: 'USTH',
    location: 'Hà Nội, Việt Nam',
    type: 'CÔNG LẬP QUỐC TẾ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Logo_USTH.svg/1200px-Logo_USTH.svg.png',
    aiMatch: 92,
    aiText: '"Cực kỳ phù hợp với định hướng nghiên cứu và thành tích môn Toán/Lý của bạn."',
    scores: { '2023': '26.55', '2022': '25.75', '2021': '24.20' },
    blocks: 'A00, A01, D07',
    tuition: '~46.000.000 VNĐ',
    scholarship: 'Học bổng Chính phủ Pháp, Học bổng USTH (10-100%)',
    facilities: ['Lab hiện đại', 'Ký túc xá gần trường'],
    rating: 4.5,
    reviews: 120,
    jobRate: '95%',
    salary: '12 - 18tr VNĐ/tháng'
  },
  {
    id: 2,
    name: 'Đại học RMIT Việt Nam',
    shortName: 'RMIT',
    location: 'TP. Hồ Chí Minh',
    type: 'TƯ THỤC QUỐC TẾ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/RMIT_University_Logo.svg/2560px-RMIT_University_Logo.svg.png',
    aiMatch: 78,
    aiText: '"Môi trường năng động, tốt cho phát triển kỹ năng mềm nhưng học phí là rào cản."',
    scores: { '2023': 'Xét tuyển riêng', '2022': 'Xét tuyển riêng', '2021': 'Xét tuyển riêng' },
    blocks: 'Xét học bạ, IELTS 6.5+, Phỏng vấn',
    tuition: '~320.000.000 VNĐ',
    scholarship: 'Học bổng Hiệu trưởng, Học bổng Thành tích (25-100%)',
    facilities: ['Thư viện 5 sao', 'Phòng Gym/Studio'],
    rating: 4.8,
    reviews: 450,
    jobRate: '98%',
    salary: '18 - 25tr VNĐ/tháng'
  }
];

export default function Compare() {
  const [schools, setSchools] = useState(initialSchools);

  // Hàm xóa trường khỏi danh sách so sánh
  const removeSchool = (id) => {
    setSchools(schools.filter(school => school.id !== id));
  };

  return (
    <main className="compare-container fade-in">
      {/* Header */}
      <div className="compare-header">
        <div>
          <h1 className="page-title">So sánh Đại học</h1>
          <p className="subtitle">Đối chiếu các tiêu chí quan trọng để đưa ra lựa chọn đúng đắn nhất.</p>
        </div>
        <button className="btn-add-school">
          <Plus size={18} /> Thêm trường đại học
        </button>
      </div>

      <div className="compare-table-wrapper">
        {/* ROW 1: School Cards */}
        <div className="compare-row header-row">
          <div className="compare-col label-col">
            <span className="section-label">THÔNG TIN CHUNG</span>
          </div>
          {schools.map(school => (
            <div className="compare-col school-col" key={school.id}>
              <div className="school-card">
                <button className="btn-remove" onClick={() => removeSchool(school.id)}><X size={16} /></button>
                <div className="school-logo-wrapper">
                   <img src={school.logo} alt={school.shortName} className="school-logo" />
                </div>
                <h3>{school.name}</h3>
                <p className="location"><MapPin size={14} /> {school.location}</p>
                <span className={`tag ${school.type.includes('CÔNG LẬP') ? 'public' : 'private'}`}>
                  {school.type}
                </span>
              </div>
            </div>
          ))}
          
          {/* Empty Slot for 3rd school */}
          {schools.length < 3 && (
            <div className="compare-col school-col">
              <div className="empty-slot">
                <Plus size={32} color="#cbd5e1" />
                <p>Chọn trường thứ {schools.length + 1}</p>
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: AI Insights */}
        <div className="compare-row ai-row">
          <div className="compare-col label-col ai-label">
            <Sparkles size={20} color="#3b5998" /> 
            <div>
               <h4>AI Insights</h4>
               <span>Phân tích mức độ phù hợp</span>
            </div>
          </div>
          {schools.map(school => (
            <div className="compare-col" key={`ai-${school.id}`}>
              <div className="ai-match-card">
                <div className="match-header">
                   <span>AI Match %</span>
                   <h2>{school.aiMatch}%</h2>
                </div>
                <div className="progress-bar-bg">
                   <div className="progress-bar-fill" style={{width: `${school.aiMatch}%`}}></div>
                </div>
                <p className="ai-text">{school.aiText}</p>
              </div>
            </div>
          ))}
           {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        {/* SECTIONS */}
        <div className="section-title">TUYỂN SINH & NGÀNH HỌC</div>
        
        <div className="compare-row">
          <div className="compare-col label-col">Điểm chuẩn (3 năm qua)</div>
          {schools.map(school => (
            <div className="compare-col data-col" key={`score-${school.id}`}>
              <div className="score-list">
                 <span>2023: <strong>{school.scores['2023']}</strong></span>
                 <span>2022: <strong>{school.scores['2022']}</strong></span>
                 <span>2021: <strong>{school.scores['2021']}</strong></span>
              </div>
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="compare-row">
          <div className="compare-col label-col">Khối xét tuyển</div>
          {schools.map(school => (
            <div className="compare-col data-col" key={`block-${school.id}`}>
              {school.blocks}
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="section-title">TÀI CHÍNH</div>
        
        <div className="compare-row">
          <div className="compare-col label-col">Học phí trung bình/năm</div>
          {schools.map(school => (
            <div className="compare-col data-col font-semibold" key={`tuition-${school.id}`}>
              {school.tuition}
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="compare-row">
          <div className="compare-col label-col">Học bổng</div>
          {schools.map(school => (
            <div className="compare-col data-col" key={`scholarship-${school.id}`}>
              {school.scholarship}
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="section-title">CƠ SỞ VẬT CHẤT & ĐÁNH GIÁ</div>

        <div className="compare-row">
          <div className="compare-col label-col">Cơ sở vật chất</div>
          {schools.map(school => (
            <div className="compare-col data-col" key={`facilities-${school.id}`}>
              <div className="facility-tags">
                 {school.facilities.map((f, i) => <span key={i} className="f-tag">{f}</span>)}
              </div>
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="compare-row">
          <div className="compare-col label-col">Xếp hạng sinh viên</div>
          {schools.map(school => (
            <div className="compare-col data-col rating-col" key={`rating-${school.id}`}>
               <span className="rating-score">{school.rating} <Star size={16} fill="#f59e0b" color="#f59e0b"/></span>
               <span className="rating-count">({school.reviews} đánh giá)</span>
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="section-title">CƠ HỘI NGHỀ NGHIỆP</div>

        <div className="compare-row">
          <div className="compare-col label-col">Tỷ lệ việc làm (6 tháng)</div>
          {schools.map(school => (
            <div className="compare-col data-col font-semibold" key={`job-${school.id}`}>
               {school.jobRate}
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        <div className="compare-row">
          <div className="compare-col label-col">Lương khởi điểm TB</div>
          {schools.map(school => (
            <div className="compare-col data-col" key={`salary-${school.id}`}>
               {school.salary}
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>

        {/* Action Buttons Row */}
        <div className="compare-row action-row">
           <div className="compare-col label-col"></div>
           {schools.map(school => (
            <div className="compare-col action-col" key={`action-${school.id}`}>
               <button className="btn-consult">Đăng ký Tư vấn ngay</button>
               <button className="btn-detail">Xem chi tiết trường</button>
            </div>
          ))}
          {schools.length < 3 && <div className="compare-col"></div>}
        </div>
      </div>

      {/* Bottom Banners */}
      <div className="bottom-banners">
         <div className="banner ai-banner">
            <div className="banner-badge"><Sparkles size={14}/> PHÂN TÍCH CHUYÊN SÂU TỪ AI</div>
            <h2>Lộ trình sự nghiệp tối ưu</h2>
            <p>Dựa trên hồ sơ của bạn, USTH mang lại cơ hội nghiên cứu tại Pháp cao hơn 40%, trong khi RMIT mở rộng mạng lưới kết nối với các tập đoàn đa quốc gia tại Singapore và Úc.</p>
            <button className="btn-white">Xem lộ trình chi tiết</button>
         </div>
         <div className="banner pdf-banner">
            <div className="pdf-icon"><Download size={24} color="#3b5998"/></div>
            <h3>Tải bảng so sánh PDF</h3>
            <p>Lưu lại bản đối chiếu chi tiết để thảo luận cùng phụ huynh.</p>
            <button className="btn-white-outline">Tải xuống ngay</button>
         </div>
      </div>
    </main>
  );
}