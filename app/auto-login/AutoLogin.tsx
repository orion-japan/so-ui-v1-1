'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AutoLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/get-user-info', {
          method: 'POST', // ← GETではなくPOST
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          console.error('get-user-info API Error', res.status)
          return
        }

        const data = await res.json()
        console.log('ユーザー情報', data)

        // ログイン後の遷移（例：チャット画面へ）
        router.push('/chat')
      } catch (error) {
        console.error('API呼び出し失敗', error)
      }
    }

    fetchUserInfo()
  }, [router, searchParams])

  return <div style={{ padding: 20 }}>自動ログイン処理中...</div>
}
