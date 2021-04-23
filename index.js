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
}

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

io.on('connection', (socket) => {
  console.log('a client connected')
  socket.on('getState', () => {
    console.log('on getState')
    socket.emit('state', state)
  })
  socket.on('setState', (newState) => {
    console.log('on setState')
    state = newState
    socket.broadcast.emit('state', state)
  })
})

const port = process.env.PORT || 4000
server.listen(port, () => {
  console.log('server listening on port ' + port)
})
