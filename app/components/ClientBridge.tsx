'use client'
import { useEffect } from 'react'

export default function ClientBridge({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e?.data || typeof e.data !== 'object') return
      if (e.data.type === 'pay:logout') {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch {}
        location.href = '/' // ログアウト後の遷移先
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return <>{children}</>
}
