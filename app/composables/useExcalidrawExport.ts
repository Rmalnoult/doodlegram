export const useExcalidrawExport = () => {
  async function exportAsPng(elements: unknown[], files: Record<string, unknown>) {
    const { exportToBlob } = await import('@excalidraw/utils')

    const blob = await exportToBlob({
      elements: elements as never[],
      files: files as never,
      mimeType: 'image/png',
      exportPadding: 20
    })

    downloadBlob(blob, 'doodlegram-diagram.png')
  }

  async function exportAsSvg(elements: unknown[], files: Record<string, unknown>) {
    const { exportToSvg } = await import('@excalidraw/utils')

    const svg = await exportToSvg({
      elements: elements as never[],
      files: files as never,
      exportPadding: 20
    })

    const svgString = svg.outerHTML
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    downloadBlob(blob, 'doodlegram-diagram.svg')
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function generateThumbnail(
    elements: unknown[],
    files: Record<string, unknown>
  ): Promise<Blob> {
    const { exportToBlob } = await import('@excalidraw/utils')

    const fullBlob = await exportToBlob({
      elements: elements as never[],
      files: files as never,
      mimeType: 'image/png',
      exportPadding: 10
    })

    // Resize to max 400px wide for thumbnail
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 400
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error('Canvas toBlob failed')),
          'image/png',
          0.8
        )
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error('Failed to load image for thumbnail'))
      }
      img.src = URL.createObjectURL(fullBlob)
    })
  }

  return { exportAsPng, exportAsSvg, generateThumbnail }
}
