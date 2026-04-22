import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Search.css';

const Search = () => {
  // 1. State lưu danh sách trường lấy từ Backend
  const [allUniversities, setAllUniversities] = useState([]);
  const [displayUnis, setDisplayUnis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = 1; // Giả lập User 1 đang đăng nhập
  
  // 2. State bộ lọc (Giá trị mặc định)
  const [filters, setFilters] = useState({
    blocks: [],
    score: 30, // Mặc định để max điểm
    region: '', 
    majors: [],
    tuition: '',
    type: '',
    facilities: []
  });

  // --- STATE QUẢN LÝ YÊU THÍCH VÀ THÔNG BÁO ---
  const [favList, setFavList] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // GỌI API LẤY DANH SÁCH TIM TỪ MYSQL KHI VỪA VÀO TRANG
  useEffect(() => {
    const fetchSavedFavs = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/favorites/${currentUserId}`);
        // Chỉ cần lấy ID của các trường đã tim để làm sáng nút trái tim
        setFavList(res.data.map(s => s.id));
      } catch (e) {
        console.error("Lỗi lấy danh sách tim từ Database:", e);
      }
    };
    fetchSavedFavs();
  }, []);

  // HÀM BẤM TIM -> LƯU/XÓA TRỰC TIẾP XUỐNG MYSQL
  const handleToggleFavorite = async (e, school) => {
    e.preventDefault(); // Ngăn việc click nhầm chuyển trang
    try {
      const response = await axios.post('http://localhost:8000/api/favorites/toggle', {
        user_id: currentUserId,
        university_id: school.id
      });
      
      // Kiểm tra trạng thái Backend trả về
      if (response.data.status === 'added') {
        setFavList([...favList, school.id]); // Thêm ID vào danh sách sáng màu
        setToastMsg('Lưu trường yêu thích thành công! ❤️');
      } else {
        setFavList(favList.filter(id => id !== school.id)); // Bỏ ID ra khỏi danh sách
        setToastMsg('Đã bỏ lưu trường khỏi danh sách!');
      }

      // Tự tắt thông báo sau 3s
      setTimeout(() => {
        setToastMsg('');
      }, 3000);

    } catch (error) {
      console.error("Lỗi thả tim Database:", error);
      alert("Lỗi kết nối Server! Vui lòng thử lại.");
    }
  };

  // 3. GỌI API LẤY TOÀN BỘ DỮ LIỆU TRƯỜNG
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/api/universities');
        setAllUniversities(response.data);
        setDisplayUnis(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trường đại học:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Hàm tự động phân loại Vùng Miền
  const getRegionFromProvince = (uni) => {
    if (!uni.ranking_note) return 'Miền Bắc';
    const note = uni.ranking_note.toLowerCase();
    
    if (note.includes('hà nội') || note.includes('hải phòng') || note.includes('quảng ninh') || 
        note.includes('tuyên quang') || note.includes('lào cai') || note.includes('thái nguyên') || 
        note.includes('phú thọ') || note.includes('bắc ninh') || note.includes('hưng yên') || 
        note.includes('ninh bình') || note.includes('cao bằng') || note.includes('lạng sơn') || 
        note.includes('lai châu') || note.includes('điện biên') || note.includes('sơn la') || 
        note.includes('hải dương') || note.includes('thái bình') || note.includes('nam định')) {
      return 'Miền Bắc';
    }
    if (note.includes('đà nẵng') || note.includes('huế') || note.includes('nghệ an') || 
        note.includes('thanh hóa') || note.includes('hà tĩnh') || note.includes('quảng bình') || 
        note.includes('quảng trị') || note.includes('quảng nam') || note.includes('quảng ngãi') || 
        note.includes('bình định') || note.includes('quy nhơn') || note.includes('phú yên') || 
        note.includes('khánh hòa') || note.includes('nha trang') || note.includes('gia lai') || 
        note.includes('đắk lắk') || note.includes('lâm đồng') || note.includes('đà lạt')) {
      return 'Miền Trung';
    }
    if (note.includes('hồ chí minh') || note.includes('cần thơ') || note.includes('đồng nai') || 
        note.includes('tây ninh') || note.includes('đồng tháp') || note.includes('vĩnh long') || 
        note.includes('cà mau') || note.includes('an giang') || note.includes('bình dương') || 
        note.includes('bà rịa') || note.includes('vũng tàu') || note.includes('tiền giang') || 
        note.includes('trà vinh') || note.includes('kiên giang') || note.includes('bạc liêu') || 
        note.includes('long an')) {
      return 'Miền Nam';
    }
    return 'Miền Bắc'; 
  };

  // 4. XỬ LÝ LỌC TRỰC TIẾP TRÊN FRONTEND
  useEffect(() => {
    let filtered = [...allUniversities];

    if (filters.blocks.length > 0) {
      filtered = filtered.filter(uni => filters.blocks.includes(uni.subject_block));
    }

    if (filters.region) {
      filtered = filtered.filter(uni => getRegionFromProvince(uni) === filters.region);
    }

    if (filters.majors.length > 0) {
      filtered = filtered.filter(uni => {
        const uniMajor = (uni.major_name || "").toLowerCase();
        return filters.majors.some(m => uniMajor.includes(m.toLowerCase()));
      });
    }

    if (filters.score < 30) {
      filtered = filtered.filter(uni => {
        const uniScore = parseFloat(uni.score_thpt_last_year) || parseFloat(uni.base_score) || 0;
        return uniScore <= filters.score;
      });
    }

    if (filters.type) {
      filtered = filtered.filter(uni => uni.school_type === filters.type);
    }

    filtered.sort((a, b) => parseFloat(b.score_thpt_last_year || 0) - parseFloat(a.score_thpt_last_year || 0));
    setDisplayUnis(filtered);
  }, [filters, allUniversities]);

  const handleToggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const handleClearFilters = () => {
    setFilters({ blocks: [], score: 30, region: '', majors: [], tuition: '', type: '', facilities: [] });
  };

  const activeTags = [
    ...filters.majors.map(m => ({ field: 'majors', val: m })),
    ...filters.blocks.map(b => ({ field: 'blocks', val: b })), 
    ...(filters.region ? [{ field: 'region', val: filters.region }] : []),
    ...(filters.tuition ? [{ field: 'tuition', val: filters.tuition }] : []),
    ...(filters.type ? [{ field: 'type', val: filters.type.replace('Đại học ', '') }] : [])
  ];

  const removeTag = (tag) => {
    if (Array.isArray(filters[tag.field])) {
      handleToggleArrayFilter(tag.field, tag.val);
    } else {
      setFilters(prev => ({ ...prev, [tag.field]: '' }));
    }
  };

  const blockOptions = [
    { id: 'A00', label: 'A00 (Toán, Vật lý, Hóa học)' },
    { id: 'A01', label: 'A01 (Toán, Vật lý, Tiếng Anh)' },
    { id: 'B00', label: 'B00 (Toán, Hóa học, Sinh học)' },
    { id: 'C00', label: 'C00 (Ngữ văn, Lịch sử, Địa lý)' },
    { id: 'D01', label: 'D01 (Ngữ văn, Toán, Tiếng Anh)' },
    { id: 'D07', label: 'D07 (Toán, Hóa học, Tiếng Anh)' },
    { id: 'V00', label: 'V00 (Toán, Vật lý, Vẽ Hình họa)' },
    { id: 'H00', label: 'H00 (Ngữ văn, Năng khiếu)' }
  ];

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
          <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blockOptions.map(block => (
              <label key={block.id} className="sp-check-item" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                <input 
                  type="checkbox" 
                  checked={filters.blocks.includes(block.id)} 
                  onChange={() => handleToggleArrayFilter('blocks', block.id)} 
                /> 
                <span>{block.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Khoảng điểm */}
        <div className="sp-filter-group" style={{ marginTop: '15px' }}>
          <div className="sp-filter-title"><i className="fas fa-chart-line"></i> Điểm thi của bạn</div>
          <div className="sp-range-box">
            <div className="sp-range-header">
              <span>TỐI ĐA</span>
              <span style={{color: '#10b981', fontWeight: 'bold'}}>{filters.score} điểm</span>
            </div>
            <input 
              type="range" min="15" max="30" step="0.25" 
              value={filters.score} 
              onChange={(e) => setFilters({...filters, score: parseFloat(e.target.value)})} 
              className="sp-range-slider" 
            />
            <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '5px'}}>Tìm trường có điểm chuẩn &le; {filters.score}</p>
          </div>
        </div>

        {/* 3. Vùng miền */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-map"></i> Vùng miền</div>
          <div className="sp-region-pills">
            {['Miền Bắc', 'Miền Trung', 'Miền Nam'].map(reg => (
              <button 
                key={reg} 
                className={`sp-region-pill ${filters.region === reg ? 'active' : ''}`} 
                onClick={() => setFilters({...filters, region: filters.region === reg ? '' : reg})}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Ngành học */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-graduation-cap"></i> Nhóm Ngành học</div>
          {[
            'Khoa học Máy tính', 'Quản trị Kinh doanh', 'Marketing', 
            'Ngôn ngữ Anh', 'Truyền thông', 'Y khoa', 'Thiết kế', 'Sư phạm'
          ].map(major => (
            <label key={major} className="sp-check-item">
              <input type="checkbox" checked={filters.majors.includes(major)} onChange={() => handleToggleArrayFilter('majors', major)} /> 
              <span>{major}</span>
            </label>
          ))}
        </div>

        {/* 5. Loại hình trường */}
        <div className="sp-filter-group">
          <div className="sp-filter-title"><i className="fas fa-university"></i> Loại hình trường</div>
          <select className="sp-select" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">Tất cả các trường</option>
            <option value="Đại học Công lập">Đại học Công lập</option>
            <option value="Đại học Tư thục">Đại học Tư thục</option>
            <option value="Đại học Quốc tế">Đại học Quốc tế</option>
          </select>
        </div>

        <button className="sp-clear-btn" onClick={handleClearFilters}>XÓA TẤT CẢ BỘ LỌC</button>
      </aside>

      {/* CỘT NỘI DUNG CHÍNH */}
      <main className="sp-main">
        <div className="sp-main-header">
          <div>
            <p className="sp-subtitle">KẾT QUẢ TỪ HỆ THỐNG</p>
            <h1>Tìm thấy {displayUnis.length} chương trình học</h1>
          </div>
          <button className="sp-sort-btn"><i className="fas fa-sort-amount-down"></i> Điểm chuẩn giảm dần</button>
        </div>

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
          {isLoading ? (
             <div style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
               <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
               <h3>Đang tìm kiếm dữ liệu...</h3>
             </div>
          ) : displayUnis.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b', background: '#f8fafc', borderRadius: '16px' }}>
              <i className="fas fa-search-minus" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
              <h3>Không tìm thấy trường nào phù hợp</h3>
              <p>Hãy thử tăng mức điểm chuẩn hoặc xóa bớt các bộ lọc nhé!</p>
            </div>
          ) : (
            displayUnis.map((uni, index) => {
              const fallbackImage = `https://images.unsplash.com/photo-${1523050854058 + index % 10}-8df90110c9f1?w=400&q=80`;
              const displayLocation = uni.ranking_note ? uni.ranking_note.split(' - ')[1] : 'Đang cập nhật';
              const displayMajor = uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành');

              return (
                <div key={uni.id} className="sp-card">
                  {/* ---- NÚT THẢ TIM TUYỆT ĐỐI GỌI API MYSQL ---- */}
                  <button 
                    className={`sp-fav-btn ${favList.includes(uni.id) ? 'active' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, uni)}
                  >
                    <i className="fas fa-heart"></i>
                  </button>

                  <div className="sp-card-img">
                    <div className="sp-ai-badge" style={{background: uni.school_type === 'Đại học Quốc tế' ? '#8b5cf6' : '#10b981'}}>
                      <i className="fas fa-star"></i> {uni.school_type || 'Đại học'}
                    </div>
                    <img src={uni.school_logo || fallbackImage} alt={uni.school_name} />
                  </div>
                  
                  <div className="sp-card-body">
                    <h3 title={uni.school_name} style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {uni.school_name}
                    </h3>
                    <p className="sp-loc"><i className="fas fa-map-marker-alt"></i> {displayLocation}</p>
                    
                    <div className="sp-stats-grid">
                      <div className="sp-stat-box">
                        <span className="stat-label">ĐIỂM CHUẨN THPT</span>
                        <span className="stat-value" style={{ color: '#ef4444' }}>{uni.score_thpt_last_year || 'N/A'}</span>
                      </div>
                      <div className="sp-stat-box">
                        <span className="stat-label">HỌC PHÍ / NĂM</span>
                        <span className="stat-value" style={{ color: '#0b132b', fontSize: '0.85rem' }}>{uni.tuition_fee || 'Đang cập nhật'}</span>
                      </div>
                    </div>

                    <div className="sp-card-footer">
                      <div className="sp-tags" style={{ maxWidth: '60%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        <span className="sp-tag" style={{ background: '#d1fae5', color: '#065f46' }}>{uni.subject_block}</span>
                        <span className="sp-tag" style={{ background: '#f1f5f9', color: '#475569' }}>{displayMajor}</span>
                      </div>
                      <Link to={`/detail/${uni.id}`} className="sp-link" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Chi tiết &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* AI SUGGESTION CARD */}
          {!isLoading && displayUnis.length > 0 && (
            <div className="sp-ai-card" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <div className="sp-ai-icon"><i className="fas fa-magic"></i></div>
              <h3>Bạn phân vân chưa biết chọn trường?</h3>
              <p>Trợ lý AI của chúng tôi sẽ phân tích tính cách và điểm số để gợi ý lộ trình tốt nhất.</p>
              <Link to="/orientation" className="sp-ai-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                Định hướng chuyên sâu ngay
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* ---- TOAST THÔNG BÁO GÓC PHẢI ---- */}
      {toastMsg && (
        <div className="sp-toast-notification">
          <i className="fas fa-check-circle"></i> {toastMsg}
        </div>
      )}

    </div>
  );
};

export default Search;