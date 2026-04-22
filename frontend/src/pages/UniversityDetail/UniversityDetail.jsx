import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './UniversityDetail.css';

const UniversityDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [uniData, setUniData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ YÊU THÍCH ---
  const [isFavorite, setIsFavorite] = useState(false);

  // --- STATE QUẢN LÝ ĐÁNH GIÁ ---
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Minh Quân',
      badge: 'Sinh viên K66',
      time: '2 tháng trước',
      avatar: 'M',
      content: 'Cơ sở vật chất của trường rất hiện đại, đặc biệt là thư viện trung tâm. Giảng viên hỗ trợ sinh viên cực kỳ nhiệt tình.',
      rating: 5
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Refs cuộn trang
  const overviewRef = useRef(null);
  const majorsRef = useRef(null);
  const admissionRef = useRef(null);
  const reviewRef = useRef(null);

  const scrollToSection = (elementRef, tabName) => {
    setActiveTab(tabName);
    const offset = 120;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = elementRef.current.getBoundingClientRect().top;
    const offsetPosition = (elementRect - bodyRect) - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  // Fetch dữ liệu và kiểm tra trạng thái Yêu thích
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/universities/${id}`);
        setUniData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (uniData) {
      const savedFavs = JSON.parse(localStorage.getItem('favSchools')) || [];
      const isFav = savedFavs.some(school => school.id === uniData.id);
      setIsFavorite(isFav);
    }
  }, [uniData]);

  // Xử lý Thả tim
  const handleToggleFavorite = () => {
    let savedFavs = JSON.parse(localStorage.getItem('favSchools')) || [];
    if (isFavorite) {
      savedFavs = savedFavs.filter(school => school.id !== uniData.id);
    } else {
      savedFavs.push({
        id: uniData.id,
        name: uniData.school_name,
        location: uniData.loc || uniData.region,
        logo: uniData.school_logo,
        score: uniData.base_score,
        rate: uniData.ratio || "1:10",
        tuition: uniData.tuition_fee,
        major: uniData.major_name
      });
    }
    localStorage.setItem('favSchools', JSON.stringify(savedFavs));
    setIsFavorite(!isFavorite);
  };

  // Xử lý Đăng bài Đánh giá
  const handleSubmitReview = (e) => {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      name: 'Bạn',
      badge: 'Thành viên mới',
      time: 'Vừa xong',
      avatar: 'B',
      content: comment,
      rating: rating
    };
    setReviews([newReview, ...reviews]);
    alert("Cảm ơn bạn! Đánh giá đã được thêm.");
    setShowModal(false);
    setComment('');
    setRating(5);
  };

  if (loading) return <div className="ud-loading">Đang tải dữ liệu...</div>;
  if (!uniData) return <div className="ud-error">Không tìm thấy dữ liệu trường học này!</div>;

  return (
    <div className="ud-page fade-in">
      {/* HERO BANNER */}
      <div className="ud-hero">
        <div className="ud-hero-bg">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80" alt="Campus" />
          <div className="ud-hero-overlay"></div>
        </div>
        <div className="ud-hero-content">
          <div className="ud-logo-box"><img src={uniData.school_logo} alt="Logo" /></div>
          <div className="ud-hero-info">
            <h1>{uniData.school_name}</h1>
            <p>{uniData.loc || uniData.region} · {uniData.school_type}</p>
          </div>
          <div className="ud-hero-actions">
            <button className="ud-btn-apply">Tư vấn ngay</button>
            <button className={`ud-btn-favorite ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
              <i className="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="ud-tabs-wrapper">
        <div className="ud-tabs">
          <button className={activeTab === 'tong-quan' ? 'active' : ''} onClick={() => scrollToSection(overviewRef, 'tong-quan')}>Tổng quan</button>
          <button className={activeTab === 'nganh-dao-tao' ? 'active' : ''} onClick={() => scrollToSection(majorsRef, 'nganh-dao-tao')}>Ngành đào tạo</button>
          <button className={activeTab === 'thong-tin-tuyen-sinh' ? 'active' : ''} onClick={() => scrollToSection(admissionRef, 'thong-tin-tuyen-sinh')}>Thông tin tuyển sinh</button>
          <button className={activeTab === 'danh-gia' ? 'active' : ''} onClick={() => scrollToSection(reviewRef, 'danh-gia')}>Đánh giá</button>
        </div>
      </div>

      {/* LAYOUT CHÍNH */}
      <div className="ud-layout">
        <main className="ud-main-content">
          {/* TỔNG QUAN */}
          <section className="ud-section" ref={overviewRef}>
            <h2>Về trường Đại học</h2>
            <div className="ud-desc-text"><p>{uniData.description}</p></div>
            <div className="ud-stats-grid">
              <div className="ud-stat-item"><h3>{uniData.base_score}</h3><span>ĐIỂM CHUẨN</span></div>
              <div className="ud-stat-item"><h3>{uniData.subject_block}</h3><span>KHỐI XÉT TUYỂN</span></div>
              <div className="ud-stat-item"><h3>{uniData.ratio || '1:10'}</h3><span>TỈ LỆ CHỌI</span></div>
              <div className="ud-stat-item"><h3>95%</h3><span>CÓ VIỆC LÀM</span></div>
            </div>
          </section>

          {/* NGÀNH ĐÀO TẠO */}
          <section className="ud-section" ref={majorsRef}>
            <h2>Chương trình đào tạo trọng điểm</h2>
            <div className="ud-majors-grid">
              <div className="ud-major-card highlighted">
                <div className="major-badge">Đang xem</div>
                <h4>{uniData.major_name}</h4>
                <p>Chương trình đào tạo chuyên sâu, bám sát thực tiễn doanh nghiệp.</p>
              </div>
              <div className="ud-major-card">
                <h4>Khoa học Máy tính</h4>
                <p>Top đầu về công nghệ và chuyển đổi số tại Việt Nam.</p>
              </div>
            </div>
          </section>

          {/* THÔNG TIN TUYỂN SINH */}
          <section className="ud-section" ref={admissionRef}>
            <h2>Thông tin tuyển sinh</h2>
            <div className="ud-admissions-box">
              <div className="ud-adm-col">
                <h4 className="ud-adm-title">PHƯƠNG THỨC XÉT TUYỂN</h4>
                <div className="ud-desc-text" style={{whiteSpace: 'pre-line', textAlign: 'left'}}>{uniData.admission_methods}</div>
              </div>
              <div className="ud-adm-col ud-border-left">
                <h4 className="ud-adm-title">LIÊN HỆ</h4>
                <p><b>Hotline:</b> {uniData.phone}</p>
                <p><b>Website:</b> <a href={uniData.website} target="_blank" rel="noreferrer">{uniData.website}</a></p>
              </div>
            </div>
          </section>

          {/* ĐÁNH GIÁ (CÓ HIỂN THỊ LIST) */}
          <section className="ud-section" ref={reviewRef}>
            <h2>Đánh giá từ cộng đồng sinh viên</h2>
            <div className="ud-reviews-container">
              <div className="ud-rating-summary">
                <div className="ud-rating-big-box">
                  <div className="ud-rating-score">4.8</div>
                  <div className="ud-rating-stars-main">⭐⭐⭐⭐⭐</div>
                  <div className="ud-rating-count">{1240 + reviews.length - 1} đánh giá</div>
                </div>
                <div className="ud-rating-bars">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="ud-bar-item">
                      <span>{s} sao</span>
                      <div className="ud-bar-bg"><div className="ud-bar-fill" style={{ width: s===5?'85%':s===4?'10%':'5%' }}></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ud-reviews-list">
                {reviews.map((rev) => (
                  <div className="ud-review-item" key={rev.id}>
                    <div className="ud-rev-user-info">
                      <div className="ud-rev-user-left">
                        <div className="ud-rev-avatar-circle">{rev.avatar}</div>
                        <div className="ud-rev-user-meta">
                          <h4>{rev.name} <span className="ud-rev-badge">{rev.badge}</span></h4>
                          <span>{rev.time}</span>
                        </div>
                      </div>
                      <div style={{color: '#fbbf24', fontSize: '1rem'}}>{'⭐'.repeat(rev.rating)}</div>
                    </div>
                    <p className="ud-rev-text">{rev.content}</p>
                  </div>
                ))}
              </div>
              <button className="ud-btn-write-review" onClick={() => setShowModal(true)}>
                <i className="fas fa-pen"></i> Viết đánh giá của bạn
              </button>
            </div>
          </section>
        </main>

        {/* SIDEBAR BÊN PHẢI */}
        <aside className="ud-sidebar">
          <div className="ud-quick-info">
            <h4>Thông tin nhanh</h4>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> <div className="qi-text"><strong>ĐỊA CHỈ</strong><span>{uniData.address}</span></div></li>
              <li><i className="fas fa-money-bill-wave"></i> <div className="qi-text"><strong>HỌC PHÍ</strong><span>{uniData.tuition_fee}</span></div></li>
              <li><i className="fas fa-university"></i> <div className="qi-text"><strong>LOẠI HÌNH</strong><span>{uniData.school_type}</span></div></li>
            </ul>
          </div>
          <div className="ud-ai-card">
            <div className="ud-ai-header"><i className="fas fa-robot"></i> PHÂN TÍCH AI</div>
            <h3>Tỉ lệ trúng tuyển</h3>
            <div className="ud-ai-circle"><span>82%</span></div>
            <p>Dựa trên điểm số của bạn, tỉ lệ trúng tuyển được đánh giá ở mức <b>Rất cao</b>.</p>
            <Link to="/chatbot" className="ud-ai-btn" style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
              Tư vấn chuyên sâu
            </Link>
          </div>
        </aside>
      </div>

      {/* --- MODAL POPUP VIẾT ĐÁNH GIÁ --- */}
      {showModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal-content fade-in">
            <h3>Viết đánh giá cho {uniData.school_name}</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="ud-form-group">
                <label>Đánh giá số sao:</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value="5">⭐⭐⭐⭐⭐ (Tuyệt vời)</option>
                  <option value="4">⭐⭐⭐⭐ (Tốt)</option>
                  <option value="3">⭐⭐⭐ (Bình thường)</option>
                  <option value="2">⭐⭐ (Kém)</option>
                  <option value="1">⭐ (Tệ)</option>
                </select>
              </div>
              <div className="ud-form-group">
                <label>Chia sẻ trải nghiệm của bạn:</label>
                <textarea 
                  rows="5" 
                  placeholder="Chia sẻ về cơ sở vật chất, giảng viên, môi trường học tập..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="ud-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Hủy bỏ</button>
                <button type="submit" className="btn-submit">Gửi đánh giá</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityDetail;