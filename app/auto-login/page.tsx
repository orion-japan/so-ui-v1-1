// app/auto-login/page.tsx
import { Suspense } from 'react'
import AutoLoginClient from './AutoLoginClient'

export default function AutoLoginPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AutoLoginClient />
    </Suspense>
  )
}
