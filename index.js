const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
})

let state = {
  started: false,
  status: 'work',
  remain: 25 * 60,
  finished: 0,
  startedAt: null,
}

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

io.on('connection', (socket) => {
  console.log('a client connected')
  socket.on('getState', () => {
    console.log('on getState')
    if (state.started == true) {
      state.remain = Math.round((new Date() - state.startedAt) / 1000)
    }
    socket.emit('state', state)
  })
  socket.on('setState', (newState) => {
    console.log('on setState')
    if (state.started == false && newState.started == true) {
      newState.startedAt = new Date()
    } else if (state.started == true && newState.started == false) {
      newState.startedAt = null
    }
    state = newState
    socket.broadcast.emit('state', state)
  })
})

const port = process.env.PORT || 4000
server.listen(port, () => {
  console.log('server listening on port ' + port)
})
