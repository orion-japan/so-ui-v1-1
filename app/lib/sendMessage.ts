// lib/sendMessage.ts
interface SendMessageOptions {
  userId: string
  conversationId?: string
  userType?: string
  plan?: string
  query: string
  uploadFileId?: string
  remoteUrl?: string
}

export const sendMessage = async ({
  userId,
  conversationId,
  userType,
  plan,
  query,
  uploadFileId,
  remoteUrl,
}: SendMessageOptions) => {
  const payload: any = {
    user: userId,
    query,
    response_mode: 'blocking',
  }

  if (userType) payload.userType = userType
  if (plan) payload.plan = plan
  if (conversationId) payload.conversation_id = conversationId
  if (uploadFileId || remoteUrl) {
    payload.uploadFileId = uploadFileId
    payload.remoteUrl = remoteUrl
  }

  const res = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('送信失敗:', res.status, error)
    throw new Error(error)
  }

  const data = await res.json()
  return data  // answer, conversation_id, metadata などを含む
}
