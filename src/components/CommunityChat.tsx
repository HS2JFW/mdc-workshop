import React, { useState } from 'react';
import { Send, MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'สมชาย รักชาติ',
    avatar: 'SR',
    content: 'โครงการพัฒนาแหล่งน้ำในชุมชนเราถึงไหนแล้วครับ มีใครพอทราบอัปเดตบ้าง?',
    timestamp: '2 ชั่วโมงที่แล้ว',
    likes: 12,
    replies: 3
  },
  {
    id: '2',
    author: 'วิไลลักษณ์ ถิ่นป่า',
    avatar: 'WT',
    content: 'เห็นคะแนนด้านความโปร่งใสของเดือนนี้เพิ่มขึ้น ดีใจมากเลยค่ะที่ทุกคนช่วยกันตรวจสอบ',
    timestamp: '5 ชั่วโมงที่แล้ว',
    likes: 24,
    replies: 5
  },
  {
    id: '3',
    author: 'ประเสริฐ ดียิ่ง',
    avatar: 'PD',
    content: 'วันเสาร์นี้ขอเชิญลูกบ้านทุกท่านมาร่วมประชุมแผนงานประจำปีที่ศาลาประชาคมนะครับ',
    timestamp: '1 วันที่แล้ว',
    likes: 45,
    replies: 12
  }
];

export const CommunityChat: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: 'คุณ (ผู้ใช้งาน)',
      avatar: 'Me',
      content: newPost,
      timestamp: 'เมื่อสักครู่',
      likes: 0,
      replies: 0
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', margin: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 }}>กระดานสนทนาชุมชน (Chat & Post)</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>พูดคุย แลกเปลี่ยนความคิดเห็นในกลุ่ม</p>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
            Me
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="มีอะไรอยากแชร์กับชุมชนบ้าง..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                paddingRight: '48px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: newPost.trim() ? '#4f46e5' : '#e2e8f0',
                color: newPost.trim() ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Send size={14} /> โพสต์
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '0', display: 'flex', flexDirection: 'column', maxHeight: '400px', overflowY: 'auto' }}>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              {post.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{post.author}</span>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{post.timestamp}</span>
              </div>
              <p style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                {post.content}
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                  <ThumbsUp size={14} /> {post.likes} ถูกใจ
                </button>
                <button style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                  <MessageCircle size={14} /> {post.replies} ตอบกลับ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
