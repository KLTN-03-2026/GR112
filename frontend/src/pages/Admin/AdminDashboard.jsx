import React from 'react';
import './AdminDashboard.css';
import { 
  Users, MessageSquare, Plus, Download, Cpu, UserCheck, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const lineData = [
  { name: 'T2', users: 4000 }, { name: 'T3', users: 5500 },
  { name: 'T4', users: 7000 }, { name: 'T5', users: 8500 },
  { name: 'T6', users: 9200 }, { name: 'T7', users: 11000 }, { name: 'CN', users: 12842 },
];

const pieData = [
  { name: 'Khối A00', value: 50, color: '#0f172a' },
  { name: 'Khối A01', value: 32, color: '#2563eb' },
  { name: 'Khối D01', value: 18, color: '#60a5fa' },
];

const AdminDashboard = () => {
  return (
    <div className="dashboard-content">
      {/* HEADER */}
      <div className="content-header">
        <div className="page-title">
          <h2>Tổng quan Hệ thống</h2>
          <p>Chào mừng trở lại, hệ thống đang vận hành ổn định.</p>
        </div>
        <div className="header-btns">
          <button className="btn-white"><Download size={16}/> Xuất Báo Cáo</button>
          {/* Đổi nút này thành Thêm Cố Vấn cho hợp với tính năng mới */}
          <button className="btn-dark"><Plus size={16}/> Thêm Cố Vấn Mới</button>
        </div>
      </div>

      {/* 4 STATS CARDS ĐÃ ĐƯỢC CẬP NHẬT */}
      <div className="stats-grid">
        <StatItem icon={<Users size={20}/>} label="Tổng số người dùng" value="12,842" trend="+12%" color="blue" />
        {/* Thêm thẻ Quản lý Cố vấn */}
        <StatItem icon={<UserCheck size={20}/>} label="Cố vấn hoạt động" value="45" trend="Online 12" color="green" />
        {/* Thêm thẻ Quản lý Đặt lịch */}
        <StatItem icon={<Calendar size={20}/>} label="Lịch hẹn chờ duyệt" value="18" trend="Cần xử lý" color="yellow" />
        <StatItem icon={<MessageSquare size={20}/>} label="Tư vấn AI trong ngày" value="3,150" trend="+24%" color="purple" />
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Xu hướng tăng trưởng người dùng</h3>
            <select className="chart-select"><option>7 ngày qua</option></select>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#0f172a" fill="#f8fafc" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card small">
          <h3>Phân bổ Khối thi</h3>
          <div className="pie-container">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center"><span className="pie-text">T.Hợp</span></div>
          </div>
          <div className="pie-legend">
             {pieData.map(item => (
               <div key={item.name} className="legend-item">
                  <span className="dot" style={{backgroundColor: item.color}}></span>
                  <span className="name">{item.name}</span>
                  <span className="val">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <section className="activity-card">
        <div className="activity-header">
          <h3>Hoạt động gần đây</h3>
          <button className="link-btn">Xem tất cả</button>
        </div>
        <div className="activity-list">
          <ActivityItem 
            title="Đơn đặt lịch mới #BK102" 
            desc="từ học sinh Trần Văn B" 
            time="Vừa xong • Cố vấn: TS. Nguyễn A" 
            tag="CHỜ DUYỆT" 
            tagColor="yellow" 
            iconType="calendar"
          />
          <ActivityItem 
            title="Nguyễn Minh Tú" 
            desc="vừa đăng ký tài khoản mới" 
            time="2 phút trước • Mục tiêu: ĐH Bách Khoa" 
            tag="THÀNH CÔNG" 
            tagColor="green" 
            iconType="user"
          />
          <ActivityItem 
            isAi 
            title="Phản hồi Chatbot" 
            desc="từ người dùng ID #2941" 
            time="15 phút trước • Đánh giá: 5 sao" 
            tag="AI INSIGHT" 
            tagColor="dark" 
            iconType="ai"
          />
        </div>
      </section>
    </div>
  );
};

const StatItem = ({ icon, label, value, trend, color }) => (
  <div className="stat-card">
    <div className={`stat-icon icon-${color}`}>{icon}</div>
    <div className="stat-data">
      <div className="stat-label-row">
        <span className="stat-label">{label}</span>
        <span className={`stat-trend trend-${color}`}>{trend}</span>
      </div>
      <h4 className="stat-value">{value}</h4>
    </div>
  </div>
);

const ActivityItem = ({ title, desc, time, tag, tagColor, iconType }) => {
  const getIcon = () => {
    if (iconType === 'ai') return <div className="ai-icon-box"><Cpu size={18}/></div>;
    if (iconType === 'calendar') return <div className="ai-icon-box" style={{background: '#fef3c7', color: '#d97706'}}><Calendar size={18}/></div>;
    return <div className="user-avatar-mini">U</div>;
  };

  return (
    <div className="activity-item">
      <div className="item-left">
        {getIcon()}
        <div className="item-info">
          <p><strong>{title}</strong> {desc}</p>
          <span>{time}</span>
        </div>
      </div>
      <span className={`tag tag-${tagColor}`}>{tag}</span>
    </div>
  );
};

export default AdminDashboard;