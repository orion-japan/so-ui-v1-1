// utils/sendToken.ts
import { auth } from '@/lib/firebase'

export async function sendTokenToServer() {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('ユーザーがログインしていません')
    }

    // 最新トークン取得（trueで強制更新）
    const idToken = await user.getIdToken(true)

    const res = await fetch('/mu-api/send-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`サーバーエラー: ${errText}`)
    }

    return await res.json()
  } catch (err) {
    console.error('[sendTokenToServer] エラー:', err)
    throw err
  }
}
