const fs = require('fs')
const express = require('express')

const app = express()
const multer = require('multer')

const upload = multer({ dest: 'temp/uploads/' })
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')

const server = http.createServer(app)

const videoPack = require('./videoCreation')
const init = require('./init')
const serverSide = require('./serverCanvas')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('src'))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/src/page.html`)
})

app.get('/videoExist', (req, res) => {
  const videoFolder = 'temp/generated'
  const arrNames = fs.readdirSync(videoFolder)
  const arrNamesRes = arrNames
    .filter((name) => path.extname(name) === '.mp4')
    .filter((name) => {
      try {
        fs.statSync(`${videoFolder}/${name}`)
        return true
      } catch {
        return false
      }
    })
  if (!arrNamesRes || arrNamesRes.length === 0) {
    res.status(200).json('Empty folder')
  } else {
    res.status(200).json('Exist')
  }
})

app.get('/video', (req, res) => {
  const videoFolder = 'temp/generated'
  const { range } = req.headers
  if (!range) {
    res.status(400).send('Requires Range header')
    return
  }
  let arrNames = fs.readdirSync(videoFolder)
  arrNames = arrNames.filter((name) => path.extname(name) === '.mp4')
  if (!arrNames || arrNames.length === 0) {
    res.status(400).send('Empty folder')
    return
  }
  arrNames = arrNames.filter((name) => {
    try {
      fs.statSync(`${videoFolder}/${name}`)
      return true
    } catch {
      return false
    }
  }).map((name) => ({ name, info: fs.statSync(`${videoFolder}/${name}`) }))
  arrNames.sort((a, b) => a.info.birthtimeMs - b.info.birthtimeMs).reverse()

  const videoPath = `${videoFolder}/${arrNames[0].name}` // "generated/video.mp4";
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  }
  res.writeHead(206, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })

  videoStream
    .on('open', () => {
      // console.log('Pipe path: ' + videoStream.path)
      videoStream.pipe(res)
    })
    .on('error', (err) => {
      console.log(err)
    })
    .on('end', () => {
      res.end()
    })
})

app.post('/genNewVideo', (req, res) => {
  videoPack.generateVideo('temp/image', 'temp/generated')
    .then((message) => {
      console.log(`PromVideo: ${message}`)
      res.status(200).send(JSON.stringify(message))
    })
    .catch((err) => {
    // console.log(err)
    })
})

app.post('/load_img', upload.single('blob'), (req, res) => {
  fs.promises.readFile(`temp/uploads/${req.file.filename}`)
    .then((data) => {
      fs.promises.writeFile(`temp/image/${req.file.originalname}image.jpg`, data)
    })
    .then(() => fs.promises.unlink(`temp/uploads/${req.file.filename}`))
    .then(() => res.status(200).send(JSON.stringify(`file: ${req.file.originalname}`)))
    .catch((err) => {
      console.log(err)
    })
})

server.listen(8000, () => {
  console.log('listening on *:8000')
})

init.initFolders()
  .then(() => {
    serverSide.checkImagesFolder('input')
  })
  .catch((e) => {
    console.log('err init')
  })
