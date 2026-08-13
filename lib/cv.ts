/**
 * CV upload rules, shared by the apply form, the profile form and their
 * server actions so the browser and the server agree on what is acceptable.
 */

export const MAX_CV_BYTES = 5 * 1024 * 1024 // 5MB

export const ACCEPTED_CV_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/rtf': 'RTF',
  'text/rtf': 'RTF',
  'text/plain': 'TXT',
}

/** The `accept` attribute for the file input — drives the phone file picker. */
export const CV_ACCEPT = '.pdf,.doc,.docx,.rtf,.txt,application/pdf'

export type CvFile = {
  // Explicit ArrayBuffer backing: Prisma's Bytes input rejects the wider
  // Uint8Array<ArrayBufferLike> that the bare alias resolves to.
  data: Uint8Array<ArrayBuffer>
  fileName: string
  mimeType: string
  size: number
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Strips any directory component a browser might include in the file name. */
function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'cv'
  return base.replace(/[^\w. ()-]/g, '_').slice(0, 120) || 'cv'
}

/**
 * Validates and reads an uploaded CV.
 *
 * @returns the file, `null` when nothing was uploaded, or an error message.
 */
export async function readCvUpload(
  value: FormDataEntryValue | null,
): Promise<{ file: CvFile | null; error?: string }> {
  if (!value || typeof value === 'string') return { file: null }

  const upload = value as File
  if (upload.size === 0) return { file: null }

  if (upload.size > MAX_CV_BYTES) {
    return {
      file: null,
      error: `That file is ${formatBytes(upload.size)}. Please upload a CV under ${formatBytes(MAX_CV_BYTES)}.`,
    }
  }

  // Some Android browsers send an empty or generic MIME type, so fall back to
  // the extension rather than rejecting a legitimate upload.
  const declared = upload.type
  const extension = upload.name.toLowerCase().split('.').pop() ?? ''
  const extensionAllowed = ['pdf', 'doc', 'docx', 'rtf', 'txt'].includes(extension)

  if (declared && !ACCEPTED_CV_TYPES[declared] && !extensionAllowed) {
    return {
      file: null,
      error: 'Please upload your CV as a PDF, DOC, DOCX, RTF or TXT file.',
    }
  }
  if (!declared && !extensionAllowed) {
    return {
      file: null,
      error: 'Please upload your CV as a PDF, DOC, DOCX, RTF or TXT file.',
    }
  }

  const bytes = new Uint8Array(await upload.arrayBuffer())

  // Trust the file's own signature over the declared type for PDFs, which are
  // the overwhelming majority of uploads.
  const looksLikePdf =
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
  if (extension === 'pdf' && !looksLikePdf) {
    return { file: null, error: 'That file is named .pdf but is not a PDF. Please re-export it.' }
  }

  return {
    file: {
      data: bytes,
      fileName: safeFileName(upload.name),
      mimeType: declared || (looksLikePdf ? 'application/pdf' : 'application/octet-stream'),
      size: bytes.byteLength,
    },
  }
}
