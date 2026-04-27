import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
};

const Step3 = ({ formData, setFormData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // BỘ DỮ LIỆU CHUẨN 34 TỈNH THÀNH
  const regions = [
    { id: 'TP. Hồ Chí Minh', sub: 'Sáp nhập Bình Dương, BR-VT', defaultCost: 8500000, coords: [10.7626, 106.6601], zoom: 11 },
    { id: 'TP. Hà Nội', sub: 'Thủ đô học thuật', defaultCost: 8000000, coords: [21.0285, 105.8048], zoom: 11 },
    { id: 'TP. Hải Phòng', sub: 'Sáp nhập Hải Dương', defaultCost: 6500000, coords: [20.8449, 106.6881], zoom: 11 },
    { id: 'TP. Đà Nẵng', sub: 'Sáp nhập Quảng Nam', defaultCost: 6000000, coords: [16.0544, 108.2022], zoom: 11 },
    { id: 'TP. Cần Thơ', sub: 'Sáp nhập Sóc Trăng, Hậu Giang', defaultCost: 5000000, coords: [10.0452, 105.7469], zoom: 11 },
    { id: 'TP. Huế', sub: 'Cố đô văn hiến (T.T. Huế)', defaultCost: 4500000, coords: [16.4637, 107.5909], zoom: 12 },
    { id: 'Tuyên Quang', sub: 'Sáp nhập Hà Giang', defaultCost: 4000000, coords: [21.8211, 105.2158], zoom: 10 },
    { id: 'Lào Cai', sub: 'Sáp nhập Yên Bái', defaultCost: 4500000, coords: [22.4842, 103.9707], zoom: 10 },
    { id: 'Thái Nguyên', sub: 'Sáp nhập Bắc Kạn', defaultCost: 4500000, coords: [21.5942, 105.8445], zoom: 10 },
    { id: 'Phú Thọ', sub: 'Sáp nhập Vĩnh Phúc, Hòa Bình', defaultCost: 4500000, coords: [21.3168, 105.2166], zoom: 10 },
    { id: 'Bắc Ninh', sub: 'Sáp nhập Bắc Giang', defaultCost: 5000000, coords: [21.1861, 106.0763], zoom: 10 },
    { id: 'Hưng Yên', sub: 'Sáp nhập Thái Bình', defaultCost: 4500000, coords: [20.6464, 106.0511], zoom: 10 },
    { id: 'Ninh Bình', sub: 'Sáp nhập Hà Nam, Nam Định', defaultCost: 4500000, coords: [20.2539, 105.9750], zoom: 10 },
    { id: 'Quảng Trị', sub: 'Sáp nhập Quảng Bình', defaultCost: 4000000, coords: [16.8167, 107.1000], zoom: 10 },
    { id: 'Quảng Ngãi', sub: 'Sáp nhập Kon Tum', defaultCost: 4000000, coords: [15.1205, 108.7923], zoom: 10 },
    { id: 'Gia Lai', sub: 'Sáp nhập Bình Định', defaultCost: 4500000, coords: [13.9833, 108.0000], zoom: 10 },
    { id: 'Khánh Hòa', sub: 'Sáp nhập Ninh Thuận', defaultCost: 5500000, coords: [12.2451, 109.1943], zoom: 10 },
    { id: 'Lâm Đồng', sub: 'Sáp nhập Đắk Nông, Bình Thuận', defaultCost: 5500000, coords: [11.9404, 108.4583], zoom: 10 },
    { id: 'Đắk Lắk', sub: 'Sáp nhập Phú Yên', defaultCost: 4500000, coords: [12.6667, 108.0500], zoom: 10 },
    { id: 'Đồng Nai', sub: 'Sáp nhập Bình Phước', defaultCost: 5500000, coords: [10.9428, 106.8276], zoom: 10 },
    { id: 'Tây Ninh', sub: 'Sáp nhập Long An', defaultCost: 4500000, coords: [11.3630, 106.1365], zoom: 10 },
    { id: 'Đồng Tháp', sub: 'Sáp nhập Tiền Giang', defaultCost: 4000000, coords: [10.4667, 105.6333], zoom: 10 },
    { id: 'Vĩnh Long', sub: 'Sáp nhập Bến Tre, Trà Vinh', defaultCost: 4000000, coords: [10.2500, 105.9667], zoom: 10 },
    { id: 'Cà Mau', sub: 'Sáp nhập Bạc Liêu', defaultCost: 4500000, coords: [9.1833, 105.1500], zoom: 10 },
    { id: 'An Giang', sub: 'Sáp nhập Kiên Giang', defaultCost: 4500000, coords: [10.3667, 105.4333], zoom: 10 },
    { id: 'Quảng Ninh', sub: 'Vùng mỏ - Du lịch', defaultCost: 6000000, coords: [20.9505, 107.0734], zoom: 10 },
    { id: 'Cao Bằng', sub: 'Non nước hữu tình', defaultCost: 4000000, coords: [22.6667, 106.2629], zoom: 10 },
    { id: 'Lạng Sơn', sub: 'Xứ Lạng - Cửa khẩu', defaultCost: 4500000, coords: [21.8333, 106.7667], zoom: 10 },
    { id: 'Lai Châu', sub: 'Nơi địa đầu Tổ quốc', defaultCost: 4000000, coords: [22.3957, 103.4516], zoom: 10 },
    { id: 'Điện Biên', sub: 'Chiến thắng lịch sử', defaultCost: 4000000, coords: [21.3855, 103.0163], zoom: 10 },
    { id: 'Sơn La', sub: 'Thành phố hoa ban', defaultCost: 4000000, coords: [21.3253, 103.8996], zoom: 10 },
    { id: 'Thanh Hóa', sub: 'Đất xứ Thanh', defaultCost: 4500000, coords: [19.8058, 105.7758], zoom: 10 },
    { id: 'Nghệ An', sub: 'Quê hương Bác Hồ', defaultCost: 4500000, coords: [18.6796, 105.6813], zoom: 10 },
    { id: 'Hà Tĩnh', sub: 'Núi Hồng Sông La', defaultCost: 4000000, coords: [18.3411, 105.9042], zoom: 10 }
  ];

  const filteredRegions = regions.filter(r => r.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeRegion = regions.find(r => r.id === formData.location) || regions[0];

  const handleLocationSelect = (locObj) => {
    setFormData({
      ...formData, 
      location: locObj.id,
      livingCost: locObj.defaultCost
    });
  };

  const handleBudgetChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, familyBudget: parseInt(rawValue) || 0 });
  };

  const handleLivingCostChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, livingCost: parseInt(rawValue) || 0 });
  };

  // 🚀 ĐÃ SỬA: Hàm Format tiền DÙNG DẤU PHẨY MỚI (150,000,000 thay vì 150.000.000)
  const formatMoney = (number) => {
    if (!number) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const familyBudget = parseInt(formData.familyBudget) || 0;
  const tuitionLimit = parseInt(formData.tuitionLimit) || 30000000;
  const livingCost = parseInt(formData.livingCost) || activeRegion.defaultCost;
  
  const totalCost = tuitionLimit + (livingCost * 12);
  const tuitionPercent = Math.round((tuitionLimit / totalCost) * 100) || 0;
  const livingPercent = 100 - tuitionPercent;
  
  const balance = familyBudget - totalCost;
  const isDeficit = balance < 0; 

  return (
    <div className="fade-step">
      <div className="ori-header">
        <span className="ori-step-number">03</span>
        <span style={{fontSize: '0.9rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'}}>LỘ TRÌNH TÀI CHÍNH</span>
        <h2 className="ori-title">Bước 3: Bộ lọc <span style={{color: '#10b981'}}>Thực tế.</span></h2>
        <p className="ori-subtitle">Hệ thống cân đối chi phí sinh hoạt tại 34 tỉnh thành và ngân sách gia đình chu cấp để tránh rủi ro tài chính.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* CỘT 1: BẢN ĐỒ VÀ KHU VỰC */}
        <div className="ori-card" style={{ flex: 1.5, padding: '25px', background: '#f8fafc', minWidth: '400px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{fontSize: '1.2rem', margin: 0, color: '#0f172a'}}>
              <i className="fas fa-map-marked-alt" style={{color: '#10b981', marginRight: '8px'}}></i> 
              Bản đồ 34 Tỉnh Thành
            </h3>
            
            <div style={{ position: 'relative', width: '220px' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm tỉnh..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          
          <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            {filteredRegions.length > 0 ? (
              <div className="loc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {filteredRegions.map(loc => (
                  <div 
                    key={loc.id} 
                    onClick={() => handleLocationSelect(loc)}
                    style={{
                      padding: '12px 15px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                      border: formData.location === loc.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                      background: formData.location === loc.id ? '#f0fdf4' : '#fff',
                      position: 'relative',
                      boxShadow: formData.location === loc.id ? '0 4px 6px -1px rgba(16, 185, 129, 0.1)' : 'none'
                    }}
                  >
                    <h4 style={{margin: '0 0 4px 0', fontSize: '0.95rem', color: formData.location === loc.id ? '#065f46' : '#1e293b'}}>{loc.id}</h4>
                    <p style={{margin: 0, fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{loc.sub}</p>
                    {formData.location === loc.id && <i className="fas fa-check-circle" style={{position: 'absolute', top: '15px', right: '12px', color: '#10b981', fontSize: '1.1rem'}}></i>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '20px 0' }}>Không tìm thấy tỉnh/thành phố nào phù hợp.</p>
            )}
          </div>

          <div style={{width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 0}}>
            <MapContainer center={activeRegion.coords} zoom={activeRegion.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <ChangeView center={activeRegion.coords} zoom={activeRegion.zoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker key={activeRegion.id} position={activeRegion.coords}>
                <Popup>
                  <strong>{activeRegion.id}</strong><br/>
                  Sinh hoạt phí TB: {(activeRegion.defaultCost / 1000000).toFixed(1).replace('.', ',')} Triệu/Tháng
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* CỘT 2: BẢNG DỰ TOÁN TÀI CHÍNH */}
        <div className="ori-card" style={{ flex: 1, padding: '30px', background: '#fff', minWidth: '350px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{fontSize: '1.3rem', margin: '0 0 25px 0', color: '#0f172a', display: 'flex', alignItems: 'center'}}>
            <div style={{background: '#d1fae5', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'}}>
              <i className="fas fa-wallet" style={{color: '#10b981', fontSize: '1.1rem'}}></i>
            </div>
            Cân đối Tài chính
          </h3>
          
          <div style={{marginBottom: '25px'}}>
            <label style={{fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px', fontSize: '0.9rem'}}>Ngân sách Gia đình chu cấp / Năm</label>
            <div style={{position: 'relative'}}>
              <i className="fas fa-hand-holding-usd" style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', fontSize: '1.1rem'}}></i>
              <input 
                type="text" 
                className="ori-input" 
                style={{
                  padding: '14px 50px 14px 45px', 
                  background: '#f8fafc', 
                  fontSize: '1.15rem', 
                  fontWeight: 700, 
                  color: '#2563eb', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px'
                }} 
                value={formatMoney(formData.familyBudget)} 
                onChange={handleBudgetChange} 
                placeholder="VD: 150,000,000" 
              />
              <span style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700, fontSize: '0.9rem'}}>VNĐ</span>
            </div>
          </div>

          <div style={{marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #f1f5f9'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <label style={{fontWeight: 700, color: '#334155', fontSize: '0.9rem', margin: 0}}>Học phí trường nhắm đến / Năm</label>
              {/* 🚀 ĐÃ SỬA: Thay đổi chấm thành phẩy cho phần thập phân luôn (VD: 15,5) */}
              <span style={{fontSize: '1.3rem', fontWeight: 800, color: '#10b981', background: '#d1fae5', padding: '4px 10px', borderRadius: '6px'}}>
                {String(tuitionLimit / 1000000).replace('.', ',')} Tr
              </span>
            </div>
            <input type="range" min="15000000" max="200000000" step="5000000" className="custom-range" value={tuitionLimit} onChange={e => setFormData({...formData, tuitionLimit: parseInt(e.target.value)})} style={{width: '100%'}}/>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8'}}>
              <span>15 Tr</span>
              <span>200 Tr</span>
            </div>
          </div>

          <div style={{marginBottom: '35px'}}>
            <label style={{fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px', fontSize: '0.9rem'}}>Sinh hoạt phí (Trọ, Ăn, Đi lại) / Tháng</label>
            <div style={{position: 'relative'}}>
              <i className="fas fa-home" style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: '1.1rem'}}></i>
              <input 
                type="text" 
                className="ori-input" 
                style={{
                  padding: '14px 50px 14px 45px', 
                  background: '#fff', 
                  fontSize: '1.15rem', 
                  fontWeight: 600, 
                  color: '#0f172a', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px'
                }} 
                value={formatMoney(formData.livingCost)} 
                onChange={handleLivingCostChange} 
                placeholder="VD: 8,000,000"
              />
              <span style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700, fontSize: '0.9rem'}}>VNĐ</span>
            </div>
          </div>

          <div className="ori-dark-card" style={{padding: '25px', position: 'relative', overflow: 'hidden', borderRadius: '16px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'}}>
            <i className="fas fa-calculator" style={{position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', opacity: 0.05}}></i>
            
            <p style={{margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>TỔNG CHI PHÍ DỰ TÍNH</p>
            {/* 🚀 ĐÃ SỬA: Đổi dấu chấm thành dấu phẩy */}
            <h2 style={{fontSize: '2.4rem', margin: 0, color: 'white', fontWeight: 800}}>
              {String(totalCost / 1000000).replace('.', ',')} <span style={{fontSize: '1.1rem', fontWeight: 500, opacity: 0.8}}>Triệu / Năm</span>
            </h2>
            
            <div style={{display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '20px', marginBottom: '20px'}}>
              <div style={{width: `${tuitionPercent}%`, background: '#10b981'}} title="Học phí"></div>
              <div style={{width: `${livingPercent}%`, background: '#3b82f6'}} title="Sinh hoạt phí"></div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Ngân sách gia đình:</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '0.95rem' }}>
                  {String(familyBudget / 1000000).replace('.', ',')} Tr
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Trạng thái quỹ:</span>
                <span style={{ fontWeight: '900', fontSize: '1.2rem', color: isDeficit ? '#fca5a5' : '#6ee7b7' }}>
                  {isDeficit ? '-' : '+'}{String(Math.abs(balance) / 1000000).replace('.', ',')} Tr
                </span>
              </div>
            </div>
            
            {isDeficit && (
              <div style={{marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontSize: '0.85rem', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', lineHeight: 1.5}}>
                <i className="fas fa-exclamation-triangle" style={{marginRight: '6px'}}></i> <strong>Cảnh báo tài chính:</strong> Vượt quá ngân sách gia đình! Bạn nên cân nhắc tìm trọ ghép hoặc săn học bổng đầu vào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;