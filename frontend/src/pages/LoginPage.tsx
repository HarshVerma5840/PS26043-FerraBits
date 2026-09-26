import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../api/authApi'
import { roleDefaultRoute } from '../auth/roles'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const from: string | undefined = (location.state as { from?: { pathname: string } })?.from?.pathname

  const { login, user, isAuthenticated, isInitializing } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      const target = from && from !== '/login' ? from : roleDefaultRoute(user.role)
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, isInitializing, user, from, navigate])

  useEffect(() => {
    const handleNetworkError = () => {
      setError('Network failure. Please check your connection and try again.')
      setLoading(false)
    }
    window.addEventListener('api-network-error', handleNetworkError)
    return () => window.removeEventListener('api-network-error', handleNetworkError)
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.sendOtp(phone)
      if (data.challengeId) {
        setChallengeId(data.challengeId)
        if (import.meta.env.DEV && data.devOtp) {
          setOtpCode(data.devOtp)
        }
      } else {
        setError('Failed to issue OTP challenge.')
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string }
      if (apiErr.status === 429) {
        setError('Too many OTP requests. Please wait before trying again.')
      } else {
        setError(apiErr.message || 'Error communicating with server.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the OTP.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await authApi.verifyOtp(challengeId, otpCode)
      if (!data.accessToken || !data.refreshToken) {
        setError('Verification failed. Invalid token payload.')
        return
      }

      login(data)
      const defaultRoute = roleDefaultRoute(data.user?.role)
      const target = from && from !== '/login' ? from : defaultRoute
      navigate(target, { replace: true })
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string }
      if (apiErr.status === 400) {
        setError('Invalid OTP code. Please try again.')
      } else if (apiErr.status === 401) {
        setError('Authentication failed. User record not found.')
      } else {
        setError(apiErr.message || 'Error verifying OTP.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f4f6f9] text-[#191c1d] antialiased min-h-screen flex flex-col justify-between pb-safe selection:bg-[#fc6018]/20 selection:text-[#a83900]">
      <div className="w-full flex flex-col">
        {/* 1. Top Government Banner with Crisp Indian Tricolor strip */}
        <div className="w-full flex h-1">
          <div className="h-full flex-1 bg-[#FF9933]"></div>
          <div className="h-full flex-1 bg-white"></div>
          <div className="h-full flex-1 bg-[#138808]"></div>
        </div>
        {/* Official Govt of India Civic Bar */}
        <div className="w-full bg-[#00173b] text-white px-4 py-1.5 flex items-center justify-between text-xs border-b border-white/10">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]"></span>
            <span className="tracking-wide">भारत सरकार | GOVT. OF INDIA</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className="flex items-center gap-1 font-inter text-[11px] font-semibold tracking-wider">
              <button className="px-1 py-0.5 hover:text-white transition-colors" type="button">A-</button>
              <button className="px-1 py-0.5 hover:text-white font-bold transition-colors" type="button">A</button>
              <button className="px-1 py-0.5 hover:text-white transition-colors" type="button">A+</button>
            </div>
            <span className="text-white/40">|</span>
            <button className="font-medium text-[11px] hover:text-[#FF9933] transition-colors" type="button">English / हिन्दी</button>
          </div>
        </div>
        
        {/* 2. App Brand Header with Emblem Logo */}
        <header className="w-full bg-white border-b border-[#c4c6d0]/30 py-4 px-4 flex flex-col items-center text-center shadow-xs">
          <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
            <img alt="SAAMYUKT Emblem Logo" className="w-20 h-20 object-contain drop-shadow-sm" loading="eager" src="https://lh3.googleusercontent.com/aida/AEtjO1WZj8_RtYeo5XNZLaVsjs2CI8dl3znBoCZAjILmG0Sl7ZkVhVuoCjWONAj6D9PhiYXIwewqj4vQdjMsj_v2RNDu_HxD0quyGxqQDVTe1KajBxeTIpU3gOZF30CEdMBPCaO6rtMbhd56LpdNDj6QzsEOENYPLap6bkm2HcZ8awGoaxnJdQu0krEr0N7IMVcD7Zs2vOM2bQkMEqJlbzMM8fRS4j91UIHKhMikUc6HyfR1RXQarpUOkyRQHKUL"/>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#00173b]">SAAMYUKT</h1>
            <span className="text-[#fc6018] font-bold text-xl">संयुक्त</span>
          </div>
          <p className="text-xs font-semibold text-[#00173b] mt-0.5 tracking-tight">राष्ट्रीय सामाजिक नवाचार पोर्टल</p>
          <p className="text-[11px] text-[#44474f] font-medium">National Societal Innovation Portal</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#f4f6f9] text-[10px] text-[#747780] font-medium border border-[#c4c6d0]/40">
            Ministry of Electronics &amp; IT • Government of India
          </span>
        </header>
        
        {/* Main Content Container */}
        <main className="w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
          
          {/* 3. Auth Switcher Tabs */}
          <div className="bg-[#edeeef] rounded-xl p-1 flex items-center shadow-inner">
            <button className="flex-1 py-2 rounded-lg bg-white text-[#00173b] font-bold text-xs shadow-xs text-center border border-[#c4c6d0]/30 transition-all flex items-center justify-center gap-1.5" type="button">
              <span className="material-symbols-outlined text-[16px] text-[#fc6018]">person</span>
              <span>Official Login</span>
            </button>
            <button className="flex-1 py-2 rounded-lg text-[#44474f] font-semibold text-xs text-center hover:text-[#00173b] transition-all flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed" type="button" title="Available in App">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Citizen / Innovator</span>
            </button>
          </div>
          
          {/* Core Authentication Card Container */}
          <section className="bg-white rounded-2xl border border-[#c4c6d0]/40 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Sub-header inside Card */}
            <div className="flex items-center justify-between border-b border-[#c4c6d0]/20 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#00173b] flex items-center gap-1.5">
                  <span>Aadhaar OTP Access</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Secure
                  </span>
                </h2>
                <p className="text-[11px] text-[#44474f]">ओटीपी द्वारा त्वरित एवं सुरक्षित सत्यापन</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-[#fc6018] hover:underline cursor-pointer">Help / सहायता</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}
            
            {!challengeId ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#00173b] flex items-center gap-1" htmlFor="mobile-number">
                    <span>Registered Mobile Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#44474f] font-medium">10 Digits</span>
                </div>
                <div className="w-full flex items-center bg-white border border-[#c4c6d0] rounded-xl overflow-hidden shadow-xs focus-within:border-[#00173b] focus-within:ring-2 focus-within:ring-[#00173b]/10 transition-all p-1">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#f8f9fa] rounded-lg text-[#00173b] font-inter text-xs font-bold border border-[#c4c6d0]/30 select-none shrink-0">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input 
                    className="w-full h-10 px-3 text-sm font-semibold text-[#00173b] tracking-wider placeholder:text-[#747780]/70 placeholder:font-normal focus:outline-none bg-transparent" 
                    id="mobile-number" 
                    inputMode="numeric" 
                    maxLength={10} 
                    placeholder="Enter 10-digit number" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    required
                  />
                  <button 
                    className="shrink-0 px-3 py-2 bg-[#00173b] text-white font-inter text-xs font-semibold rounded-lg hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1 shadow-xs disabled:opacity-50" 
                    type="submit"
                    disabled={loading || phone.length < 10}
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>{loading ? 'Wait...' : 'Get OTP'}</span>
                  </button>
                </div>
                
                {import.meta.env.DEV && (
                  <p className="text-[11px] text-[#44474f] flex items-center gap-1 pl-0.5 mt-2 bg-yellow-50 p-2 rounded">
                    <span className="material-symbols-outlined text-[13px] text-yellow-600">info</span>
                    <span>[DEV] Test Admin: 9999999999, Reviewer: 8888888888</span>
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-1.5 pt-1 relative">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-bold text-[#00173b] flex items-center gap-1">
                      <span>Enter 6-digit OTP / ओटीपी दर्ज करें</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <button 
                      className="text-[11px] font-bold text-[#fc6018] hover:underline cursor-pointer" 
                      type="button"
                      onClick={() => setChallengeId('')}
                      disabled={loading}
                    >
                      Change Number
                    </button>
                  </div>
                  
                  {/* Invisible input overlaying the segmented boxes */}
                  <div className="relative w-full h-12">
                    <input 
                      type="tel"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 font-inter"
                      disabled={loading}
                      autoFocus
                    />
                    
                    {/* Visual Segmented PIN boxes */}
                    <div className="grid grid-cols-6 gap-2 w-full h-full pointer-events-none" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map(i => {
                        const char = otpCode[i]
                        const isActive = otpCode.length === i
                        return (
                          <div key={i} className={`h-12 rounded-xl flex items-center justify-center font-bold text-base font-inter ${
                            isActive ? 'bg-white border-2 border-[#00173b] shadow-xs' : 
                            char ? 'bg-[#f4f6f9] border-2 border-[#00173b]/20 shadow-inner text-[#00173b]' : 
                            'bg-[#f4f6f9] border border-[#c4c6d0]/60 text-[#c4c6d0]'
                          }`}>
                            {char ? char : isActive ? <span className="w-2.5 h-2.5 rounded-full bg-[#00173b] animate-pulse"></span> : <span className="text-lg">•</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1.5 text-[11px] mt-2">
                    <span className="text-[#44474f] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#747780]">schedule</span>
                      <span>Resend OTP in <strong className="text-[#00173b] font-inter">01:45</strong></span>
                    </span>
                    <button className="font-bold text-[#fc6018] hover:underline flex items-center gap-1" type="button" disabled={loading}>
                      <span>Resend via SMS</span>
                    </button>
                  </div>
                </div>

                <button 
                  className="w-full h-12 mt-2 bg-[#00173b] text-white font-inter text-sm font-bold rounded-xl shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                >
                  <span className="material-symbols-outlined text-[18px]">{loading ? 'hourglass_empty' : 'lock'}</span>
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Portal / सत्यापित कर प्रवेश करें'}</span>
                </button>
              </form>
            )}

            {/* 6. Alternative Citizen SSO Divider & Buttons */}
            <div className="relative flex items-center justify-center my-1 mt-3">
              <div className="w-full border-t border-[#c4c6d0]/40"></div>
              <span className="absolute bg-white px-3 text-[11px] font-bold text-[#747780] uppercase tracking-wider">Or Authenticate With</span>
            </div>
            
            {/* MeriPehchaan (National SSO) Auth Option */}
            <button className="w-full h-11 bg-[#f8f9fa] hover:bg-[#f4f6f9] border border-[#c4c6d0]/50 rounded-xl px-3 flex items-center justify-between text-[#00173b] transition-all group opacity-75 cursor-not-allowed" type="button" title="Integration Pending">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#fc6018]/15 border border-[#fc6018]/30 text-[#a83900] flex items-center justify-center font-bold text-xs font-inter">
                  MP
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight group-hover:text-[#a83900] transition-colors">MeriPehchaan (National SSO)</span>
                  <span className="text-[10px] text-[#747780] leading-tight">Ministry of Electronics &amp; IT Single Sign-On</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#747780] text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
            
          </section>
          
          {/* 8. Supplementary Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#c4c6d0]/40 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-bold text-[#00173b]">UIDAI Verified</span>
                <span className="text-[9px] text-[#747780]">Aadhaar Auth Core</span>
              </div>
            </div>
            <div className="bg-white border border-[#c4c6d0]/40 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-[#00173b] text-[18px]">lock</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-bold text-[#00173b]">256-Bit SSL</span>
                <span className="text-[9px] text-[#747780]">NIC Encrypted Gateway</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Official Institutional & Helpdesk Footer */}
      <footer className="w-full bg-white border-t border-[#c4c6d0]/30 py-4 px-4 text-center mt-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#44474f] bg-[#f4f6f9] px-3 py-1 rounded-full border border-[#c4c6d0]/30">
          <span className="material-symbols-outlined text-[16px] text-[#fc6018]">support_agent</span>
          <span>National Civic Helpdesk (Toll Free): <strong className="text-[#00173b] font-inter font-bold">1800-11-2026</strong></span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#747780] font-medium">
          <a className="hover:text-[#00173b] hover:underline" href="javascript:void(0)">Accessibility Statement</a>
          <span>•</span>
          <a className="hover:text-[#00173b] hover:underline" href="javascript:void(0)">Terms of Use</a>
          <span>•</span>
          <a className="hover:text-[#00173b] hover:underline" href="javascript:void(0)">Privacy Policy</a>
          <span>•</span>
          <a className="hover:text-[#00173b] hover:underline" href="javascript:void(0)">NIC Security Guidelines</a>
        </div>
        <p className="text-[10px] text-[#747780] font-medium max-w-xs leading-normal">
          Designed &amp; Hosted by National Informatics Centre (NIC) • Ministry of Electronics &amp; Information Technology, Government of India
        </p>
      </footer>
    </div>
  )
}
