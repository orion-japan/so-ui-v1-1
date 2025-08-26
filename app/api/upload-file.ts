export async function uploadFile(file: File, user: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', user)

  const res = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    throw new Error('ファイルのアップロードに失敗しました')
  }

  const data = await res.json()
  return { id: data.id, url: data.url }
}
