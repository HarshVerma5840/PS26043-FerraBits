import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { messageApi } from '../api/messageApi'
import { MessageSquare, Send, User } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function MessagingPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations()
  })

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', selectedConv],
    queryFn: () => {
      if (!selectedConv) return []
      return messageApi.getMessages(selectedConv)
    },
    enabled: !!selectedConv
  })

  const sendMutation = useMutation({
    mutationFn: () => messageApi.sendMessage(selectedConv!, content),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConv] })
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Project Communications</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Secure messaging channel</p>
        </div>
      </header>

      <div className="glass-panel" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 600 }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading...</div> : conversations?.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedConv(c.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--glass-border)', 
                  cursor: 'pointer',
                  background: selectedConv === c.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Channel: {c.type}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {c.id.substring(0,8)}...</div>
              </div>
            ))}
            {(!conversations || conversations.length === 0) && (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active conversations.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingMsgs ? <div style={{ color: 'var(--text-muted)' }}>Loading messages...</div> : messages?.map((m: any) => {
                  const isMe = m.senderId === user?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ 
                        maxWidth: '70%', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '8px',
                        background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: isMe ? 'none' : '1px solid var(--glass-border)'
                      }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {isMe ? 'You' : m.senderId}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && content.trim()) sendMutation.mutate()
                  }}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}
                />
                <button className="btn" onClick={() => sendMutation.mutate()} disabled={!content.trim() || sendMutation.isPending}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
