import React, { useState, useEffect } from 'react';
import './ContentManagement.css';
import { 
  BrainCircuit, MessageSquare, BarChart3, 
  Star, Check, EyeOff, Trash2, ChevronDown, Sparkles,
  Edit3, X, Save
} from 'lucide-react';

const ContentManagement = () => {
  // --- STATE CHO QUẢN LÝ CÂU HỎI ---
  const [showModal, setShowModal] = useState(false);
  const [currentType, setCurrentType] = useState(''); 
  const [questions, setQuestions] = useState([]);
  const [editingQ, setEditingQ] = useState(null);
  
  // State cho form nhập liệu
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState('');

  // State lưu tổng số câu hỏi từ Database
  const [totalQuestions, setTotalQuestions] = useState(0);

  // --- DỮ LIỆU REVIEW GIẢ LẬP ---
  const reviews = [
    {
      id: 1, name: 'Nguyễn Minh Anh', role: 'SV NĂM 3', school: 'ĐH Bách Khoa TP.HCM',
      content: '"Môi trường học tập rất năng động nhưng áp lực học tập khá lớn..."',
      time: '2 giờ trước', verified: true, rating: 5
    },
    {
      id: 2, name: 'Trần Hoàng Long', role: 'CỰU SV', school: 'ĐH Kinh tế Quốc dân',
      content: '"Giảng viên rất tận tâm và giàu kinh nghiệm thực tế..."',
      time: '5 giờ trước', verified: false, rating: 5
    }
  ];

  // ==========================================
  // CÁC HÀM XỬ LÝ API CHO CÂU HỎI
  // ==========================================

  const fetchTotalQuestions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/questions-count');
      if (res.ok) {
        const data = await res.json();
        setTotalQuestions(data.total);
      }
    } catch (e) {
      console.error("Lỗi đếm số câu hỏi:", e);
    }
  };

  useEffect(() => {
    fetchTotalQuestions();
  }, []);
  
  const openManagement = async (type) => {
    setCurrentType(type);
    setShowModal(true); 
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/questions?type=${type}`);
      if (!res.ok) {
        console.error("API trả về lỗi:", res.status);
        return; 
      }
      const data = await res.json();
      setQuestions(data);
      resetForm();
    } catch (e) {
      console.error("Lỗi lấy câu hỏi:", e);
      alert("Chưa kết nối được với Server Python! Nhưng bảng quản lý vẫn sẽ mở.");
    }
  };

  const handleEditClick = (q) => {
    setEditingQ(q);
    setQText(q.text);
    setQCategory(q.category);
  };

  const resetForm = () => {
    setEditingQ(null);
    setQText('');
    setQCategory('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      id: editingQ?.id,
      quiz_type: currentType,
      text: qText,
      category: qCategory
    };

    try {
      await fetch('http://localhost:8000/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      resetForm();
      const res = await fetch(`http://localhost:8000/api/admin/questions?type=${currentType}`);
      if (res.ok) {
          const data = await res.json();
          setQuestions(data);
      }
      fetchTotalQuestions();
    } catch (e) {
      console.error("Lỗi lưu câu hỏi:", e);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      try {
        await fetch(`http://localhost:8000/api/admin/questions/${id}`, { method: 'DELETE' });
        const res = await fetch(`http://localhost:8000/api/admin/questions?type=${currentType}`);
        if (res.ok) {
            const data = await res.json();
            setQuestions(data);
        }
        fetchTotalQuestions();
      } catch (e) {
        console.error("Lỗi xóa câu hỏi:", e);
      }
    }
  };

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================
  return (
    <div className="cm-inner-content fade-in">
      {/* SECTION 1: QUẢN LÝ CÂU HỎI */}
      <section className="cm-section">
        <div className="cm-section-header">
          <div className="cm-title-group">
            <div className="cm-icon-box"><BrainCircuit size={20} /></div>
            <div>
              <h2>Quản lý Bộ câu hỏi Trắc nghiệm</h2>
              <p>Quản lý toàn bộ ngân hàng câu hỏi định hướng nghề nghiệp và tâm lý.</p>
            </div>
          </div>
        </div>

        {/* 🚀 LƯỚI DANH SÁCH CÁC BÀI TEST ĐÃ ĐƯỢC BỔ SUNG */}
        <div className="cm-q-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          
          {/* Card Thống Kê Tổng */}
          <div className="cm-q-card stat">
            <span>TỔNG CÂU HỎI</span>
            <h3>{totalQuestions} <small style={{color: '#64748b', fontSize: '14px', fontWeight: 'normal'}}>Câu</small></h3>
            <BarChart3 size={32} className="card-bg-icon" />
          </div>

          {/* 1. HOLLAND */}
          <div className="cm-q-card category" onClick={() => openManagement('holland')} style={{cursor: 'pointer'}}>
            <div className="cat-badge">HOLLAND</div>
            <h4>Nhóm Realistic</h4>
            <p>Câu hỏi trắc nghiệm ngành nghề</p>
            <span className="cat-time" style={{color: '#4f46e5', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          {/* 2. MBTI */}
          <div className="cm-q-card category mbti" onClick={() => openManagement('mbti')} style={{cursor: 'pointer'}}>
            <div className="cat-badge mbti">MBTI</div>
            <h4>Nhóm Hướng nội (I)</h4>
            <p>Câu hỏi trắc nghiệm tính cách</p>
            <span className="cat-time" style={{color: '#a855f7', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          {/* 🚀 3. BÀI TEST MINDSET MỚI */}
          <div className="cm-q-card category" onClick={() => openManagement('mindset')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#dcfce7', color: '#15803d'}}>MINDSET</div>
            <h4>Growth Mindset</h4>
            <p>Câu hỏi đánh giá tư duy phát triển</p>
            <span className="cat-time" style={{color: '#15803d', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          {/* 🚀 4. BÀI TEST GRIT MỚI */}
          <div className="cm-q-card category" onClick={() => openManagement('grit')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#ffedd5', color: '#c2410c'}}>GRIT</div>
            <h4>Chỉ số kiên trì</h4>
            <p>Câu hỏi đo lường sự bền bỉ</p>
            <span className="cat-time" style={{color: '#c2410c', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          {/* 🚀 5. BÀI TEST ĐA TRÍ TUỆ (MI) MỚI */}
          <div className="cm-q-card category" onClick={() => openManagement('mi')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#ffe4e6', color: '#be123c'}}>ĐA TRÍ TUỆ</div>
            <h4>Multiple Intelligences</h4>
            <p>Đánh giá 8 loại hình thông minh</p>
            <span className="cat-time" style={{color: '#be123c', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

        </div>
      </section>

      {/* SECTION 2: KIỂM DUYỆT REVIEW */}
      {/* ... Phần review này giữ nguyên hoàn toàn ... */}
      <section className="cm-section" style={{marginTop: '40px'}}>
        <div className="cm-section-header">
          <div className="cm-title-group">
            <div className="cm-icon-box review-bg"><MessageSquare size={20} /></div>
            <div>
              <h2>Kiểm duyệt Review (US-22)</h2>
              <p>Quản lý đánh giá từ sinh viên về các trường đại học.</p>
            </div>
          </div>
          <div className="cm-filter-tabs">
            <button className="active">Tất cả</button>
            <button>Chờ duyệt (24)</button>
          </div>
        </div>

        <div className="cm-review-list">
          {reviews.map(rev => (
            <div key={rev.id} className="cm-review-card">
              <div className="cm-rev-user">
                <div className="cm-rev-avatar">{rev.name.charAt(0)}</div>
                <div className="cm-rev-info">
                  <strong>{rev.name} <span>• {rev.school}</span></strong>
                  <small>{rev.role}</small>
                  <p>{rev.content}</p>
                  <div className="cm-rev-meta">
                    <span className="time">{rev.time}</span>
                    {rev.verified && <span className="verified"><Check size={12}/> Đã xác thực</span>}
                  </div>
                </div>
              </div>
              <div className="cm-rev-actions">
                <div className="cm-stars">
                   {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="#fbbf24" stroke="none" />)}
                </div>
                <div className="cm-action-btns">
                  <button className="btn-ok" title="Duyệt"><Check size={16}/></button>
                  <button className="btn-hide" title="Ẩn"><EyeOff size={16}/></button>
                  <button className="btn-del" title="Xóa"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-load-more">Tải thêm dữ liệu <ChevronDown size={14}/></button>
      </section>

      {/* ==========================================
          MODAL QUẢN LÝ CÂU HỎI NỔI LÊN (OVERLAY) 
          ========================================== */}
      {showModal && (
        <div className="cm-modal-overlay">
          <div className="cm-modal-content" style={{maxWidth: '800px', width: '90%'}}>
            <div className="modal-header">
              <div className="cm-title-group">
                <div className={`cm-icon-box ${currentType === 'mbti' ? 'review-bg' : ''}`}>
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 style={{margin: 0, textTransform: 'uppercase'}}>Quản lý câu hỏi {currentType}</h2>
                  <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Thêm, sửa, xóa trực tiếp vào CSDL.</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => {setShowModal(false); resetForm();}}><X size={24}/></button>
            </div>

            <form className="q-form" onSubmit={handleSave}>
              <input 
                type="text" 
                placeholder="Nhập nội dung câu hỏi..." 
                value={qText} 
                onChange={(e) => setQText(e.target.value)} 
                required 
                style={{flex: 1}}
              />
              <input 
                type="text" 
                placeholder="Phân loại (Ví dụ: POE, LING...)" 
                value={qCategory} 
                onChange={(e) => setQCategory(e.target.value)} 
                required 
                style={{width: '180px'}}
              />
              <button type="submit" className="btn-save-q">
                <Save size={16}/> {editingQ ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {editingQ && (
                <button type="button" className="btn-cancel-q" onClick={resetForm}>Hủy</button>
              )}
            </form>

            <div className="q-list-scroll">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th width="10%">ID</th>
                    <th width="60%">Nội dung câu hỏi</th>
                    <th width="15%">Nhóm</th>
                    <th width="15%">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Chưa có câu hỏi nào. (Hoặc mất kết nối Server)</td></tr>
                  ) : (
                    questions.map(q => (
                      <tr key={q.id}>
                        <td>#{q.id}</td>
                        <td>{q.text}</td>
                        <td>
                          <span className={`badge-type ${currentType}`} style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'}}>{q.category}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon edit" onClick={() => handleEditClick(q)} title="Sửa"><Edit3 size={16}/></button>
                            <button className="btn-icon del" onClick={() => handleDelete(q.id)} title="Xóa"><Trash2 size={16}/></button>
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
    </div>
  );
};

export default ContentManagement;