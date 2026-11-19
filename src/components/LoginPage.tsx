import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import { authenticateAccount } from './moral-center/utils/adminAuthService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const res = authenticateAccount(cleanUser, cleanPass);
    if (res.success) {
      sessionStorage.setItem('current_user', cleanUser);
      onLoginSuccess();
      return;
    }

    setError(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Username หรือ Password ไม่ถูกต้อง)');
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: '"Inter", "Sarabun", sans-serif'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Logo */}
        <div style={{ width: '120px', height: '120px', marginBottom: '24px' }}>
          <img src="/moral-center-logo.png" alt="Moral Center Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>
          ศูนย์คุณธรรม (องค์การมหาชน)
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
          ระบบวิเคราะห์และประเมินผลโครงการ
        </p>

        <form onSubmit={handleLogin} autoComplete="off" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Username
            </label>
            <input 
              type="text" 
              name="login_user"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                fontSize: '16px',
                outline: 'none'
              }} 
              placeholder="กรอกชื่อผู้ใช้งาน..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Password
            </label>
            <input 
              type="password" 
              name="login_pwd"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                fontSize: '16px',
                outline: 'none'
              }} 
              placeholder="กรอกรหัสผ่าน..."
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', marginTop: '4px' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', paddingBottom: '4px', borderBottom: '1px dashed #cbd5e1' }}>
              * สำหรับบัญชีผู้ดูแลระบบ (Admin) จะต้องพิมพ์ Username และ Password ด้วยตนเองเท่านั้น
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <User size={14} color="#64748b" />
                <span><strong>User a1:</strong> <code style={{ color: '#475569', fontWeight: 700 }}>a1</code> / <code style={{ color: '#475569', fontWeight: 700 }}>test</code> (ดร.อนันต์)</span>
              </span>
              <button
                type="button"
                onClick={() => { setUsername('a1'); setPassword('test'); setError(''); }}
                style={{ padding: '3px 8px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', color: '#475569', cursor: 'pointer', fontWeight: 700 }}
              >
                เลือก a1
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <User size={14} color="#64748b" />
                <span><strong>User a2:</strong> <code style={{ color: '#475569', fontWeight: 700 }}>a2</code> / <code style={{ color: '#475569', fontWeight: 700 }}>test</code> (พญ.กานดา)</span>
              </span>
              <button
                type="button"
                onClick={() => { setUsername('a2'); setPassword('test'); setError(''); }}
                style={{ padding: '3px 8px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', color: '#475569', cursor: 'pointer', fontWeight: 700 }}
              >
                เลือก a2
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <User size={14} color="#64748b" />
                <span><strong>User a3:</strong> <code style={{ color: '#475569', fontWeight: 700 }}>a3</code> / <code style={{ color: '#475569', fontWeight: 700 }}>test</code> (อ.วิชัย)</span>
              </span>
              <button
                type="button"
                onClick={() => { setUsername('a3'); setPassword('test'); setError(''); }}
                style={{ padding: '3px 8px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '5px', color: '#475569', cursor: 'pointer', fontWeight: 700 }}
              >
                เลือก a3
              </button>
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              marginTop: '16px',
              width: '100%', 
              padding: '14px', 
              background: '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            <LogIn size={20} /> เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};
