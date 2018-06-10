const reSpeakerSource = require('..').reSpeakerSource

const source = reSpeakerSource()

source.resume()

source.once('start', () => {
  console.log('Recording started...')
})

source.on('speech-start', () => console.log('start of speech detected'))
source.on('speech-end', () => console.log('end of speech detected'))

console.log('Listens for the keyword and shows the start and end of speech.')
console.log('Exit program with Ctrl-C.')
