
module.exports = {
    async wait(time) {
        return new Promise(r => {
            setTimeout(() => {
                r()
            },time)
        })
    },
}