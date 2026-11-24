import { imageUrl } from '@/lib/config'

/** Folder of a backend file from its name prefix (same rule the legacy views use). */
export const folderFor = (fileName: string) => {
  if (fileName.startsWith('uploaded')) return 'uploaded_images'
  if (fileName.startsWith('generated')) return 'generated_images'
  if (fileName.startsWith('drawn')) return 'drawn_images'
  return 'template_images'
}

/** Displayable URL for any file name the services return (demo-aware through lib/config). */
export const urlFor = (fileName: string) => (fileName ? imageUrl(folderFor(fileName), fileName) : '')

/** Plain file name from a URL or a name (demo URLs end in `#/<fileName>`). */
export const fileNameOf = (v: string) => String(v ?? '').split('#').pop()!.split('/').pop()!

export type CreateKind = 'words' | 'sketch' | 'image' | 'mixed'
