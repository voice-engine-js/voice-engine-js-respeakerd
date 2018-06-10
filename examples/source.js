const wavFileWriter = require('@voice-engine/core').wavFileWriter
const respeakerSource = require('..').reSpeakerSource

const source = respeakerSource()
const file = wavFileWriter('test.wav')

source.pipe(file)

source.once('start', () => {
  console.log('Recording started...')

  setTimeout(() => {
    source.stop()
  }, 3000)
})

console.log('Records audio and saves it into the file "test.wav".')
console.log('The program will exit after 3 seconds.')
