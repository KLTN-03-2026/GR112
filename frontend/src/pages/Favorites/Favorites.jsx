import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Info, BarChart2, Download, Sparkles, MapPin, PlusCircle, Maximize2, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import './Favorites.css';

const Favorites = () => {
  const [favoriteSchools, setFavoriteSchools] = useState([]);
  const [allUnis, setAllUnis] = useState([]);
  const currentUserId = 1; // Giả lập User ID đang đăng nhập

  // 🚀 ĐÃ SỬA: KHỚP 100% VỚI TÊN CỘT TRONG DATABASE MYSQL CỦA SẾP
  const formatSchoolData = (uni) => ({
    id: uni.id,
    name: uni.school_name || uni.name,
    logo: uni.school_logo || `https://images.unsplash.com/photo-${1523050854058 + uni.id}-8df90110c9f1?w=100&q=80`,
    location: uni.ranking_note ? uni.ranking_note.split(' - ')[1] : 'Đang cập nhật',
    
    // Ánh xạ chính xác các loại điểm từ DB
    scoreTHPT: uni.score_thpt_last_year || 'N/A',  // Điểm thi THPT
    scoreHocBa: uni.base_score || 'N/A',           // Điểm Học bạ
    scoreDGNL: uni.score_dgnl || 'N/A',            // Điểm ĐGNL
    
    tuition: uni.tuition_fee || 'Đang cập nhật',
    major: uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành'),
    majorNameOnly: uni.major_name || 'Đa ngành',
    block: uni.subject_block || 'N/A'
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`https://gr112.onrender.com/api/favorites/${currentUserId}`);
        const formattedFavs = res.data.map(uni => formatSchoolData(uni));
        setFavoriteSchools(formattedFavs);
      } catch (error) {
        console.error("Lỗi lấy danh sách yêu thích từ DB:", error);
      }
    };

    const fetchAll = async () => {
      try {
        const res = await axios.get('https://gr112.onrender.com/api/universities');
        setAllUnis(res.data);
      } catch (error) {
        console.error("Lỗi lấy tất cả trường:", error);
      }
    };

    fetchFavorites();
    fetchAll();
  }, []);

  const handleRemoveFavorite = async (id) => {
    try {
      await axios.post('https://gr112.onrender.com/api/favorites/toggle', {
        user_id: currentUserId,
        university_id: id
      });
      setFavoriteSchools(favoriteSchools.filter(school => school.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
    }
  };

  const handleAddSuggestion = async (school) => {
    try {
      await axios.post('https://gr112.onrender.com/api/favorites/toggle', {
        user_id: currentUserId,
        university_id: school.id
      });
      setFavoriteSchools([...favoriteSchools, school]);
    } catch (error) {
      console.error("Lỗi khi thêm yêu thích:", error);
    }
  };

  const handleExportReport = () => {
    if (favoriteSchools.length === 0) {
      alert("Danh sách yêu thích đang trống. Không có dữ liệu để xuất!");
      return;
    }
    let csvContent = "\uFEFFSTT,Tên Trường,Ngành Học,Khu Vực,Khối Xét Tuyển,Điểm THPT,Điểm Học Bạ,Điểm ĐGNL,Học Phí Dự Kiến\n";
    favoriteSchools.forEach((school, index) => {
      csvContent += `"${index + 1}","${school.name}","${school.major}","${school.location}","${school.block}","${school.scoreTHPT}","${school.scoreHocBa}","${school.scoreDGNL}","${school.tuition}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Bao_Cao_Truong_Yeu_Thich.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const overallMatch = useMemo(() => {
    if (favoriteSchools.length === 0) return 0;
    // Dùng điểm THPT để phân tích AI
    const avgScore = favoriteSchools.reduce((acc, curr) => acc + (parseFloat(curr.scoreTHPT) || 20), 0) / favoriteSchools.length;
    return Math.min(98, Math.max(65, Math.round((avgScore / 30) * 100) + 5));
  }, [favoriteSchools]);

  const aiSuggestions = useMemo(() => {
    if (allUnis.length === 0) return [];
    const favIds = favoriteSchools.map(s => s.id);
    let availableUnis = allUnis.filter(u => !favIds.includes(u.id));

    if (favoriteSchools.length > 0) {
      const favMajors = favoriteSchools.map(s => s.majorNameOnly.toLowerCase());
      const favBlocks = favoriteSchools.map(s => s.block);
      availableUnis.sort((a, b) => {
        let scoreA = 0; let scoreB = 0;
        if (favMajors.some(m => (a.major_name || "").toLowerCase().includes(m))) scoreA += 10;
        if (favBlocks.includes(a.subject_block)) scoreA += 5;
        if (favMajors.some(m => (b.major_name || "").toLowerCase().includes(m))) scoreB += 10;
        if (favBlocks.includes(b.subject_block)) scoreB += 5;
        scoreA += (parseFloat(a.score_thpt_last_year) || 0) * 0.1;
        scoreB += (parseFloat(b.score_thpt_last_year) || 0) * 0.1;
        return scoreB - scoreA;
      });
    }
    return availableUnis.slice(0, 3).map(u => formatSchoolData(u));
  }, [favoriteSchools, allUnis]);

  return (
    <div className="fav-container fade-in">
      <div className="fav-header">
        <div className="header-text">
          <p className="breadcrumb">TRANG CHỦ / <strong>TRƯỜNG YÊU THÍCH</strong></p>
          <h1>Danh sách trường quan tâm</h1>
          <p>Bạn đang theo dõi {favoriteSchools.length} chương trình học.</p>
        </div>
        <div className="header-btns">
          <Link to="/compare" style={{textDecoration: 'none'}}>
            <button className="btn-white-icon"><BarChart2 size={18} /> So sánh chi tiết ({favoriteSchools.length})</button>
          </Link>
          <button onClick={handleExportReport} className="btn-dark-icon"><Download size={18} /> Xuất báo cáo</button>
        </div>
      </div>

      <div className="fav-main-layout">
        <div className="fav-list">
          {favoriteSchools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <Heart size={48} color="#cbd5e1" style={{marginBottom: '15px'}} />
              <h3 style={{color: '#64748b'}}>Bạn chưa yêu thích trường nào</h3>
              <Link to="/search" className="btn-dark-icon" style={{display: 'inline-flex', textDecoration: 'none', marginTop: '10px', gap: '8px'}}><Search size={18}/> Đi tới Tìm kiếm</Link>
            </div>
          ) : (
            favoriteSchools.map(school => (
              <div className="school-item-card" key={school.id}>
                <div className="school-main-info">
                  <div className="school-logo-bg" style={{background: 'white', padding: '5px', border: '1px solid #e2e8f0'}}>
                    <img src={school.logo} alt="logo" style={{objectFit: 'contain'}} />
                  </div>
                  <div className="school-details" style={{flex: 1}}>
                    <h3>{school.name} <Heart size={18} fill="#e11d48" color="#e11d48" className="heart-active" style={{cursor: 'pointer'}} onClick={() => handleRemoveFavorite(school.id)} /></h3>
                    <p><MapPin size={14} /> {school.location} • Ngành: <strong>{school.major}</strong></p>
                  </div>
                </div>
                
                <div className="school-stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                  <div className="stat-box" style={{ flex: '1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Đ.THPT</span>
                    <strong style={{color: '#ef4444', fontSize: '15px'}}>{school.scoreTHPT}</strong>
                  </div>
                  <div className="stat-box" style={{ flex: '1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>HỌC BẠ</span>
                    <strong style={{color: '#f59e0b', fontSize: '15px'}}>{school.scoreHocBa}</strong>
                  </div>
                  <div className="stat-box" style={{ flex: '1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>ĐGNL</span>
                    <strong style={{color: '#8b5cf6', fontSize: '15px'}}>{school.scoreDGNL}</strong>
                  </div>
                  <div className="stat-box" style={{ flex: '1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>KHỐI</span>
                    <strong className="text-blue" style={{background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '13px'}}>{school.block}</strong>
                  </div>
                  <div className="stat-box" style={{ flex: '1.5' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>HỌC PHÍ</span>
                    <strong style={{fontSize: '13px'}}>{school.tuition}</strong>
                  </div>

                  <div className="school-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link to={`/detail/${school.id}`} className="btn-light-sm" style={{textDecoration: 'none'}}>Chi tiết</Link>
                    <button onClick={() => handleRemoveFavorite(school.id)} className="btn-outline-sm" style={{color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2', cursor: 'pointer', padding: '6px 10px'}}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="fav-sidebar">
          <div className="ai-analysis-card">
            <div className="ai-card-title"><Sparkles size={18} /> AI Phân tích <Info size={16} style={{marginLeft: '4px'}} /></div>
            <p>Dựa trên điểm thi thử của bạn và danh sách {favoriteSchools.length} trường đã chọn, cơ hội trúng tuyển tổng thể rất khả quan.</p>
            <div className="match-progress">
              <div className="progress-text"><span>ĐỘ PHÙ HỢP TỔNG THỂ</span> <span>{overallMatch}%</span></div>
              <div className="bar-bg"><div className="bar-fill" style={{width: `${overallMatch}%`, background: '#10b981'}}></div></div>
            </div>
          </div>
          <div className="ai-suggestions">
            <h4><Sparkles size={16} color="#3b5998" /> Gợi ý tương tự từ AI</h4>
            {aiSuggestions.map((school, i) => (
                <div className="suggest-item" key={school.id}>
                  <div className="suggest-icon"><img src={school.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%'}}/></div>
                  <div className="suggest-info" style={{flex: 1, paddingRight: '10px'}}>
                    <strong style={{display: 'block', fontSize: '0.9rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px'}} title={school.name}>{school.name}</strong>
                    <span style={{fontSize: '0.75rem', color: '#64748b'}}>Phù hợp {95 - i * 2}% • THPT: {school.scoreTHPT}</span>
                  </div>
                  <button className="add-suggest" onClick={() => handleAddSuggestion(school)} title="Thêm vào yêu thích"><PlusCircle size={22} color="#4f46e5" /></button>
                </div>
            ))}
            <Link to="/search" style={{textDecoration: 'none'}}><button className="view-more-link" style={{cursor: 'pointer', width: '100%'}}>Khám phá thêm ở Tìm kiếm</button></Link>
          </div>
        </aside>
      </div>

      {favoriteSchools.length > 0 && (
        <section className="quick-compare-section">
          <div className="section-header">
            <h2>So sánh nhanh các trường đã chọn</h2>
            <Link to="/compare"><Maximize2 size={18} color="#94a3b8" cursor="pointer" /></Link>
          </div>
          <div className="compare-table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '10px' }}>
            <table className="compare-mini-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                  <th style={{ minWidth: '150px', padding: '15px', color: '#475569', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 }}>TIÊU CHÍ</th>
                  {favoriteSchools.map(school => (
                    <th key={school.id} style={{minWidth: '200px', padding: '15px', color: '#0f172a'}}>{school.name.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Điểm THPT</td>
                  {favoriteSchools.map(school => (<td key={school.id} style={{padding: '15px'}}><strong style={{color: '#ef4444'}}>{school.scoreTHPT}</strong></td>))}
                </tr>
                <tr style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Điểm Học bạ</td>
                  {favoriteSchools.map(school => (<td key={school.id} style={{padding: '15px'}}><strong style={{color: '#f59e0b'}}>{school.scoreHocBa}</strong></td>))}
                </tr>
                <tr style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Điểm ĐGNL</td>
                  {favoriteSchools.map(school => (<td key={school.id} style={{padding: '15px'}}><strong style={{color: '#8b5cf6'}}>{school.scoreDGNL}</strong></td>))}
                </tr>
                <tr style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Khối xét tuyển</td>
                  {favoriteSchools.map(school => (<td key={school.id} style={{padding: '15px'}}><strong>{school.block}</strong></td>))}
                </tr>
                <tr style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Học phí dự kiến</td>
                  {favoriteSchools.map(school => (<td key={school.id} style={{padding: '15px', color: '#0b132b', fontWeight: '500'}}>{school.tuition}</td>))}
                </tr>
                <tr>
                  <td style={{padding: '15px', color: '#64748b', position: 'sticky', left: 0, background: 'white', zIndex: 1}}>Phân tích AI</td>
                  {favoriteSchools.map(school => {
                    const score = parseFloat(school.scoreTHPT) || 0; 
                    let bBg = "#d1fae5"; let bCol = "#065f46"; let bTxt = "AN TOÀN";
                    if (score >= 26.5) { bBg = "#fef2f2"; bCol = "#991b1b"; bTxt = "THỬ THÁCH"; } 
                    else if (score > 0 && score < 24.5) { bBg = "#e0e7ff"; bCol = "#3730a3"; bTxt = "KHUYÊN DÙNG"; }
                    else if (score === 0) { bBg = "#f1f5f9"; bCol = "#475569"; bTxt = "ĐANG CẬP NHẬT"; }
                    return (
                      <td key={school.id} style={{padding: '15px'}}>
                        <span style={{background: bBg, color: bCol, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'}}>{bTxt}</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Favorites;