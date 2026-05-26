import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { Bot, Send, AlertTriangle, ClipboardList, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MediConnectBot() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)

  const askBot = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const res = await api.post('/bot/general-prescription', { message })
      setResponse(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bot could not respond')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-btn bg-gradient-to-br from-[#004AC6] to-[#00687A] flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MediConnect Bot</h1>
                <p className="text-sm text-[#737686]">General health guidance for your next consultation</p>
              </div>
            </div>

            <form onSubmit={askBot} className="card space-y-4">
              <div>
                <label className="label">Symptoms or question</label>
                <textarea
                  rows={8}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Example: I have fever and sore throat for two days..."
                  className="input resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-[#737686] mt-1">{message.length}/1000</p>
              </div>
              <button disabled={loading || !message.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {loading ? 'Checking...' : 'Ask MediConnect Bot'}
              </button>
            </form>
          </section>

          <section className="card min-h-[420px]">
            {!response ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <ShieldCheck className="w-12 h-12 text-[#004AC6] mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ready when you are</h2>
                <p className="text-[#737686] max-w-sm">The bot can organize self-care ideas, red flags, and notes to discuss with a doctor.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Guidance</h2>
                  <p className="text-[#434655]">{response.answer}</p>
                </div>

                {response.redFlags?.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-card p-4">
                    <h3 className="font-semibold text-[#BA1A1A] flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Urgent signs
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-[#434655] space-y-1">
                      {response.redFlags.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> General self-care
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-[#434655] space-y-1">
                    {response.selfCare?.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <ClipboardList className="w-4 h-4 text-[#004AC6]" /> Notes for prescription discussion
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-[#434655] space-y-1">
                    {response.prescriptionNotes?.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <p className="text-xs text-[#737686] border-t border-[#E2E8F0] pt-4">{response.disclaimer}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
