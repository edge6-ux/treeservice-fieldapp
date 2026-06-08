import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json() as { password: string }

  if (password !== process.env.MASTER_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('master_authed', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  })
  return response
}
