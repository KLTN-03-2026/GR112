import React, { useState, useEffect } from 'react';
import './UniversityManagement.css';
import { 
  Plus, Search, Filter, Edit3, ChevronLeft, 
  ChevronRight, Zap, ListTree, X, Trash2, Save, CheckCircle, AlertTriangle
} from 'lucide-react';

const UniversityManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 STATE THỐNG KÊ HỆ THỐNG (LẤY TỪ BACKEND)
  const [systemStats, setSystemStats] = useState({
    total_unis: 0,
    missing_tuition: 0,
    missing_logo: 0,
    recent_logs: []
  });

  // STATE BỘ LỌC
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); 
  const [locationFilter, setLocationFilter] = useState('All'); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  const [showMajorsModal, setShowMajorsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentSchool, setCurrentSchool] = useState('');
  const [schoolMajors, setSchoolMajors] = useState([]);
  
  // STATE FORM
  const [formData, setFormData] = useState({
    id: null, school_name: '', school_type: 'Công lập', school_logo: '', 
    address: '', website: '', phone: '', description: '', admission_methods: '',
    major_name: '', major_code: '', subject_block: '', tuition_fee: '',
    base_score: '', score_thpt_last_year: '', score_dgnl: '', 
    combo_cert: '', direct_admission: '', aptitude_test: ''
  });

  const token = localStorage.getItem('token');

  // 1. LẤY DANH SÁCH TRƯỜNG
  const fetchUniversities = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/admin/universities', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUniversities(data);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  // 2. LẤY THỐNG KÊ (AUDIT & LỊCH SỬ)
  const fetchSystemStats = () => {
    fetch('http://localhost:8000/api/admin/system-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(data && !data.error) setSystemStats(data);
      })
      .catch(err => console.error("Lỗi lấy thống kê:", err));
  };

  // CHẠY KHI VỪA MỞ TRANG
  useEffect(() => { 
    fetchUniversities(); 
    fetchSystemStats(); // <-- Gọi lấy thống kê
  }, []);

  // LẤY DANH SÁCH TỈNH THÀNH ĐỂ LỌC
  const uniqueLocations = Array.from(new Set(
    universities.map(uni => uni.location.split('•')[0].trim())
  )).filter(loc => loc && loc !== 'Chưa có địa chỉ');

  const filteredUniversities = universities.filter(uni => {
    const matchSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) || uni.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || uni.location.includes(typeFilter);
    const uniCity = uni.location.split('•')[0].trim();
    const matchLocation = locationFilter === 'All' || uniCity === locationFilter;
    return matchSearch && matchType && matchLocation;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUniversities = filteredUniversities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewMajors = (schoolName) => {
    setCurrentSchool(schoolName);
    setShowMajorsModal(true);
    setSchoolMajors([]); 
    fetchMajorsBySchool(schoolName);
  };

  const fetchMajorsBySchool = (schoolName) => {
    fetch(`http://localhost:8000/api/admin/universities/majors?school=${encodeURIComponent(schoolName)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSchoolMajors(data); })
      .catch(err => console.error("Lỗi:", err));
  };

  const openForm = (editData = null) => {
    if (editData) {
      setFormData({ ...editData }); 
    } else {
      setFormData({ 
        id: null, school_name: currentSchool || '', school_type: 'Công lập', school_logo: '', 
        address: '', website: '', phone: '', description: '', admission_methods: '',
        major_name: '', major_code: '', subject_block: '', tuition_fee: '',
        base_score: '', score_thpt_last_year: '', score_dgnl: '', 
        combo_cert: '', direct_admission: '', aptitude_test: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const url = formData.id ? `http://localhost:8000/api/admin/universities/${formData.id}` : 'http://localhost:8000/api/admin/universities';
    const method = formData.id ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if (res.ok) {
        alert("✅ Lưu dữ liệu thành công!");
        setShowFormModal(false);
        fetchUniversities(); 
        fetchSystemStats(); // <-- Load lại Lịch sử & Cảnh báo
        if (showMajorsModal && formData.school_name) fetchMajorsBySchool(formData.school_name); 
      }
    });
  };

  const handleDeleteMajor = (id) => {
    if (window.confirm("⚠️ Bạn có chắc muốn xóa ngành này khỏi hệ thống?")) {
      fetch(`http://localhost:8000/api/admin/universities/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          fetchUniversities();
          fetchSystemStats(); // <-- Load lại Lịch sử & Cảnh báo
          if (showMajorsModal) fetchMajorsBySchool(currentSchool);
        }
      });
    }
  };

  return (
    <div className="uni-mgmt-content fade-in">
      <div className="page-header-uni">
        <div className="title-text-uni">
          <span className="badge-ai-active"><Zap size={12}/> AI ANALYTICS ACTIVE</span>
          <h2>Quản lý Dữ liệu Trường & Ngành</h2>
          <p>Tối ưu hóa dữ liệu ngành học bằng trí tuệ nhân tạo EduGuide AI.</p>
        </div>
        <div className="title-actions-uni">
          <button className="btn-add-uni" onClick={() => { setCurrentSchool(''); openForm(null); }}><Plus size={16}/> Thêm mới Dữ liệu</button>
        </div>
      </div>

      <div className="filter-row-uni">
        <div className="search-uni">
          <Search size={18} />
          <input type="text" placeholder="Tìm kiếm trường, mã trường..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
        <div className="select-groups" style={{ display: 'flex', gap: '10px' }}>
          <select className="uni-select" value={locationFilter} onChange={(e) => {setLocationFilter(e.target.value); setCurrentPage(1);}}>
            <option value="All">TỈNH/THÀNH: Tất cả</option>
            {uniqueLocations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
          <select className="uni-select" value={typeFilter} onChange={(e) => {setTypeFilter(e.target.value); setCurrentPage(1);}}>
            <option value="All">LOẠI HÌNH: Tất cả</option>
            <option value="Công lập">Trường Công lập</option>
            <option value="Tư thục">Trường Tư thục</option>
            <option value="Quốc tế">Trường Quốc tế</option>
          </select>
        </div>
      </div>

      <div className="uni-grid-layout">
        <div className="uni-table-container">
          {loading ? <p style={{textAlign: 'center', padding: '40px'}}>Đang tải dữ liệu từ Server...</p> : (
            <>
              <table className="uni-table">
                <thead><tr><th>TRƯỜNG ĐẠI HỌC</th><th>MÃ</th><th>CẬP NHẬT</th><th>THAO TÁC</th></tr></thead>
                <tbody>
                  {currentUniversities.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>Không tìm thấy trường nào phù hợp.</td></tr>
                  ) : (
                    currentUniversities.map(uni => (
                      <tr key={uni.id}>
                        <td>
                          <div className="uni-info-cell">
                            <img src={uni.logo} alt="logo" style={{objectFit: 'contain', background: '#fff'}} />
                            <div><p className="uni-name">{uni.name}</p><span className="uni-loc">{uni.location}</span></div>
                          </div>
                        </td>
                        <td><span className="uni-code-badge">{uni.code}</span></td>
                        <td>
                          <div className="uni-update-cell"><p>{uni.updated}</p><span className="status-sync"><CheckCircle size={12}/> {uni.status}</span></div>
                        </td>
                        <td><button className="btn-view-detail" onClick={() => handleViewMajors(uni.name)}>Ngành học & Sửa</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="uni-pagination">
                  <span>Hiển thị trang {currentPage} / {totalPages} (Tổng {filteredUniversities.length} trường)</span>
                  <div className="page-btns-uni">
                    <button className="p-nav" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => paginate(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="p-nav" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ----------------- SIDEBAR CHẠY DATA THẬT ----------------- */}
        <aside className="uni-info-aside">
          
          <div className="ai-assist-card-uni" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div className="ai-icon-circle" style={{ background: '#3b82f6', color: 'white' }}><Zap size={18}/></div>
              <h4 style={{ margin: 0, color: 'white' }}>System Overview</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px', fontSize: '14px' }}>
              <span style={{ color: '#94a3b8' }}>Tổng số Trường:</span>
              <strong style={{ fontSize: '16px' }}>{systemStats.total_unis}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#94a3b8' }}>Trạng thái Server:</span>
              <strong style={{ color: '#4ade80' }}>Online & Ổn định</strong>
            </div>
          </div>

          <div className="majors-cat-card" style={{ border: `1px solid ${systemStats.missing_tuition > 0 || systemStats.missing_logo > 0 ? '#fecdd3' : '#bbf7d0'}`, background: systemStats.missing_tuition > 0 || systemStats.missing_logo > 0 ? '#fff1f2' : '#f0fdf4' }}>
            <div className="cat-card-header" style={{ borderBottom: `1px solid ${systemStats.missing_tuition > 0 || systemStats.missing_logo > 0 ? '#fecaca' : '#bbf7d0'}`, paddingBottom: '10px', marginBottom: '15px' }}>
              <h4 style={{ color: systemStats.missing_tuition > 0 || systemStats.missing_logo > 0 ? '#be123c' : '#166534', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {systemStats.missing_tuition > 0 || systemStats.missing_logo > 0 ? <AlertTriangle size={18} /> : <CheckCircle size={18}/>} 
                Audit Dữ Liệu
              </h4>
            </div>
            <div style={{ fontSize: '13px', color: '#881337', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {systemStats.missing_tuition === 0 && systemStats.missing_logo === 0 ? (
                <span style={{color: '#166534'}}>Tuyệt vời! 100% dữ liệu đã được cập nhật đầy đủ thông tin Học phí và Logo.</span>
              ) : (
                <>
                  {systemStats.missing_tuition > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ minWidth: '6px', height: '6px', background: '#e11d48', borderRadius: '50%', marginTop: '6px' }}></span>
                      <span>Phát hiện <strong>{systemStats.missing_tuition} ngành học</strong> đang bị bỏ trống Học phí.</span>
                    </div>
                  )}
                  {systemStats.missing_logo > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ minWidth: '6px', height: '6px', background: '#eab308', borderRadius: '50%', marginTop: '6px' }}></span>
                      <span style={{color: '#854d0e'}}>Có <strong>{systemStats.missing_logo} trường Đại học</strong> chưa có Link Logo website.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="majors-cat-card">
            <div className="cat-card-header" style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>Hoạt động gần đây</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {systemStats.recent_logs.length === 0 ? (
                <span style={{fontSize: '13px', color: '#64748b'}}>Chưa có hoạt động nào được ghi nhận.</span>
              ) : (
                systemStats.recent_logs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <div style={{ color: log.type === 'Xóa' ? '#ef4444' : (log.type === 'Thêm mới' ? '#10b981' : '#3b82f6'), marginTop: '2px' }}>
                      {log.type === 'Xóa' ? <Trash2 size={16}/> : (log.type === 'Thêm mới' ? <Plus size={16}/> : <Edit3 size={16}/>)}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#334155' }}>{log.type}</p>
                      <p style={{ margin: 0, color: '#64748b' }}>{log.desc}</p>
                      <small style={{ color: '#94a3b8' }}>{log.time}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL 1: BẢNG CHI TIẾT NGÀNH */}
      {/* ========================================================================= */}
      {showMajorsModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="cm-modal-content" style={{ background: '#fff', width: '95%', maxWidth: '1200px', borderRadius: '12px', padding: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px', flexShrink: 0 }}>
              <div><h2 style={{ margin: 0, fontSize: '20px' }}>{currentSchool}</h2><p style={{ margin: '0', color: '#64748b' }}>Danh sách ngành đào tạo</p></div>
              <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                <button onClick={() => openForm(null)} style={{background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}><Plus size={16}/> Thêm Ngành</button>
                <button onClick={() => setShowMajorsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }} className="custom-scrollbar">
              <table className="uni-table" style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', margin: 0 }}>
                
                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Mã Ngành</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Tên Ngành</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Khối</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Điểm THPT</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Điểm ĐGNL</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Học bạ</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Học phí</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Tuyển kết hợp</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Tuyển thẳng</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Năng khiếu</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Website</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Điện thoại</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>Địa chỉ</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'}}>PTXT Khác</th>
                    
                    {/* ĐÓNG BĂNG CỘT THAO TÁC */}
                    <th style={{padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', right: 0, background: '#f8fafc', zIndex: 11, borderLeft: '1px solid #e2e8f0'}}>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {schoolMajors.length === 0 ? (
                    <tr><td colSpan="15" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>Trường này hiện chưa có dữ liệu ngành nào trong hệ thống.</td></tr>
                  ) : (
                    schoolMajors.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#3b82f6' }}>{m.major_code}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: '500' }}>{m.major_name}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}><span className="badge-type">{m.subject_block}</span></td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', color: '#ef4444', fontWeight: 'bold' }}>{m.score_thpt_last_year || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', color: '#a855f7', fontWeight: 'bold' }}>{m.score_dgnl || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', color: '#16a34a', fontWeight: 'bold' }}>{m.base_score || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.tuition_fee || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.combo_cert || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.direct_admission || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.aptitude_test || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.website || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{m.phone || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.address}>{m.address || '-'}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.admission_methods}>{m.admission_methods || '-'}</td>
                        
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', position: 'sticky', right: 0, background: '#fff', borderLeft: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                            <button style={{border:'none', background:'none', cursor:'pointer', color:'#3b82f6'}} onClick={() => openForm(m)}><Edit3 size={16}/></button>
                            <button style={{border:'none', background:'none', cursor:'pointer', color:'#ef4444'}} onClick={() => handleDeleteMajor(m.id)}><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM NHẬP LIỆU */}
      {/* ========================================================================= */}
      {showFormModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="cm-modal-content custom-scrollbar" style={{ background: '#fff', width: '800px', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{margin: 0}}>{formData.id ? 'Sửa thông tin Ngành học' : 'Thêm dữ liệu Trường/Ngành'}</h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmitForm} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>1. Thông tin Chung (Trường Đại học)</h4>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Tên trường Đại học (*)</label>
                    <input type="text" required value={formData.school_name || ''} onChange={e => setFormData({...formData, school_name: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Loại hình</label>
                    <select value={formData.school_type || 'Công lập'} onChange={e => setFormData({...formData, school_type: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}>
                      <option>Công lập</option><option>Tư thục</option><option>Quốc tế</option>
                    </select>
                  </div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Link Logo (URL)</label>
                    <input type="text" value={formData.school_logo || ''} onChange={e => setFormData({...formData, school_logo: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Website Trường</label>
                    <input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Số điện thoại</label>
                    <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Địa chỉ</label>
                    <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#166534' }}>2. Thông tin Ngành học & Học phí</h4>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Tên Ngành học (*)</label>
                    <input type="text" required value={formData.major_name || ''} onChange={e => setFormData({...formData, major_name: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Mã ngành</label>
                    <input type="text" required value={formData.major_code || ''} onChange={e => setFormData({...formData, major_code: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Tổ hợp môn</label>
                    <input type="text" required value={formData.subject_block || ''} onChange={e => setFormData({...formData, subject_block: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}} placeholder="A00, A01..."/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize: '13px', fontWeight: 'bold'}}>Học phí (Mô tả ngắn)</label>
                  <input type="text" value={formData.tuition_fee || ''} onChange={e => setFormData({...formData, tuition_fee: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}} placeholder="VD: 25 - 30 triệu/năm"/>
                </div>
              </div>

              <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#9f1239' }}>3. Điểm Chuẩn & Phương thức Xét Tuyển</h4>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Điểm THPT (Năm ngoái)</label>
                    <input type="number" step="0.01" value={formData.score_thpt_last_year || ''} onChange={e => setFormData({...formData, score_thpt_last_year: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Điểm ĐGNL</label>
                    <input type="number" value={formData.score_dgnl || ''} onChange={e => setFormData({...formData, score_dgnl: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Điểm Học bạ (Base Score)</label>
                    <input type="number" step="0.01" value={formData.base_score || ''} onChange={e => setFormData({...formData, base_score: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}}/>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Tuyển kết hợp (IELTS/SAT)</label>
                    <input type="text" value={formData.combo_cert || ''} onChange={e => setFormData({...formData, combo_cert: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}} placeholder="VD: IELTS 6.5 + Toán"/>
                  </div>
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 'bold'}}>Tuyển thẳng</label>
                    <input type="text" value={formData.direct_admission || ''} onChange={e => setFormData({...formData, direct_admission: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px'}} placeholder="Đối tượng tuyển thẳng"/>
                  </div>
                </div>

                <div>
                  <label style={{fontSize: '13px', fontWeight: 'bold'}}>Các phương thức xét tuyển khác (Mô tả chi tiết)</label>
                  <textarea rows="3" value={formData.admission_methods || ''} onChange={e => setFormData({...formData, admission_methods: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical'}}></textarea>
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{padding: '10px 20px', background: '#e2e8f0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Hủy Bỏ</button>
                <button type="submit" style={{padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}><Save size={18}/> Lưu Dữ Liệu</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UniversityManagement;