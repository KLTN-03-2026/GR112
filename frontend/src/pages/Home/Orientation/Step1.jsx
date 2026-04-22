import React, { useState, useEffect } from 'react';

const Step1 = ({ formData, setFormData, toggleInterest }) => {
  const [interestTags, setInterestTags] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [allUnis, setAllUnis] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resOptions, resUnis] = await Promise.all([
          fetch('http://localhost:8000/api/step1-options'),
          fetch('http://localhost:8000/api/universities')
        ]);
        
        if (resOptions.ok) {
          const data = await resOptions.json();
          setInterestTags(data.interests || []);
          setEnvironments(data.environments || []);
        }
        if (resUnis.ok) {
          const uniData = await resUnis.json();
          setAllUnis(uniData || []);
        }
      } catch (e) {
        console.error("Lỗi tải dữ liệu Bước 1:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- THUẬT TOÁN AI: GỢI Ý CHUẨN 100% TỪ BẢNG TRUNG GIAN DATABASE ---
  const getAiSuggestions = () => {
    // ĐÃ SỬA: Cho phép AI chạy nếu có Sở thích HOẶC có Môi trường
    if ((formData.interests.length === 0 && !formData.workEnv) || allUnis.length === 0) return [];

    // 1. Chấm điểm từng ngành học
    let scoredUnis = allUnis.map(uni => {
      let score = 0;
      const majorName = uni.major_name || uni.major || "";
      const schoolName = uni.school_name || uni.name || "";
      
      const aiInterests = uni.ai_interests || []; 
      const aiEnvs = uni.ai_environments || []; 

      // A. Đối chiếu Sở thích
      if (formData.interests.length > 0) {
        formData.interests.forEach(interest => {
          if (aiInterests.includes(interest)) {
            score += 5;
          } else if (majorName.toLowerCase().includes(interest.toLowerCase())) {
            score += 2;
          }
        });
      }

      // B. Đối chiếu Môi trường
      if (formData.workEnv && aiEnvs.includes(formData.workEnv)) {
        score += 5;
      }

      return { 
        ...uni, 
        matchScore: score, 
        majorNameForUI: majorName, 
        schoolNameForUI: schoolName 
      };
    });

    // 2. LỌC VÀ GỘP NGÀNH TRÙNG LẶP
    const validMatches = scoredUnis.filter(u => u.matchScore > 0);
    const uniqueSuggestions = new Map();
    
    validMatches.forEach(uni => {
      const key = `${uni.schoolNameForUI}-${uni.majorNameForUI}`;
      if (!uniqueSuggestions.has(key) || uniqueSuggestions.get(key).matchScore < uni.matchScore) {
        uniqueSuggestions.set(key, uni);
      }
    });

    let bestMatches = Array.from(uniqueSuggestions.values()).sort((a, b) => b.matchScore - a.matchScore);
    
    if (bestMatches.length === 0) {
      let allUnique = new Map();
      allUnis.forEach(uni => {
        const key = `${uni.school_name || uni.name}-${uni.major_name || uni.major}`;
        if (!allUnique.has(key)) allUnique.set(key, uni);
      });
      bestMatches = Array.from(allUnique.values()).sort((a, b) => (b.base_score || 0) - (a.base_score || 0));
    }

    return bestMatches; // Hiển thị toàn bộ kết quả phù hợp
  };

  const aiSuggestions = getAiSuggestions();

  return (
    <div className="fade-step">
      <div className="ori-header">
        <span className="ori-step-number">01</span>
        <h2 className="ori-title">PHÂN TÍCH NĂNG LỰC & SỞ THÍCH</h2>
        <p className="ori-subtitle">Khởi đầu hành trình học thuật bằng cách thấu hiểu bản thân qua các giá trị cốt lõi và môi trường lý tưởng của bạn.</p>
      </div>

      <div className="ori-progress-container">
        <span className="ori-progress-text">BƯỚC 1: KHÁM PHÁ BẢN THÂN</span>
        <div className="ori-progress-bar"><div className="ori-progress-fill" style={{ width: '25%' }}></div></div>
        <span className="ori-progress-text" style={{textTransform: 'none'}}>Tiến trình: 25%</span>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* CỘT 1: TỪ KHÓA SỞ THÍCH (40 TAGS) */}
        <div className="ori-card" style={{ flex: 1.2, minWidth: '350px' }}>
          <h3 style={{fontSize: '1.3rem', color: '#0b132b', margin: '0 0 5px 0'}}>
            <i className="fas fa-shapes" style={{color: '#10b981'}}></i> Từ khóa sở thích
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '15px' }}>
            Bạn có thể chọn nhiều chủ đề khiến bạn cảm thấy hào hứng và muốn đào sâu tìm hiểu nhất.
          </p>
          
          <div className="tag-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {isLoading ? (
              <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Đang tải dữ liệu từ máy chủ...</p>
            ) : interestTags.length > 0 ? (
              interestTags.map(tag => (
                <button 
                  key={tag} 
                  className={`ori-tag ${formData.interests.includes(tag) ? 'selected' : ''}`} 
                  onClick={() => toggleInterest(tag)}
                  style={{ margin: 0, fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  {formData.interests.includes(tag) && <i className="fas fa-check" style={{marginRight: '5px'}}></i>} {tag}
                </button>
              ))
            ) : (
              <p style={{color: '#ef4444'}}>Không tìm thấy dữ liệu Sở thích!</p>
            )}
          </div>
        </div>

        {/* CỘT 2: MÔI TRƯỜNG LÀM VIỆC & AI GỢI Ý */}
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Box: Môi trường làm việc */}
          <div>
            <h3 style={{fontSize: '1.3rem', color: '#0b132b', marginBottom: '15px'}}>
              <i className="fas fa-briefcase" style={{color: '#10b981', marginRight: '8px'}}></i>
              Môi trường lý tưởng
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '5px' }}>
              {isLoading ? (
                <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Đang tải dữ liệu...</p>
              ) : environments.length > 0 ? (
                environments.map(env => (
                  <div 
                    key={env.id}
                    className={`env-card ${formData.workEnv === env.id ? 'selected' : ''}`} 
                    onClick={() => {
                      // Click lại môi trường đang chọn thì sẽ bỏ chọn (Hủy chọn môi trường)
                      if (formData.workEnv === env.id) {
                        setFormData({...formData, workEnv: ''});
                      } else {
                        setFormData({...formData, workEnv: env.id});
                      }
                    }}
                    style={{ 
                      padding: '12px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', 
                      borderRadius: '12px', transition: 'all 0.3s ease',
                      border: formData.workEnv === env.id ? '2px solid #10b981' : '1px solid #e2e8f0', 
                      background: formData.workEnv === env.id ? '#f0fdf4' : 'white'
                    }}
                  >
                    <div className="env-icon" style={{ 
                      background: formData.workEnv === env.id ? '#10b981' : '#f1f5f9', 
                      color: formData.workEnv === env.id ? 'white' : '#64748b',
                      width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', flexShrink: 0
                    }}>
                      <i className={`fas ${env.icon}`}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 3px 0', color: formData.workEnv === env.id ? '#065f46' : '#0b132b', fontSize: '0.95rem' }}>{env.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{env.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{color: '#ef4444'}}>Không tìm thấy dữ liệu môi trường!</p>
              )}
            </div>
          </div>

          {/* Box: AI Gợi ý Ngành nghề */}
          <div className="ori-dark-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
            <h3 style={{fontSize: '1.1rem', color: '#a7f3d0', margin: '0 0 15px 0'}}>
              <i className="fas fa-magic" style={{marginRight: '8px', color: '#f59e0b'}}></i> 
              AI Định hướng Ngành nghề 
              {aiSuggestions.length > 0 && <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '10px'}}>({aiSuggestions.length} kết quả)</span>}
            </h3>
            
            {/* ĐÃ SỬA: Hiển thị nếu có chọn Sở thích HOẶC Môi trường */}
            {(formData.interests.length > 0 || formData.workEnv) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '5px', flex: 1 }}>
                
                {/* Lời dẫn thông minh tùy theo việc bạn chọn cái gì */}
                <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '0 0 5px 0' }}>
                  Dựa trên 
                  {formData.interests.length > 0 ? ` ${formData.interests.length} sở thích` : ''}
                  {formData.interests.length > 0 && formData.workEnv ? ' và ' : ''}
                  {formData.workEnv ? ' môi trường' : ''} bạn chọn, AI gợi ý:
                </p>

                {aiSuggestions.length > 0 ? aiSuggestions.map((uni, idx) => (
                  <div key={idx} style={{background: 'rgba(255,255,255,0.05)', padding: '12px 15px', borderRadius: '8px', borderLeft: '3px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontWeight: 700, fontSize: '0.9rem', color: 'white', marginBottom: '3px'}}>{uni.majorNameForUI}</div>
                      <div style={{fontSize: '0.75rem', color: '#94a3b8'}}><i className="fas fa-university"></i> {uni.schoolNameForUI}</div>
                    </div>
                    {uni.matchScore >= 5 && <i className="fas fa-star" style={{color: '#f59e0b', fontSize: '0.9rem'}} title="Mức độ phù hợp xuất sắc!"></i>}
                  </div>
                )) : (
                  <p style={{fontSize: '0.85rem', color: '#fca5a5', fontStyle: 'italic', margin: 0}}>Chưa tìm thấy ngành phù hợp. Thử chọn thêm Sở thích/Môi trường khác nhé!</p>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5, textAlign: 'center' }}>
                <i className="fas fa-hand-pointer" style={{fontSize: '2.5rem', marginBottom: '10px'}}></i>
                <p style={{fontSize: '0.85rem', margin: 0}}>Hãy chọn các từ khóa sở thích hoặc môi trường bên trái để AI bắt đầu phân tích.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Step1;