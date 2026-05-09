import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2
import './MentorManagement.css'; 

const MentorManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // State quản lý Form
  const [formData, setFormData] = useState({ 
    name: '', email: '', specialty: '', exp: '' 
  });

  const token = localStorage.getItem('token');

  const fetchMentors = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/admin/mentors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMentors(Array.isArray(data) ? data : (data.mentors || []));
        setLoading(false);
      })
      .catch(() => {
        setMentors([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Mở Modal để Thêm mới
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', email: '', specialty: '', exp: '' });
    setShowModal(true);
  };

  // Mở Modal để Chỉnh sửa
  const openEditModal = (mentor) => {
    setIsEditing(true);
    setCurrentId(mentor.id);
    setFormData({ 
      name: mentor.name, 
      email: mentor.email, 
      specialty: mentor.specialty, 
      exp: mentor.exp 
    });
    setShowModal(true);
  };

  // 🚀 XỬ LÝ GỬI FORM (ĐÃ ĐỘ LẠI VALIDATION)
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. KIỂM TRA ĐỊNH DẠNG EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        title: 'Lỗi nhập liệu!',
        text: "Định dạng email không hợp lệ (vd: thiếu @ hoặc domain).",
        icon: 'error',
        confirmButtonText: 'Sửa lại',
        borderRadius: '16px'
      });
      return; // Chặn đứng, không cho code chạy tiếp xuống dưới
    }

    // 2. KIỂM TRA NĂM KINH NGHIỆM
    // Chuyển về số, nếu rỗng thì cho phép hoặc bắt buộc nhập tùy ý sếp (ở đây em mặc định coi chuỗi rỗng là lỗi)
    if (formData.exp === '' || isNaN(formData.exp) || Number(formData.exp) < 0) {
      Swal.fire({
        title: 'Lỗi nhập liệu!',
        text: "Năm kinh nghiệm phải là số lớn hơn hoặc bằng 0.",
        icon: 'error',
        confirmButtonText: 'Sửa lại',
        borderRadius: '16px'
      });
      return; // Chặn đứng
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `http://localhost:8000/api/admin/mentors/${currentId}` 
      : 'http://localhost:8000/api/admin/mentors';

    fetch(url, {
      method: method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      Swal.fire({
        title: 'Thành công!',
        text: isEditing ? "Cập nhật thông tin Cố vấn thành công!" : "Thêm Cố vấn mới thành công!",
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setShowModal(false);
      fetchMentors();
    })
    .catch(() => {
      Swal.fire('Lỗi!', 'Đã có lỗi xảy ra, vui lòng thử lại.', 'error');
    });
  };

  // 🚀 XÓA CỐ VẤN
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa Cố vấn?',
      text: "Bạn có chắc chắn muốn xóa cố vấn này khỏi hệ thống? Dữ liệu không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8',  
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy bỏ',
      borderRadius: '16px'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8000/api/admin/mentors/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Cố vấn đã được xóa khỏi hệ thống.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          fetchMentors();
        })
        .catch(() => {
          Swal.fire('Lỗi!', 'Không thể xóa cố vấn, vui lòng kiểm tra kết nối.', 'error');
        });
      }
    });
  };

  return (
    <div className="mentor-management-container fade-in">
      <div className="mm-header">
        <div className="mm-header-text">
          <h2>Quản lý Cố vấn 👨‍🏫</h2>
          <p>Kiểm soát hồ sơ và trạng thái của các chuyên gia tư vấn.</p>
        </div>
        <button className="mm-btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm Cố vấn
        </button>
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Chỉnh sửa Cố vấn" : "Thêm Cố vấn Mới"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên</label>
                <input type="text" value={formData.name} required 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={formData.email} required 
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Chuyên môn</label>
                <input type="text" value={formData.specialty} required
                  onChange={e => setFormData({...formData, specialty: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Kinh nghiệm (năm)</label>
                <input type="number" value={formData.exp} required
                  onChange={e => setFormData({...formData, exp: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLE --- */}
      <div className="mm-table-wrapper">
        {loading ? <p className="text-center">Đang tải...</p> : (
          <table className="mm-table">
            <thead>
              <tr>
                <th>Cố vấn</th>
                <th>Chuyên môn</th>
                <th>Kinh nghiệm</th>
                <th>Trạng thái</th>
                <th className="mm-text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mentors.length > 0 ? mentors.map((mentor) => (
                <tr key={mentor.id}>
                  <td>
                    <div className="mm-user-cell">
                      <div className="mm-avatar">{mentor.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="mm-fw-600">{mentor.name}</div>
                        <div className="mm-text-sm mm-text-muted">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{mentor.specialty}</td>
                  <td>{mentor.exp} năm</td>
                  <td>
                    <span className="mm-badge mm-badge-success"><CheckCircle size={14}/> Hoạt động</span>
                  </td>
                  <td className="mm-text-right mm-actions">
                    <button className="mm-btn-icon" onClick={() => openEditModal(mentor)}><Edit size={16}/></button>
                    <button className="mm-btn-icon mm-text-danger" onClick={() => handleDelete(mentor.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="text-center">Trống.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MentorManagement;