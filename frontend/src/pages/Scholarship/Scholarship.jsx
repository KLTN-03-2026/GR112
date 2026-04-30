import React, { useState, useEffect } from 'react';
import { Award, Calendar, DollarSign, ArrowRight, Loader2,Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Scholarship = () => {
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        // Gọi API lấy toàn bộ bài viết đã xuất bản
        const res = await fetch('http://localhost:8000/api/articles');
        if (res.ok) {
          const data = await res.json();
          // LỌC: Chỉ lấy những bài thuộc chuyên mục 'hoc-bong'
          const scholarshipData = data.filter(item => item.categoryCode === 'hoc-bong');
          setScholarships(scholarshipData);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu học bổng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.2rem', marginBottom: '10px' }}>Săn Học Bổng 2026 </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Khám phá các cơ hội học bổng giá trị từ các trường Đại học Top đầu.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Loader2 className="fa-spin" size={32} color="#3b82f6" />
          <p>Đang tải dữ liệu học bổng...</p>
        </div>
      ) : scholarships.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          Hiện chưa có thông tin học bổng nào được đăng tải.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {scholarships.map((item, index) => {
            // Tự động gán màu Tag ngẫu nhiên cho đẹp mắt
            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
            const tagColor = colors[index % colors.length];

            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ background: tagColor, color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                      HOT
                    </span>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={20} color="#d97706" /> {item.title}
                    </h3>
                  </div>
                  
                  {/* Vì bảng Article của bạn chưa có cột School, Value, Deadline riêng nên mình sẽ dùng nội dung trích xuất hoặc text mặc định */}
                  <p style={{ color: '#3b5998', fontWeight: '600', margin: '0 0 15px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Thông tin từ: MindConnect
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={16} color="#10b981" /> Trị giá: <strong style={{ color: '#0f172a' }}>Xem trong bài</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={16} /> Ngày đăng: {item.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={16} /> Lượt quan tâm: {item.views}
                    </span>
                  </div>
                </div>

                <div>
                  <Link to={`/article/${item.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}
                            onMouseOver={(e) => {e.currentTarget.style.background = '#3b5998'; e.currentTarget.style.color = 'white'}}
                            onMouseOut={(e) => {e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'}}>
                      Xem chi tiết <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Scholarship;