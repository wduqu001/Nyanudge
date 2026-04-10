import React from 'react';
import { LocalNotifications, type PendingResult } from '@capacitor/local-notifications';

interface DebugPanelProps {
  pendingNotifs: PendingResult;
  setPendingNotifs: (val: PendingResult | null) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ pendingNotifs, setPendingNotifs }) => {
  return (
    <div style={{ 
      margin: '0 20px 20px', 
      padding: '16px', 
      background: 'var(--card-bg)', 
      borderRadius: '16px', 
      fontSize: '11px', 
      maxHeight: '300px', 
      overflow: 'auto', 
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-secondary)',
      boxShadow: 'var(--shadow-sm)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px', 
        borderBottom: '1px solid var(--border-subtle)', 
        paddingBottom: '8px' 
      }}>
        <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
          Debug: Pending ({pendingNotifs.notifications.length})
        </strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={async () => {
              await LocalNotifications.schedule({
                notifications: [{
                  id: 999,
                  title: 'Test Meow! 🐱',
                  body: 'Firing in 5 seconds...',
                  schedule: { at: new Date(Date.now() + 5000) },
                  channelId: 'nyanudge_default'
                }]
              });
              // Refreshing list isn't automatic, but helpful for dev
              const updated = await LocalNotifications.getPending();
              setPendingNotifs(updated);
            }} 
            style={{ 
              fontSize: '10px', 
              padding: '4px 10px', 
              borderRadius: '8px', 
              background: 'var(--accent)', 
              color: 'white', 
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Test 5s
          </button>
          <button 
            onClick={() => setPendingNotifs(null)} 
            style={{ 
              fontSize: '10px', 
              padding: '4px 10px', 
              borderRadius: '8px', 
              background: 'var(--surface-bg)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            Hide
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[...pendingNotifs.notifications]
          .sort((a, b) => {
            const timeA = a.schedule?.at ? new Date(a.schedule.at).getTime() : 0;
            const timeB = b.schedule?.at ? new Date(b.schedule.at).getTime() : 0;
            return timeA - timeB;
          })
          .map(n => {
            const fireDate = n.schedule?.at ? new Date(n.schedule.at) : null;
            const isToday = fireDate?.toDateString() === new Date().toDateString();
            
            return (
              <div key={n.id} style={{ 
                borderBottom: '1px dotted var(--border-subtle)', 
                padding: '6px 0', 
                display: 'flex', 
                justifyContent: 'space-between',
                fontFamily: 'monospace'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ID: {n.id} | {n.title}</span>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>{n.body?.substring(0, 30)}...</span>
                </div>
                <div style={{ textAlign: 'right', minWidth: '70px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {fireDate ? fireDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                  </div>
                  {!isToday && <div style={{ fontSize: '8px', opacity: 0.6 }}>Tomorrow</div>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
