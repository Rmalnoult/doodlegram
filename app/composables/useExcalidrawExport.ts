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

  return { exportAsPng, exportAsSvg }
}
