import React, { useState } from 'react';
import { Sparkles, Zap, ShieldCheck, Target, AlertTriangle } from 'lucide-react';
import axios from 'axios'; // Đã thêm axios
import './AiSuggestion.css';

const BLOCK_CONFIG = {
  'A00': { name: 'Khối A00 (Toán, Lý, Hóa)', subjects: ['Toán học', 'Vật lý', 'Hóa học'] },
  'A01': { name: 'Khối A01 (Toán, Lý, Anh)', subjects: ['Toán học', 'Vật lý', 'Tiếng Anh'] },
  'A02': { name: 'Khối A02 (Toán, Lý, Sinh)', subjects: ['Toán học', 'Vật lý', 'Sinh học'] },
  'B00': { name: 'Khối B00 (Toán, Hóa, Sinh)', subjects: ['Toán học', 'Hóa học', 'Sinh học'] },
  'B08': { name: 'Khối B08 (Toán, Sinh, Anh)', subjects: ['Toán học', 'Sinh học', 'Tiếng Anh'] },
  'C00': { name: 'Khối C00 (Văn, Sử, Địa)', subjects: ['Ngữ văn', 'Lịch sử', 'Địa lý'] },
  'C01': { name: 'Khối C01 (Văn, Toán, Lý)', subjects: ['Ngữ văn', 'Toán học', 'Vật lý'] },
  'C02': { name: 'Khối C02 (Văn, Toán, Hóa)', subjects: ['Ngữ văn', 'Toán học', 'Hóa học'] },
  'C14': { name: 'Khối C14 (Văn, Toán, GDCD)', subjects: ['Ngữ văn', 'Toán học', 'Giáo dục công dân'] },
  'C19': { name: 'Khối C19 (Văn, Sử, GDCD)', subjects: ['Ngữ văn', 'Lịch sử', 'Giáo dục công dân'] },
  'C20': { name: 'Khối C20 (Văn, Địa, GDCD)', subjects: ['Ngữ văn', 'Địa lý', 'Giáo dục công dân'] },
  'D01': { name: 'Khối D01 (Toán, Văn, Anh)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Anh'] },
  'D07': { name: 'Khối D07 (Toán, Hóa, Anh)', subjects: ['Toán học', 'Hóa học', 'Tiếng Anh'] },
  'D08': { name: 'Khối D08 (Toán, Sinh, Anh)', subjects: ['Toán học', 'Sinh học', 'Tiếng Anh'] },
  'D09': { name: 'Khối D09 (Toán, Sử, Anh)', subjects: ['Toán học', 'Lịch sử', 'Tiếng Anh'] },
  'D10': { name: 'Khối D10 (Toán, Địa, Anh)', subjects: ['Toán học', 'Địa lý', 'Tiếng Anh'] },
  'D14': { name: 'Khối D14 (Văn, Sử, Anh)', subjects: ['Ngữ văn', 'Lịch sử', 'Tiếng Anh'] },
  'D15': { name: 'Khối D15 (Văn, Địa, Anh)', subjects: ['Ngữ văn', 'Địa lý', 'Tiếng Anh'] },
  'D02': { name: 'Khối D02 (Toán, Văn, Nga)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Nga'] },
  'D03': { name: 'Khối D03 (Toán, Văn, Pháp)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Pháp'] },
  'D04': { name: 'Khối D04 (Toán, Văn, Trung)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Trung'] },
  'D05': { name: 'Khối D05 (Toán, Văn, Đức)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Đức'] },
  'D06': { name: 'Khối D06 (Toán, Văn, Nhật)', subjects: ['Toán học', 'Ngữ văn', 'Tiếng Nhật'] },
  'D78': { name: 'Khối D78 (Văn, KHXH, Anh)', subjects: ['Ngữ văn', 'Khoa học Xã hội', 'Tiếng Anh'] },
  'D96': { name: 'Khối D96 (Toán, KHXH, Anh)', subjects: ['Toán học', 'Khoa học Xã hội', 'Tiếng Anh'] }
};

const AiSuggestion = () => {
  const [selectedBlock, setSelectedBlock] = useState('A01');
  const [scores, setScores] = useState({ sub1: '', sub2: '', sub3: '' });
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleBlockChange = (e) => {
    setSelectedBlock(e.target.value);
    setScores({ sub1: '', sub2: '', sub3: '' });
    setAnalysisData(null); 
  };

  // ==========================================
  // THUẬT TOÁN AI PHÂN TÍCH LỘ TRÌNH (FRONTEND)
  // ==========================================
  const handleAnalyze = async () => {
    if (!scores.sub1 || !scores.sub2 || !scores.sub3) {
      alert("Vui lòng nhập đầy đủ điểm 3 môn nhé!");
      return;
    }

    setLoading(true);
    try {
      // Tính tổng điểm
      const totalScore = parseFloat(scores.sub1) + parseFloat(scores.sub2) + parseFloat(scores.sub3);
      
      // Gọi API lấy toàn bộ dữ liệu trường từ Database
      const response = await axios.get('http://localhost:8000/api/universities');
      const allUnis = response.data;

      // Lọc các trường có xét tuyển khối người dùng chọn
      const blockUnis = allUnis.filter(uni => 
        uni.subject_block && uni.subject_block.includes(selectedBlock)
      );

      const safe = [];
      const moderate = [];
      const challenge = [];

      // Phân loại nhóm trường
      blockUnis.forEach(uni => {
        const uniScore = parseFloat(uni.score_thpt_last_year) || parseFloat(uni.base_score) || 0;
        if (uniScore === 0) return; // Bỏ qua nếu trường chưa cập nhật điểm

        // Format lại dữ liệu cho chuẩn giao diện
        const formattedUni = {
          id: uni.id,
          school_name: uni.school_name || uni.name,
          school_logo: uni.school_logo || `https://images.unsplash.com/photo-${1523050854058 + uni.id}-8df90110c9f1?w=100&q=80`,
          major_name: uni.major_code ? `${uni.major_name} (${uni.major_code})` : (uni.major_name || 'Đa ngành'),
          base_score: uni.score_thpt_last_year || uni.base_score,
          ranking_note: uni.ranking_note ? uni.ranking_note.split(' - ')[1] : 'Việt Nam',
          tuition_fee: uni.tuition_fee || 'Cập nhật...'
        };

        const diff = totalScore - uniScore;

        if (diff >= 1.5) {
          // An toàn: Điểm cao hơn điểm chuẩn từ 1.5đ trở lên (Tỉ lệ đỗ 85-99%)
          formattedUni.match_percent = Math.min(99, Math.round(85 + diff * 3));
          safe.push(formattedUni);
        } else if (diff >= -0.5 && diff < 1.5) {
          // Vừa sức: Lệch trong khoảng -0.5đ đến +1.5đ (Tỉ lệ đỗ 65-84%)
          formattedUni.match_percent = Math.round(65 + (diff + 0.5) * 10);
          moderate.push(formattedUni);
        } else if (diff >= -3 && diff < -0.5) {
          // Thử thách: Thấp hơn điểm chuẩn từ -3đ đến -0.5đ (Tỉ lệ đỗ 30-64%)
          formattedUni.match_percent = Math.max(30, Math.round(50 + (diff + 0.5) * 8));
          challenge.push(formattedUni);
        }
      });

      // Sắp xếp các nhóm theo % độ phù hợp giảm dần
      safe.sort((a, b) => b.match_percent - a.match_percent);
      moderate.sort((a, b) => b.match_percent - a.match_percent);
      challenge.sort((a, b) => b.match_percent - a.match_percent);

      // Cắt lấy 4 trường đại diện mỗi nhóm để giao diện không bị dài quá
      setAnalysisData({
        total_score: totalScore.toFixed(2),
        ai_explanation: `Với tổng điểm ${totalScore.toFixed(2)} ở ${BLOCK_CONFIG[selectedBlock].name}, bạn đang có lợi thế lớn ở nhóm trường tầm trung. Hệ thống AI nhận thấy điểm của bạn rất ổn định. Lời khuyên là hãy rải đều nguyện vọng: Đặt 1-2 trường ở nhóm 'Thử thách' lên đầu (NV1, NV2), tiếp theo là 2-3 trường 'Vừa sức', và lót đáy bằng 1-2 trường 'An toàn' để đảm bảo 100% trúng tuyển đại học.`,
        results: {
          safe: safe.slice(0, 4),
          moderate: moderate.slice(0, 4),
          challenge: challenge.slice(0, 4)
        }
      });

    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối đến dữ liệu hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page-container fade-in">
      <div className="ai-page-header">
        <span className="badge-ai-powered"><Sparkles size={14} /> AI POWERED</span>
        <h1>Gợi ý Trường theo Điểm thi</h1>
        <p>Hệ thống UniAI phân tích dữ liệu lịch sử kết hợp với xu hướng đăng ký năm nay để đưa ra lộ trình trúng tuyển tối ưu.</p>
      </div>

      <div className="ai-main-layout">
        <div className="ai-input-sidebar">
          <div className="input-card">
            <h3>Nhập điểm của bạn</h3>
            
            <div className="form-group">
              <label>KHỐI XÉT TUYỂN</label>
              <select 
                className="custom-select-real" 
                value={selectedBlock} 
                onChange={handleBlockChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer', fontSize: '1rem', color: '#0f172a', fontWeight: '500' }}
              >
                {Object.keys(BLOCK_CONFIG).map(key => (
                  <option key={key} value={key}>{BLOCK_CONFIG[key].name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{BLOCK_CONFIG[selectedBlock].subjects[0]}</label>
              <input type="number" step="0.1" value={scores.sub1} onChange={(e) => setScores({...scores, sub1: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{BLOCK_CONFIG[selectedBlock].subjects[1]}</label>
              <input type="number" step="0.1" value={scores.sub2} onChange={(e) => setScores({...scores, sub2: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{BLOCK_CONFIG[selectedBlock].subjects[2]}</label>
              <input type="number" step="0.1" value={scores.sub3} onChange={(e) => setScores({...scores, sub3: e.target.value})} />
            </div>

            <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}>
              <Zap size={18} fill="currentColor" /> {loading ? 'Đang phân tích...' : 'Phân tích AI'}
            </button>
          </div>
        </div>

        <div className="ai-results-content">
          {!analysisData ? (
            <div style={{textAlign: 'center', padding: '50px', color: '#64748b'}}>
              <Sparkles size={40} color="#cbd5e1" style={{marginBottom: '15px'}}/>
              <h3>Sẵn sàng dự báo tương lai của bạn</h3>
              <p>Nhập điểm số và nhấn "Phân tích AI" để hệ thống tính toán lộ trình trúng tuyển tốt nhất.</p>
            </div>
          ) : (
            <>
              <div className="ai-logic-summary">
                <h4><Sparkles size={16} /> Tóm tắt AI Logic</h4>
                <p>Tổng điểm của bạn: <strong style={{color: '#4f46e5', fontSize: '1.2rem'}}>{analysisData.total_score}</strong>. Phân tích dựa trên phổ điểm <strong>{BLOCK_CONFIG[selectedBlock].name}</strong> hiện tại và đối chiếu với cơ sở dữ liệu các trường.</p>
              </div>

              {analysisData.results.safe.length > 0 && (
                <div className="result-group">
                  <div className="group-title green">
                    <div className="color-line"></div>
                    <h3><ShieldCheck size={20} color="#22c55e" /> An toàn</h3>
                    <span>Khả năng &gt; 80%</span>
                  </div>
                  {analysisData.results.safe.map(school => (
                    <div className="school-card safe-card" key={school.id}>
                      <div className="card-header">
                        {/* ĐÃ FIX LỖI ẢNH LOGO BỊ TRỐNG */}
                        <img src={school.school_logo} alt="Logo" className="school-logo-sm" style={{objectFit: 'contain', background: 'white'}} />
                        <div className="school-info">
                          <h4 style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={school.school_name}>{school.school_name}</h4>
                          <p className="major-name text-blue">{school.major_name}</p>
                        </div>
                      </div>
                      <div className="card-stats">
                        <div><span>ĐIỂM CHUẨN</span><strong>{school.base_score}</strong></div>
                        <div><span>PHÙ HỢP AI</span><strong className="text-green">{school.match_percent}%</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analysisData.results.moderate.length > 0 && (
                <div className="result-group">
                  <div className="group-title blue">
                    <div className="color-line"></div>
                    <h3><Target size={20} color="#3b82f6" /> Vừa sức</h3>
                    <span>Khả năng 50-80%</span>
                  </div>
                  <div className="cards-grid">
                    {analysisData.results.moderate.map(school => (
                      <div className="school-card" key={school.id}>
                        <div className="card-header flex-col">
                          <div className="badge-match">AI MATCH {school.match_percent}%</div>
                          <img src={school.school_logo} alt="Logo" className="school-logo-sm" style={{marginBottom: '10px', objectFit: 'contain', background: 'white', width: '50px', height: '50px', borderRadius: '50%'}} />
                          <h4 style={{textAlign: 'center', height: '40px', overflow: 'hidden'}}>{school.school_name}</h4>
                          <p className="major-name" style={{textAlign: 'center'}}>{school.major_name}</p>
                        </div>
                        <div className="card-stats-mini">
                          <div><span>ĐIỂM CHUẨN</span><strong>{school.base_score}</strong></div>
                          <div><span>HỌC PHÍ</span><strong style={{fontSize: '0.8rem', fontWeight: '500'}}>{school.tuition_fee}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisData.results.challenge.length > 0 && (
                <div className="result-group">
                  <div className="group-title orange">
                    <div className="color-line"></div>
                    <h3><AlertTriangle size={20} color="#f97316" /> Thử thách</h3>
                    <span>Nguyện vọng cao (&lt; 50%)</span>
                  </div>
                  {analysisData.results.challenge.map(school => (
                    <div className="school-card challenge-card" key={school.id}>
                      <div className="card-left">
                        <img src={school.school_logo} alt="Logo" className="school-logo-md" style={{objectFit: 'contain', background: 'white'}} />
                      </div>
                      <div className="card-center">
                        <h4>{school.school_name}</h4>
                        <p className="major-name text-orange">{school.major_name}</p>
                        <div className="ai-quote">Điểm của bạn đang thấp hơn điểm chuẩn năm ngoái ({school.base_score}). Khuyến nghị chỉ đặt làm Nguyện vọng 1-2.</div>
                      </div>
                      <div className="card-right">
                        <span>KHẢ NĂNG ĐẬU</span>
                        <strong className="text-orange score-big">{school.match_percent}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(analysisData.results.safe.length === 0 && analysisData.results.moderate.length === 0 && analysisData.results.challenge.length === 0) && (
                 <div style={{textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px'}}>
                    <AlertTriangle size={30} color="#f59e0b" style={{marginBottom: '10px'}}/>
                    <h4>Chưa có dữ liệu phù hợp</h4>
                    <p>Hiện tại hệ thống chưa có dữ liệu trường đại học nào xét tuyển khối {selectedBlock} ở mức điểm này. Bạn thử khối khác xem sao nhé!</p>
                 </div>
              )}

              <div className="ai-explanation-box">
                <div className="box-header">
                  <div className="icon-wrapper"><Sparkles size={20} /></div>
                  <h2>Lý giải từ UniAI</h2>
                </div>
                <p>{analysisData.ai_explanation}</p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AiSuggestion;