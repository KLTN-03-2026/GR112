import React from 'react';
import { Briefcase, Code, HeartPulse, TrendingUp, ArrowRight } from 'lucide-react';

const Guide = () => {
  const careers = [
    { title: 'Công nghệ thông tin', desc: 'Lập trình viên, AI Engineer, Data Scientist...', icon: <Code size={32} color="#3b82f6" />, bg: '#eff6ff' },
    { title: 'Kinh tế & Quản lý', desc: 'Marketing, Digital Business, Phân tích tài chính...', icon: <TrendingUp size={32} color="#10b981" />, bg: '#ecfdf5' },
    { title: 'Y Dược & Sức khỏe', desc: 'Bác sĩ, Dược sĩ, Kỹ thuật viên y khoa...', icon: <HeartPulse size={32} color="#ef4444" />, bg: '#fef2f2' },
    { title: 'Kỹ thuật & Công nghệ', desc: 'Tự động hóa, Vi mạch bán dẫn, Kỹ thuật ô tô...', icon: <Briefcase size={32} color="#f59e0b" />, bg: '#fffbeb' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.5rem', marginBottom: '10px' }}>Cẩm Nang Nghề Nghiệp 🚀</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá xu hướng thị trường lao động và tìm hiểu các ngành nghề phù hợp nhất với tính cách của bạn.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        {careers.map((career, index) => (
          <div key={index} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '30px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
               onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#3b5998'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)' }}
               onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ background: career.bg, width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              {career.icon}
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '10px' }}>{career.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>{career.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#3b5998', fontWeight: '600', fontSize: '0.9rem' }}>
              Xem lộ trình <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;