import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// --- COMPONENT THẺ TRƯỜNG HỌC ---
const UniCard = ({ uni, index, isScroll = false }) => {
  const b = [
    { type: 'HOT', color: '#10b981', bg: '#f0fdf4', c: '#065f46' },
    { type: 'TOP TIER', color: '#f59e0b', bg: '#fff7ed', c: '#9a3412' },
    { type: 'MỚI NỔI', color: '#ef4444', bg: '#fef2f2', c: '#991b1b' }
  ][index % 3];

  // ĐÃ SỬA: Lấy đúng điểm học bạ từ cột base_score, KHÔNG CỘNG 1.5 NỮA
  const hocBaScore = uni.base_score ? parseFloat(uni.base_score).toFixed(2) : 'Đang cập nhật';
  
  // ĐÃ SỬA: Lấy đúng điểm THPT từ cột score_thpt_last_year
  const thptScore = uni.score_thpt_last_year ? parseFloat(uni.score_thpt_last_year).toFixed(2) : 'Đang cập nhật';

  const displayMajor = uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành');
  
  const locationName = uni.region || (uni.ranking_note && uni.ranking_note.includes(' - ') ? uni.ranking_note.split(' - ')[1] : 'Đang cập nhật');

  const hasDirect = uni.direct_admission && uni.direct_admission.toLowerCase() !== 'không xét' ? 'Có xét' : 'Không xét';
  const hasAptitude = uni.aptitude_test && uni.aptitude_test.toLowerCase() !== 'không yêu cầu' ? 'Có xét' : 'Không yêu cầu';

  const fallbackImage = `https://images.unsplash.com/photo-${1523050854058 + index}-8df90110c9f1?w=400&q=80`;

  return (
    <Link 
      to={`/detail/${uni.id}`} 
      className="uni-suggest-card" 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'white',
        minWidth: isScroll ? '320px' : 'auto', 
        scrollSnapAlign: isScroll ? 'start' : 'none',
        flexShrink: isScroll ? 0 : 1,
        transition: 'transform 0.3s ease'
      }}
    >
      <div className="uni-suggest-img" style={{ height: '160px', position: 'relative' }}>
        <span style={{ 
            position: 'absolute', top: '10px', left: '10px', zIndex: 2,
            background: b.color, color: 'white', padding: '4px 12px',
            borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
        }}>{b.type}</span>
        <img src={uni.school_logo || fallbackImage} alt={uni.school_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      
      <div className="uni-suggest-info" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '5px', lineHeight: '1.4', height: '2.8rem', overflow: 'hidden' }}>{uni.school_name}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div style={{flex: 1, paddingRight: '10px'}}>
            <p style={{ fontWeight: 'bold', color: '#10b981', fontSize: '0.85rem', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={displayMajor}>
              {displayMajor}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <i className="fas fa-map-marker-alt"></i> Khu vực: {locationName}
            </p>
          </div>
          
          {uni.subject_block && (
            <span style={{ background: '#e2e8f0', color: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
              Khối {uni.subject_block}
            </span>
          )}
        </div>
        
        <div className="uni-prob" style={{background: b.bg, padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px'}}>
          <span style={{color: b.c, fontWeight: 'bold', fontSize: '0.9rem'}}>
            ĐIỂM CHUẨN THPT: {thptScore}
          </span>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
          <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569' }}><i className="fas fa-book" style={{width: '20px'}}></i> Học bạ:</span>
            <strong style={{ color: '#0b132b' }}>{hocBaScore}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569' }}><i className="fas fa-brain" style={{width: '20px'}}></i> Thi ĐGNL:</span>
            <strong style={{ color: '#0b132b' }}>{uni.score_dgnl || 'Không xét'}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569' }}><i className="fas fa-globe" style={{width: '20px'}}></i> Chứng chỉ:</span>
            <strong style={{ color: '#f59e0b' }}>{uni.combo_cert || 'Không Y/C'}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
            <span style={{ color: '#475569' }}><i className="fas fa-medal" style={{width: '20px'}}></i> Tuyển thẳng:</span>
            <strong style={{ color: '#0b132b' }}>{hasDirect}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#475569' }}><i className="fas fa-palette" style={{width: '20px'}}></i> Năng khiếu:</span>
            <strong style={{ color: '#0b132b' }}>{hasAptitude}</strong>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '15px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>HP: {uni.tuition_fee || 'Cập nhật...'}</span>
          <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
            {uni.school_type || 'Công lập'}
          </span>
        </div>
      </div>
    </Link>
  );
};


// --- MAIN HOME COMPONENT ---
const Home = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needUpdate, setNeedUpdate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Kiểm tra User thiếu thông tin
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        const user = JSON.parse(savedUser);
        if (!user.className || !user.schoolName) {
          setNeedUpdate(true);
        }
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }

    // 2. Fetch data thật từ Backend Database
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/universities');
        const data = await response.json();
        
        if (response.ok) {
          setUniversities(data); 
        } else {
          console.error("Lỗi lấy dữ liệu trường:", data.error);
        }
      } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []); 

  const getRegionFromProvince = (uni) => {
    if (uni.region) {
      const loc = uni.region.toLowerCase();
      if (loc.includes('hà nội') || loc.includes('hải phòng') || loc.includes('quảng ninh') || loc.includes('thái bình') || loc.includes('nam định')) return 'Miền Bắc';
      if (loc.includes('đà nẵng') || loc.includes('huế') || loc.includes('nghệ an') || loc.includes('khánh hòa') || loc.includes('đà lạt')) return 'Miền Trung';
      if (loc.includes('hồ chí minh') || loc.includes('cần thơ') || loc.includes('đồng nai') || loc.includes('bình dương') || loc.includes('long an')) return 'Miền Nam';
    }

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

  const getTopUniqueUnis = () => {
    const uniqueSchools = [];
    const schoolNames = new Set();
    
    // ĐÃ SỬA: Ưu tiên xếp hạng theo điểm THPT, nếu không có thì lấy điểm học bạ
    const sorted = [...universities].sort((a, b) => 
      parseFloat(b.score_thpt_last_year || b.base_score || 0) - parseFloat(a.score_thpt_last_year || a.base_score || 0)
    );

    for (const uni of sorted) {
      if (!schoolNames.has(uni.school_name)) {
        schoolNames.add(uni.school_name);
        uniqueSchools.push(uni);
      }
    }
    return uniqueSchools;
  };

  return (
    <div className="home-page fade-in">
      
      {needUpdate && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '12px 24px',
          borderRadius: '8px', margin: '20px auto 0 auto', maxWidth: '1024px',
          boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)', color: '#c2410c',
          animation: 'fadeInDown 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '22px', color: '#ea580c' }}></i>
            <span>
              <strong>Chú ý:</strong> Hồ sơ học thuật của bạn chưa hoàn thiện. Vui lòng bổ sung để hệ thống gợi ý chính xác nhất!
            </span>
          </div>
          
          <button 
            onClick={() => window.location.href = '/profile'} 
            style={{
              backgroundColor: '#ea580c', color: 'white', padding: '10px 24px', borderRadius: '6px',
              border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(234,88,12,0.3)',
              position: 'relative', zIndex: 9999
            }}
          >
            Cập nhật ngay <i className="fas fa-arrow-right" style={{marginLeft: '5px'}}></i>
          </button>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="hm-hero">
        <div className="hm-hero-content">
          <span className="hm-badge"><i className="fas fa-compass"></i> ĐỊNH HƯỚNG TƯƠNG LAI CỦA BẠN</span>
          <h1 className="hm-title">Bản đồ Chính xác cho Vận mệnh Học thuật.</h1>
          <p className="hm-subtitle">Vượt xa những lời khuyên chung chung. Hệ thống AI của chúng tôi phân tích hồ sơ tài năng và xu hướng thị trường để kết nối bạn với những trường đại học phù hợp với tiềm năng thực sự của bạn.</p>
          <div className="hm-hero-btns" style={{ flexWrap: 'wrap' }}>
            <Link to="/quiz" className="hm-btn-primary" style={{ textDecoration: 'none' }}>
              Làm trắc nghiệm hướng nghiệp &rarr;
            </Link>
            <Link to="/search" className="hm-btn-outline" style={{ textDecoration: 'none' }}>
              Tìm trường ngay
            </Link>
            <Link to="/orientation" className="hm-btn-outline" style={{ textDecoration: 'none', borderColor: '#4f46e5', color: '#4f46e5', backgroundColor: '#e0e7ff' }}>
              Tư vấn & Định hướng <i className="fas fa-map-signs" style={{marginLeft: '5px'}}></i>
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
          
          <Link to="/roi-calculator" className="hm-feat-card purple span-1" style={{ textDecoration: 'none', color: 'white', display: 'block' }}>
            <div className="hm-feat-icon white"><i className="fas fa-chart-line"></i></div>
            <h3>Dự đoán ROI</h3>
            <p>Tính toán thu nhập dự kiến sau 10 năm tốt nghiệp dựa trên xu thế kinh tế và sự phát triển thị trường đại học và doanh nghiệp liên quan.</p>
          </Link>
          
          <Link to="/mentors" className="hm-feat-card light span-1" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3>Cố vấn Tinh hoa</h3>
            <p>Kết nối với các chuyên gia giáo dục hàng đầu, những người được lựa chọn cẩn thận để phù hợp với mục tiêu nghề nghiệp của bạn.</p>
          </Link>
          
          <Link to="/booking" className="hm-feat-card light span-1 hm-avatar-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="hm-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 1" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User 2" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 3" />
            </div>
            <h3>Đặt lịch Tư vấn Trực tiếp</h3>
            <p>Trao đổi 1-1 với đội ngũ chuyên gia về định hướng trọn đời.</p>
          </Link>

          <Link to="/orientation" className="hm-feat-card span-3" style={{ 
            textDecoration: 'none', 
            gridColumn: '1 / -1', 
            background: '#f4f7ff', 
            border: '2px dashed #a5b4fc', 
            borderRadius: '24px',
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '50px 60px',
            marginTop: '15px',
            boxShadow: '0 10px 30px rgba(67, 56, 202, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{ flex: 1, paddingRight: '40px' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#4338ca', margin: '0 0 15px 0', lineHeight: '1.3' }}>
                Tư vấn & Định hướng<br/>Chuyên sâu
              </h3>
              <p style={{ color: '#64748b', fontSize: '1.15rem', lineHeight: '1.7', margin: 0, maxWidth: '600px' }}>
                Chưa biết bắt đầu từ đâu? Đăng ký ngay để nhận lộ trình học tập và nghề nghiệp được cá nhân hóa hoàn toàn dành riêng cho bạn.
              </p>
            </div>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              background: '#7c3aed', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '3rem', 
              flexShrink: 0, 
              boxShadow: '0 15px 35px rgba(124, 58, 237, 0.3)' 
            }}>
              <i className="fas fa-map-marked-alt"></i>
            </div>
          </Link>
        </div>
      </section>

      {/* --- UNIVERSITIES SECTION --- */}
      <section className="hm-universities">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <p>Đang tải dữ liệu trường học...</p>
          </div>
        ) : (
          <>
            {/* CÁC TRƯỜNG ĐẠI HỌC TIÊU BIỂU */}
            <div className="hm-uni-header">
              <div>
                <h2>Các trường đại học tiêu biểu</h2>
                <p>Danh sách các ngôi trường có chỉ số phù hợp cao nhất dành cho bạn.</p>
              </div>
              <Link to="/search" className="hm-btn-outline-small" style={{ textDecoration: 'none' }}>Xem tất cả</Link>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '25px', 
              marginBottom: '60px',
              overflowX: 'auto',
              paddingBottom: '20px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}>
              {getTopUniqueUnis().map((uni, index) => (
                <UniCard key={`top-${uni.id}`} uni={uni} index={index} isScroll={true} />
              ))}
            </div>

            {/* KHÁM PHÁ THEO VÙNG MIỀN */}
            {['Miền Bắc', 'Miền Trung', 'Miền Nam'].map((region) => {
              const regionUnis = universities.filter(u => getRegionFromProvince(u) === region);
              
              const displayRegionUnis = regionUnis; 
              
              if (displayRegionUnis.length === 0) return null;

              return (
                <div key={region} style={{ marginBottom: '50px' }}>
                  <div className="hm-uni-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', color: '#1e293b' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: '#4f46e5', marginRight: '10px' }}></i>
                      Đại học tại {region}
                    </h3>
                  </div>
                  
                  <div className="hm-uni-scroll-container" style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    overflowX: 'auto', 
                    paddingBottom: '20px',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                  }}>
                    {displayRegionUnis.map((uni, index) => (
                      <UniCard key={`${region}-${uni.id}`} uni={uni} index={index} isScroll={true} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
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