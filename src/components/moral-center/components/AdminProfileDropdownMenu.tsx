import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Database,
  Layers,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';
import {
  logoutSystem,
  isAccountLoggedIn,
  authenticateAccount,
  type UserProfile
} from '../utils/adminAuthService';

export interface AdminProfileDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  profile: UserProfile;
  isLoggedIn?: boolean;
  onOpenDatabase: () => void;
  onOpenDataset: () => void;
  onLogoutAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  onLogoutSystem?: () => void;
  position?: 'above' | 'below';
  align?: 'left' | 'right';
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const AdminProfileDropdownMenu: React.FC<AdminProfileDropdownMenuProps> = ({
  isOpen,
  onClose,
  isAdmin,
  profile,
  isLoggedIn,
  onOpenDatabase,
  onOpenDataset,
  onLogoutAdmin,
  onOpenAdminLogin,
  onLogoutSystem,
  position = 'below',
  align = 'right',
  triggerRef
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      let target = triggerRef?.current;
      if (!target) {
        // Fallback: auto-locate the active admin/login button in the hero banner or top bar
        target = (document.querySelector('.pilot-hero-login-btn') as HTMLElement) ||
                 (document.querySelector('.mdc-login-btn') as HTMLElement);
      }
      if (target) {
        const rect = target.getBoundingClientRect();
        if (position === 'above') {
          setCoords({
            bottom: Math.max(10, window.innerHeight - rect.top + 6),
            right: Math.max(12, window.innerWidth - rect.right)
          });
        } else {
          setCoords({
            top: Math.max(10, rect.bottom + 6),
            right: Math.max(12, window.innerWidth - rect.right)
          });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, triggerRef, position]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target && target.closest && target.closest('.mdc-login-btn')) {
          return;
        }
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSystemLogout = () => {
    onClose();
    if (onLogoutAdmin) {
      onLogoutAdmin();
    }
    if (onLogoutSystem) {
      onLogoutSystem();
    }
    logoutSystem();
  };

  const effectiveLoggedIn = isLoggedIn ?? isAccountLoggedIn();

  const menuElement = (
    <div
      ref={menuRef}
      className="admin-profile-dropdown-menu"
      style={{
        position: 'fixed',
        ...(coords
          ? {
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              right: `${coords.right}px`
            }
          : {
              top: '64px',
              right: '24px'
            }),
        width: '260px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.28), 0 8px 20px rgba(15, 23, 42, 0.12)',
        zIndex: 999999, // Layer สูงสุดเหนือ Banner
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        animation: 'fadeIn 0.15s ease-out',
        fontFamily: "'Kanit', sans-serif",
        color: '#1e293b',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Invisible Hover Bridge connecting trigger button and menu */}
      <div
        style={{
          position: 'absolute',
          top: position === 'below' ? '-10px' : 'auto',
          bottom: position === 'above' ? '-10px' : 'auto',
          left: 0,
          right: 0,
          height: '10px',
          background: 'transparent',
          pointerEvents: 'auto'
        }}
      />
      {/* 1. User Header Summary (White Clean Card) */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '12px',
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px'
        }}
      >
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            objectFit: 'cover',
            border: isAdmin ? '2px solid #10b981' : '2px solid #3b82f6',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isAdmin ? 'admin' : profile.name}
            </span>
            {isAdmin && <ShieldCheck size={14} color="#059669" />}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: isAdmin ? '#059669' : '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : profile.title || 'ผู้ใช้งานทั่วไป'}
          </div>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '6px',
                background: (profile.tier === 'A1' || isAdmin) ? '#e0f2fe' : profile.tier === 'A2' ? '#dcfce7' : '#fef3c7',
                color: (profile.tier === 'A1' || isAdmin) ? '#0284c7' : profile.tier === 'A2' ? '#15803d' : '#b45309',
                border: `1px solid ${(profile.tier === 'A1' || isAdmin) ? '#bae6fd' : profile.tier === 'A2' ? '#bbf7d0' : '#fde68a'}`
              }}
            >
              {(profile.tier === 'A1' || isAdmin) ? 'A1: ระดับนโยบาย' : profile.tier === 'A2' ? 'A2: ระดับผู้ปฏิบัติงาน' : 'A3: ระดับประชาชนทั่วไป'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Role Switcher Chips for Demo / Testing (A1 / A2 / A3) */}
      <div
        style={{
          padding: '8px 10px',
          marginBottom: '6px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
          สลับระดับสิทธิ์การแสดงผล (RBAC):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              authenticateAccount('a1', 'test');
              onClose();
            }}
            style={{
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              border: (profile.tier === 'A1' && !isAdmin) ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
              background: (profile.tier === 'A1' && !isAdmin) ? '#e0f2fe' : '#ffffff',
              color: (profile.tier === 'A1' && !isAdmin) ? '#0284c7' : '#475569',
              cursor: 'pointer',
              fontFamily: 'Kanit, sans-serif'
            }}
            title="A1: ระดับนโยบาย (ดร.อนันต์)"
          >
            A1 นโยบาย
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              authenticateAccount('a2', 'test');
              onClose();
            }}
            style={{
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              border: profile.tier === 'A2' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
              background: profile.tier === 'A2' ? '#dcfce7' : '#ffffff',
              color: profile.tier === 'A2' ? '#15803d' : '#475569',
              cursor: 'pointer',
              fontFamily: 'Kanit, sans-serif'
            }}
            title="A2: ระดับผู้ปฏิบัติงาน (พญ.กานดา)"
          >
            A2 ปฏิบัติงาน
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              authenticateAccount('a3', 'test');
              onClose();
            }}
            style={{
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              border: profile.tier === 'A3' ? '1.5px solid #b45309' : '1px solid #cbd5e1',
              background: profile.tier === 'A3' ? '#fef3c7' : '#ffffff',
              color: profile.tier === 'A3' ? '#b45309' : '#475569',
              cursor: 'pointer',
              fontFamily: 'Kanit, sans-serif'
            }}
            title="A3: ระดับประชาชนทั่วไป (อ.วิชัย)"
          >
            A3 ประชาชน
          </button>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* MENU ITEM 1: DATABASE (No subtitle) */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onOpenDatabase();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Database size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                Database
              </div>
            </div>
            <ChevronRight size={15} color="#94a3b8" />
          </button>

          {/* MENU ITEM 2: DATASET (No subtitle) */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onOpenDataset();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Layers size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                Dataset
              </div>
            </div>
            <ChevronRight size={15} color="#94a3b8" />
          </button>

          <div
            style={{
              height: '1px',
              backgroundColor: '#f1f5f9',
              margin: '3px 0'
            }}
          />

          {/* UNIFIED LOGOUT BUTTON: ออกจากระบบ */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleSystemLogout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#dc2626',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <LogOut size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                ออกจากระบบ
              </div>
            </div>
          </button>
        </>
      ) : effectiveLoggedIn ? (
        /* เมื่อเข้าเป็น account ทั่วไป (เช่น a1, a2, a3): ลบปุ่ม "เข้าสู่ระบบ admin" ออก ให้แสดงเฉพาะปุ่ม "ออกจากระบบ" */
        <>
          {/* UNIFIED LOGOUT BUTTON: ออกจากระบบ */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleSystemLogout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#dc2626',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <LogOut size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                ออกจากระบบ
              </div>
            </div>
          </button>
        </>
      ) : (
        /* เมื่อยังไม่ได้ login เท่านั้น: แสดงปุ่มเข้าสู่ระบบ admin */
        <>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              if (onOpenAdminLogin) onOpenAdminLogin();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Lock size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                เข้าสู่ระบบ Admin
              </div>
            </div>
          </button>
        </>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(menuElement, document.body) : menuElement;
};
