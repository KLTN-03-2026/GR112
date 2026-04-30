import React, { useState, useEffect } from 'react';
import './ContentManagement.css';
import { 
  BrainCircuit, MessageSquare, BarChart3, 
  Star, Check, EyeOff, Trash2, ChevronDown, Sparkles,
  Edit3, X, Save, Building2, UserCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const ContentManagement = () => {
  // --- STATE CHO QUẢN LÝ CÂU HỎI ---
  const [showModal, setShowModal] = useState(false);
  const [currentType, setCurrentType] = useState(''); 
  const [questions, setQuestions] = useState([]);
  const [editingQ, setEditingQ] = useState(null);
  
  // State cho form nhập liệu
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);

  // --- STATE CHO QUẢN LÝ REVIEW ---
  const [activeReviewTab, setActiveReviewTab] = useState('university'); // 'university' hoặc 'mentor'
  const [reviews, setReviews] = useState([]); 

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
      Swal.fire({
        title: 'Cảnh báo kết nối!',
        text: 'Chưa kết nối được với Server Python! Nhưng bảng quản lý vẫn sẽ mở.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
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
      
      Swal.fire({
        title: 'Thành công!',
        text: editingQ ? 'Đã cập nhật câu hỏi!' : 'Đã thêm câu hỏi mới!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
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
      Swal.fire('Lỗi!', 'Không thể lưu câu hỏi.', 'error');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xóa câu hỏi?',
      text: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`http://localhost:8000/api/admin/questions/${id}`, { method: 'DELETE' });
          
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Câu hỏi đã bị xóa khỏi hệ thống.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          const res = await fetch(`http://localhost:8000/api/admin/questions?type=${currentType}`);
          if (res.ok) {
              const data = await res.json();
              setQuestions(data);
          }
          fetchTotalQuestions();
        } catch (e) {
          console.error("Lỗi xóa câu hỏi:", e);
          Swal.fire('Lỗi kết nối!', 'Không thể xóa câu hỏi lúc này.', 'error');
        }
      }
    });
  };

  // ==========================================
  // 🚀 ĐÃ FIX: HÀM XỬ LÝ API QUẢN LÝ REVIEW
  // ==========================================
  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews?type=${activeReviewTab}`);
      const data = await res.json();
      
      // 🚀 BẬT RADAR: In ra F12 xem Python gửi cái gì sang
      console.log(`[DEBUG] API trả về cho tab ${activeReviewTab}:`, data);

      if (res.ok) {
        // 🚀 BỘ LỌC AN TOÀN: Kiểm tra xem data có phải là Mảng không
        if (Array.isArray(data)) {
            setReviews(data);
        } else if (data.reviews && Array.isArray(data.reviews)) {
            setReviews(data.reviews); // Đề phòng Python bọc trong key "reviews"
        } else {
            console.warn("Dữ liệu không phải là mảng, ép về mảng rỗng:", data);
            setReviews([]);
        }
      } else {
        console.error("Lỗi từ Server:", data);
        setReviews([]);
      }
    } catch (e) {
      console.error("Lỗi kết nối khi lấy danh sách review:", e);
      setReviews([]); // Đứt mạng cũng không được sập web
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeReviewTab]);

  const handleReviewAction = async (action, id) => {
    if (action === 'delete') {
      const result = await Swal.fire({
        title: 'Xóa đánh giá?',
        text: "CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này khỏi Database?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Xóa vĩnh viễn',
        cancelButtonText: 'Hủy bỏ',
        borderRadius: '16px'
      });
      if (!result.isConfirmed) return; 
    }

    try {
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const bodyPayload = action === 'delete' ? null : JSON.stringify({ action: action, type: activeReviewTab });

      const res = await fetch(`http://localhost:8000/api/admin/reviews/${id}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: bodyPayload
      });

      if (res.ok) {
        Swal.fire({
          title: 'Thành công!',
          text: action === 'delete' ? 'Đã xóa đánh giá.' : 'Đã cập nhật trạng thái đánh giá.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchReviews();
      } else {
        Swal.fire('Lỗi!', 'Có lỗi xảy ra từ Server!', 'error');
      }
    } catch (e) {
      console.error("Lỗi thao tác Review:", e);
      Swal.fire('Lỗi kết nối!', 'Lỗi kết nối Server!', 'error');
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

        <div className="cm-q-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          
          <div className="cm-q-card stat">
            <span>TỔNG CÂU HỎI</span>
            <h3>{totalQuestions} <small style={{color: '#64748b', fontSize: '14px', fontWeight: 'normal'}}>Câu</small></h3>
            <BarChart3 size={32} className="card-bg-icon" />
          </div>

          <div className="cm-q-card category" onClick={() => openManagement('holland')} style={{cursor: 'pointer'}}>
            <div className="cat-badge">HOLLAND</div>
            <h4>Nhóm Realistic</h4>
            <p>Câu hỏi trắc nghiệm ngành nghề</p>
            <span className="cat-time" style={{color: '#4f46e5', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          <div className="cm-q-card category mbti" onClick={() => openManagement('mbti')} style={{cursor: 'pointer'}}>
            <div className="cat-badge mbti">MBTI</div>
            <h4>Nhóm Hướng nội (I)</h4>
            <p>Câu hỏi trắc nghiệm tính cách</p>
            <span className="cat-time" style={{color: '#a855f7', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          <div className="cm-q-card category" onClick={() => openManagement('mindset')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#dcfce7', color: '#15803d'}}>MINDSET</div>
            <h4>Growth Mindset</h4>
            <p>Câu hỏi đánh giá tư duy phát triển</p>
            <span className="cat-time" style={{color: '#15803d', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          <div className="cm-q-card category" onClick={() => openManagement('grit')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#ffedd5', color: '#c2410c'}}>GRIT</div>
            <h4>Chỉ số kiên trì</h4>
            <p>Câu hỏi đo lường sự bền bỉ</p>
            <span className="cat-time" style={{color: '#c2410c', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

          <div className="cm-q-card category" onClick={() => openManagement('mi')} style={{cursor: 'pointer'}}>
            <div className="cat-badge" style={{background: '#ffe4e6', color: '#be123c'}}>ĐA TRÍ TUỆ</div>
            <h4>Multiple Intelligences</h4>
            <p>Đánh giá 8 loại hình thông minh</p>
            <span className="cat-time" style={{color: '#be123c', fontWeight: 'bold'}}>Bấm để quản lý &rarr;</span>
          </div>

        </div>
      </section>

      {/* SECTION 2: KIỂM DUYỆT REVIEW KÉP */}
      <section className="cm-section" style={{marginTop: '40px'}}>
        <div className="cm-section-header" style={{ alignItems: 'flex-start' }}>
          <div className="cm-title-group">
            <div className="cm-icon-box review-bg"><MessageSquare size={20} /></div>
            <div>
              <h2>Kiểm duyệt Đánh giá (Reviews)</h2>
              <p>Kiểm duyệt các luồng ý kiến từ học sinh/sinh viên trên hệ thống.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setActiveReviewTab('university')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                background: activeReviewTab === 'university' ? 'white' : 'transparent',
                color: activeReviewTab === 'university' ? '#0f172a' : '#64748b',
                boxShadow: activeReviewTab === 'university' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Building2 size={16} /> Đánh giá Trường ĐH
            </button>
            <button 
              onClick={() => setActiveReviewTab('mentor')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                background: activeReviewTab === 'mentor' ? 'white' : 'transparent',
                color: activeReviewTab === 'mentor' ? '#0f172a' : '#64748b',
                boxShadow: activeReviewTab === 'mentor' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <UserCircle size={16} /> Đánh giá Cố vấn
            </button>
          </div>
        </div>

        <div className="cm-review-list">
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Chưa có đánh giá nào hoặc đang kết nối Server...</p>
            </div>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="cm-review-card">
                <div className="cm-rev-user">
                  <div className="cm-rev-avatar" style={{background: activeReviewTab === 'university' ? '#3b82f6' : '#8b5cf6'}}>{(rev.name || 'U').charAt(0)}</div>
                  <div className="cm-rev-info">
                    <strong>{rev.name} <span style={{color: activeReviewTab === 'university' ? '#3b82f6' : '#8b5cf6'}}>• {rev.target}</span></strong>
                    <small>{rev.role}</small>
                    <p>{rev.content}</p>
                    <div className="cm-rev-meta">
                      <span className="time">{rev.time}</span>
                      {rev.verified && <span className="verified"><Check size={12}/> Đã xác thực</span>}
                      
                      {rev.status === 'published' && <span style={{fontSize: '0.75rem', color: '#10b981', marginLeft: '10px'}}>(Đã xuất bản)</span>}
                      {rev.status === 'hidden' && <span style={{fontSize: '0.75rem', color: '#f59e0b', marginLeft: '10px'}}>(Đang ẩn)</span>}
                    </div>
                  </div>
                </div>
                <div className="cm-rev-actions">
                  <div className="cm-stars">
                     {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={12} fill="#fbbf24" stroke="none" />)}
                  </div>
                  <div className="cm-action-btns">
                    <button className="btn-ok" title="Duyệt xuất bản" onClick={() => handleReviewAction('approve', rev.id)}><Check size={16}/></button>
                    <button className="btn-hide" title="Ẩn nháp" onClick={() => handleReviewAction('hide', rev.id)}><EyeOff size={16}/></button>
                    <button className="btn-del" title="Xóa vĩnh viễn" onClick={() => handleReviewAction('delete', rev.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="btn-load-more">Tải thêm dữ liệu chờ duyệt <ChevronDown size={14}/></button>
      </section>

      {/* ==========================================
          MODAL QUẢN LÝ CÂU HỎI
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