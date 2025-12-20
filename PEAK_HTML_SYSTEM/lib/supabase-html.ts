import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadHTMLToStorage(
  numeroDossier: string,
  htmlContent: string
): Promise<{ url: string; filename: string }> {
  const filename = `${numeroDossier}.html`
  const blob = new Blob([htmlContent], { type: 'text/html' })
  
  // Upload vers Supabase Storage (bucket "sites-html")
  const { error: uploadError } = await supabase.storage
    .from('sites-html')
    .upload(filename, blob, {
      contentType: 'text/html',
      upsert: true // Écraser si existe déjà
    })
  
  if (uploadError) throw uploadError
  
  // Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('sites-html')
    .getPublicUrl(filename)
  
  return { url: publicUrl, filename }
}

export async function deleteHTMLFromStorage(numeroDossier: string) {
  const filename = `${numeroDossier}.html`
  
  const { error } = await supabase.storage
    .from('sites-html')
    .remove([filename])
  
  if (error) throw error
}

export async function getHTMLFromStorage(numeroDossier: string): Promise<string | null> {
  const filename = `${numeroDossier}.html`
  
  const { data, error } = await supabase.storage
    .from('sites-html')
    .download(filename)
  
  if (error) return null
  
  return await data.text()
}
