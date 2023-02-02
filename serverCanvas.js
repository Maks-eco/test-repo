const fs = require('fs')
const path = require('path')

const { createCanvas, loadImage } = require('canvas')
const videoPack = require('./videoCreation')

let sourceImage = ''
let globalImagesFolder = ''

function checkImagesFolder(dir) {
  globalImagesFolder = dir
  // const dir = 'input'
  fs.readdir(dir, (err, list) => {
    if (!list || list.length == 0) {
      process.stdout.write(`Folder /${dir} empty\n`)
      return
    }
    list = list.filter((name) => {
      const ext = path.extname(name)// '.' + name.split('.').slice(-1).toString();
      return (ext === '.png' || ext === '.bmp' || ext === '.jpg' || ext === '.jpeg')
    })
    if (list.length > 0) {
      process.stdout.write(`Open file ${list[0]}? (Y)\n`)
      sourceImage = `${dir}/${list[0]}`
    } else {
      process.stdout.write(`Folder /${dir} empty\n`)
    }
  })
}

process.stdin.on('data', (data) => {
  data = data.toString().toUpperCase().slice(0, -2)
  // console.log(data)
  if (data === 'Y' && sourceImage.length > 0) {
    process.stdout.write('On process...\n')
    uploadImageCanvas()
  } else {
    checkImagesFolder(globalImagesFolder)
  }
})

function uploadImageCanvas() {
  const source = 'temp/image'
  const dest = 'temp/generated'
  loadImage(sourceImage).then(async (image) => {
    const { canvasToPyramidArr, resizeCanvasImage } = await import('./src/slidesCreation.mjs')
    const imageArray = canvasToPyramidArr(resizeCanvasImage(image, image.width, image.height, createCanvas), createCanvas)
    for (const item of imageArray) {
      await fs.promises.writeFile(`${source}/${item.name}image.jpg`, Buffer.from(item.data.split(',')[1], 'base64'))
    }
    videoPack.generateVideo(source, dest)
      .then((messg) => {
        console.log(`Video creation: ${messg} in folder ${dest}`)
        checkImagesFolder(globalImagesFolder)
      })
  })
}

module.exports = {
  checkImagesFolder,
}
