'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'

interface ChatInputProps {
  onSend: (
    input: string,
    files: File[] | null,
    previewUrl?: string,
    conversationId?: string | null
  ) => Promise<{ conversation_id?: string }>
  onPreview?: (files: File[], previewUrl: string) => void
  onCancelPreview?: () => void
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onPreview,
  onCancelPreview,
}) => {
  const [input, setInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[] | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams?.get('user') || ''

  useEffect(() => {
    const convId = searchParams?.get('conversation_id')
    if (convId) setConversationId(convId)
  }, [searchParams])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSend = async () => {
    if (isSending) return
    if (!input.trim() && (!imageFiles || imageFiles.length === 0)) return

    setIsSending(true)

    const currentInput = input.trim()
    const currentFiles = imageFiles
    const currentPreview = previewUrl || undefined

    // ✅ 親でAPI送信 & 新規会話ID取得
    const data = await onSend(currentInput, currentFiles, currentPreview, conversationId)

    // ✅ 新規ならID保存してURL更新
    if (data?.conversation_id && !conversationId) {
      setConversationId(data.conversation_id)
      const newQuery = new URLSearchParams(searchParams.toString())
      newQuery.set('conversation_id', data.conversation_id)
      router.replace(`?${newQuery.toString()}`)
    }

    setInput('')
    setImageFiles(null)
    setPreviewUrl(null)
    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMobile) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)
    const preview = URL.createObjectURL(fileArray[0])
    setImageFiles(fileArray)
    setPreviewUrl(preview)
    onPreview?.(fileArray, preview)
    e.target.value = ''
  }

  const handleCancelPreview = () => {
    setImageFiles(null)
    setPreviewUrl(null)
    onCancelPreview?.()
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4 max-w-screen-md mx-auto px-4 pb-6">
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="preview"
              className="w-24 h-24 object-cover rounded-xl border border-gray-300 shadow-md"
            />
            <button
              onClick={handleCancelPreview}
              className="absolute top-0 right-0 bg-white text-red-600 text-xs px-2 py-1 rounded shadow"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex w-full gap-2">
          <div className="flex-grow flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full resize-none rounded-lg border border-purple-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="こちらに入力してください…"
            />
          </div>

          <div className="flex flex-col justify-between items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
              multiple
            />
            <label
              htmlFor="fileInput"
              className="flex items-center justify-center w-12 h-12 bg-white border border-purple-300 rounded-full cursor-pointer shadow-sm hover:bg-purple-50 transition"
            >
              📎
            </label>

            <motion.button
              onClick={handleSend}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              disabled={isSending}
              className={`${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              } bg-purple-400 hover:bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
