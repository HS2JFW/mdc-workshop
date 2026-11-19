import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: '"Prompt", "Inter", sans-serif',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#ef4444'
            }}>
              <AlertTriangle size={36} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0', color: '#ffffff' }}>
              เกิดข้อผิดพลาดในการโหลดหน้าเว็บ
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              ระบบพบปัญหาชั่วคราวในการประมวลผล กรุณาลองรีเฟรชหน้าเว็บ หรือล้างข้อมูลเซสชัน
            </p>

            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: '#0f172a',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                color: '#f87171',
                fontSize: '13px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                marginBottom: '24px',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> รีเฟรชหน้าเว็บ
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#334155',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <LogIn size={16} /> ล้างเซสชันและเข้าสู่ระบบใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
