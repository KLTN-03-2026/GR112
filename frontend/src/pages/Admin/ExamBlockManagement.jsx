import React from 'react';
import './ExamBlockManagement.css';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  BookOpen, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ExamBlockManagement = () => {
  const blocks = [
    { id: 1, name: 'A00', subjects: ['Toán', 'Vật lý', 'Hóa học'], type: 'Tự nhiên', usage: 120 },
    { id: 2, name: 'A01', subjects: ['Toán', 'Vật lý', 'Tiếng Anh'], type: 'Tự nhiên', usage: 95 },
    { id: 3, name: 'D01', subjects: ['Toán', 'Ngữ văn', 'Tiếng Anh'], type: 'Xã hội', usage: 210 },
    { id: 4, name: 'B00', subjects: ['Toán', 'Hóa học', 'Sinh học'], type: 'Tự nhiên', usage: 45 },
  ];

  return (
    <div className="eb-container">
      <header className="eb-header">
        <div className="eb-header-left">
          <div className="eb-icon-box"><Layers size={22} /></div>
          <div>
            <h1>Quản lý Khối thi</h1>
            <p>Định nghĩa danh mục khối thi và các môn học thành phần cho hệ thống.</p>
          </div>
        </div>
        <button className="btn-add-block"><Plus size={18} /> Thêm khối mới</button>
      </header>

      <div className="eb-content-grid">
        <div className="eb-table-section">
          <div className="eb-toolbar">
            <div className="eb-search">
              <Search size={18} />
              <input type="text" placeholder="Tìm mã khối hoặc môn học..." />
            </div>
            <select className="eb-select">
              <option>Tất cả nhóm ngành</option>
              <option>Tự nhiên</option>
              <option>Xã hội</option>
            </select>
          </div>

          <div className="eb-card">
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Mã Khối</th>
                  <th>Tổ hợp môn</th>
                  <th>Phân loại</th>
                  <th>Số ngành dùng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => (
                  <tr key={block.id}>
                    <td className="eb-name"><strong>{block.name}</strong></td>
                    <td>
                      <div className="eb-subject-tags">
                        {block.subjects.map(s => <span key={s} className="s-tag">{s}</span>)}
                      </div>
                    </td>
                    <td><span className={`eb-type ${block.type === 'Tự nhiên' ? 'blue' : 'orange'}`}>{block.type}</span></td>
                    <td className="eb-usage">{block.usage} ngành</td>
                    <td className="eb-actions">
                      <button className="btn-edit"><Edit size={16}/></button>
                      <button className="btn-delete"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="eb-sidebar">
          <div className="eb-guide-card">
            <h3><BookOpen size={18} /> Hướng dẫn</h3>
            <ul>
              <li><CheckCircle size={14} /> Mã khối phải đúng theo quy định của Bộ GD&ĐT.</li>
              <li><CheckCircle size={14} /> Tổ hợp môn dùng để tính điểm tại <strong>US-12</strong>.</li>
              <li><AlertCircle size={14} /> Xóa khối thi sẽ ảnh hưởng đến dữ liệu tuyển sinh liên quan.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamBlockManagement;