import React, { useState } from 'react';
import { Briefcase, Code, HeartPulse, TrendingUp, ArrowRight, X, BookOpen, Target, Award, Rocket, Palette, Globe, Scale, Map } from 'lucide-react';

const Guide = () => {
  const [selectedCareer, setSelectedCareer] = useState(null);

  const careers = [
    { 
      title: 'Công nghệ thông tin', 
      desc: 'Lập trình viên, AI Engineer, Data Scientist, An ninh mạng...', 
      icon: <Code size={32} color="#3b82f6" />, 
      bg: '#eff6ff',
      color: '#3b82f6',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Xây dựng Nền tảng', detail: 'Học Lập trình cơ bản (C/C++, Python), Toán rời rạc, Cấu trúc dữ liệu & Thuật toán.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Chọn Chuyên ngành', detail: 'Đi sâu vào Web/Mobile Dev, Trí tuệ nhân tạo (AI), hoặc An toàn thông tin. Bắt đầu làm dự án cá nhân.', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Thực chiến & Đồ án', detail: 'Đi thực tập (Internship) tại các công ty công nghệ, hoàn thiện Portfolio (GitHub) và làm Đồ án tốt nghiệp.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Phát triển Sự nghiệp', detail: 'Trở thành Junior Developer, thi lấy các chứng chỉ quốc tế (AWS, Google) để thăng tiến lên Senior.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Kinh tế & Quản lý', 
      desc: 'Marketing, Digital Business, Phân tích tài chính, HR...', 
      icon: <TrendingUp size={32} color="#10b981" />, 
      bg: '#ecfdf5',
      color: '#10b981',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Đại cương Kinh tế', detail: 'Học Kinh tế vi mô/vĩ mô, Nguyên lý kế toán, Quản trị học và rèn luyện kỹ năng mềm, ngoại ngữ.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Kiến thức Chuyên sâu', detail: 'Học sâu về Marketing số, Quản trị chuỗi cung ứng, hoặc Tài chính doanh nghiệp. Giải quyết các Case Study.', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Cọ xát Doanh nghiệp', detail: 'Thực tập tại các tập đoàn, agency. Xây dựng mạng lưới quan hệ (Networking) và làm Khóa luận.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Chuyên gia & Quản lý', detail: 'Bắt đầu từ vị trí Specialist/Executive. Có thể học thêm MBA để nhắm tới các vị trí Manager, Giám đốc.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Y Dược & Sức khỏe', 
      desc: 'Bác sĩ, Dược sĩ, Kỹ thuật viên y khoa, Nha khoa...', 
      icon: <HeartPulse size={32} color="#ef4444" />, 
      bg: '#fef2f2',
      color: '#ef4444',
      roadmap: [
        { phase: 'Năm 1 - 3', name: 'Khoa học Cơ sở', detail: 'Học Giải phẫu, Sinh lý học, Hóa sinh. Kiến thức rất nặng, đòi hỏi sự kiên trì và ghi nhớ cực tốt.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 4 - 6', name: 'Thực tập Lâm sàng', detail: 'Đi thực tập tại các bệnh viện lớn (đi buồng, trực gác). Áp dụng lý thuyết vào chẩn đoán và điều trị thực tế.', icon: <Target size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Chứng chỉ Hành nghề', detail: 'Làm việc 18 tháng tại cơ sở y tế để được cấp Chứng chỉ hành nghề. Chính thức trở thành Bác sĩ/Dược sĩ.', icon: <Award size={20} /> },
        { phase: 'Tương lai', name: 'Học Chuyên khoa', detail: 'Tiếp tục học lên Bác sĩ Chuyên khoa I, Chuyên khoa II hoặc Thạc sĩ, Tiến sĩ để nâng cao tay nghề.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Kỹ thuật & Công nghệ', 
      desc: 'Tự động hóa, Vi mạch bán dẫn, Kỹ thuật ô tô, Điện tử...', 
      icon: <Briefcase size={32} color="#f59e0b" />, 
      bg: '#fffbeb',
      color: '#f59e0b',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Toán & Khoa học Cơ bản', detail: 'Học Toán cao cấp, Vật lý đại cương, Vẽ kỹ thuật, Cơ học. Đây là nền móng bắt buộc của mọi kỹ sư.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Chuyên ngành Kỹ thuật', detail: 'Học thiết kế mạch, lập trình PLC, mô phỏng 3D. Dành phần lớn thời gian trong phòng Thí nghiệm (Lab).', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Đồ án & Thực tập', detail: 'Chế tạo sản phẩm thực tế (xe mô hình, robot, chip). Thực tập tại nhà máy hoặc khu công nghiệp.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Kỹ sư Thực thụ', detail: 'Làm việc tại các phòng R&D, nhà máy sản xuất. Lộ trình có thể lên Quản lý dự án hoặc Chuyên gia kỹ thuật.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Nghệ thuật & Thiết kế', 
      desc: 'Graphic Design, UI/UX, Đạo diễn, Thiết kế thời trang...', 
      icon: <Palette size={32} color="#8b5cf6" />, 
      bg: '#f5f3ff',
      color: '#8b5cf6',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Nền tảng Thẩm mỹ', detail: 'Học Lịch sử mỹ thuật, Hình họa, Bố cục, Màu sắc, Typography và làm quen các phần mềm thiết kế (Adobe).', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Chuyên ngành & Freelance', detail: 'Đi sâu vào Thiết kế Web (UI/UX), 3D Animation, hoặc Quay dựng video. Bắt đầu nhận dự án freelance nhỏ.', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Đồ án & Portfolio', detail: 'Xây dựng Portfolio nghệ thuật mang đậm dấu ấn cá nhân. Thực tập thực chiến tại các Studio hoặc Agency quảng cáo.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Sáng tạo Chuyên nghiệp', detail: 'Trở thành Junior Designer, trau dồi gu thẩm mỹ và hướng tới vị trí Art Director hoặc Creative Director.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Khoa học Xã hội', 
      desc: 'Tâm lý học, Quan hệ công chúng, Báo chí, Ngôn ngữ...', 
      icon: <Globe size={32} color="#0ea5e9" />, 
      bg: '#f0f9ff',
      color: '#0ea5e9',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Kiến thức Nền tảng', detail: 'Học Triết học, Logic học, Xã hội học đại cương, rèn luyện tư duy phản biện, kỹ năng viết và thuyết trình.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Nghiên cứu & Áp dụng', detail: 'Đi sâu vào Tâm lý học hành vi, Phân tích dữ liệu truyền thông, Viết bài PR. Tham gia các câu lạc bộ, dự án xã hội.', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Thực tập & Khóa luận', detail: 'Thực tập tại đài truyền hình, tòa soạn báo, các tổ chức phi chính phủ (NGO) hoặc phòng Nhân sự.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Phát triển Nghề nghiệp', detail: 'Trở thành Chuyên viên truyền thông, Phóng viên, Chuyên gia tâm lý. Có thể học Thạc sĩ để giảng dạy.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Luật & Pháp lý', 
      desc: 'Luật kinh tế, Luật quốc tế, Kiểm sát viên, Cố vấn pháp lý...', 
      icon: <Scale size={32} color="#84cc16" />, 
      bg: '#f7fee7',
      color: '#84cc16',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Pháp luật Căn bản', detail: 'Nắm vững Luật Hiến pháp, Dân sự, Hình sự, Lý luận nhà nước và pháp luật. Đọc hiểu văn bản luật.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Chuyên ngành & Diễn án', detail: 'Học chuyên sâu Luật doanh nghiệp, Thương mại quốc tế. Tham gia các Phiên tòa giả định (Moot Court).', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Thực tập Pháp lý', detail: 'Thực tập tại Tòa án, Viện kiểm sát hoặc các Văn phòng luật sư. Rèn luyện kỹ năng nghiên cứu hồ sơ thực tế.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Hành nghề Luật sư', detail: 'Tham gia khóa học nghiệp vụ tại Học viện Tư pháp, đi tập sự và thi lấy Thẻ hành nghề Luật sư.', icon: <Rocket size={20} /> },
      ]
    },
    { 
      title: 'Du lịch & Khách sạn', 
      desc: 'Quản trị Khách sạn, Quản lý sự kiện, Hướng dẫn viên...', 
      icon: <Map size={32} color="#f43f5e" />, 
      bg: '#fff1f2',
      color: '#f43f5e',
      roadmap: [
        { phase: 'Năm 1 - 2', name: 'Dịch vụ Khách hàng', detail: 'Học Tổng quan du lịch, Tâm lý khách hàng, Kỹ năng giao tiếp xuất sắc và bắt buộc phải có Ngoại ngữ 2.', icon: <BookOpen size={20} /> },
        { phase: 'Năm 3', name: 'Nghiệp vụ Chuyên sâu', detail: 'Học nghiệp vụ Tiền sảnh, Buồng phòng, Quản trị F&B (Nhà hàng), Điều hành Tour hoặc Tổ chức sự kiện.', icon: <Target size={20} /> },
        { phase: 'Năm 4', name: 'Thực tập Thực chiến', detail: 'OJT (On-the-job Training) tại các Khách sạn, Resort 4-5 sao hoặc các công ty Lữ hành lớn.', icon: <Award size={20} /> },
        { phase: 'Sau Tốt nghiệp', name: 'Quản lý & Điều hành', detail: 'Bắt đầu từ vị trí Giám sát (Supervisor) tiến lên Quản lý (Manager), hoặc mở Công ty du lịch/Agency sự kiện riêng.', icon: <Rocket size={20} /> },
      ]
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.5rem', marginBottom: '10px' }}>Cẩm Nang Nghề Nghiệp </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá xu hướng thị trường lao động và lộ trình phát triển chi tiết cho từng khối ngành.
        </p>
      </div>

      {/* --- GRID CÁC KHỐI NGÀNH (Giờ là 8 khối) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
        {careers.map((career, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedCareer(career)}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '30px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = career.color; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          >
            <div style={{ background: career.bg, width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              {career.icon}
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>{career.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', minHeight: '60px' }}>{career.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: career.color, fontWeight: '600', fontSize: '0.9rem' }}>
              Xem lộ trình <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL (POP-UP) HIỂN THỊ LỘ TRÌNH CHI TIẾT --- */}
      {selectedCareer && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }} onClick={() => setSelectedCareer(null)}>
          
          <div style={{ 
            background: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px', 
            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeInUp 0.3s ease-out' 
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header Pop-up */}
            <div style={{ background: selectedCareer.bg, padding: '30px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', position: 'relative' }}>
              <button 
                onClick={() => setSelectedCareer(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              >
                <X size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  {selectedCareer.icon}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: '#0f172a' }}>{selectedCareer.title}</h2>
                  <span style={{ color: selectedCareer.color, fontWeight: '600', fontSize: '0.9rem' }}>Lộ trình phát triển 4 giai đoạn</span>
                </div>
              </div>
            </div>

            {/* Nội dung lộ trình */}
            <div style={{ padding: '30px 40px' }}>
              <div style={{ borderLeft: `2px dashed ${selectedCareer.color}`, marginLeft: '20px', paddingBottom: '20px' }}>
                
                {selectedCareer.roadmap.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '40px', marginBottom: idx === selectedCareer.roadmap.length - 1 ? '0' : '35px' }}>
                    {/* Chấm tròn Icon */}
                    <div style={{ 
                      position: 'absolute', left: '-20px', top: '0', background: 'white', 
                      border: `2px solid ${selectedCareer.color}`, color: selectedCareer.color, 
                      width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {step.icon}
                    </div>
                    
                    {/* Text Lộ trình */}
                    <div style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'inline-block', background: selectedCareer.bg, color: selectedCareer.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        {step.phase}
                      </span>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' }}>{step.name}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>{step.detail}</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* CSS Animation cho Pop-up mượt mà */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Guide;