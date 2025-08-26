export async function postMessage(
  query: string,
  uploadedFiles: { id: string }[],
  user: string,
  conversation_id: string | null
) {
  const body = {
    query,
    user,
    conversation_id: conversation_id || undefined,
    response_mode: 'blocking',
    files: uploadedFiles.map(file => ({
      type: 'image',
      transfer_method: 'local_file',
      upload_file_id: file.id
    }))
  }

  const res = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error('メッセージの送信に失敗しました')
  }

  return await res.json()
}
