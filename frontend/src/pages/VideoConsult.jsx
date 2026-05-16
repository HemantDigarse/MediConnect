import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Peer from 'peerjs'
import api from '../api/axiosInstance'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, MessageSquare, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VideoConsult() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  // Consultation state
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [webrtcError, setWebrtcError]   = useState(false)

  // Video refs
  const localVideoRef  = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef        = useRef(null)
  const streamRef      = useRef(null)
  const stompRef       = useRef(null)

  // Controls
  const [muted,      setMuted]      = useState(false)
  const [camOff,     setCamOff]     = useState(false)
  const [chatOpen,   setChatOpen]   = useState(true)
  const [messages,   setMessages]   = useState([])
  const [msgInput,   setMsgInput]   = useState('')
  const [connected,  setConnected]  = useState(false)
  const [remoteConn, setRemoteConn] = useState(false)
  const chatEndRef = useRef(null)

  // ── Load / Start Consultation ─────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        let res = await api.post(`/consultations/start/${appointmentId}`)
        setConsultation(res.data.data)
      } catch (err) {
        if (err.response?.status === 400) {
          // Already started — fetch existing
          try {
            const apptRes = await api.get(`/appointments/patient/${user?.id}?size=50`)
            const appt = apptRes.data.data?.content?.find(a => a.id === appointmentId)
            if (appt) {
              const cRes = await api.get(`/consultations/${appointmentId}`)
              setConsultation(cRes.data.data)
            }
          } catch {}
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [appointmentId, user?.id])

  // ── WebRTC via PeerJS ─────────────────────────────────────────────
  useEffect(() => {
    if (!consultation?.videoRoomId) return
    let peer

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        peer = new Peer(user.id + '-' + consultation.videoRoomId.slice(0, 8), {
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        })
        peerRef.current = peer

        peer.on('open', () => {
          setConnected(true)
          // Call the other participant
          const otherId = consultation.videoRoomId
          const call = peer.call(otherId, stream)
          if (call) {
            call.on('stream', remoteStream => {
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
              setRemoteConn(true)
            })
          }
        })

        peer.on('call', call => {
          call.answer(stream)
          call.on('stream', remoteStream => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
            setRemoteConn(true)
          })
        })

        peer.on('error', err => {
          console.warn('PeerJS error:', err)
          if (err.type === 'browser-incompatible') setWebrtcError(true)
        })
      } catch (err) {
        console.warn('Camera/mic error:', err)
        setWebrtcError(true)
      }
    }

    startVideo()

    return () => {
      peer?.destroy()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [consultation?.videoRoomId, user?.id])

  // ── STOMP Chat ────────────────────────────────────────────────────
  useEffect(() => {
    if (!consultation?.id) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/consultation/${consultation.id}`, msg => {
          const data = JSON.parse(msg.body)
          setMessages(prev => [...prev, data])
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
        // Announce join
        client.publish({
          destination: `/app/chat/${consultation.id}`,
          body: JSON.stringify({ senderId: user.id, senderName: user.fullName, message: `${user.fullName} joined the call`, type: 'JOIN' }),
        })
      },
      reconnectDelay: 3000,
    })

    client.activate()
    stompRef.current = client

    return () => { client.deactivate() }
  }, [consultation?.id, user])

  const sendMessage = () => {
    if (!msgInput.trim() || !stompRef.current?.connected) return
    stompRef.current.publish({
      destination: `/app/chat/${consultation?.id}`,
      body: JSON.stringify({ senderId: user.id, senderName: user.fullName, message: msgInput.trim(), type: 'CHAT' }),
    })
    setMsgInput('')
  }

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = muted })
      setMuted(!muted)
    }
  }

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = camOff })
      setCamOff(!camOff)
    }
  }

  const endCall = async () => {
    try {
      await api.patch(`/consultations/${consultation?.id}/end`)
      toast.success('Consultation ended.')
    } catch {}
    peerRef.current?.destroy()
    streamRef.current?.getTracks().forEach(t => t.stop())
    stompRef.current?.deactivate()
    navigate('/dashboard')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-teal-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <p>Starting consultation...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-white font-semibold text-sm">MediConnect — Video Consultation</span>
          {remoteConn && <span className="badge badge-green text-xs">Connected</span>}
        </div>
        <button onClick={() => setChatOpen(!chatOpen)} className="text-gray-400 hover:text-white transition-colors">
          {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="relative flex-1 bg-gray-900">
          {webrtcError ? (
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div>
                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-white text-xl font-bold mb-2">Video Unavailable</h2>
                <p className="text-gray-400 mb-4">WebRTC is blocked or your browser doesn't support it.<br />Please switch to a phone consultation.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">Return to Dashboard</button>
              </div>
            </div>
          ) : (
            <>
              {/* Remote video (fullscreen) */}
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {!remoteConn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    <p className="font-semibold">Waiting for the other participant...</p>
                    <div className="flex justify-center gap-1 mt-3">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* Local video (pip) */}
              <div className="absolute bottom-20 right-4 w-36 h-28 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-xl">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {camOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-700">
            <button onClick={toggleMute} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
              {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
            <button onClick={toggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${camOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
              {camOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </button>
            <button onClick={endCall} className="w-14 h-11 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors shadow-lg">
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setChatOpen(!chatOpen)} className="w-11 h-11 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">In-Consultation Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-gray-500 text-xs text-center mt-8">Messages appear here during the consultation.</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                  {m.type === 'JOIN' || m.type === 'LEAVE' ? (
                    <p className="text-xs text-gray-500 text-center w-full">{m.message}</p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-1">{m.senderName}</p>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${m.senderId === user?.id ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-gray-700 text-gray-100 rounded-bl-sm'}`}>
                        {m.message}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-2">
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..." className="flex-1 bg-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-gray-500" />
              <button onClick={sendMessage} className="w-10 h-10 bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
