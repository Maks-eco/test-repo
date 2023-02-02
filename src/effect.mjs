function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function distanceTwoPoints(point1, point2) {
  const x1 = point1.x
  const y1 = point1.y
  const x2 = point2.x
  const y2 = point2.y
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2 // * 2 //-- *x - more frames
  return dist
}

function centerTwoPoints(point1, point2) {
  let x1 = point1.x
  let y1 = point1.y
  const x2 = point2.x
  const y2 = point2.y
  x1 -= (x1 - x2) / 2
  y1 -= (y1 - y2) / 2
  return [x1, y1]
}

function generPyramidNewLayer(arrPyr, step, colorInterval) {
  arrPyr.push([])
  const curr = step // new lay
  const base = step - 1 // base lay
  for (let i = 0; i < arrPyr[base].length; i++) {
    if (arrPyr[base][i].sta !== 'f') continue
    let minDist = step// arrPyr[base].length * 2
    let minIndex = 0
    let setFnd = false

    for (let j = i + 1; j < arrPyr[base].length; j++) { // find min length
      if (arrPyr[base][j].sta !== 'f') continue
      if (Math.abs(arrPyr[base][i].val - arrPyr[base][j].val) > colorInterval) continue
      const dist = distanceTwoPoints(arrPyr[base][i], arrPyr[base][j])
      if (minDist >= dist) {
        minDist = dist
        minIndex = j
        setFnd = true
        break
      }
    }
    if (setFnd) { // append fusion two nearby points (center point)
      const [centerX, centerY] = centerTwoPoints(arrPyr[base][i], arrPyr[base][minIndex])
      arrPyr[curr].push({
        x: centerX,
        y: centerY,
        val: arrPyr[base][i].val,
        sta: 'f',
      })
      arrPyr[base][minIndex].sta = arrPyr[base][i].sta = 'd'
    }
  }

  for (let i = 0; i < arrPyr[base].length; i++) { // append not processed points
    if (arrPyr[base][i].sta === 'f') {
      arrPyr[curr].push({
        x: arrPyr[base][i].x,
        y: arrPyr[base][i].y,
        val: arrPyr[base][i].val,
        sta: 'f',
      })
      arrPyr[base][i].sta = 'd'
    }
  }
  return arrPyr
}

function formingPyramidRefs(initArr) {
  let arrShuf = JSON.parse(JSON.stringify(initArr))
  arrShuf = shuffle(arrShuf)
  let arrPyr = []
  arrPyr.push([])
  arrPyr[0] = arrShuf
  let step = 1
  let colorInterval = 1
  while (arrPyr[step - 1].length > 1) {
    // console.log(arrPyr[step-1].length)
    arrPyr = generPyramidNewLayer(arrPyr, step, colorInterval)
    step += 1
    colorInterval += 1
  }
  return arrPyr
}

export { formingPyramidRefs }
