const MAX_DIM = 1920

export function compressImage(file: File, maxBytes = 5 * 1024 * 1024): Promise<File> {
  if (file.size <= maxBytes) return Promise.resolve(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

      let quality = 0.85

      const tryEncode = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('No se pudo comprimir la imagen')); return }
            if (blob.size <= maxBytes || quality <= 0.3) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
            } else {
              quality = parseFloat((quality - 0.1).toFixed(1))
              tryEncode()
            }
          },
          'image/jpeg',
          quality,
        )
      }

      tryEncode()
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo leer la imagen'))
    }

    img.src = objectUrl
  })
}
