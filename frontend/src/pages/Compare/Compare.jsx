import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Star, Sparkles, MapPin, Search, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import './Compare.css';

export default function Compare() {
  const [schools, setSchools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUniversities, setAllUniversities] = useState([]); 

  const [tempSelectedSchools, setTempSelectedSchools] = useState([]);

  useEffect(() => {
    // Gọi API lấy TẤT CẢ dữ liệu trường 1 lần duy nhất
    const fetchAllUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/universities');
        const dbData = response.data;
        setAllUniversities(dbData);

        // Lấy danh sách ID các trường đã thả tim
        const savedFavs = JSON.parse(localStorage.getItem('favSchools')) || [];
        const favIds = savedFavs.map(s => s.id);

        // Lọc ra các trường có trong yêu thích (Tối đa 3 trường)
        const initialSchools = dbData
          .filter(uni => favIds.includes(uni.id))
          .slice(0, 3)
          .map(uni => formatSchoolData(uni)); // Map đúng chuẩn hiển thị

        setSchools(initialSchools);

      } catch (error) {
        console.error("Lỗi lấy danh sách trường:", error);
      }
    };
    fetchAllUniversities();
  }, []);

  // Hàm Format dữ liệu chuẩn để bảng Compare không bao giờ bị lỗi 'undefined'
  const formatSchoolData = (uni) => {
    return {
      id: uni.id,
      name: uni.school_name || uni.name,
      logo: uni.school_logo || `https://images.unsplash.com/photo-${1523050854058 + uni.id}-8df90110c9f1?w=100&q=80`,
      location: uni.ranking_note ? uni.ranking_note.split(' - ')[1] : 'Đang cập nhật',
      score: uni.score_thpt_last_year || uni.base_score || 'N/A',
      tuition: uni.tuition_fee || 'Đang cập nhật',
      major: uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành'),
      block: uni.subject_block || 'N/A',
      dgnl: parseInt(uni.score_dgnl) > 0 ? uni.score_dgnl : 'Không xét',
      cert: uni.combo_cert || 'Không yêu cầu',
      direct: uni.direct_admission || 'Không xét',
      aptitude: uni.aptitude_test || 'Không yêu cầu',
      rate: "4.8"
    };
  };

  const removeSchool = (id) => {
    const newSchools = schools.filter(school => school.id !== id);
    setSchools(newSchools);
  };

  const openModal = () => {
    setTempSelectedSchools([...schools]);
    setShowModal(true);
    setSearchTerm('');
  };

  const toggleSchoolSelection = (uni) => {
    const isAlreadySelected = tempSelectedSchools.some(s => s.id === uni.id);

    if (isAlreadySelected) {
      setTempSelectedSchools(tempSelectedSchools.filter(s => s.id !== uni.id));
    } else {
      if (tempSelectedSchools.length >= 3) {
        alert("Vượt mức cho phép! Bạn chỉ có thể so sánh tối đa 3 trường.");
        return;
      }
      setTempSelectedSchools([...tempSelectedSchools, formatSchoolData(uni)]);
    }
  };

  const handleConfirmCompare = () => {
    if (tempSelectedSchools.length < 2) {
      alert("Vui lòng chọn ít nhất 2 trường để so sánh!");
      return;
    }
    setSchools(tempSelectedSchools);
    setShowModal(false);
  };

  const generateAIText = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "Đang cập nhật...";
    if (numScore >= 26.5) return "Mức độ cạnh tranh cực kỳ cao. Đòi hỏi chiến lược ôn thi nghiêm túc.";
    if (numScore >= 24) return "Cơ hội trúng tuyển tốt nếu bạn giữ phong độ ổn định.";
    return "Mức điểm an toàn. Hãy tự tin với lựa chọn của mình.";
  };

  const filteredSchools = allUniversities.filter(s => {
    const sName = s.school_name || s.name || "";
    return sName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main className="compare-container fade-in">
      <div className="compare-header">
        <div>
          <h1 className="page-title">So sánh Đại học</h1>
          <p className="subtitle">Đối chiếu các tiêu chí quan trọng để đưa ra lựa chọn đúng đắn nhất.</p>
        </div>
        <button className="btn-add-school" onClick={openModal}>
          <Plus size={18} /> Thêm trường đại học
        </button>
      </div>

      {schools.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1', margin: '20px 0' }}>
          <div style={{ width: '70px', height: '70px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Sparkles size={32} color="#64748b" />
          </div>
          <h2 style={{color: '#1e293b', marginBottom: '10px', fontSize: '1.6rem'}}>
            {schools.length === 1 ? "Cần thêm trường để so sánh" : "Chưa đủ dữ liệu so sánh"}
          </h2>
          <p style={{color: '#64748b', marginBottom: '30px', fontSize: '1rem'}}>
            {schools.length === 1 
              ? "Bạn đã chọn 1 trường. Vui lòng chọn thêm ít nhất 1 trường nữa để hệ thống bắt đầu đối chiếu." 
              : "Vui lòng chọn ít nhất 2 trường (tối đa 3 trường) để hệ thống bắt đầu phân tích và đối chiếu."}
          </p>
          <button className="cp-btn-empty" onClick={openModal}>
            <Plus size={20} /> Chọn thêm trường
          </button>
        </div>
      ) : (
        <div className="compare-table-wrapper fade-in">
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
                     <img src={school.logo} alt={school.name} className="school-logo" style={{objectFit: 'contain'}} />
                  </div>
                  <h3>{school.name}</h3>
                  <p className="location"><MapPin size={14} /> {school.location}</p>
                  <span className="tag public">ĐẠI HỌC</span>
                </div>
              </div>
            ))}
            
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col school-col" key={`empty-${idx}`}>
                <div className="empty-slot" onClick={openModal}>
                  <Plus size={32} color="#cbd5e1" />
                  <p>Chọn trường thứ {schools.length + idx + 1}</p>
                </div>
              </div>
            ))}
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
            {schools.map(school => {
              const aiMatch = isNaN(parseFloat(school.score)) ? 85 : Math.min(99, Math.max(60, 100 - (parseFloat(school.score) - 20) * 4));
              return (
                <div className="compare-col" key={`ai-${school.id}`}>
                  <div className="ai-match-card">
                    <div className="match-header">
                       <span>Độ khó Tuyển sinh</span>
                       <h2 style={{color: aiMatch <= 80 ? '#ef4444' : '#f59e0b'}}>{Math.round(aiMatch)}/100</h2>
                    </div>
                    <div className="progress-bar-bg">
                       <div className="progress-bar-fill" style={{width: `${aiMatch}%`, background: aiMatch <= 80 ? '#ef4444' : '#f59e0b'}}></div>
                    </div>
                    <p className="ai-text">"{generateAIText(school.score)}"</p>
                  </div>
                </div>
              )
            })}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-ai-${idx}`}></div>
            ))}
          </div>

          {/* === BỔ SUNG CÁC HÀNG SO SÁNH CHI TIẾT === */}
          <div className="section-title">TUYỂN SINH & NGÀNH HỌC</div>
          
          <div className="compare-row">
            <div className="compare-col label-col">Ngành học đang xét</div>
            {schools.map(school => (
              <div className="compare-col data-col font-semibold" key={`major-${school.id}`} style={{color: '#0f172a'}}>
                {school.major}
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-major-${idx}`}></div>
            ))}
          </div>

          <div className="compare-row" style={{background: '#f8fafc'}}>
            <div className="compare-col label-col">Khối xét tuyển</div>
            {schools.map(school => (
              <div className="compare-col data-col" key={`block-${school.id}`}>
                <span style={{background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', color: '#334155'}}>{school.block}</span>
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-block-${idx}`} style={{background: '#f8fafc'}}></div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-col label-col">Điểm chuẩn THPT</div>
            {schools.map(school => (
              <div className="compare-col data-col" key={`score-${school.id}`}>
                <span style={{color: '#ef4444', fontWeight: '900', fontSize: '1.2rem'}}>{school.score}</span>
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-score-${idx}`}></div>
            ))}
          </div>

          <div className="compare-row" style={{background: '#f8fafc'}}>
            <div className="compare-col label-col">Điểm Đánh giá năng lực</div>
            {schools.map(school => (
              <div className="compare-col data-col font-semibold" key={`dgnl-${school.id}`}>
                {school.dgnl}
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-dgnl-${idx}`} style={{background: '#f8fafc'}}></div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-col label-col">Yêu cầu Chứng chỉ QT</div>
            {schools.map(school => (
              <div className="compare-col data-col" key={`cert-${school.id}`}>
                <span style={{color: school.cert !== 'Không yêu cầu' ? '#059669' : '#64748b', fontWeight: 'bold'}}>
                  {school.cert}
                </span>
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-cert-${idx}`}></div>
            ))}
          </div>

          <div className="compare-row" style={{background: '#f8fafc'}}>
            <div className="compare-col label-col">Ưu tiên / Tuyển thẳng</div>
            {schools.map(school => (
              <div className="compare-col data-col" key={`direct-${school.id}`} style={{fontSize: '0.85rem', lineHeight: '1.4'}}>
                {school.direct}
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-direct-${idx}`} style={{background: '#f8fafc'}}></div>
            ))}
          </div>

          <div className="compare-row">
            <div className="compare-col label-col">Môn Năng khiếu</div>
            {schools.map(school => (
              <div className="compare-col data-col" key={`aptitude-${school.id}`} style={{fontSize: '0.85rem'}}>
                {school.aptitude}
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-aptitude-${idx}`}></div>
            ))}
          </div>

          <div className="section-title">TÀI CHÍNH</div>
          
          <div className="compare-row">
            <div className="compare-col label-col">Học phí dự kiến</div>
            {schools.map(school => (
              <div className="compare-col data-col font-semibold" key={`tuition-${school.id}`} style={{color: '#0b132b'}}>
                {school.tuition}
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-tuition-${idx}`}></div>
            ))}
          </div>

          <div className="section-title">ĐÁNH GIÁ CỘNG ĐỒNG</div>

          <div className="compare-row">
            <div className="compare-col label-col">Xếp hạng sinh viên</div>
            {schools.map(school => (
              <div className="compare-col data-col rating-col" key={`rating-${school.id}`}>
                 <span className="rating-score">4.8 <Star size={16} fill="#f59e0b" color="#f59e0b"/></span>
                 <span className="rating-count">(Hơn 1000 đánh giá)</span>
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-rating-${idx}`}></div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="compare-row action-row">
             <div className="compare-col label-col"></div>
             {schools.map(school => (
              <div className="compare-col action-col" key={`action-${school.id}`} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                 <Link to="/orientation" style={{textDecoration: 'none'}}>
                   <button className="btn-consult">Tư vấn Lộ trình ngay</button>
                 </Link>
                 <Link to={`/detail/${school.id}`} style={{textDecoration: 'none'}}>
                   <button className="btn-detail">Xem chi tiết trường</button>
                 </Link>
              </div>
            ))}
            {Array.from({ length: 3 - schools.length }).map((_, idx) => (
              <div className="compare-col" key={`empty-action-${idx}`}></div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP CHỌN NHIỀU TRƯỜNG */}
      {showModal && (
        <div className="cp-modal-overlay">
          <div className="cp-modal-content fade-in">
            <div className="cp-modal-header">
              <h3>Chọn trường để so sánh</h3>
              <button className="cp-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <div className="cp-search-bar">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên trường đại học..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="cp-school-list">
              {filteredSchools.length === 0 ? (
                <p className="cp-no-result">Đang tải hoặc không tìm thấy trường nào khớp với từ khóa của bạn.</p>
              ) : (
                filteredSchools.map(uni => {
                  const isSelected = tempSelectedSchools.some(s => s.id === uni.id);
                  const fallbackImage = `https://images.unsplash.com/photo-${1523050854058 + uni.id}-8df90110c9f1?w=60&q=80`;
                  
                  return (
                    <div 
                      className={`cp-school-item ${isSelected ? 'selected' : ''}`} 
                      key={uni.id} 
                      onClick={() => toggleSchoolSelection(uni)}
                    >
                      <img src={uni.school_logo || fallbackImage} alt="logo" style={{objectFit: 'contain', background: '#fff'}} />
                      <div>
                        <h4 style={{marginBottom: '4px'}}>{uni.school_name}</h4>
                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                          Ngành: {uni.major_code ? `${uni.major_name} (${uni.major_code})` : uni.major_name} - Điểm THPT: <strong style={{color: '#ef4444'}}>{uni.score_thpt_last_year || uni.base_score}</strong>
                        </span>
                      </div>
                      
                      {isSelected ? (
                        <CheckCircle2 size={24} color="#10b981" style={{marginLeft: 'auto'}} />
                      ) : (
                        <Plus size={24} color="#cbd5e1" style={{marginLeft: 'auto'}} />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="cp-modal-footer">
              <span>Đã chọn: <strong style={{color: '#4f46e5'}}>{tempSelectedSchools.length}/3</strong> trường</span>
              <button className="cp-btn-confirm" onClick={handleConfirmCompare}>
                Bắt đầu So sánh
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}