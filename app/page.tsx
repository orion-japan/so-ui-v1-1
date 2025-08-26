'use client'
import { useEffect, useState } from 'react'
import SofiaChat from './components/SofiaChat'
import { Suspense } from 'react'

type SofiaUserInfo = { id: string; name: string; userType: string; credits: number }

const PROFILE_ENDPOINT = '/api/sidebar-user'

// 親ウィンドウにログ転送
function muLog(...args: any[]) {
  try {
    window.parent?.postMessage(
      { type: 'MU_LOG', ts: Date.now(), args },
      '*' // ★本番では https://pay.muverse.jp に固定
    )
  } catch (e) {
    console.error('muLog failed', e)
  }
}

function PageContent() {
  const [userInfo, setUserInfo] = useState<SofiaUserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const sp = new URLSearchParams(window.location.search)
        const user = sp.get('user') || ''

        if (!user) {
          muLog('[MU][PAGE] ❌ user param missing')
          return
        }

        muLog('[MU][PAGE] user_code from query:', user)

        // 直接 sidebar-user を呼ぶ
        const res = await fetch(PROFILE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_code: user }),
          cache: 'no-store',
        })

        const json: any = await res.json().catch(() => ({}))
        muLog('[MU][PAGE] sidebar-user status/json:', res.status, json)

        if (res.ok && json?.ok && json.profile) {
          setUserInfo(json.profile)
        } else {
          // fallback
          setUserInfo({ id: user, name: user, userType: 'free', credits: 0 })
        }

        // クエリを消す（きれいにする）
        const clean = new URL(window.location.href)
        clean.searchParams.delete('user')
        clean.searchParams.delete('ts')
        clean.searchParams.delete('sig')
        window.history.replaceState({}, document.title, clean.pathname + (clean.search || ''))
      } catch (e) {
        muLog('[MU][PAGE] ❌ 例外', e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return <div>ユーザー情報取得中...</div>
  if (!userInfo) return <div>認証に失敗しました。</div>

  muLog('[MU][PAGE] ✅ 最終 userInfo =', userInfo)

  return (
    <main className="h-screen flex flex-col bg-gradient-to-br from-blue-100 to-purple-100">
      <SofiaChat userId={userInfo.id} userInfo={userInfo} />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Sofia...</div>}>
      <PageContent />
    </Suspense>
  )
}
