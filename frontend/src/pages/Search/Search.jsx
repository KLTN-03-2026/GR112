import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Dùng Link để chuyển trang mượt mà
import './Search.css';

const Search = ({ mockUniversities }) => {
  const [filters, setFilters] = useState({
    blocks: [],
    score: 24.5,
    region: 'Miền Bắc',
    majors: ['CNTT & Phần mềm', 'Ngôn ngữ Anh'],
    tuition: '20 - 40 triệu',
    type: 'Đại học Công lập',
    facilities: ['Thư viện']
  });

  const handleToggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const handleClearFilters = () => {
    setFilters({ blocks: [], score: 0, region: '', majors: [], tuition: '', type: '', facilities: [] });
  };

  const activeTags = [
    ...filters.majors.map(m => ({ field: 'majors', val: m })),
    ...filters.blocks.map(b => ({ field: 'blocks', val: b.split(' ')[1] || b })),
    ...(filters.region ? [{ field: 'region', val: filters.region }] : []),
    ...(filters.tuition ? [{ field: 'tuition', val: filters.tuition }] : []),
    ...(filters.type ? [{ field: 'type', val: filters.type.replace('Đại học ', '') }] : []),
    ...filters.facilities.map(f => ({ field: 'facilities', val: f }))
  ];

  const removeTag = (tag) => {
    if (Array.isArray(filters[tag.field])) {
      handleToggleArrayFilter(tag.field, tag.val === 'Công lập' ? 'Đại học Công lập' : (tag.field === 'blocks' ? filters.blocks.find(b => b.includes(tag.val)) : tag.val));
    } else {
      setFilters(prev => ({ ...prev, [tag.field]: '' }));
    }
  };

  return (
    <div className="sp-container fade-in">
      {/* SIDEBAR BỘ LỌC */}
      <aside className="sp-sidebar">
        <div className="sp-sidebar-header">
          <h2>Khám phá</h2>
          <p>ĐỊNH HÌNH TƯƠNG LAI</p>
        </div>

        {/* 1. Khối thi */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-cube"></i> Khối thi</div>
          {['Khối A00 (Toán, Lý, Hóa)', 'Khối D01 (Toán, Văn, Anh)'].map(block => (
            <button key={block} className={`sp-block-btn ${filters.blocks.includes(block) ? 'active' : ''}`} onClick={() => handleToggleArrayFilter('blocks', block)}>
              {block}
            </button>
          ))}
          <button className="sp-add-link">+ Thêm Khối thi</button>
        </div>

        {/* 2. Khoảng điểm */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-chart-line"></i> Khoảng điểm</div>
          <div className="sp-range-box">
            <div className="sp-range-header">
              <span>ĐIỂM THPTQG</span>
              <span>{filters.score} - 28.5</span>
            </div>
            <input type="range" min="15" max="30" step="0.5" value={filters.score} onChange={(e) => setFilters({...filters, score: e.target.value})} className="sp-range-slider" />
          </div>
        </div>

        {/* 3. Vùng miền */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-map"></i> Vùng miền</div>
          <div className="sp-region-pills">
            {['Miền Bắc', 'Miền Trung', 'Miền Nam'].map(reg => (
              <button key={reg} className={`sp-region-pill ${filters.region === reg ? 'active' : ''}`} onClick={() => setFilters({...filters, region: reg})}>{reg}</button>
            ))}
          </div>
        </div>

        {/* 4. Ngành học */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-graduation-cap"></i> Ngành học</div>
          {['CNTT & Phần mềm', 'Kinh tế & Marketing', 'Ngôn ngữ Anh', 'Thiết kế đồ họa', 'Y Dược'].map(major => (
            <label key={major} className="sp-check-item">
              <input type="checkbox" checked={filters.majors.includes(major)} onChange={() => handleToggleArrayFilter('majors', major)} /> 
              <span>{major}</span>
            </label>
          ))}
        </div>

        {/* 5. Mức học phí */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-money-bill-wave"></i> Mức học phí (năm)</div>
          {['Dưới 20 triệu', '20 - 40 triệu', 'Trên 40 triệu'].map(fee => (
            <label key={fee} className="sp-check-item">
              <input type="radio" name="tuition" checked={filters.tuition === fee} onChange={() => setFilters({...filters, tuition: fee})} /> 
              <span>{fee}</span>
            </label>
          ))}
        </div>

        {/* 6. Loại hình trường */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-university"></i> Loại hình trường</div>
          <select className="sp-select" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">Tất cả</option>
            <option value="Đại học Công lập">Đại học Công lập</option>
            <option value="Đại học Dân lập">Đại học Dân lập</option>
            <option value="Đại học Quốc tế">Đại học Quốc tế</option>
          </select>
        </div>

        <button className="sp-clear-btn" onClick={handleClearFilters}>XÓA TẤT CẢ BỘ LỌC</button>
      </aside>

      {/* CỘT NỘI DUNG CHÍNH */}
      <main className="sp-main">
        <div className="sp-main-header">
          <div>
            <p className="sp-subtitle">KẾT QUẢ CHỌN LỌC</p>
            <h1>Tìm thấy {mockUniversities.length} trường</h1>
          </div>
          <button className="sp-sort-btn"><i className="fas fa-sort-amount-down"></i> Độ phù hợp</button>
        </div>

        {/* Active Filters */}
        {activeTags.length > 0 && (
          <div className="sp-active-filters">
            <span className="label">ĐANG LỌC:</span>
            {activeTags.map((tag, idx) => (
              <span key={idx} className="sp-active-tag">
                {tag.val} <i className="fas fa-times" onClick={() => removeTag(tag)}></i>
              </span>
            ))}
          </div>
        )}

        <div className="sp-grid">
          {mockUniversities.map((uni) => (
            <div key={uni.id} className="sp-card">
              <div className="sp-card-img">
                <div className="sp-ai-badge"><i className="fas fa-bolt"></i> {uni.match}% AI PHÙ HỢP</div>
                <img src={uni.img} alt={uni.name} />
              </div>
              <div className="sp-card-body">
                <h3>{uni.name}</h3>
                <p className="sp-loc">{uni.loc}</p>
                
                <div className="sp-stats-grid">
                  <div className="sp-stat-box">
                    <span className="stat-label">TỈ LỆ CHỌI</span>
                    <span className="stat-value">{uni.ratio}</span>
                  </div>
                  <div className="sp-stat-box">
                    <span className="stat-label">HỌC PHÍ DỰ KIẾN</span>
                    <span className="stat-value">{uni.tuition}</span>
                  </div>
                </div>

                <div className="sp-card-footer">
                  <div className="sp-tags">
                    {uni.tags.map(tag => <span key={tag} className="sp-tag">{tag}</span>)}
                  </div>
                  {/* SỬA TẠI ĐÂY: Dùng Link trỏ tới /detail/:id */}
                  <Link to={`/detail/${uni.id}`} className="sp-link" style={{ textDecoration: 'none' }}>
                    Xem thông tin &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* AI SUGGESTION CARD */}
          <div className="sp-ai-card">
            <div className="sp-ai-icon"><i className="fas fa-magic"></i></div>
            <h3>Bạn cần danh sách riêng biệt?</h3>
            <p>AI phân tích điểm số và sở thích để tìm ra ngôi trường phù hợp nhất với bạn.</p>
            <Link to="/chatbot" className="sp-ai-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
              Bắt đầu Phân tích AI
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;