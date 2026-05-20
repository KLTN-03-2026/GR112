import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, FileText, Eye, BookOpen, Award, 
  CheckCircle2, X, Save, Compass, Star, Users, Download, Mail, Send, Clock 
} from 'lucide-react';
import Swal from 'sweetalert2'; 
import './AdminContent.css';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('articles');

  // ==========================================
  // 1. STATE & LOGIC CHO QUẢN LÝ BÀI VIẾT
  // ==========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Cẩm nang định hướng', categoryCode: 'cam-nang',
    status: 'Bản nháp', image: '', content: ''
  });

  const fetchArticles = async () => {
    try {
      const res = await fetch('https://gr112.onrender.com/api/admin/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách bài viết:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || article.categoryCode === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleDelete = async (id, title) => {
    Swal.fire({
      title: 'Xóa bài viết?',
      text: `Bạn có chắc chắn muốn xóa bài viết: "${title}"? Dữ liệu không thể khôi phục!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa vĩnh viễn',
      cancelButtonText: 'Hủy bỏ',
      customClass: { popup: 'my-swal-rounded' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://gr112.onrender.com/api/admin/articles/${id}`, { method: 'DELETE' });
          if (res.ok) {
            Swal.fire({ title: 'Đã xóa!', text: 'Bài viết đã được xóa thành công.', icon: 'success', timer: 1500, showConfirmButton: false });
            fetchArticles();
          }
        } catch (error) {
          Swal.fire('Lỗi!', 'Lỗi kết nối Server!', 'error');
        }
      }
    });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    let code = 'cam-nang';
    if(val === 'Thông tin học bổng') code = 'hoc-bong';
    if(val === 'Hướng dẫn tuyển sinh') code = 'tuyen-sinh';
    if(val === 'Tin tức sự kiện') code = 'tin-tuc';
    if(val === 'Review Đại học') code = 'review-truong';
    if(val === 'Góc sinh viên') code = 'goc-sinh-vien';
    if(val === 'Tài liệu ôn thi') code = 'tai-lieu';
    setFormData({...formData, category: val, categoryCode: code});
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: '', category: 'Cẩm nang định hướng', categoryCode: 'cam-nang', status: 'Bản nháp', image: '', content: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title, category: article.category, categoryCode: article.categoryCode,
      status: article.status, image: article.image || '', content: article.content || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    const url = editingId ? `https://gr112.onrender.com/api/admin/articles/${editingId}` : 'https://gr112.onrender.com/api/admin/articles';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        Swal.fire({ title: 'Thành công!', text: editingId ? "Đã cập nhật bài viết!" : "Đã thêm bài viết mới!", icon: 'success', timer: 1500, showConfirmButton: false });
        setIsModalOpen(false);
        fetchArticles();
      } else {
        Swal.fire('Lỗi!', 'Có lỗi xảy ra, vui lòng thử lại!', 'error');
      }
    } catch (error) {
      Swal.fire('Lỗi!', 'Lỗi kết nối Server!', 'error');
    }
  };

  // ==========================================
  // 2. STATE & LOGIC CHO QUẢN LÝ BẢN TIN (NEWSLETTER)
  // ==========================================
  const [subscribers, setSubscribers] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('https://gr112.onrender.com/api/admin/subscribers');
      if(res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đăng ký:", error);
    }
  };

  // 🚀 ĐÃ FIX DỨT ĐIỂM: Lấy token chính xác và xử lý lỗi UI
  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    // 1. Lấy token để mở khóa API Admin
    const token = localStorage.getItem("token"); 

    if (!token) {
      Swal.fire('Chưa đăng nhập!', 'Không tìm thấy Token. Vui lòng đăng nhập lại với tài khoản Admin.', 'error');
      return;
    }

    if (!emailSubject || !emailBody) {
      Swal.fire('Thiếu thông tin!', 'Vui lòng nhập đầy đủ tiêu đề và nội dung Email.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Xác nhận gửi Mail',
      text: `Bạn có chắc chắn muốn gửi email này tới toàn bộ ${subscribers.length} người đăng ký không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Gửi ngay',
      cancelButtonText: 'Hủy bỏ',
      customClass: { popup: 'my-swal-rounded' } // Fix lỗi CSS borderRadius
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSending(true);
        setNewsletterMsg('');

        try {
          const res = await fetch('https://gr112.onrender.com/api/admin/broadcast', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // 👈 Gửi chìa khóa kèm theo request
            },
            body: JSON.stringify({ subject: emailSubject, content: emailBody })
          });

          // Nếu chìa khóa sai hoặc không có quyền Admin
          if (res.status === 401 || res.status === 403) {
             Swal.fire('Lỗi Quyền Hạn!', 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền Admin. Hãy đăng nhập lại!', 'error');
             setNewsletterMsg("Lỗi: Không có quyền truy cập (401/403)");
             setIsSending(false);
             return;
          }

          const data = await res.json();
          
          if (res.ok && data.success) {
            Swal.fire('Gửi thành công!', `Đã gửi mail tới ${subscribers.length} người dùng.`, 'success');
            setNewsletterMsg(` Thành công: ${data.message}`);
            setEmailSubject('');
            setEmailBody('');
          } else {
            Swal.fire('Có lỗi xảy ra!', data.message || "Lỗi không xác định từ Server", 'error');
            setNewsletterMsg(` Lỗi: ${data.message}`);
          }
        } catch (error) {
          Swal.fire('Lỗi hệ thống!', 'Lỗi mạng hoặc Server không phản hồi.', 'error');
          setNewsletterMsg(" Lỗi kết nối mạng!");
        } finally {
          setIsSending(false);
        }
      }
    });
  };

  useEffect(() => {
    fetchArticles();
    fetchSubscribers();
  }, []);

  return (
    <div className="admin-content-page fade-in">
      
      <div className="ac-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1>Quản lý Nội dung & Giao tiếp</h1>
          <p>Đăng tải bài viết và tương tác với người dùng qua hệ thống Bản tin.</p>
        </div>
        {activeTab === 'articles' && (
          <button className="ac-btn-add" onClick={handleOpenAdd}>
            <Plus size={18} /> Viết Bài Mới
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e2e8f0', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('articles')}
          style={{ 
            background: 'transparent', border: 'none', padding: '10px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
            color: activeTab === 'articles' ? '#4f46e5' : '#64748b',
            borderBottom: activeTab === 'articles' ? '3px solid #4f46e5' : '3px solid transparent',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <FileText size={20} /> Quản lý Bài viết
        </button>
        <button 
          onClick={() => setActiveTab('newsletter')}
          style={{ 
            background: 'transparent', border: 'none', padding: '10px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
            color: activeTab === 'newsletter' ? '#4f46e5' : '#64748b',
            borderBottom: activeTab === 'newsletter' ? '3px solid #4f46e5' : '3px solid transparent',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Mail size={20} /> Bản tin & Gửi Mail
        </button>
      </div>

      {activeTab === 'articles' && (
        <div className="fade-in">
          <div className="ac-stats-row">
            <div className="ac-stat-card">
              <div className="ac-stat-icon blue"><FileText size={28} /></div>
              <div className="ac-stat-info">
                <h3>{articles.length}</h3>
                <span>Tổng số bài viết</span>
              </div>
            </div>
            <div className="ac-stat-card">
              <div className="ac-stat-icon green"><CheckCircle2 size={28} /></div>
              <div className="ac-stat-info">
                <h3>{articles.filter(a => a.status === 'Đã xuất bản').length}</h3>
                <span>Đã xuất bản</span>
              </div>
            </div>
            <div className="ac-stat-card">
              <div className="ac-stat-icon orange"><Eye size={28} /></div>
              <div className="ac-stat-info">
                <h3>{articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString('vi-VN')}</h3>
                <span>Tổng lượt xem</span>
              </div>
            </div>
          </div>

          <div className="ac-table-container">
            <div className="ac-table-toolbar">
              <div className="ac-search-box">
                <Search size={18} color="#64748b" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm tiêu đề bài viết..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select className="ac-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">Tất cả chuyên mục</option>
                <option value="cam-nang">Cẩm nang định hướng</option>
                <option value="hoc-bong">Thông tin học bổng</option>
                <option value="tuyen-sinh">Hướng dẫn tuyển sinh</option>
                <option value="tin-tuc">Tin tức sự kiện</option>
                <option value="review-truong">Review Đại học</option>
                <option value="goc-sinh-vien">Góc sinh viên</option>
                <option value="tai-lieu">Tài liệu ôn thi</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ac-table">
                <thead>
                  <tr>
                    <th>Tiêu đề bài viết</th>
                    <th>Chuyên mục</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th>Lượt xem</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</td></tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Không tìm thấy bài viết nào.</td></tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <div className="ac-article-info">
                            <img src={article.image} alt="thumbnail" className="ac-article-img" />
                            <div>
                              <span className="ac-article-title" title={article.title}>{article.title}</span>
                              <span className="ac-article-meta">ID: #{article.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`ac-category-badge ${article.categoryCode}`}>
                            {article.categoryCode === 'hoc-bong' && <Award size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'tuyen-sinh' && <BookOpen size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'cam-nang' && <Compass size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'tin-tuc' && <FileText size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'review-truong' && <Star size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'goc-sinh-vien' && <Users size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.categoryCode === 'tai-lieu' && <Download size={12} style={{marginRight: '4px', marginBottom: '-2px'}}/>}
                            {article.category}
                          </span>
                        </td>
                        <td><span style={{color: '#64748b'}}>{article.date}</span></td>
                        <td>
                          <span className={`ac-status-badge ${article.status === 'Đã xuất bản' ? 'published' : 'draft'}`}>
                            <span style={{width: '6px', height: '6px', borderRadius: '50%', background: article.status === 'Đã xuất bản' ? '#10b981' : '#94a3b8'}}></span>
                            {article.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#475569' }}>
                            <Eye size={14} color="#94a3b8" /> {(article.views || 0).toLocaleString('vi-VN')}
                          </div>
                        </td>
                        <td>
                          <div className="ac-actions">
                            <button className="ac-btn-icon ac-btn-edit" title="Chỉnh sửa bài viết" onClick={() => handleOpenEdit(article)}>
                              <Edit size={16} />
                            </button>
                            <button className="ac-btn-icon ac-btn-delete" title="Xóa bài viết" onClick={() => handleDelete(article.id, article.title)}>
                              <Trash2 size={16} />
                            </button>
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

      {activeTab === 'newsletter' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
          
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <Send size={20} style={{ marginRight: '8px', color: '#4f46e5' }}/>
              Trạm Gửi Mail Hàng Loạt
            </h3>
            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Tiêu đề thư (Subject)</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="VD: Cập nhật học bổng mới nhất tháng 10!"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  disabled={isSending}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Nội dung (Hỗ trợ thẻ HTML cơ bản)</label>
                <textarea 
                  rows="10"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Nhập nội dung email vào đây. Bạn có thể dùng <br> để xuống dòng, <b>chữ đậm</b>..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                  disabled={isSending}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSending || subscribers.length === 0}
                style={{ 
                  background: isSending ? '#94a3b8' : '#4f46e5', color: 'white', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', border: 'none', cursor: isSending ? 'wait' : 'pointer', transition: '0.3s' 
                }}
              >
                {isSending ? 'Đang gửi...' : ` Gửi tới toàn bộ ${subscribers.length} người`}
              </button>
              {newsletterMsg && <p style={{ fontWeight: 'bold', color: newsletterMsg.includes('Lỗi') ? '#ef4444' : '#10b981', textAlign: 'center' }}>{newsletterMsg}</p>}
            </form>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><Users size={20} style={{ marginRight: '8px', color: '#4f46e5' }}/> Danh sách Đăng ký</span>
              <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Tổng: {subscribers.length}</span>
            </h3>
            
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '480px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th style={{ padding: '12px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontSize: '0.9rem' }}>#</th>
                    <th style={{ padding: '12px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontSize: '0.9rem' }}>Email</th>
                    <th style={{ padding: '12px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontSize: '0.9rem' }}><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Ngày Đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, index) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>{index + 1}</td>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>{sub.email}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>{sub.subscribed_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subscribers.length === 0 && <p style={{ textAlign: 'center', marginTop: '30px', color: '#94a3b8' }}>Chưa có người đăng ký nào.</p>}
            </div>
          </div>

        </div>
      )}

      {isModalOpen && activeTab === 'articles' && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-content fade-in">
            <div className="ac-modal-header">
              <h2>{editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h2>
              <button className="ac-close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveArticle}>
              <div className="ac-modal-body">
                <div className="ac-form-group">
                  <label>Tiêu đề bài viết</label>
                  <input type="text" className="ac-input" required placeholder="Nhập tiêu đề..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div style={{display: 'flex', gap: '15px'}}>
                  <div className="ac-form-group" style={{flex: 1}}>
                    <label>Chuyên mục</label>
                    <select className="ac-input" value={formData.category} onChange={handleCategoryChange}>
                      <option value="Cẩm nang định hướng">Cẩm nang định hướng</option>
                      <option value="Thông tin học bổng">Thông tin học bổng</option>
                      <option value="Hướng dẫn tuyển sinh">Hướng dẫn tuyển sinh</option>
                      <option value="Tin tức sự kiện">Tin tức sự kiện</option>
                      <option value="Review Đại học">Review Đại học</option>
                      <option value="Góc sinh viên">Góc sinh viên</option>
                      <option value="Tài liệu ôn thi">Tài liệu ôn thi</option>
                    </select>
                  </div>
                  <div className="ac-form-group" style={{flex: 1}}>
                    <label>Trạng thái</label>
                    <select className="ac-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Bản nháp">Bản nháp</option>
                      <option value="Đã xuất bản">Xuất bản ngay</option>
                    </select>
                  </div>
                </div>

                <div className="ac-form-group">
                  <label>Link ảnh thu nhỏ (URL)</label>
                  <input type="url" className="ac-input" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>

                <div className="ac-form-group">
                  <label>Nội dung tóm tắt / Nội dung bài viết</label>
                  <textarea className="ac-input" rows="4" placeholder="Nhập nội dung bài viết vào đây..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                </div>
              </div>
              <div className="ac-modal-footer">
                <button type="button" className="ac-btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="ac-btn-save"><Save size={16}/> {editingId ? 'Cập nhật' : 'Đăng bài'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminContent;