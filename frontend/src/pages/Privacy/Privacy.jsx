import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', color: '#334155', lineHeight: '1.8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <ShieldCheck size={40} color="#3b5998" />
        <h1 style={{ color: '#0f172a', margin: 0 }}>Chính sách Quyền riêng tư</h1>
      </div>
      
      <p style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '40px' }}>
        Cập nhật lần cuối: 02/04/2026. Tại ConsulTing, chúng tôi coi trọng và cam kết bảo vệ dữ liệu cá nhân của học sinh.
      </p>

      <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '12px', marginBottom: '30px', borderLeft: '4px solid #3b82f6' }}>
        <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <FileText size={20} color="#3b82f6" /> 1. Dữ liệu chúng tôi thu thập
        </h3>
        <p>Chúng tôi chỉ thu thập các thông tin cần thiết để AI có thể phân tích và đưa ra gợi ý chính xác nhất cho bạn, bao gồm:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Điểm số các môn học và khối thi bạn cung cấp.</li>
          <li>Thông tin liên hệ cơ bản (Email, Tên) khi bạn tạo tài khoản.</li>
          <li>Lịch sử tìm kiếm và các trường đại học bạn lưu vào danh sách yêu thích.</li>
        </ul>
      </div>

      <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
        <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <Lock size={20} color="#10b981" /> 2. Cam kết bảo mật
        </h3>
        <p>Dữ liệu của bạn được mã hóa an toàn và lưu trữ trên các máy chủ đạt chuẩn quốc tế. Chúng tôi cam kết <strong>KHÔNG</strong> bán, trao đổi hay chia sẻ dữ liệu cá nhân của học sinh cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại.</p>
      </div>
    </div>
  );
};

export default Privacy;