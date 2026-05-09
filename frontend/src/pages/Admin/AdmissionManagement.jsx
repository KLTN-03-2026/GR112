import React, { useState, useEffect, useRef } from 'react';
import './AdmissionManagement.css';
import { 
  Database, Plus, Upload, Search, Filter, 
  Edit3, Trash2, TrendingUp, BarChart2,
  ChevronLeft, ChevronRight, X, Save
} from 'lucide-react';
import Swal from 'sweetalert2'; 

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState([]);
  const [stats, setStats] = useState({ total_majors: 0, total_quota: 0 });
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('2025'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; 
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, school: '', major: '', code: '', blocks: '', quota: '', 
    score_thpt: '', score_hocba: '', score_dgnl: '', combo_cert: '', direct_admission: '', aptitude_test: '', year: '2025'
  });

  const fileInputRef = useRef(null); 
  const token = localStorage.getItem('token');

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:8000/api/admin/admissions?year=${yearFilter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setAdmissions(data.data);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); setCurrentPage(1); }, [yearFilter]);

  const filteredData = admissions.filter(item => 
    item.school.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const openForm = (editData = null) => {
    if (editData) setFormData({ ...editData });
    else setFormData({ id: null, school: '', major: '', code: '', blocks: '', quota: '', score_thpt: '', score_hocba: '', score_dgnl: '', combo_cert: '', direct_admission: '', aptitude_test: '', year: yearFilter });
    setShowFormModal(true);
  };

  // 🚀 XỬ LÝ GỬI FORM (ĐÃ ĐỘ LẠI VALIDATION CHỈ TIÊU)
  const handleSubmit = (e) => {
    e.preventDefault();

    // 🛡️ BƯỚC KIỂM TRA BẢO MẬT: CHỈ TIÊU PHẢI LÀ SỐ NGUYÊN DƯƠNG
    const quotaNum = Number(formData.quota);
    if (!formData.quota || !Number.isInteger(quotaNum) || quotaNum <= 0) {
      Swal.fire({
        title: 'Lỗi nhập liệu!',
        text: "Chỉ tiêu phải là số nguyên dương.",
        icon: 'error',
        confirmButtonText: 'Sửa lại',
        borderRadius: '16px'
      });
      return; // Chặn đứng, không cho gửi API
    }

    const url = formData.id ? `http://localhost:8000/api/admin/admissions/${formData.id}` : 'http://localhost:8000/api/admin/admissions';
    const method = formData.id ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if(res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã lưu thông tin tuyển sinh!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowFormModal(false);
        fetchData();
      } else {
        Swal.fire('Lỗi!', 'Không thể lưu dữ liệu, vui lòng thử lại.', 'error');
      }
    }).catch(err => {
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối với máy chủ.', 'error');
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa bản ghi?',
      text: "CẢNH BÁO: Bạn có chắc chắn muốn xóa bản ghi tuyển sinh này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8000/api/admin/admissions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { 
          if(res.ok) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Bản ghi đã được xóa.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchData(); 
          }
        }).catch(err => {
          Swal.fire('Lỗi kết nối!', 'Không thể xóa bản ghi.', 'error');
        });
      }
    });
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire({
      title: 'Đang Import Excel...',
      text: 'Hệ thống đang xử lý dữ liệu, vui lòng chờ!',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('year', yearFilter); 

    fetch('http://localhost:8000/api/admin/admissions/import', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadData
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) {
        Swal.fire('Lỗi Import!', data.error, 'error');
      } else {
        Swal.fire({
          title: 'Import Thành công!',
          text: data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData(); 
      }
      e.target.value = null; 
    }).catch(err => {
      Swal.fire('Lỗi kết nối!', 'Không thể tải file lên máy chủ.', 'error');
      e.target.value = null;
    });
  };

  return (
    <div className="adm-inner-content fade-in">
      <div className="adm-header-row">
        <div className="adm-title-area">
          <div className="adm-icon-wrapper"><Database size={20} /></div>
          <div>
            <h2>Quản lý dữ liệu Tuyển sinh</h2>
            <p>Hệ thống quản lý chỉ tiêu và tất cả các phương thức xét tuyển.</p>
          </div>
        </div>
        <div className="adm-header-btns">
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleExcelUpload} />
          <button className="btn-adm-secondary" onClick={() => fileInputRef.current.click()} title="Upload file Excel">
            <Upload size={16} /> Import Excel
          </button>
          
          <button className="btn-adm-primary" onClick={() => openForm(null)}><Plus size={16} /> Thêm mới</button>
        </div>
      </div>

      <div className="adm-stats-grid">
        <div className="adm-mini-stat">
          <span className="mini-label">TỔNG SỐ NGÀNH ({yearFilter})</span>
          <div className="mini-value">{stats.total_majors} <small>ngành</small></div>
        </div>
        <div className="adm-mini-stat">
          <span className="mini-label">CHỈ TIÊU HỆ THỐNG</span>
          <div className="mini-value">{stats.total_quota?.toLocaleString() || 0} <BarChart2 size={16} color="#64748b"/></div>
        </div>
        <div className="adm-mini-stat highlight">
          <span className="mini-label">DỰ BÁO BIẾN ĐỘNG</span>
          <div className="mini-value" style={{fontSize: '18px'}}>{stats.trend || 'Đang phân tích...'} <TrendingUp size={16} /></div>
        </div>
      </div>

      <div className="adm-toolbar-row">
        <div className="adm-search-wrap">
          <Search size={16} />
          <input type="text" placeholder="Tìm tên trường, mã ngành..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
        <div className="adm-filter-wrap">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold'}}>
            <option value="2025">Năm tuyển sinh: 2025</option>
            <option value="2024">Năm tuyển sinh: 2024</option>
            <option value="2023">Năm tuyển sinh: 2023</option>
          </select>
          <button className="btn-filter-icon"><Filter size={16} /></button>
        </div>
      </div>

      {/* TABLE CÓ SCROLL NGANG */}
      <div className="adm-table-card custom-scrollbar" style={{overflowX: 'auto'}}>
        {loading ? <p style={{textAlign: 'center', padding: '30px'}}>Đang tải dữ liệu...</p> : (
          <>
            <table className="adm-table" style={{minWidth: '1100px'}}>
              <thead>
                <tr>
                  <th style={{whiteSpace: 'nowrap'}}>TRƯỜNG ĐẠI HỌC</th>
                  <th style={{whiteSpace: 'nowrap'}}>NGÀNH & MÃ</th>
                  <th style={{whiteSpace: 'nowrap'}}>KHỐI / CHỈ TIÊU</th>
                  <th style={{whiteSpace: 'nowrap'}}>ĐIỂM SỐ (THPT / HỌC BẠ / ĐGNL)</th>
                  <th style={{whiteSpace: 'nowrap'}}>PHƯƠNG THỨC KHÁC</th>
                  <th style={{textAlign: 'center', position: 'sticky', right: 0, background: '#fcfcfc', borderLeft: '1px solid #e2e8f0', zIndex: 10}}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding: '20px'}}>Không có dữ liệu cho năm {yearFilter}</td></tr> : 
                  currentData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="school-cell">
                        <strong style={{fontSize: '14px', color: '#0f172a'}}>{item.school}</strong>
                        <span style={{color: '#64748b', fontSize: '12px'}}>{item.method}</span>
                      </div>
                    </td>
                    <td>
                      <div className="major-cell">
                        <p style={{margin: 0, fontWeight: '600', color: '#334155'}}>{item.major}</p>
                        <span className="code-tag">{item.code}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <div className="blocks-list">
                          {item.blocks ? item.blocks.split(',').map((b, i) => <span key={i} className="b-tag">{b.trim()}</span>) : '-'}
                        </div>
                        <span style={{fontSize: '12px', fontWeight: 'bold', color: '#475569'}}>Chỉ tiêu: <span style={{color: '#0f172a', fontSize: '14px'}}>{item.quota || 0}</span></span>
                      </div>
                    </td>
                    <td>
                       <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          {item.score_thpt > 0 && <span style={{fontSize: '13px', color: '#e11d48'}}><strong>THPT:</strong> {item.score_thpt}</span>}
                          {item.score_hocba > 0 && <span style={{fontSize: '13px', color: '#16a34a'}}><strong>Học bạ:</strong> {item.score_hocba}</span>}
                          {item.score_dgnl > 0 && <span style={{fontSize: '13px', color: '#a855f7'}}><strong>ĐGNL:</strong> {item.score_dgnl}</span>}
                          {!item.score_thpt && !item.score_hocba && !item.score_dgnl && <span style={{color: '#94a3b8', fontStyle: 'italic', fontSize: '12px'}}>Chưa cập nhật</span>}
                       </div>
                    </td>
                    <td>
                       <div style={{display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px'}}>
                          {item.combo_cert ? <span style={{color: '#0284c7'}}><strong>Kết hợp:</strong> {item.combo_cert}</span> : null}
                          {item.direct_admission ? <span style={{color: '#d97706'}}><strong>Tuyển thẳng:</strong> {item.direct_admission}</span> : null}
                          {item.aptitude_test ? <span style={{color: '#4f46e5'}}><strong>Năng khiếu:</strong> {item.aptitude_test}</span> : null}
                          {!item.combo_cert && !item.direct_admission && !item.aptitude_test && <span style={{color: '#94a3b8'}}>-</span>}
                       </div>
                    </td>
                    <td className="actions-cell" style={{textAlign: 'center', position: 'sticky', right: 0, background: '#fff', borderLeft: '1px solid #f1f5f9'}}>
                      <button className="btn-edit" onClick={() => openForm(item)}><Edit3 size={16} /></button>
                      <button className="btn-del" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="adm-pagination-row">
                <span>Trang {currentPage} / {totalPages}</span>
                <div className="adm-page-nav">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FORM NHẬP LIỆU (CÓ SCROLL DỌC) */}
      {showFormModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="cm-modal-content custom-scrollbar" style={{ background: '#fff', width: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{margin: 0, color: '#0f172a'}}>{formData.id ? 'Sửa thông tin Tuyển sinh' : 'Thêm mới Tuyển sinh'}</h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px' }}>Thông tin Cơ bản ({formData.year})</h4>
                <div style={{marginBottom: '10px'}}>
                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Trường Đại học</label>
                  <input type="text" required value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}}/>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Tên Ngành học</label>
                    <input type="text" required value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}}/>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Mã Ngành</label>
                    <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}}/>
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Khối xét tuyển</label>
                    <input type="text" required value={formData.blocks} onChange={e => setFormData({...formData, blocks: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: A00, A01, D01"/>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Chỉ tiêu</label>
                    {/* 🚀 LỚP BẢO VỆ 1: CHỈ CHO PHÉP NHẬP SỐ DƯƠNG, CHẶN GÕ CHỮ */}
                    <input 
                      type="number" 
                      min="1"
                      step="1"
                      required
                      value={formData.quota} 
                      onChange={e => setFormData({...formData, quota: e.target.value})} 
                      onKeyDown={(e) => {
                        // Chặn các phím có thể nhập dưới dạng text trong thẻ number
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '13px', color: '#9f1239'}}>Điểm chuẩn đầu vào</h4>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#e11d48'}}>Thi THPT</label>
                    <input type="number" step="0.01" value={formData.score_thpt} onChange={e => setFormData({...formData, score_thpt: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: 26.5"/>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#16a34a'}}>Học bạ</label>
                    <input type="number" step="0.01" value={formData.score_hocba} onChange={e => setFormData({...formData, score_hocba: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: 28.0"/>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#a855f7'}}>ĐGNL</label>
                    <input type="number" value={formData.score_dgnl} onChange={e => setFormData({...formData, score_dgnl: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: 950"/>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '13px', color: '#166534'}}>Các phương thức khác</h4>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#0284c7'}}>Tuyển kết hợp</label>
                    <input type="text" value={formData.combo_cert || ''} onChange={e => setFormData({...formData, combo_cert: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: IELTS 6.5 + Toán"/>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#d97706'}}>Tuyển thẳng</label>
                    <input type="text" value={formData.direct_admission || ''} onChange={e => setFormData({...formData, direct_admission: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="Giải QG, Tỉnh..."/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#4f46e5'}}>Thi năng khiếu</label>
                  <input type="text" value={formData.aptitude_test || ''} onChange={e => setFormData({...formData, aptitude_test: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="Vẽ, Hát, Thể thao..."/>
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{padding: '10px 15px', background: '#f1f5f9', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Hủy</button>
                <button type="submit" style={{padding: '10px 15px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'}}><Save size={16}/> Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionManagement;