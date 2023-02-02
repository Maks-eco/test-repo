const download = (url, filename) => {
  console.log(url)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename || 'download'
  anchor.click()
}

function createFrontVideo(data, updateVideoSource, createCanvasElement) {
  HME.createH264MP4Encoder().then(async (encoder) => {
    const url0 = data[0].data
    const img0 = new Image()
    await new Promise((r) => img0.onload = r, img0.src = url0)

    const width = encoder.width = img0.width // canvas.width;
    const height = encoder.height = img0.height // canvas.height;
    const ctx = createCanvasElement(width, height).canvas.getContext('2d')
    encoder.quantizationParameter = 10
    encoder.frameRate = 5
    encoder.initialize()

    for (let i = 0; i < data.length; ++i) {
      const url = data[i].data // "data:image/gif;base...";
      const img = new Image()
      await new Promise((r) => img.onload = r, img.src = url)

      ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height)
      encoder.addFrameRgba(ctx.getImageData(0, 0, width, height).data)
      // await new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    encoder.finalize()
    const uint8Array = encoder.FS.readFile(encoder.outputFilename)
    // download(URL.createObjectURL(new Blob([uint8Array], { type: "video/mp4" })))
    updateVideoSource(URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' })))
    encoder.delete()
  })
}

export { createFrontVideo }
