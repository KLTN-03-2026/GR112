import React from 'react';
import { Award, Calendar, DollarSign, ArrowRight } from 'lucide-react';

const mockScholarships = [
  { id: 1, name: 'Học bổng Tài năng Trẻ 2026', school: 'Đại học Công nghệ - ĐHQGHN', value: '100% Học phí', deadline: '30/06/2026', tag: 'HOT', color: '#ef4444' },
  { id: 2, name: 'Học bổng Khuyến khích Nữ sinh IT', school: 'Đại học Bách Khoa Hà Nội', value: '50% Học phí', deadline: '15/07/2026', tag: 'MỚI', color: '#3b82f6' },
  { id: 3, name: 'Học bổng Chắp cánh Tương lai', school: 'Đại học FPT', value: '30 - 100% Học phí', deadline: '20/08/2026', tag: 'ĐANG MỞ', color: '#10b981' },
];

const Scholarship = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.2rem', marginBottom: '10px' }}>Săn Học Bổng 2026 🎓</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Khám phá các cơ hội học bổng giá trị từ các trường Đại học Top đầu.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {mockScholarships.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ background: item.color, color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>{item.tag}</span>
                {/* Đã gắn icon Award (Cúp) vào tiêu đề */}
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={20} color="#d97706" /> {item.name}
                </h3>
              </div>
              <p style={{ color: '#3b5998', fontWeight: '600', margin: '0 0 15px 0' }}>{item.school}</p>
              
              <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                {/* Đã sử dụng icon DollarSign cho phần Trị giá */}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={16} color="#10b981" /> Trị giá: <strong style={{ color: '#0f172a' }}>{item.value}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={16} /> Hạn chót: {item.deadline}
                </span>
              </div>
            </div>

            <div>
              <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseOver={(e) => {e.currentTarget.style.background = '#3b5998'; e.currentTarget.style.color = 'white'}}
                      onMouseOut={(e) => {e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'}}>
                Xem chi tiết <ArrowRight size={16} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Scholarship;