import { canvasToPyramidArr, createCanvasElement, resizeCanvasImage } from './slidesCreation.mjs'
import { createFrontVideo } from './encoder.mjs'

function setAttrSource(src, elementCont, elementSource, elementWind) {
  elementCont.hidden = false
  elementSource.setAttribute('src', src)
  elementCont.appendChild(elementWind.cloneNode(true))
  elementWind.remove()
}

function updateVideoSource(src) {
  const elementCont = document.getElementById('videoContainer')
  const elementWind = document.getElementById('videoWindow')
  const elementSource = document.getElementById('videoSource')
  if (src) {
    setAttrSource(src, elementCont, elementSource, elementWind)
  } else {
    fetch('/videoExist')
      .then((res) => res.json())
      .then((res) => {
        // console.log(res)
        if (res !== 'Empty folder') {
          setAttrSource(`/video?time=${Date.now()}`, elementCont, elementSource, elementWind)
        } else {
          elementCont.hidden = true
        }
      })
      .catch((e) => {
        console.log(e)
      })
  }
}
updateVideoSource()

async function sendImage(dataCanv, nameFile) {
  return new Promise((resolve) => {
    const formData = new FormData()

    fetch(dataCanv)
      .then((res) => res.blob())
      .then((blb) => {
        formData.append('blob', blb, nameFile.toString())
        return formData
      })
      .then((body) => fetch(`${window.location.origin}/load_img`, {
        method: 'POST',
        body,
      }))
      .then((res) => res.json())
      .then((data) => {
        resolve(data)
      })
  })
}

function mergeCanvasToVideo() {
  fetch(`${window.location.origin}/genNewVideo`, { method: 'POST' })
    .then((res) => res.json())
    .then((data) => {
      updateVideoSource()
    })
}

async function uploadCanvasArrToServer(feDataImgs) {
  let dats
  for (let i = 0; i < feDataImgs.length; i++) {
    dats = await sendImage(feDataImgs[i].data, feDataImgs[i].name)
  }
  // console.log(`Last step: ${dats}`)
  mergeCanvasToVideo()
}

function getImageDimensions(file) {
  return new Promise((resolve) => {
    const i = new Image()
    i.onload = () => {
      resolve({ img: i, w: i.width, h: i.height })
    }
    i.src = file
  })
}

function imageToCanvas(input) {
  let context
  let buffer
  const processSide = localStorage.getItem('processSide')
  if (input) {
    getImageDimensions(input).then((dim) => {
      buffer = canvasToPyramidArr(resizeCanvasImage(dim.img, dim.w, dim.h))
      if (processSide === 'front') createFrontVideo(buffer, updateVideoSource, createCanvasElement)
      else uploadCanvasArrToServer(buffer)
    })
  } else {
    context = document.getElementById('constImg')
    buffer = canvasToPyramidArr(resizeCanvasImage(context, context.naturalWidth, context.naturalHeight))
    if (processSide === 'front') createFrontVideo(buffer, updateVideoSource, createCanvasElement)
    else uploadCanvasArrToServer(buffer)
  }
}

function fileToImage(input) {
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    imageToCanvas(reader.result)
  }, false)
  reader.readAsDataURL(input)
}

const inputFile = document.getElementById('file')

function updateImageDisplay() {
  // console.log( input.files)
  fileToImage(inputFile.files[0])
}

inputFile.addEventListener('change', updateImageDisplay)

const checkElem = document.getElementById('sideCheck')
checkElem.addEventListener('click', (e) => {
  let side = ''
  if (checkElem.checked) side = 'front'
  else side = 'back'
  localStorage.setItem('processSide', side)
})

function initStorage() {
  const processSide = localStorage.getItem('processSide')
  if (!(processSide === 'front' || processSide === 'back')) localStorage.setItem('processSide', 'front')
  if (processSide === 'front') checkElem.checked = true
  else checkElem.checked = false
}
// initStorage()
window.imageToCanvas = imageToCanvas

window.onload = () => {
  initStorage()
}
