// components/ImageInputUploader.tsx
'use client'

import { useState, ChangeEvent } from 'react'
import Image from 'next/image'

interface Props {
  onSend: (input: string, file?: File | null, imageUrl?: string | null) => void
}

const ImageInputUploader: React.FC<Props> = ({ onSend }) => {
  const [textInput, setTextInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setImageUrl(URL.createObjectURL(selected))
    }
  }

  const handleUrlInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrlInput(value)
    setImageUrl(value || null)
    if (value) setFile(null) // URL優先
  }

  const handleSend = () => {
    if (!textInput && !imageUrl) return
    onSend(textInput.trim(), file, imageUrl)
    setTextInput('')
    setUrlInput('')
    setFile(null)
    setImageUrl(null)
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-xl flex flex-col space-y-4 w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder="テキストを入力（任意）"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        className="border p-2 rounded"
      />
      <div className="flex space-x-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="flex-1"
        />
        <input
          type="text"
          placeholder="画像URLを入力（例：https://〜）"
          value={urlInput}
          onChange={handleUrlInput}
          className="flex-1 border p-2 rounded"
        />
      </div>
      {imageUrl && (
        <div className="relative w-full h-64">
          <Image
            src={imageUrl}
            alt="プレビュー"
            fill
            className="object-contain rounded-lg border"
          />
        </div>
      )}
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
      >
        🚀 送信
      </button>
    </div>
  )
}