import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob
  const user = formData.get('user') as string

  if (!file || !user) {
    return NextResponse.json({ error: 'file and user are required' }, { status: 400 })
  }

  const uploadRes = await fetch(`${process.env.DIFY_API_URL}/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
    },
    body: formData,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    console.error('Upload failed:', err)
    return NextResponse.json({ error: err }, { status: uploadRes.status })
  }

  const result = await uploadRes.json()
  const fileId = result.id
  const publicUrl = `https://upload.dify.ai/files/${fileId}`

  return NextResponse.json({
    ...result,
    url: publicUrl,
  })
}
