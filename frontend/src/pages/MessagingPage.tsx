import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useState, useRef, useEffect } from 'react'
import { messageApi } from '../api/messageApi'
import { MessageSquare, Send, Plus, Trash2, CheckCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

import CreateConversationDialog from '../components/messaging/CreateConversationDialog'
import AddParticipantDialog from '../components/messaging/AddParticipantDialog'
import ConversationDetails from '../components/messaging/ConversationDetails'

export default function MessagingPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Dialogs
  const [showCreate, setShowCreate] = useState(false)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  
  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  // Fetch all conversations
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations()
  })

  // Fetch selected conversation details
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: selectedConv, isLoading: loadingConvDetails } = useQuery({
    queryKey: ['conversation', selectedConvId],
    queryFn: () => messageApi.getConversation(selectedConvId!),
    enabled: !!selectedConvId
  })

  // Fetch paginated messages for selected conversation
  const { data: messageData, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: () => messageApi.getMessages(selectedConvId!, 0, 50),
    enabled: !!selectedConvId
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messageData])

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (messageData && user && selectedConvId) {
      const unread = messageData.content.filter(m => !m.isRead && m.senderId !== user.id)
      unread.forEach(m => {
        messageApi.markAsRead(selectedConvId, m.id).catch(console.error)
      })
      if (unread.length > 0) {
        // Refresh after marking
        setTimeout(() => queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] }), 1000)
      }
    }
  }, [messageData, user, selectedConvId, queryClient])

  // Handlers
  const handleCreateConv = async (type: string, contextId?: string) => {
    setActionLoading(true)
    try {
      const conv = await messageApi.createConversation(type, contextId)
      await queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setShowCreate(false)
      setSelectedConvId(conv.id)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleAddParticipant = async (userId: string) => {
    setActionLoading(true)
    try {
      await messageApi.addParticipant(selectedConvId!, userId)
      await queryClient.invalidateQueries({ queryKey: ['conversation', selectedConvId] })
      setShowAddParticipant(false)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleRemoveParticipant = async (userId: string) => {
    setRemovingUserId(userId)
    try {
      await messageApi.removeParticipant(selectedConvId!, userId)
      await queryClient.invalidateQueries({ queryKey: ['conversation', selectedConvId] })
    } catch (err: any) { toast.error(err.message) }
    finally { setRemovingUserId(null) }
  }

  const sendMutation = useMutation({
    mutationFn: () => messageApi.sendMessage(selectedConvId!, content),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] }) // update last message time
    }
  })

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await messageApi.deleteMessage(messageId)
      await queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] })
    } catch (err: any) { toast.error(err.message) }
  }

  const messages = messageData?.content ? [...messageData.content].reverse() : [] // Backend returns newest first usually, we want oldest first for chat

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MessageSquare size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Secure Messaging</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>End-to-end communication channels</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Conversation
        </button>
      </header>

      <div className="glass-panel" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar: Conversations List */}
        <div style={{ width: '320px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading...</div> : conversations?.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedConvId(c.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--glass-border)', 
                  cursor: 'pointer',
                  background: selectedConvId === c.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{c.type.replace('_', ' ')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {c.contextId ? `Ctx: ${c.contextId.substring(0,8)}` : 'General'}
                  </div>
                </div>
                {c.unreadCount ? (
                  <div style={{ background: '#f43f5e', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, height: 'fit-content' }}>
                    {c.unreadCount}
                  </div>
                ) : null}
              </div>
            ))}
            {(!conversations || conversations.length === 0) && (
              <div style={{ padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                No active conversations.
              </div>
            )}
          </div>
        </div>

        {/* Center: Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedConvId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              {/* Messages Window */}
              <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingMsgs ? <div style={{ color: 'var(--text-muted)' }}>Loading messages...</div> : messages.map(m => {
                  const isMe = m.senderId === user?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div className="message-bubble" style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '8px',
                        background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', border: isMe ? 'none' : '1px solid var(--glass-border)'
                      }}>
                        <div style={{ flex: 1 }}>{m.content}</div>
                        {isMe && (
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteMessage(m.id)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                            title="Delete message"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isMe ? 'You' : m.senderId.substring(0,8)} · {new Date(m.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isMe && (
                          <span style={{ color: m.isRead || (m.readBy && m.readBy.length > 0) ? '#60a5fa' : 'var(--text-muted)' }}>
                            <CheckCheck size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {messages.length === 0 && !loadingMsgs && (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No messages yet. Say hello!</div>
                )}
              </div>
              
              {/* Input Area */}
              <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && content.trim()) sendMutation.mutate() }}
                  placeholder="Type your secure message..."
                  style={{ flex: 1, padding: '0.85rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}
                />
                <button className="btn" onClick={() => sendMutation.mutate()} disabled={!content.trim() || sendMutation.isPending} style={{ background: 'var(--primary)', padding: '0.85rem 1.25rem' }}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar: Conversation Details */}
        {selectedConv && (
          <ConversationDetails 
            conversation={selectedConv} 
            onAddParticipant={() => setShowAddParticipant(true)}
            onRemoveParticipant={handleRemoveParticipant}
            loadingUserId={removingUserId}
          />
        )}

      </div>

      {/* Dialogs */}
      {showCreate && <CreateConversationDialog onClose={() => setShowCreate(false)} onSave={handleCreateConv} loading={actionLoading} />}
      {showAddParticipant && <AddParticipantDialog onClose={() => setShowAddParticipant(false)} onAdd={handleAddParticipant} loading={actionLoading} />}
      
    </div>
  )
}
