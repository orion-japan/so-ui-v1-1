// lib/uploadFile.ts

import { ensureConversationId } from './ensureConversationId'

export async function uploadFile(
  file: File,
  userId: string,
  conversationId?: string
): Promise<{ id: string, url: string } | null> {
  let convId = conversationId

  // conversation_id が未設定なら生成
  if (!convId) {
    console.warn('⚠️ [uploadFile] conversationId is missing. Generating...')
    convId = await ensureConversationId(userId)
    console.log('✨ [uploadFile] ensured conversationId:', convId)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', userId)
  formData.append('conversation_id', convId)

  console.log('📂 [uploadFile] FormData:', [...formData.entries()])

  const res = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    console.error('❌ [uploadFile] Upload failed:', res.status, await res.text())
    return null
  }

  const json = await res.json()
  console.log('✅ [uploadFile] Response:', json)

  return json
}
