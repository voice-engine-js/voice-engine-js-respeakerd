const respeakerSource = require('..').reSpeakerSource

const source = respeakerSource()

source.resume()

source.once('start', () => {
  console.log('Recording started...')
})

source.on('keyword', keyword => {
  console.log(`keyword: ${keyword}`)

  source.once('direction', direction => {
    console.log(`direction: ${direction}`)
  })
})

console.log('Listens for a keyword and shows the direction of arrival of the keyword.')
console.log('Exit program with Ctrl-C.')
