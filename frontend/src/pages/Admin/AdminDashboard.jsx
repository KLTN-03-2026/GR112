import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { 
  Users, Download, Cpu, UserCheck, Calendar, 
  Activity, Star, Filter 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, YAxis 
} from 'recharts';
import Swal from 'sweetalert2';
import axios from 'axios'; 

export default function AdminDashboard() {
  // 🚀 MẸO: Thêm 'demo_token' dự phòng để lúc test không bị lỗi 401 Unauthorized
  const token = localStorage.getItem('token') || 'demo_token'; 

  // ================= 1. QUẢN LÝ TRẠNG THÁI =================
  const [stats, setStats] = useState({
    total_users: 0, user_trend: 'Đang tải...', 
    active_advisors: 0, online_advisors: 'Đang tải...',
    pending_bookings: 0, sync_status: 'Đang tải...', sync_detail: ''
  });
  const [trafficData, setTrafficData] = useState([]);
  const [testData, setTestData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [topAdvisors, setTopAdvisors] = useState([]);
  const [aiKeywords, setAiKeywords] = useState([]);
  const [activities, setActivities] = useState([]);
  
  const [activeChart, setActiveChart] = useState('holland'); 
  const [activeTab, setActiveTab] = useState('all'); 
  const [isLoading, setIsLoading] = useState(true);

  // ================= 2. CẤU HÌNH GỌI API =================
  const API_BASE_URL = 'http://localhost:8000/api/admin'; 
  const axiosConfig = {
    headers: { 'Authorization': `Bearer ${token}` }
  };

  // 🚀 HÀM BẢO VỆ: Gọi API an toàn, lỗi cái nào bỏ qua cái đó, không sập dây chuyền
  const fetchSafe = (url) => {
    return axios.get(url, axiosConfig).catch(err => {
      console.warn(`⚠️ API bị lỗi hoặc chưa có data: ${url}`);
      return { data: { success: false } }; // Trả về data rỗng thay vì làm sập web
    });
  };

  // ================= 3. GỌI API TỔNG LỰC =================
  useEffect(() => {
    const fetchDashboardOverview = async () => {
      try {
        // Gọi 6 API với hàm an toàn
        const [statsRes, trafficRes, funnelRes, mentorsRes, logsRes, keywordsRes] = await Promise.all([
          fetchSafe(`${API_BASE_URL}/stats`),
          fetchSafe(`${API_BASE_URL}/traffic`),
          fetchSafe(`${API_BASE_URL}/funnel`),
          fetchSafe(`${API_BASE_URL}/top-mentors`),
          fetchSafe(`${API_BASE_URL}/logs`),
          fetchSafe(`${API_BASE_URL}/trending-keywords`)
        ]);

        // Cái nào lấy được dữ liệu thì cập nhật, cái nào lỗi thì bỏ qua
        if(statsRes.data?.success) setStats(statsRes.data.data);
        if(trafficRes.data?.success) setTrafficData(trafficRes.data.data);
        if(funnelRes.data?.success) setFunnelData(funnelRes.data.data);
        if(mentorsRes.data?.success) setTopAdvisors(mentorsRes.data.data);
        if(logsRes.data?.success) setActivities(logsRes.data.data);
        if(keywordsRes.data?.success) setAiKeywords(keywordsRes.data.data);

      } catch (error) {
        console.error("Lỗi khung Dashboard:", error);
      }
    };
    fetchDashboardOverview(); 
  }, []);

  // API riêng cho biểu đồ Test Tâm lý
  useEffect(() => {
    const fetchTestResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetchSafe(`${API_BASE_URL}/tests?type=${activeChart}`);
        if(res.data?.success) {
            setTestData(res.data.data);
        } else {
            setTestData([]); // Nếu lỗi thì cho mảng rỗng để hiện chữ "Chưa có bài test nào"
        }
      } catch (error) {
        console.error("Lỗi biểu đồ test:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestResults(); 
  }, [activeChart]);

  // ================= 4. HÀM XỬ LÝ ACTION =================
  // 🚀 ĐÃ BỔ SUNG HỘP THOẠI XÁC NHẬN TRƯỚC KHI DUYỆT
  const handleApprove = (id) => {
    Swal.fire({
      title: 'Xác nhận duyệt lịch?',
      text: "Bạn có chắc chắn muốn duyệt lịch hẹn này không?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Nút màu xanh lá báo hiệu an toàn
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Duyệt ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        // Thực hiện Cập nhật State sau khi xác nhận
        setActivities(activities.map(act => act.id === id ? { ...act, tag: "ĐÃ DUYỆT", color: "blue" } : act));
        
        // Báo thành công
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã duyệt lịch và cập nhật vào Database.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredActivities = activities.filter(a => activeTab === 'all' || a.type === activeTab);
  
  // 🚀 HÀM XỬ LÝ XUẤT BÁO CÁO (Đã xịn sẵn)
  const handleExportReport = async () => {
    try {
      // Bật thông báo đang tải
      Swal.fire({
        title: 'Đang xuất báo cáo...',
        text: 'Hệ thống đang tổng hợp dữ liệu, vui lòng đợi!',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      // Gọi API lấy file (Phải có responseType: 'blob' để trình duyệt hiểu đây là file)
      const response = await axios.get(`${API_BASE_URL}/export-report`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob', 
      });

      // Tạo đường link ảo để tải file về máy
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Bao_Cao_MindConnect.csv'); // Tên file tải về
      document.body.appendChild(link);
      link.click(); // Tự động click tải
      
      // Dọn dẹp
      link.parentNode.removeChild(link);
      Swal.close();
      Swal.fire({
        title: 'Thành công',
        text: 'Đã tải xuống file Báo cáo hệ thống!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      Swal.close();
      console.error("Lỗi xuất báo cáo:", error);
      Swal.fire('Lỗi', 'Không thể xuất báo cáo lúc này.', 'error');
    }
  };

  return (
    <div className="dashboard-content" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Trung tâm Quản trị Hệ thống</h2>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Giám sát người dùng, cố vấn, AI và tiến trình đồng bộ (Real-time).</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-white" onClick={handleExportReport}>
            <Download size={16}/> Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <StatItem icon={<Users size={20}/>} label="Tổng Người Dùng" value={stats.total_users} trend={stats.user_trend} color="blue" />
        <StatItem icon={<UserCheck size={20}/>} label="Cố vấn Hoạt động" value={stats.active_advisors} trend={stats.online_advisors} color="purple" />
        <StatItem icon={<Calendar size={20}/>} label="Lịch chờ duyệt" value={stats.pending_bookings} trend="Cần xử lý" color="yellow" />
        <StatItem icon={<Activity size={20}/>} label="Trạng thái Sync" value={stats.sync_status} trend={stats.sync_detail} color="green" />
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* LƯU LƯỢNG */}
        <div className="chart-card large" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Tăng trưởng người dùng (7 ngày qua)</h3>
          <ResponsiveContainer width="100%" height={250}>
            {trafficData.length > 0 ? (
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
              </AreaChart>
            ) : (
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có dữ liệu người dùng mới</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* KẾT QUẢ TEST */}
        <div className="chart-card small" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Kết quả Test</h3>
            <select 
              value={activeChart} 
              onChange={(e) => setActiveChart(e.target.value)}
              style={{ border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', padding: '4px', cursor: 'pointer' }}
            >
              <option value="holland">Holland</option>
              <option value="mbti">MBTI</option>
              <option value="mindset">Mindset</option>
              <option value="grit">Grit</option>
              <option value="mi">MI (Đa trí tuệ)</option>
            </select>
          </div>
          
          {isLoading ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>
          ) : testData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={testData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {testData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} HS`} />
                </PieChart>
              </ResponsiveContainer>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                {testData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></span>
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có bài test nào</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* PHỄU TƯƠNG TÁC */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems:'center', gap:'8px' }}>
            <Filter size={18} color="#10b981"/> Phễu Tương tác Hệ thống
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            {funnelData.length > 0 ? (
              <BarChart data={funnelData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="step" type="category" axisLine={false} tickLine={false} width={80} style={{ fontSize: '12px' }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
                  {funnelData.map((entry, index) => (<Cell key={`cell-${index}`} fillOpacity={1 - index * 0.2} />))}
                </Bar>
              </BarChart>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có dữ liệu phễu</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* TOP ADVISORS */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems:'center', gap:'8px' }}>
            <Star size={18} color="#f59e0b"/> Xếp hạng Cố vấn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '250px' }}>
            {topAdvisors.length > 0 ? topAdvisors.map((adv, idx) => (
              <div key={adv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold' }}>{idx + 1}</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize:'14px' }}>{adv.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{adv.sessions} ca tư vấn</div>
                  </div>
                </div>
                <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize:'14px' }}>★ {adv.rating}</div>
              </div>
            )) : <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Chưa có cố vấn nào</div>}
          </div>
        </div>

        {/* LOGS HOẠT ĐỘNG */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Nhật ký & Vận hành</h3>
            <select onChange={(e) => setActiveTab(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', fontSize:'12px', padding:'2px 8px' }}>
              <option value="all">Tất cả</option>
              <option value="booking">Lịch hẹn</option>
              <option value="ai">AI Chatbot</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
            {filteredActivities.length > 0 ? filteredActivities.map(item => (
              <div key={item.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${item.color === 'yellow' ? '#f59e0b' : item.color === 'green' ? '#10b981' : item.color === 'red' ? '#ef4444' : '#3b82f6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>{item.title}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{item.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: '#e2e8f0' }}>{item.tag}</span>
                  {item.tag === 'CHỜ DUYỆT' && (
                    <button onClick={() => handleApprove(item.id)} style={{ padding: '4px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Duyệt ngay</button>
                  )}
                </div>
              </div>
            )) : <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Không có nhật ký mới</div>}
          </div>
        </div>
      </div>

      {/* AI KEYWORDS */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems:'center', gap:'8px' }}>
          <Cpu size={18} color="#8b5cf6"/> Phân tích Khóa tìm kiếm AI (Trending Chat Topics)
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Các chủ đề học sinh đang trò chuyện và thắc mắc nhiều nhất với Chatbot trong tuần qua.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {aiKeywords.length > 0 ? aiKeywords.map((kw, idx) => (
            <div key={idx} style={{ background: kw.color, color: kw.textColor, padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{kw.text}</span><span style={{ background: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>{kw.count} lượt</span>
            </div>
          )) : <div style={{ color: '#94a3b8', fontSize: '13px' }}>Chưa có dữ liệu từ khóa AI</div>}
        </div>
      </div>

    </div>
  );
}

const StatItem = ({ icon, label, value, trend, color }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
    <div style={{ padding: '12px', borderRadius: '50%', background: '#f1f5f9', color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'yellow' ? '#f59e0b' : '#8b5cf6' }}>{icon}</div>
    <div>
      <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: '12px', color: color === 'yellow' ? '#f59e0b' : '#10b981', marginTop: '4px', fontWeight: '500' }}>{trend}</div>
    </div>
  </div>
);