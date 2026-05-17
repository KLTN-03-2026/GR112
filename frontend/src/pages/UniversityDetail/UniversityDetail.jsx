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

  // --- STATE QUẢN LÝ ĐÁNH GIÁ (DỮ LIỆU THẬT) ---
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 1. HÀM TẢI DANH SÁCH ĐÁNH GIÁ TỪ DATABASE
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`hhttps://gr112.onrender.com/api/universities/${id}/reviews`);
      if (res.data.reviews) {
        setReviews(res.data.reviews);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
    }
  };

  // Fetch dữ liệu Trường và Reviews khi mở trang
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`https://gr112.onrender.com/api/universities/${id}`);
        setUniData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy thông tin trường:", error);
        setLoading(false);
      }
    };
    
    fetchDetail();
    fetchReviews();
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

  // 2. HÀM BẮN API LƯU ĐÁNH GIÁ XUỐNG DATABASE
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://gr112.onrender.com/api/universities/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rating: rating, content: comment })
      });
      
      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        alert("Cảm ơn bạn! Đánh giá đã được ghi nhận.");
        setShowModal(false);
        setComment('');
        setRating(5);
        fetchReviews();
      } else {
        alert(data.error || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      alert("Lỗi kết nối đến máy chủ.");
    }
  };

  // 3. TÍNH TOÁN THỐNG KÊ ĐÁNH GIÁ
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1) 
    : 0;

  const getStarPercentage = (starLevel) => {
    if (totalReviews === 0) return '0%';
    const count = reviews.filter(rev => rev.rating === starLevel).length;
    return `${(count / totalReviews) * 100}%`;
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
            
            {/* 🚀 ĐÃ NÂNG CẤP: Biến nút thành thẻ Link để chuyển sang trang Đặt lịch 1-1 */}
            <Link 
              to="/mentors" 
              className="ud-btn-apply" 
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Tư vấn trực tiếp 1-1
            </Link>

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
            
            {/* 1. Phần mô tả chung */}
            <div className="ud-desc-text"><p>{uniData.description}</p></div>
            
            {/* 🚀 2. THÊM MỚI: Khung Phương thức xét tuyển nổi bật (Màu vàng nhạt) */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              background: '#fffbeb', 
              border: '1px solid #fde68a', 
              borderRadius: '12px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <h4 style={{ color: '#92400e', marginTop: 0, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-file-signature"></i> Phương thức xét tuyển chi tiết:
              </h4>
              <div style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {uniData.admission_methods || "Nhà trường đang cập nhật phương thức xét tuyển mới nhất..."}
              </div>
            </div>

            {/* 3. ĐÃ NÂNG CẤP: 4 Ô THỐNG KÊ ĐIỂM SỐ */}
            <div className="ud-stats-grid">
              <div className="ud-stat-item">
                <h3 style={{ color: '#ef4444' }}>{String(uniData.score_thpt_last_year || '-').replace('.', ',')}</h3>
                <span>ĐIỂM THI THPT</span>
              </div>
              <div className="ud-stat-item">
                <h3 style={{ color: '#3b82f6' }}>{String(uniData.base_score || '-').replace('.', ',')}</h3>
                <span>ĐIỂM HỌC BẠ</span>
              </div>
              <div className="ud-stat-item">
                <h3 style={{ color: '#10b981' }}>{uniData.score_dgnl || '-'}</h3>
                <span>ĐIỂM ĐGNL</span>
              </div>
              <div className="ud-stat-item">
                <h3 style={{ color: '#f59e0b' }}>{uniData.subject_block || '-'}</h3>
                <span>TỔ HỢP MÔN</span>
              </div>
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
            <h2>Thông tin tuyển sinh chi tiết</h2>
            <div className="ud-admissions-box">
              <div className="ud-adm-col">
                <h4 className="ud-adm-title">PHƯƠNG THỨC & ĐIỀU KIỆN KÈM THEO</h4>
                
                {/* HIỂN THỊ CÁC THÔNG TIN CHUYÊN SÂU TỪ DB */}
                {uniData.combo_cert && <p>🏆 <b>Xét kết hợp chứng chỉ:</b> {uniData.combo_cert}</p>}
                {uniData.direct_admission && <p>🎯 <b>Tuyển thẳng:</b> {uniData.direct_admission}</p>}
                {uniData.aptitude_test && <p>🎨 <b>Thi năng khiếu:</b> {uniData.aptitude_test}</p>}
                {uniData.quota > 0 && <p>👥 <b>Chỉ tiêu năm {uniData.year || 2025}:</b> {uniData.quota} sinh viên</p>}
                
                <div className="ud-desc-text" style={{whiteSpace: 'pre-line', textAlign: 'left', marginTop: '15px'}}>
                  {uniData.admission_methods}
                </div>
              </div>
              <div className="ud-adm-col ud-border-left">
                <h4 className="ud-adm-title">LIÊN HỆ PHÒNG ĐÀO TẠO</h4>
                <p><b>Hotline:</b> {uniData.phone || "Đang cập nhật"}</p>
                <p><b>Website:</b> <a href={uniData.website} target="_blank" rel="noreferrer">{uniData.website || "Đang cập nhật"}</a></p>
              </div>
            </div>
          </section>

          {/* ĐÁNH GIÁ TỪ CỘNG ĐỒNG */}
          <section className="ud-section" ref={reviewRef}>
            <h2>Đánh giá từ cộng đồng sinh viên</h2>
            <div className="ud-reviews-container">
              
              <div className="ud-rating-summary">
                <div className="ud-rating-big-box">
                  <div className="ud-rating-score">{avgRating}</div>
                  <div className="ud-rating-stars-main">{'⭐'.repeat(Math.round(avgRating) || 5)}</div>
                  <div className="ud-rating-count">{totalReviews} đánh giá</div>
                </div>
                <div className="ud-rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="ud-bar-item">
                      <span>{star} sao</span>
                      <div className="ud-bar-bg">
                        <div className="ud-bar-fill" style={{ width: getStarPercentage(star) }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ud-reviews-list">
                {reviews.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                  reviews.map((rev) => (
                    <div className="ud-review-item" key={rev.id}>
                      <div className="ud-rev-user-info">
                        <div className="ud-rev-user-left">
                          <div className="ud-rev-avatar-circle">{rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}</div>
                          <div className="ud-rev-user-meta">
                            <h4>{rev.name || 'Người dùng ẩn danh'} <span className="ud-rev-badge">{rev.badge || 'Sinh viên'}</span></h4>
                            <span>{rev.time || 'Vừa xong'}</span>
                          </div>
                        </div>
                        <div style={{color: '#fbbf24', fontSize: '1rem'}}>{'⭐'.repeat(rev.rating)}</div>
                      </div>
                      <p className="ud-rev-text">{rev.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <button className="ud-btn-write-review" onClick={() => setShowModal(true)}>
                <i className="fas fa-pen"></i> Viết đánh giá của bạn
              </button>
            </div>
          </section>
        </main>

        {/* SIDEBAR BÊN PHẢI */}
        <aside className="ud-sidebar">
          
          {/* GIAO DIỆN THÔNG TIN NHANH MỚI */}
          <div className="ud-quick-info">
            <h4>⚡ Thông định nhanh</h4>
            <ul>
              <li>
                <i className="fas fa-map-marker-alt"></i> 
                <div className="qi-text">
                  <strong>Địa chỉ</strong>
                  <span>{uniData.address || "Đang cập nhật..."}</span>
                </div>
              </li>
              <li>
                <i className="fas fa-money-bill-wave"></i> 
                <div className="qi-text">
                  <strong>Học phí trung bình</strong>
                  <span>{uniData.tuition_fee || "Đang cập nhật..."}</span>
                </div>
              </li>
              <li>
                <i className="fas fa-university"></i> 
                <div className="qi-text">
                  <strong>Loại hình</strong>
                  <span>{uniData.school_type || "Đang cập nhật..."}</span>
                </div>
              </li>
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
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel" disabled={isSubmitting}>Hủy bỏ</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityDetail;