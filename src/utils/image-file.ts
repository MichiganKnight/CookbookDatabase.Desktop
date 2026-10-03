const maximumImageSize = 15 * 1024 * 1024

const supportedImageTypes = new Set([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'image/webp'
])

export function readImageFileAsDataUrl(file: File): Promise<string> {
    if (!supportedImageTypes.has(file.type)) {
        return Promise.reject(new Error('Please Select a Supported Image File'))
    }

    if (file.size > maximumImageSize) {
        return Promise.reject(new Error('The Selected Image Must Be 15 MB or Smaller'))
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('The Image Could Not Be Read'))

                return
            }

            resolve(reader.result)
        }

        reader.onerror = () => {
            reject(reader.error ?? new Error('The Image Could Not Be Read'))
        }

        reader.readAsDataURL(file)
    })
}