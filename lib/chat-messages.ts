import type { PostMessageParams } from 'types'

// ✅ 自分の Next.js API Route に向ける
export async function postMessage(params: PostMessageParams) {
  console.log('📨 [lib/postMessage] 中継:', params)

  const res = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    console.error('❌ [lib/postMessage] failed:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  data.role = 'assistant' // 🔑 必ずアシスタントに固定
  return data
}

// ✅ ファイルアップロードは外部に直接送る場合でもOK
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ id: string } | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', userId)

  try {
    console.log('📤 ファイルアップロード開始:', file.name)

    // 🔸 ここは外部に直接送るなら API_URL でOK
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`,
      },
      body: formData,
    })

    if (!res.ok) {
      console.error('❌ uploadFile failed:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    console.log('✅ upload success:', data)
    return data // { id: string }
  } catch (err) {
    console.error('❌ uploadFile error:', err)
    return null
  }
}
