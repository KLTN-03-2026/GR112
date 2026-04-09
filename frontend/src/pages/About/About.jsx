import React from 'react';
import { Target, Users, Sparkles, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', color: '#334155' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.5rem', marginBottom: '15px' }}>
          Về <span style={{ color: '#3b5998' }}>ConsulTing</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Nền tảng tiên phong ứng dụng Trí tuệ Nhân tạo (AI) để định hướng tương lai, giúp học sinh Việt Nam chọn đúng ngành, học đúng trường.
        </p>
      </div>

      {/* Grid Giá trị cốt lõi (Đã thêm box thứ 4 dùng icon Users cho cân đối) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ background: '#e0e7ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#4f46e5' }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Công nghệ AI</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>Thuật toán phân tích phổ điểm lịch sử và xu hướng ngành nghề để đưa ra dự báo chuẩn xác.</p>
        </div>

        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16a34a' }}>
            <Target size={28} />
          </div>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Cá nhân hóa</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>Mỗi học sinh là một cá thể riêng biệt. Lộ trình được thiết kế đo ni đóng giày cho riêng bạn.</p>
        </div>

        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ background: '#fef3c7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#d97706' }}>
            <BookOpen size={28} />
          </div>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Dữ liệu minh bạch</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>Thông tin học phí, điểm chuẩn, cơ sở vật chất của hơn 200 trường Đại học được cập nhật liên tục.</p>
        </div>

        {/* ĐÃ THÊM CARD SỬ DỤNG ICON USERS VÀO ĐÂY */}
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ background: '#fce7f3', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#db2777' }}>
            <Users size={28} />
          </div>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Cộng đồng gắn kết</h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>Kết nối mạng lưới hàng ngàn học sinh và chuyên gia tư vấn để chia sẻ kinh nghiệm thực tế.</p>
        </div>

      </div>
    </div>
  );
};

export default About;