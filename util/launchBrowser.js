const puppeteer = require('puppeteer-extra')
const findChrome = require('carlo/lib/find_chrome')
const path = require('path')

module.exports = async() => {
  try{
    // 选择使用已有的chrome客户端启动
    let findChromePath = await findChrome({})
    let executablePath = findChromePath.executablePath
    // 用户数据路径
    let userDataPath = `../browserData`
    // 浏览器启动选项
    let puppeteerOptions = {
      headless: false,
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1400, height: 800 },
      userDataDir: path.resolve(__dirname, userDataPath),
      executablePath: executablePath,
      dumpio: true,
      args: [
        `--user-data-dir=${path.resolve(__dirname, userDataPath)}`,
        `--window-size=1400,800`,
        '--no-sandbox'
      ]
    }
    // 启动浏览器
    const browser = await puppeteer.launch(puppeteerOptions)
    const page = await browser.newPage()
    return { page, browser }
  } catch(e) {
    console.error(e)
    return {}
  }
}