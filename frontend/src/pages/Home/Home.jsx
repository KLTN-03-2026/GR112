import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ mockUniversities }) => {
  // Mình đã gỡ bỏ hoàn toàn logic Modal Waitlist ở đây vì giờ bay thẳng sang trang chức năng!

  return (
    <div className="home-page fade-in">
      
      {/* --- HERO SECTION --- */}
      <section className="hm-hero">
        <div className="hm-hero-content">
          <span className="hm-badge"><i className="fas fa-compass"></i> ĐỊNH HƯỚNG TƯƠNG LAI CỦA BẠN</span>
          <h1 className="hm-title">Bản đồ Chính xác cho Vận mệnh Học thuật.</h1>
          <p className="hm-subtitle">Vượt xa những lời khuyên chung chung. Hệ thống AI của chúng tôi phân tích hồ sơ tài năng và xu hướng thị trường để kết nối bạn với những trường đại học phù hợp với tiềm năng thực sự của bạn.</p>
          <div className="hm-hero-btns">
            <Link to="/quiz" className="hm-btn-primary" style={{ textDecoration: 'none' }}>
              Làm trắc nghiệm hướng nghiệp &rarr;
            </Link>
            <Link to="/search" className="hm-btn-outline" style={{ textDecoration: 'none' }}>
              Tìm trường ngay
            </Link>
          </div>
        </div>
        <div className="hm-hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="Students studying" />
          <div className="hm-floating-card">
            <div className="hm-float-icon"><i className="fas fa-brain"></i></div>
            <div className="hm-float-text">
              <strong>Tư duy Logic &rarr; Khoa học Dữ liệu</strong>
              <span>Phù hợp với đặc điểm tính cách, kỹ năng phân tích và giải quyết vấn đề của bạn.</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="hm-features">
        <div className="hm-section-header">
          <h2>Công cụ Hiện đại cho Thế hệ Tiếp theo.</h2>
          <p>Định hướng tương lai không thể đoán mò. Chúng tôi sử dụng các điểm dữ liệu đa chiều để đảm bảo việc giáo dục của bạn là một khoản đầu tư, không chỉ là một tấm bằng.</p>
          <div className="hm-icon-bg"><i className="fas fa-robot"></i></div>
        </div>

        <div className="hm-features-grid">
          {/* 1. Ghép đôi Chuyên ngành */}
          <Link to="/quiz" className="hm-feat-card light span-1" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="hm-feat-icon purple"><i className="fas fa-project-diagram"></i></div>
            <h3>Ghép đôi Chuyên ngành Thông minh</h3>
            <p>Thuật toán độc quyền của chúng tôi phân tích học bạ, sở thích và tính cách để dự đoán sự bền vững nghề nghiệp trong các lĩnh vực mới nổi.</p>
          </Link>
          
          {/* 2. AI Tuyển sinh */}
          <Link to="/chatbot" className="hm-feat-card dark span-2" style={{ textDecoration: 'none', color: 'white', display: 'block' }}>
            <h3>AI Tuyển sinh Thời gian thực</h3>
            <p>Mô phỏng các kịch bản ứng tuyển và nhận phản hồi tức thì cho bài luận cá nhân bằng mô hình LLM được huấn luyện trên dữ liệu xét tuyển hàng đầu.</p>
            <i className="fas fa-graduation-cap hm-bg-icon"></i>
          </Link>
          
          {/* 3. Dự đoán ROI -> Bay sang /roi */}
          <Link to="/roi-calculator" className="hm-feat-card purple span-1" style={{ textDecoration: 'none', color: 'white', display: 'block' }}>
            <div className="hm-feat-icon white"><i className="fas fa-chart-line"></i></div>
            <h3>Dự đoán ROI</h3>
            <p>Tính toán thu nhập dự kiến sau 10 năm tốt nghiệp dựa trên xu thế kinh tế và sự phát triển thị trường đại học và doanh nghiệp liên quan.</p>
          </Link>
          
          {/* 4. Cố vấn Tinh hoa -> Bay sang /mentors */}
          <Link to="/mentors" className="hm-feat-card light span-1" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3>Cố vấn Tinh hoa</h3>
            <p>Kết nối với các chuyên gia giáo dục hàng đầu, những người được lựa chọn cẩn thận để phù hợp với mục tiêu nghề nghiệp của bạn.</p>
          </Link>
          
          {/* 5. Tư vấn Trực tiếp -> Bay sang /booking */}
          <Link to="/booking" className="hm-feat-card light span-1 hm-avatar-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="hm-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 1" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User 2" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 3" />
            </div>
            <h3>Tư vấn Trực tiếp</h3>
            <p>Trao đổi 1-1 với đội ngũ chuyên gia về định hướng trọn đời.</p>
          </Link>
        </div>
      </section>

      {/* --- UNIVERSITIES SECTION --- */}
      <section className="hm-universities">
        <div className="hm-uni-header">
          <div>
            <h2>Các trường đại học hàng đầu</h2>
            <p>Các trường đại học phù hợp cao dựa trên hồ sơ sinh viên của nền tảng của bạn.</p>
          </div>
          <Link to="/search" className="hm-btn-outline-small" style={{ textDecoration: 'none' }}>Xem tất cả các trường</Link>
        </div>

        <div className="hm-uni-grid">
          {mockUniversities.slice(0, 3).map(uni => (
            <Link 
              to={`/detail/${uni.id}`} 
              key={uni.id} 
              className="hm-uni-card" 
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              <div className="hm-uni-img">
                <span className="hm-match-badge"><i className="fas fa-bolt"></i> {uni.match}% AI PHÙ HỢP</span>
                <img src={uni.img} alt={uni.name} />
              </div>
              <div className="hm-uni-info">
                <h3>{uni.name} ({uni.tags[0]})</h3>
                <p className="hm-location"><i className="fas fa-map-marker-alt"></i> {uni.loc}</p>
                
                <div className="hm-uni-stats">
                  <div className="stat-row"><span>Điểm THPTQG</span><strong>24.5 - 28.5</strong></div>
                  <div className="stat-row"><span>Tỉ lệ chọi</span><strong>{uni.ratio}</strong></div>
                  <div className="stat-row"><span>Điểm trung bình hệ số</span><strong>85% Phù hợp</strong></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="hm-testimonials">
        <div className="hm-testi-header">
          <h2>Tiếng nói của Tương lai.</h2>
        </div>
        <div className="hm-testi-container">
          <div className="hm-testi-left">
            <div className="hm-testi-card">
              <p>"Hệ thống AI không chỉ xem xét điểm thi tốt nghiệp của mình; nó hiểu niềm đam mê của mình với AI đạo đức. Nó đã tìm thấy một chương trình chuyên sâu tại Bách Khoa mà mình thậm chí chưa từng cân nhắc. Thực sự là một sinh viên năm nhất rất tự hào!"</p>
              <div className="hm-author">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Author" />
                <div>
                  <h4>Trần Phương Anh</h4>
                  <span>Ngành Khoa học Máy tính, HUST</span>
                </div>
              </div>
            </div>
            <div className="hm-testi-card">
              <p>"Tính năng Ghép đôi Chuyên ngành Thông minh thực sự thay đổi mọi thứ. Mình từng phân vân giữa Luật và Công nghệ; AI đã chỉ cho mình cầu nối trong mảng Luật Sở hữu Trí tuệ cho Công nghệ sinh học. Nó giúp mình tiết kiệm nhiều năm mò mẫm sai."</p>
              <div className="hm-author">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Author" />
                <div>
                  <h4>Nguyễn Minh Hoàng</h4>
                  <span>Đại học Kinh tế Quốc dân</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hm-testi-right">
            <div className="hm-stat-circle">
              <div className="hm-check-icon"><i className="fas fa-check"></i></div>
              <h2>94%</h2>
              <p>TỈ LỆ THÀNH CÔNG</p>
              <span>Dựa trên 10K+ hồ sơ tham gia đánh giá</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="hm-cta">
        <h2>Sẵn sàng để xác định di sản học thuật<br/>của bạn?</h2>
        <p>Gia nhập cùng 50.000+ sinh viên đang sử dụng trí tuệ dữ liệu để điều hướng thế giới giáo dục đại học đầy phức tạp.</p>
        <div className="hm-cta-btns">
          <Link to="/quiz" className="hm-btn-white" style={{ textDecoration: 'none' }}>Làm trắc nghiệm miễn phí</Link>
          <Link to="/booking" className="hm-btn-outline-white" style={{ textDecoration: 'none' }}>Yêu cầu tư vấn</Link>
        </div>
      </section>

    </div>
  );
};

export default Home;