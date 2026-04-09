import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Premium.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/mentors')
      .then(res => res.json())
      .then(data => setMentors(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="premium-page fade-in">
      <div className="pr-header">
        <h1>Cố vấn Tinh hoa 🌟</h1>
        <p>Kết nối 1-1 với những bộ óc hàng đầu để định hướng sự nghiệp của bạn.</p>
      </div>
      <div className="mentors-grid">
        {mentors.map(m => (
          <div key={m.id} className="mentor-card">
            <img src={m.img} alt={m.name} className="mentor-img" />
            <h3>{m.name}</h3>
            <p><strong>{m.role}</strong><br/>{m.company}</p>
            {/* Chuyền ID mentor sang trang đặt lịch */}
            <Link to={`/booking?mentorId=${m.id}&name=${encodeURIComponent(m.name)}`} className="mentor-btn">
              Đặt lịch 1-1 ngay
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Mentors;