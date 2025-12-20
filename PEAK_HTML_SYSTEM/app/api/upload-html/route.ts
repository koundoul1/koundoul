import { NextRequest, NextResponse } from 'next/server'
import { uploadHTMLToStorage } from '@/lib/supabase-html'

export async function POST(request: NextRequest) {
  try {
    const { numeroDossier, html } = await request.json()
    
    if (!numeroDossier || !html) {
      return NextResponse.json(
        { error: 'numeroDossier et html sont requis' },
        { status: 400 }
      )
    }
    
    // Valider que c'est bien du HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      return NextResponse.json(
        { error: 'Le contenu ne semble pas être du HTML valide' },
        { status: 400 }
      )
    }
    
    // Upload vers Supabase Storage
    const result = await uploadHTMLToStorage(numeroDossier, html)
    
    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: new Blob([html]).size
    })
    
  } catch (error: any) {
    console.error('Erreur upload HTML:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
