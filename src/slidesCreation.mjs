import { formingPyramidRefs } from './effect.mjs'

const scale = 3

function createCanvasElement(width, height, createCanvas) {
  let canvasNew
  if (typeof window === 'undefined') {
    canvasNew = createCanvas(width, height)
  } else {
    canvasNew = document.createElement('canvas')
    canvasNew.setAttribute('width', width)
    canvasNew.setAttribute('height', height)
  }
  return { canvas: canvasNew, width, height }
}

function canvasClearBackground(ctx, canvas, width, height) {
  // console.log(canvas, width, height)
  ctx.beginPath()
  ctx.fillStyle = '#fff'// `rgba(255, 255, 255, 255)`
  ctx.fillRect(0, 0, width, height/* canvas.width, canvas.height */)
  ctx.stroke()
  return ctx
}

function drawOnePointCanvas(ctx, data, transp) {
  ctx.beginPath()
  if (data.val < 100) ctx.strokeStyle = `rgba(0, 0, 200, ${transp})`
  if (data.val > 100) ctx.strokeStyle = 'rgba(200, 0, 0, 0)'// ${/*transp*/})`
  const x = data.x * scale + 10
  const y = data.y * scale + 10
  ctx.moveTo(x + 1.5 * scale, y)
  ctx.arc(x, y, 1.5 * scale, 0, Math.PI * 2, true)
  ctx.stroke()
}

function drawCanvasLoop(data, createCanvas) {
  const feDataImgs = []
  const { canvas, width, height } = createCanvasElement(100 * scale + 20, 100 * scale + 20, createCanvas)

  if (canvas.getContext) {
    let ctx = canvas.getContext('2d')
    let step = data.length - 1
    ctx = canvasClearBackground(ctx, canvas, width, height)

    while (step > 5) {
      ctx = canvasClearBackground(ctx, canvas, width, height)
      for (let i = step - 3; i <= step; i++) {
        try {
          data[i].forEach((point) => {
            drawOnePointCanvas(ctx, point, 0.4)
          })
        } catch {}
      }
      step--
      if (data[step].length > 10) {
        const dataCanv = canvas.toDataURL('image/jpeg', 1.0)
        feDataImgs.push({ data: dataCanv, name: step, ctx: canvas })
      }
    }
  }
  return feDataImgs
}

function canvasToPyramidArr(imDat, createCanvas) {
  const pointsArr = []
  let ii
  let jj
  for (let i = 0; i < imDat.data.length; i += 4) {
    ii = (i / 4) % 100
    jj = Math.trunc(i / 4 / 100)
    pointsArr.push({
      x: ii, y: jj, val: imDat.data[i], sta: 'f',
    })
  }
  // console.log(pointsArr)
  const pyramidRefsData = formingPyramidRefs(pointsArr)
  return drawCanvasLoop(pyramidRefsData, createCanvas)
}

function resizeCanvasImage(img, width, height, createCanvas) {
  const canvasNew = createCanvasElement(100, 100, createCanvas).canvas
  const ctxNew = canvasNew.getContext('2d')
  ctxNew.drawImage(img, 0, 0, width, height, 0, 0, 100, 100)
  return ctxNew.getImageData(0, 0, 100, 100)
}

export { canvasToPyramidArr, createCanvasElement, resizeCanvasImage }
