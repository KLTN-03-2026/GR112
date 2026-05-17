import React, { useState, useEffect } from 'react';
import './ExamBlockManagement.css';
import { 
  Layers, Plus, Trash2, Edit, Search, 
  BookOpen, CheckCircle, AlertCircle, X, Save
} from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2

const ExamBlockManagement = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // LỌC & TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  
  // 🚀 STATE FORM (Đã thêm trường type)
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', subjects: '', description: '', type: 'Tự nhiên' });

  const token = localStorage.getItem('token');

  // LẤY DỮ LIỆU TỪ API
  const fetchBlocks = () => {
    setLoading(true);
    fetch('https://gr112.onrender.com/api/admin/exam-blocks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlocks(data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchBlocks(); }, []);

  // XỬ LÝ LỌC
  const filteredBlocks = blocks.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        b.subjects.join(', ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'Tất cả' || b.type.includes(typeFilter);
    return matchSearch && matchType;
  });

  // MỞ FORM
  const openForm = (editData = null) => {
    if (editData) {
      setFormData({ 
        id: editData.id, 
        name: editData.name, 
        subjects: editData.subjects.join(', '), 
        description: editData.description || '',
        type: editData.type || 'Tự nhiên' // 🚀 Load type từ dữ liệu cũ lên
      });
    } else {
      setFormData({ id: null, name: '', subjects: '', description: '', type: 'Tự nhiên' });
    }
    setShowFormModal(true);
  };

  // LƯU DỮ LIỆU (THÊM/SỬA) 🚀 ĐÃ THAY BẰNG SWEETALERT2
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = formData.id ? `https://gr112.onrender.com/api/admin/exam-blocks/${formData.id}` : 'https://gr112.onrender.com/api/admin/exam-blocks';
    const method = formData.id ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if(res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã lưu thông tin Khối thi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowFormModal(false);
        fetchBlocks();
      } else {
        Swal.fire({
          title: 'Lỗi!',
          text: 'Có lỗi xảy ra, vui lòng kiểm tra lại (mã khối có thể đã bị trùng).',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }).catch(err => {
      Swal.fire('Lỗi kết nối!', 'Không thể kết nối đến máy chủ.', 'error');
    });
  };

  // XÓA 🚀 ĐÃ THAY BẰNG SWEETALERT2
  const handleDelete = (id, usage) => {
    if (usage > 0) {
      Swal.fire({
        title: 'Không thể xóa!',
        text: 'Đang có ngành học sử dụng khối này. Vui lòng gỡ khối khỏi các ngành trước khi xóa!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b' // Màu cam cảnh báo
      });
      return;
    }
    
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa khối ${id} không? Dữ liệu không thể khôi phục!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://gr112.onrender.com/api/admin/exam-blocks/${id}`, { 
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
        })
        .then(res => { 
          if(res.ok) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Khối thi đã được xóa thành công.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchBlocks(); 
          }
        }).catch(err => {
          Swal.fire('Lỗi kết nối!', 'Không thể xóa bản ghi.', 'error');
        });
      }
    });
  };

  return (
    <div className="eb-container fade-in">
      <header className="eb-header">
        <div className="eb-header-left">
          <div className="eb-icon-box"><Layers size={22} /></div>
          <div>
            <h1>Quản lý Khối thi</h1>
            <p>Định nghĩa danh mục khối thi và các môn học thành phần cho hệ thống.</p>
          </div>
        </div>
        <button className="btn-add-block" onClick={() => openForm(null)}><Plus size={18} /> Thêm khối mới</button>
      </header>

      <div className="eb-content-grid">
        <div className="eb-table-section">
          <div className="eb-toolbar">
            <div className="eb-search">
              <Search size={18} />
              <input type="text" placeholder="Tìm mã khối hoặc môn học..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="eb-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="Tất cả">Tất cả nhóm ngành</option>
              <option value="Tự nhiên">Khối Tự nhiên</option>
              <option value="Xã hội">Khối Xã hội</option>
              <option value="Năng khiếu">Năng khiếu / Khác</option>
            </select>
          </div>

          <div className="eb-card">
            {loading ? <p style={{textAlign: 'center', padding: '30px'}}>Đang tải dữ liệu từ CSDL...</p> : (
              <table className="eb-table">
                <thead>
                  <tr>
                    <th>Mã Khối</th>
                    <th>Tổ hợp môn</th>
                    <th>Phân loại</th>
                    <th>Mô tả chi tiết</th>
                    <th>Sử dụng</th>
                    <th style={{textAlign: 'center'}}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlocks.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Không có dữ liệu</td></tr> : 
                    filteredBlocks.map(block => (
                    <tr key={block.id}>
                      <td className="eb-name"><strong style={{color: '#0f172a'}}>{block.name}</strong></td>
                      <td>
                        <div className="eb-subject-tags">
                          {block.subjects.map(s => <span key={s} className="s-tag" style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px', display: 'inline-block', marginBottom: '4px'}}>{s}</span>)}
                        </div>
                      </td>
                      <td>
                        <span className={`eb-type ${block.type === 'Tự nhiên' ? 'blue' : (block.type === 'Xã hội' ? 'orange' : 'purple')}`} style={{background: block.type === 'Tự nhiên' ? '#e0f2fe' : (block.type === 'Xã hội' ? '#ffedd5' : '#f3e8ff'), color: block.type === 'Tự nhiên' ? '#0369a1' : (block.type === 'Xã hội' ? '#c2410c' : '#7e22ce'), padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'}}>
                          {block.type}
                        </span>
                      </td>
                      <td style={{fontSize: '12px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={block.description}>
                        {block.description || '-'}
                      </td>
                      <td className="eb-usage">
                        <strong style={{color: block.usage > 0 ? '#10b981' : '#94a3b8'}}>{block.usage}</strong> ngành
                      </td>
                      <td className="eb-actions" style={{textAlign: 'center'}}>
                        <button className="btn-edit" onClick={() => openForm(block)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '10px'}}><Edit size={16}/></button>
                        <button className="btn-delete" onClick={() => handleDelete(block.id, block.usage)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="eb-sidebar">
          <div className="eb-guide-card" style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '16px', color: '#0f172a'}}><BookOpen size={18} color="#3b82f6"/> Hướng dẫn</h3>
            <ul style={{listStyle: 'none', padding: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6'}}>
              <li style={{display: 'flex', gap: '8px', marginBottom: '10px'}}><CheckCircle size={16} color="#10b981" style={{flexShrink: 0, marginTop: '2px'}}/> Mã khối (A00, B00...) đóng vai trò là Khóa chính trong CSDL.</li>
              <li style={{display: 'flex', gap: '8px', marginBottom: '10px'}}><CheckCircle size={16} color="#10b981" style={{flexShrink: 0, marginTop: '2px'}}/> Phân loại khối thi (Tự nhiên, Xã hội) giúp hệ thống phân tích và gợi ý ngành nghề chính xác hơn.</li>
              <li style={{display: 'flex', gap: '8px'}}><AlertCircle size={16} color="#f59e0b" style={{flexShrink: 0, marginTop: '2px'}}/> Không thể xóa khối thi nếu có trên 0 ngành học đang sử dụng.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* MODAL FORM NHẬP LIỆU */}
      {showFormModal && (
        <div className="cm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="cm-modal-content" style={{ background: '#fff', width: '480px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{margin: 0, color: '#0f172a'}}>{formData.id ? 'Sửa Khối thi' : 'Thêm mới Khối thi'}</h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              
              {/* 🚀 CHIA CỘT CHO MÃ KHỐI VÀ PHÂN LOẠI */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Mã Khối (*)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                    disabled={formData.id !== null} 
                    style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: formData.id ? '#f1f5f9' : 'white'}} 
                    placeholder="VD: A00"
                  />
                </div>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Phân loại</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})} 
                    style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', background: 'white'}}
                  >
                    <option value="Tự nhiên">Tự nhiên</option>
                    <option value="Xã hội">Xã hội</option>
                    <option value="Năng khiếu">Năng khiếu / Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Tổ hợp môn (Ngăn cách bằng dấu phẩy)</label>
                <input type="text" required value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px'}} placeholder="VD: Toán, Vật lý, Hóa học"/>
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}}>Mô tả chi tiết khối thi</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '5px', resize: 'vertical'}} placeholder="VD: Khối thi nền tảng cho các ngành Kỹ thuật..."></textarea>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{padding: '10px 15px', background: '#f1f5f9', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Hủy</button>
                <button type="submit" style={{padding: '10px 15px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'}}><Save size={16}/> Lưu dữ liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamBlockManagement;