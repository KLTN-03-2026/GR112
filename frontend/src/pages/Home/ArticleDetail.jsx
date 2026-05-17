import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Eye, ChevronLeft, Calendar, Tag } from 'lucide-react';

const ArticleDetail = () => {
  const { id } = useParams(); // Lấy ID bài viết từ thanh địa chỉ
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://gr112.onrender.com/api/articles/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        } else {
          alert("Không tìm thấy bài viết!");
          navigate('/handbook');
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
    // Cuộn lên đầu trang khi vào xem bài
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>Đang mở cẩm nang...</div>;
  if (!article) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent',
            color: '#64748b', cursor: 'pointer', marginBottom: '20px', fontWeight: '600'
          }}
        >
          <ChevronLeft size={20} /> Quay lại
        </button>

        <article style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          {/* Ảnh bìa bài viết */}
          <img 
            src={article.image} 
            alt={article.title} 
            style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
          />

          <div style={{ padding: '40px' }}>
            {/* Tag chuyên mục */}
            <span style={{ 
              background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px', 
              borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700' 
            }}>
              {article.category}
            </span>

            <h1 style={{ fontSize: '2.5rem', color: '#0f172a', margin: '20px 0', lineHeight: '1.2' }}>
              {article.title}
            </h1>

            {/* Thông tin phụ */}
            <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> {article.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} /> {article.views} lượt xem
              </span>
            </div>

            {/* Nội dung bài viết */}
            <div style={{ 
              fontSize: '1.15rem', color: '#334155', lineHeight: '1.8', 
              whiteSpace: 'pre-line', // Giúp xuống dòng đúng như lúc Admin nhập
              textAlign: 'justify' 
            }}>
              {article.content}
            </div>

            {/* Kết bài */}
            <div style={{ marginTop: '50px', padding: '30px', background: '#f1f5f9', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: '600', color: '#475569' }}>
                Hy vọng bài viết này giúp ích cho lộ trình định hướng của bạn! 🚀
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;