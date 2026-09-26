import React from 'react'
import { UserPlus, Trash2 } from 'lucide-react'
import { Conversation } from '../../types'

interface Props {
  conversation: Conversation
  onAddParticipant: () => void
  onRemoveParticipant: (userId: string) => void
  loadingUserId?: string | null
}

export default function ConversationDetails({ conversation, onAddParticipant, onRemoveParticipant, loadingUserId }: Props) {
  return (
    <div style={{ width: '280px', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Details</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div><strong>Type:</strong> {conversation.type}</div>
          {conversation.contextId && <div><strong>Context:</strong> {conversation.contextId.substring(0,8)}...</div>}
          <div><strong>Created:</strong> {new Date(conversation.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Participants ({conversation.participants?.length || 0})</h4>
          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={onAddParticipant}>
            <UserPlus size={14} /> Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {conversation.participants?.map(p => (
            <div key={p.userId} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.userId.substring(0,8)}...</div>
                {p.role && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.role}</div>}
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.3rem', color: '#f43f5e' }} 
                onClick={() => onRemoveParticipant(p.userId)}
                disabled={loadingUserId === p.userId}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {(!conversation.participants || conversation.participants.length === 0) && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No participants loaded.</div>
          )}
        </div>
      </div>
    </div>
  )
}
