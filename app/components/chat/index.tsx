'use client'

import React, { useState } from 'react'
import classNames from 'classnames'
import { BotIcon, UserIcon } from 'lucide-react'
import Textarea from '../UI/Textarea'
import Button from '../UI/Button'

export default function SofiaChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'おはようございます。 🌄\n\n新しい一日の始まりに、どんな響きがあなたを包んでいるでしょうか。\nその静かな時間に、心の声が優しく届くことを願っています。🤎✨',
    },
    { role: 'user', content: 'こんにちは！' },
    {
      role: 'assistant',
      content: '今日はどんな日が、あなたにとって特別な響きをもたらしそうですか。',
    },
    { role: 'user', content: '良い天気です' },
  ])

  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-100 via-white to-indigo-100">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 p-4 border-b bg-white shadow-sm">
        <img src="/mu_logo3.png" alt="Sofia" className="w-6 h-6 rounded-full" />
        <h1 className="text-lg font-semibold text-gray-700">Sofiaと響き合う</h1>
      </div>

      {/* メッセージ表示 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={classNames(
              'rounded-2xl px-4 py-3 max-w-xl shadow-sm',
              msg.role === 'assistant'
                ? 'bg-gray-100 text-left self-start text-gray-800'
                : 'bg-blue-100 text-right self-end text-gray-900'
            )}
          >
            <div className="flex items-center space-x-2">
              {msg.role === 'assistant' ? <BotIcon size={16} /> : <UserIcon size={16} />}
              <span className="whitespace-pre-line">{msg.content}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 入力エリア */}
      <div className="flex items-center p-4 gap-2 border-t bg-white">
        <Textarea
          className="flex-1 min-h-[60px] border border-gray-300 rounded-xl px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend()
              e.preventDefault()
            }
          }}
          placeholder="あなたの響きをここに..."
        />
        <Button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl"
          onClick={handleSend}
        >
          送信
        </Button>
      </div>
    </div>
  )
}
