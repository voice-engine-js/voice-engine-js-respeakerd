const net = require('net')
const speechDetection = require('@voice-engine/core').speechDetection
const Readable = require('stream').Readable

class ReSpeakerSource extends Readable {
  constructor (options) {
    super({
      objectMode: true
    })

    options = options || {}

    this.keyword = options.keyword || 'snowboy'
    this.socketPath = options.socketPath || '/tmp/respeakerd.sock'
    this.format = {
      endianness: 'LE',
      channels: 1,
      sampleRate: 16000,
      bitDepth: 16
    }
  }

  _read () {
    if (this.socket) {
      return
    }

    this.emit('format', this.format)

    this.socket = net.createConnection(this.socketPath)
    this.socket.on('data', this.parseData.bind(this))
    this.socket.once('connect', () => this.emit('start'))
    this.socket.once('end', () => this.push(null))

    this.data = ''

    this.socket.write(JSON.stringify({
      type: 'status',
      data: 'ready'
    }) + '\r\n')
  }

  stop () {
    this.socket.end()
  }

  parseData (chunk) {
    if (chunk) {
      this.data = this.data + chunk.toString()
    }

    const index = this.data.indexOf('\r\n')

    if (index === -1) {
      return
    }

    const json = JSON.parse(this.data.slice(0, index))

    this.data = this.data.slice(index + 2)

    if (json.type === 'audio') {
      this.push(Buffer.from(json.data, 'base64'))
    } else if (json.type === 'event') {
      if (json.data === 'hotword') {
        this.emit('keyword', this.keyword)
        this.emit('direction', json.direction)

        this.emit('speech-start')

        this.speechDetection = speechDetection({
          silenceLength: 1.0,
          speech: true,
          volumeChange: 1.5
        })
        this.speechDetection.setFormat(this.format)
        this.speechDetection.once('speech-end', () => {
          this.unpipe(this.speechDetection)
          this.emit('speech-end')
        })

        this.pipe(this.speechDetection)
      }
    }

    this.parseData()
  }

  static create (options) {
    return new ReSpeakerSource(options)
  }
}

module.exports = ReSpeakerSource
