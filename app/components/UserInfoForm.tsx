'use client'

import { useState } from 'react'

export default function UserInfoForm() {
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<{
    id: string
    name: string
    userType: string
    credits: number
  } | null>(null)

  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    setResult(null)

    if (!userId.trim()) {
      setError('🪔 ユーザーコードを入力してください')
      return
    }

    try {
      const res = await fetch('/api/get-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        setError(`API Error: ${res.status}`)
        return
      }

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white mt-10">
      <h2 className="text-xl font-bold mb-4">🌿 ユーザー情報を引き出す</h2>

      <div className="mb-2">
        <label className="block mb-1 font-semibold">ユーザーコード:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="例: abc-123"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
      >
        情報を取得する
      </button>

      {error && (
        <div className="mt-4 p-2 text-red-600 border rounded">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p><strong>🪷 ユーザー名:</strong> {result.name}</p>
          <p><strong>🪷 ユーザータイプ:</strong> {result.userType}</p>
          <p><strong>🪷 Sofiaクレジット:</strong> {result.credits}</p>
        </div>
      )}
    </div>
  )
}
