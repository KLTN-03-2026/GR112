import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Eye, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import './AdminContent.css';

const AdminContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dữ liệu MẪU cho Quản lý Bài viết (Sau này gọi API thay vào đây)
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Bí kíp đạt 900+ ĐGNL Đại học Quốc gia',
      category: 'Cẩm nang định hướng',
      categoryCode: 'cam-nang',
      date: '26/04/2026',
      status: 'Đã xuất bản',
      views: 1250,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=80'
    },
    {
      id: 2,
      title: 'Tổng hợp các gói học bổng toàn phần ngành IT 2026',
      category: 'Thông tin học bổng',
      categoryCode: 'hoc-bong',
      date: '24/04/2026',
      status: 'Bản nháp',
      views: 0,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80'
    },
    {
      id: 3,
      title: 'Hướng dẫn xét tuyển bằng học bạ (GPA) cực chuẩn',
      category: 'Hướng dẫn tuyển sinh',
      categoryCode: 'tuyen-sinh',
      date: '20/04/2026',
      status: 'Đã xuất bản',
      views: 3420,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80'
    }
  ]);

  // Hàm lọc bài viết
  const filteredArticles = articles.filter(article => {
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || article.categoryCode === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}"?`)) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  return (
    <div className="admin-content-page fade-in">
      
      <div className="ac-header">
        <div>
          <h1>Quản lý Nội dung & Bài viết</h1>
          <p>Đăng tải, chỉnh sửa cẩm nang định hướng, thông tin học bổng và tuyển sinh.</p>
        </div>
        <button className="ac-btn-add">
          <Plus size={18} /> Viết Bài Mới
        </button>
      </div>

      {/* THỐNG KÊ NHANH */}
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
            <h3>{articles.reduce((sum, a) => sum + a.views, 0).toLocaleString('vi-VN')}</h3>
            <span>Tổng lượt xem</span>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU BÀI VIẾT */}
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
          
          <select 
            className="ac-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tất cả chuyên mục</option>
            <option value="cam-nang">Cẩm nang định hướng</option>
            <option value="hoc-bong">Thông tin học bổng</option>
            <option value="tuyen-sinh">Hướng dẫn tuyển sinh</option>
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
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
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
                        <Eye size={14} color="#94a3b8" /> {article.views.toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td>
                      <div className="ac-actions">
                        <button className="ac-btn-icon ac-btn-edit" title="Chỉnh sửa bài viết">
                          <Edit size={16} />
                        </button>
                        <button 
                          className="ac-btn-icon ac-btn-delete" 
                          title="Xóa bài viết"
                          onClick={() => handleDelete(article.id, article.title)}
                        >
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
  );
};

export default AdminContent;