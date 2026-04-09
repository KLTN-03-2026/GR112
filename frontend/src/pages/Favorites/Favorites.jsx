import React from 'react';
import { Link } from 'react-router-dom';
// Sửa barChart2 thành BarChart2 ở dòng dưới
import { Heart, Info, BarChart2, Download, Sparkles, MapPin, PlusCircle, Maximize2 } from 'lucide-react';
import './Favorites.css';

const Favorites = () => {
  const favoriteSchools = [
    {
      id: 1,
      name: "Đại học Ngoại thương (FTU)",
      location: "91 Chùa Láng, Đống Đa, Hà Nội",
      logo: "https://upload.wikimedia.org/wikipedia/vi/8/85/Logo_FTU.png",
      score: "28.25",
      rate: "75%",
      tuition: "25M/Năm"
    },
    {
      id: 2,
      name: "Đại học Bách khoa Hà Nội (HUST)",
      location: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      logo: "https://upload.wikimedia.org/wikipedia/vi/a/a1/Logo_HUST.png",
      score: "27.50",
      rate: "62%",
      rank: "#1"
    },
    {
      id: 3,
      name: "Đại học Kinh tế Quốc dân (NEU)",
      location: "207 Giải Phóng, Đồng Tâm, Hai Bà Trưng",
      logo: "https://upload.wikimedia.org/wikipedia/vi/c/c4/Logo_NEU.png",
      score: "27.80",
      rate: "88%",
      major: "Kinh tế số"
    }
  ];

  return (
    <div className="fav-container fade-in">
      {/* HEADER */}
      <div className="fav-header">
        <div className="header-text">
          <p className="breadcrumb">TRANG CHỦ / <strong>TRƯỜNG YÊU THÍCH</strong></p>
          <h1>Danh sách trường quan tâm</h1>
          <p>Theo dõi các nguyện vọng của bạn và nhận phân tích chuyên sâu từ AI.</p>
        </div>
        <div className="header-btns">
          {/* Sửa thành BarChart2 */}
          <button className="btn-white-icon"><BarChart2 size={18} /> So sánh nhanh (3)</button>
          <button className="btn-dark-icon"><Download size={18} /> Xuất báo cáo</button>
        </div>
      </div>

      <div className="fav-main-layout">
        {/* CỘT TRÁI: DANH SÁCH TRƯỜNG */}
        <div className="fav-list">
          {favoriteSchools.map(school => (
            <div className="school-item-card" key={school.id}>
              <div className="school-main-info">
                <div className="school-logo-bg">
                  <img src={school.logo} alt="logo" />
                </div>
                <div className="school-details">
                  <h3>{school.name} <Heart size={18} fill="#e11d48" color="#e11d48" className="heart-active" /></h3>
                  <p><MapPin size={14} /> {school.location}</p>
                </div>
              </div>

              <div className="school-stats-row">
                <div className="stat-box">
                  <span>ĐIỂM CHUẨN</span>
                  <strong>{school.score}</strong>
                </div>
                <div className="stat-box">
                  <span>TỈ LỆ TRÚNG TUYỂN</span>
                  <strong className="text-blue">{school.rate}</strong>
                </div>
                <div className="stat-box">
                  <span>{school.tuition ? 'HỌC PHÍ' : school.rank ? 'XẾP HẠNG' : 'NGÀNH MŨI NHỌN'}</span>
                  <strong>{school.tuition || school.rank || school.major}</strong>
                </div>
                <div className="school-actions">
                  <Link to={`/detail/${school.id}`} className="btn-light-sm">Chi tiết</Link>
                  {/* Sửa thành BarChart2 */}
                  <button className="btn-outline-sm"><BarChart2 size={14} /> So sánh</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CỘT PHẢI: AI ANALYSIS */}
        <aside className="fav-sidebar">
          <div className="ai-analysis-card">
            {/* Tìm đến dòng này trong code của bạn */}
<div className="ai-card-title">
  <Sparkles size={18} /> AI Phân tích <Info size={16} style={{marginLeft: '4px'}} />
</div>
            <p>Dựa trên điểm thi thử <strong>26.5</strong> và sở thích <strong>Kinh tế</strong>, các trường FTU và NEU là lựa chọn đầy tham vọng nhưng khả thi.</p>
            <div className="match-progress">
              <div className="progress-text"><span>ĐỘ PHÙ HỢP TỔNG THỂ</span> <span>82%</span></div>
              <div className="bar-bg"><div className="bar-fill" style={{width: '82%'}}></div></div>
            </div>
          </div>

          <div className="ai-suggestions">
            <h4><Sparkles size={16} color="#3b5998" /> Gợi ý tương tự từ AI</h4>
            {[1, 2, 3].map(i => (
              <div className="suggest-item" key={i}>
                <div className="suggest-icon"><PlusCircle size={20} color="#cbd5e1" /></div>
                <div className="suggest-info">
                  <strong>Học viện Ngân hàng</strong>
                  <span>Phù hợp 94% • 25.80 điểm</span>
                </div>
                <button className="add-suggest">+</button>
              </div>
            ))}
            <button className="view-more-link">Xem thêm gợi ý khác</button>
          </div>
        </aside>
      </div>

      {/* PHẦN DƯỚI: BẢNG SO SÁNH NHANH */}
      <section className="quick-compare-section">
        <div className="section-header">
          <h2>So sánh nhanh các trường đã chọn</h2>
          <Maximize2 size={18} color="#94a3b8" cursor="pointer" />
        </div>
        <div className="compare-table-container">
          <table className="compare-mini-table">
            <thead>
              <tr>
                <th>TIÊU CHÍ</th>
                <th>ĐẠI HỌC NGOẠI THƯƠNG</th>
                <th>ĐH BÁCH KHOA HÀ NỘI</th>
                <th>ĐH KINH TẾ QUỐC DÂN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Điểm chuẩn '25</td>
                <td><strong>28.25 (D01)</strong></td>
                <td><strong>27.50 (A00)</strong></td>
                <td><strong>27.80 (A01)</strong></td>
              </tr>
              <tr>
                <td>Học phí</td>
                <td>~25 - 45 tr/năm</td>
                <td>~22 - 28 tr/năm</td>
                <td>~16 - 22 tr/năm</td>
              </tr>
              <tr>
                <td>Hỗ trợ AI</td>
                <td><span className="badge-blue">KHUYÊN DÙNG</span></td>
                <td><span className="badge-gray">THỬ THÁCH</span></td>
                <td><span className="badge-green">AN TOÀN</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Favorites;