module.exports = class Queue {
  constructor() {
      this.cacheQueue = []
      this.running = false
  }

  async pushJob(job) {
      if (!this.running) {
          this.running = true
          await job()
          let next = this.cacheQueue.shift()

          while (!!next) {
              await next()
              next = this.cacheQueue.shift()
          }
          // for (let i = 0; i < this.cacheQueue.length; i++) {
          //     await this.cacheQueue[i]()
          // }
          this.running = false
      } else {
          this.cacheQueue.push(job)
      }
  }
}