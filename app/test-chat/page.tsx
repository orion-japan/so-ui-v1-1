'use client'

import { useState } from 'react'

export default function SimpleChat() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [chatLog, setChatLog] = useState<{
    input: string
    fileUrl?: string
    response: string
    responseImageUrls?: string[]
  }[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
    }
  }

  const uploadFile = async (): Promise<{ id: string; preview_url?: string } | null> => {
    if (!file) return null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', 'test-user')

    const res = await fetch('https://api.dify.ai/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`
      },
      body: formData,
    })

    if (!res.ok) {
      console.error('ファイルアップロード失敗')
      return null
    }

    const result = await res.json()
    console.log('🟢 アップロード成功:', result)
    return { id: result.id, preview_url: result.preview_url }
  }

  const sendMessage = async () => {
    let uploaded: { id: string; preview_url?: string } | null = null
    if (file) {
      uploaded = await uploadFile()
    }

    const body: any = {
      user: 'test-user',
      query: input,
      response_mode: 'blocking',
    }

    if (uploaded?.id) {
      body.files = [
        {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: uploaded.id,
        },
      ]
    }

    const res = await fetch('/api/chat-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('❌ メッセージ送信エラー:', error)
      return
    }

    const data = await res.json()
    console.log('💬 応答:', data)
    setResponse(data.answer ?? 'No response')

    const urls = data.message_files?.map((f: any) => f.preview_url || f.url) || []

    setChatLog((prev) => [
      ...prev,
      {
        input,
        fileUrl: uploaded?.preview_url || previewUrl || undefined,
        response: data.answer ?? 'No response',
        responseImageUrls: urls,
      },
    ])

    setInput('')
    setFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="p-4 space-y-4">
      {chatLog.map((entry, idx) => (
        <div key={idx} className="border-b pb-4">
          <div className="font-semibold mb-1">あなたの入力：</div>
          {entry.fileUrl && (
            <a href={entry.fileUrl} target="_blank" rel="noopener noreferrer">
              <img src={entry.fileUrl} alt="input-image" className="max-w-xs rounded border mb-2" />
            </a>
          )}
          <p className="mb-2 whitespace-pre-wrap">{entry.input}</p>
          <div className="mt-2 p-2 bg-gray-100 border rounded">
            <strong>AI応答:</strong>
            <p className="mt-2 whitespace-pre-wrap">{entry.response}</p>
            {Array.isArray(entry.responseImageUrls) && entry.responseImageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {entry.responseImageUrls.map((url, i) => (
                  <img key={i} src={url} alt={`response-image-${i}`} className="w-full max-w-xs rounded border" />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <textarea
        className="w-full border p-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="メッセージを入力..."
      />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <img src={previewUrl} alt="preview" className="max-w-xs border rounded" />
      )}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={sendMessage}
      >
        送信
      </button>
    </div>
  )
}