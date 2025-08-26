// app/api/upload-file/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('[Upload API] 📥 Upload endpoint called')

  const formData = await req.formData()
  const file = formData.get('file') as File
  const user = formData.get('user') as string

  console.log('[Upload API] user:', user)
  console.log('[Upload API] file name:', file?.name)
  console.log('[Upload API] DIFY_API_URL:', process.env.DIFY_API_URL)
  console.log('[Upload API] DIFY_API_KEY:', process.env.DIFY_API_KEY)

  if (!file || !user) {
    console.error('[Upload API] ⚠️ Missing file or user')
    return NextResponse.json({ error: 'Missing file or user' }, { status: 400 })
  }

  const uploadForm = new FormData()
  uploadForm.set('file', file)
  uploadForm.set('user', user)

  try {
    const res = await fetch(`${process.env.DIFY_API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
      },
      body: uploadForm,
    })

    const responseText = await res.text()

    if (!res.ok) {
      console.error('[Upload API] ❌ Upload failed:', res.status)
      console.error('[Upload API] ❌ Response:', responseText)
      return NextResponse.json({ error: responseText }, { status: res.status })
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (err) {
      console.error('[Upload API] ❌ JSON parse error:', err)
      return NextResponse.json({ error: 'Invalid JSON response from Dify' }, { status: 500 })
    }

    console.log('[Upload API] ✅ Upload success:', result)
    return NextResponse.json(result)

  } catch (err) {
    console.error('[Upload API] ❗ Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error occurred.' }, { status: 500 })
  }
}