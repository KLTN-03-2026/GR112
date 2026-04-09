import React, { useState } from 'react';
import './UniversityDetail.css';

const UniversityDetail = () => {
  const [activeTab, setActiveTab] = useState('tong-quan');

  return (
    <div className="ud-page fade-in">
      
      {/* --- HERO BANNER --- */}
      <div className="ud-hero">
        <div className="ud-hero-bg">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80" alt="HUST Campus" />
          <div className="ud-hero-overlay"></div>
        </div>
        
        <div className="ud-hero-content">
          <div className="ud-logo-box">
            <img src="https://upload.wikimedia.org/wikipedia/vi/a/a1/Logo_HUST.png" alt="HUST Logo" />
          </div>
          <div className="ud-hero-info">
            <h1>Đại học Bách Khoa Hà Nội</h1>
            <p>Hà Nội, Việt Nam · Đại học công lập trọng điểm</p>
          </div>
          <div className="ud-hero-actions">
            <button className="ud-btn-apply">Nộp hồ sơ ngay</button>
            <button className="ud-btn-favorite"><i className="fas fa-heart"></i></button>
          </div>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="ud-tabs-wrapper">
        <div className="ud-tabs">
          <button className={activeTab === 'tong-quan' ? 'active' : ''} onClick={() => setActiveTab('tong-quan')}>Tổng quan</button>
          <button className={activeTab === 'nganh-dao-tao' ? 'active' : ''} onClick={() => setActiveTab('nganh-dao-tao')}>Ngành đào tạo</button>
          <button className={activeTab === 'thong-tin-tuyen-sinh' ? 'active' : ''} onClick={() => setActiveTab('thong-tin-tuyen-sinh')}>Thông tin tuyển sinh</button>
          <button className={activeTab === 'danh-gia' ? 'active' : ''} onClick={() => setActiveTab('danh-gia')}>Đánh giá sinh viên</button>
        </div>
      </div>

      {/* --- MAIN CONTENT & SIDEBAR --- */}
      <div className="ud-layout">
        
        {/* CỘT TRÁI (NỘI DUNG CHÍNH) */}
        <main className="ud-main-content">
          
          {/* Section: Về trường Đại học */}
          <section className="ud-section">
            <h2>Về trường Đại học</h2>
            <div className="ud-desc-text">
              <p>Đại học Bách khoa Hà Nội là trường đại học kỹ thuật đầu tiên của Việt Nam, được thành lập năm 1956. Trường luôn khẳng định vị thế là trung tâm đào tạo, nghiên cứu khoa học và chuyển giao công nghệ hàng đầu của cả nước.</p>
              <p>Tọa lạc tại trung tâm Hà Nội với khuôn viên rộng hơn 26 héc-ta, trường sở hữu hệ thống phòng thí nghiệm hiện đại cùng đội ngũ giảng viên giàu kinh nghiệm. Đại học Bách Khoa Hà Nội là cái nôi đào tạo ra nhiều thế hệ lãnh đạo, chuyên gia xuất sắc trong các lĩnh vực khoa học, kỹ thuật và quản lý tại Việt Nam.</p>
            </div>
            
            <div className="ud-stats-grid">
              <div className="ud-stat-item">
                <h3>15%</h3>
                <span>TỈ LỆ TRÚNG TUYỂN</span>
              </div>
              <div className="ud-stat-item">
                <h3>35,000+</h3>
                <span>TỔNG SINH VIÊN</span>
              </div>
              <div className="ud-stat-item">
                <h3>Top 1</h3>
                <span>KỸ THUẬT TẠI VN</span>
              </div>
              <div className="ud-stat-item">
                <h3>95%</h3>
                <span>TỈ LỆ VIỆC LÀM</span>
              </div>
            </div>
          </section>

          {/* Section: Ngành đào tạo */}
          <section className="ud-section">
            <div className="ud-section-header">
              <div>
                <h2>Ngành đào tạo</h2>
                <p className="ud-subtitle">Khám phá hơn 60 chương trình đào tạo đại học chất lượng cao.</p>
              </div>
              <a href="#all" className="ud-link-all">Xem tất cả &rarr;</a>
            </div>
            
            <div className="ud-majors-grid">
              <div className="ud-major-card">
                <h4>Khoa học Máy tính</h4>
                <p>Ngành học mũi nhọn với trọng tâm AI và Big Data.</p>
              </div>
              <div className="ud-major-card">
                <h4>Kỹ thuật Điều khiển & TĐH</h4>
                <p>Dẫn đầu về công nghệ robot và nhà máy thông minh.</p>
              </div>
              <div className="ud-major-card">
                <h4>Kỹ thuật Điện tử - Viễn thông</h4>
                <p>Nghiên cứu bán dẫn và mạng không dây thế hệ mới.</p>
              </div>
              <div className="ud-major-card">
                <h4>Logistics & Quản lý chuỗi cung ứng</h4>
                <p>Ứng dụng tối ưu hóa trong vận tải và dịch vụ.</p>
              </div>
            </div>
          </section>

          {/* Section: Thông tin tuyển sinh */}
          <section className="ud-section">
            <h2>Thông tin tuyển sinh</h2>
            <div className="ud-admissions-box">
              <div className="ud-adm-col">
                <h4 className="ud-adm-title">HẠN NỘP HỒ SƠ DỰ KIẾN</h4>
                <ul className="ud-adm-dates">
                  <li><span>Xét tuyển tài năng</span> <strong>Tháng 5</strong></li>
                  <li><span>Kỳ thi Đánh giá tư duy</span> <strong>Tháng 6</strong></li>
                  <li><span>Xét điểm thi tốt nghiệp THPT</span> <strong>Tháng 7</strong></li>
                </ul>
              </div>
              <div className="ud-adm-col ud-border-left">
                <h4 className="ud-adm-title">HỒ SƠ YÊU CẦU</h4>
                <ul className="ud-adm-reqs">
                  <li><i className="fas fa-check-circle"></i> Phiếu đăng ký xét tuyển trực tuyến</li>
                  <li><i className="fas fa-check-circle"></i> Học bạ THPT (Bản sao công chứng)</li>
                  <li><i className="fas fa-check-circle"></i> Chứng chỉ ngoại ngữ (IELTS, TOEFL... nếu có)</li>
                  <li><i className="fas fa-check-circle"></i> Căn cước công dân và Ảnh thẻ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Đánh giá sinh viên */}
          <section className="ud-section">
            <h2>Đánh giá sinh viên</h2>
            <div className="ud-reviews-list">
              
              <div className="ud-review-item">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="User" className="ud-rev-avatar" />
                <div className="ud-rev-content">
                  <div className="ud-rev-header">
                    <div>
                      <h4>Nguyễn Phương Linh</h4> <span>Khóa K65</span>
                    </div>
                    <div className="ud-stars">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                  </div>
                  <p>"Môi trường học tập tại Bách Khoa cực kỳ kỷ luật nhưng cũng rất năng động. Chương trình đào tạo bám sát thực tế, giúp mình tự tin khi đi thực tập tại các tập đoàn lớn ngay từ năm 3."</p>
                </div>
              </div>

              <div className="ud-review-item">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="User" className="ud-rev-avatar" />
                <div className="ud-rev-content">
                  <div className="ud-rev-header">
                    <div>
                      <h4>Trần Hoàng Nam</h4> <span>Khóa K64</span>
                    </div>
                    <div className="ud-stars">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                    </div>
                  </div>
                  <p>"Dù việc học có phần áp lực, nhưng cộng đồng sinh viên Bách Khoa rất gắn kết. Các câu lạc bộ học thuật và phong trào nghiên cứu khoa học ở đây thực sự rất phát triển."</p>
                </div>
              </div>

            </div>
          </section>

        </main>

        {/* CỘT PHẢI (SIDEBAR) */}
        <aside className="ud-sidebar">
          
          {/* Card Phân tích AI (Màu tím) */}
          <div className="ud-ai-card">
            <div className="ud-ai-header">
              <i className="fas fa-robot"></i> PHÂN TÍCH AI
            </div>
            <h3>Khả năng trúng tuyển</h3>
            <p>Dựa trên điểm thi thử 28.5 và giải HSG Thành phố.</p>
            
            {/* Vòng tròn phần trăm 62% */}
            <div className="ud-circular-progress">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray="62, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">62%</text>
              </svg>
            </div>

            <ul className="ud-ai-bullets">
              <li>Độ phù hợp cao với ngành CNTT</li>
              <li>Điểm số nằm trong top 5% thí sinh</li>
            </ul>

            <button className="ud-ai-btn">Cải thiện cơ hội của bạn</button>
          </div>

          {/* Card Thông tin nhanh */}
          <div className="ud-quick-info">
            <h4>Thông tin nhanh</h4>
            <ul>
              <li>
                <div className="qi-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="qi-text">
                  <strong>ĐỊA CHỈ</strong>
                  <span>01 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
                </div>
              </li>
              <li>
                <div className="qi-icon"><i className="fas fa-money-bill-wave"></i></div>
                <div className="qi-text">
                  <strong>HỌC PHÍ TRUNG BÌNH</strong>
                  <span>25 - 45 triệu VNĐ/năm</span>
                </div>
              </li>
              <li>
                <div className="qi-icon"><i className="fas fa-globe"></i></div>
                <div className="qi-text">
                  <strong>WEBSITE</strong>
                  <a href="https://hust.edu.vn" target="_blank" rel="noreferrer">hust.edu.vn</a>
                </div>
              </li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default UniversityDetail;