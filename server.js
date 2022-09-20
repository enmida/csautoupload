const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('@koa/router')
const { action } = require('./index.js')
const app = new Koa()
const router = new Router();
const Queue = require('./util/queue')
const queue = new Queue()

app.use(koaBody())

router.post('/auto/carsome/c2b-upload', ctx => {
  const params = ctx.request.body
  const nowDate = new Date()
  const month = nowDate.getMonth() + 1
  const date = nowDate.getDate()
  const hour = nowDate.getHours() 
  queue.pushJob(async function () {
    console.log('Task Start At : ' + `${month}.${date} ${hour}点`)
    await action(params)
  })
  ctx.body = { 
    "code": 200
  }
})

app.use(router.routes())
const port = process.env.PORT
app.listen(port)
console.log('Server is starting at port ' + port)