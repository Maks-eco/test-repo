const fs = require('fs')

async function checkDest(folder) {
  fs.promises.access(folder)
    .catch(() => {
      fs.promises.mkdir(folder)
        .catch((e) => {
          console.log(e)
        })
    })
}

async function initFolders() {
  return checkDest('input')
    .then(() => checkDest('temp'))
    .then(() => checkDest('temp/generated'))
    .then(() => checkDest('temp/image'))
    .then(() => checkDest('temp/uploads'))
    .catch((e) => {
      console.log('create folders err final')
    })
}

module.exports = {
  initFolders,
}
