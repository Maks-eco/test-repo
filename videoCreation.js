const videoshow = require('videoshow')
const fs = require('fs')

// const images = []

const videoOptions = {
  fps: 25,
  loop: 0.2, // seconds
  transition: false,
  transitionDuration: 1, // seconds
  videoBitrate: 1024,
  videoCodec: 'libx264',
  size: '640x?',
  audioBitrate: '128k',
  audioChannels: 2,
  format: 'mp4',
  pixelFormat: 'yuv420p',
}

function unlinkFolder(folder) {
  return new Promise((resolve, reject) => {
    fs.readdir(folder, (e, list) => {
      list.map((item) => {
        fs.unlink(folder + item, (err) => {
          if (err) {
            reject(err)
          }
        })
      })
      console.log(`Clear folder: ${folder}`)
      resolve()
    })
  })
}

function buildVideo(images, dest) {
  return new Promise((resolve, reject) => {
    videoshow(images, videoOptions)
    // .audio('song.mp3')
      .save(`${dest}/video${Math.trunc(Math.random() * 10 ** 5)}.mp4`)
      .on('start', (command) => {
        console.log('ffmpeg process started:'/* , command */)
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
        reject(err)
      })
      .on('end', (output) => {
        console.error('Video created in:', output)
        resolve()
      })
  })
}

function prepareLibs() {
  return new Promise((resolve, reject) => {
    const arrNames = fs.readdirSync(__dirname)
    const values = ['ffmpeg.exe', 'ffplay.exe', 'ffprobe.exe']
    const multipleExist = values.every((value) => arrNames/* .map(item => item.toLowerCase()) */.includes(value))

    if (multipleExist) {
      resolve()
    } else {
      reject(new Error(`Libs not found, download it from https://ffmpeg.org/download.html, 
        copy ${values.map((value) => value)} to project folder`))
    }
  })
}

function prepareImage(source, dest) {
  return new Promise((resolve) => {
    unlinkFolder(`${dest}/`)
      // .then(() => prepareLibs())
      .then(() => fs.promises.readdir(source))
      .then((imgs) => {
        const arrObjImg = imgs.sort((a, b) => a.split('i')[0] - b.split('i')[0])
          .reverse()
          .map((img) => `${source}/${img}`)
        return arrObjImg
      })
      .then((arrObjImg) => buildVideo(arrObjImg, dest))
      .then(() => unlinkFolder(`${source}/`))
      .then(() => resolve('done'))
      .catch((err) => {
        console.log(err)
        // reject(err)
      })
  })
}

module.exports = {
  generateVideo: prepareImage,
}
