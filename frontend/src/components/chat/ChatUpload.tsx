import { FC, useState, ChangeEvent } from 'react'
import { FiUpload } from 'react-icons/fi'
import { Chat } from './chatList'

interface Props {
  onUploaded: (chat: Chat) => void
}

export const ChatUpload: FC<Props> = ({ onUploaded }) => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const base = process.env.NEXT_PUBLIC_API_URL || ''

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setBusy(true)

    const token = localStorage.getItem('access_token')
    const form = new FormData()
    form.append('image', file)

    const delay = new Promise(res => setTimeout(res, 1000))

    try {
      const upload = fetch(`${base}/chats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }).then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Erro no upload')
        return data as Chat
      })

      const [chat] = await Promise.all([upload, delay])
      onUploaded(chat)
      setSuccess('Upload concluído com sucesso!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro desconhecido no upload')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="upload-box">
        <input
          type="file"
          accept=".png,.jpg"
          onChange={handleFile}
          disabled={busy}
        />
        {busy ? (
          <span className="btn-spinner" />
        ) : (
          <FiUpload size={48} className="upload-icon" />
        )}
      </div>
    </div>
  )
}

