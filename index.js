const fs = require('fs')
// 工具函数
const { wait } = require('./util/wait')
const { getMailOtp } = require('./mail.js')
// 静态参数
const { CMS_ACCOUNT } = require('./config/auth.json')
const { FILE_NAME, DATA_FILE_PATH } = require('./config/file.json')
const { UPLOAD_HREF, LOGIN_HREF, UPLOAD_CHECK_HREF } = require('./config/href.json')
const { LOGIN_ERROR, UPLOAD_ERROR, NO_RESULT_ERROR, BROWSER_ERROR, DATA_ERROR, TIMEOUT_ERROR } = require('./config/error.json')
// 钉钉提醒
const dingNotice = require('./util/dingNotice.js')
// 启动浏览器
const launchBrowser = require('./util/launchBrowser.js')
// 任务超时时间 10分钟
const TASK_TIMEOUT = 1000 * 60 * 10

const env = process.env.NODE_ENV
const dingding = process.env.DINGDING

// 登录动作
const login = async (page) => {
  await page.goto(LOGIN_HREF)
  // 没有数据需要上传也要执行登录流程，以保持登录状态
  // 如果已经登录，则这里不会执行实际的登录操作，只会刷新页面使token不过期
  const isLogin = await loginCheck(page)
  if(isLogin) return
  const usernameInput = await page.$('div > div.wrapper-login > div > input[type=\'text\']', {timeout: 1000})
  const passwordInput = await page.$('div.wrapper-login > div.inner-addon > input[type=\'password\']')
  const signInButton = await page.$('button.login-button')
  await usernameInput.click()
  await wait(1000)
  await page.keyboard.type(`${CMS_ACCOUNT.user}`,{delay:100})
  await passwordInput.click()
  await wait(1000)
  await page.keyboard.type(`${CMS_ACCOUNT.password}`,{delay:100})
  await signInButton.click()
  await page.waitForNavigation()
  await wait(3000)
  const code = await getMailOtp()
  // console.log(code)
  const optInput = await page.$('input.form-control')
  await optInput.click()
  await page.keyboard.type(code,{delay:100})
  const optSubmitButton = await page.$('input.btn')
  await optSubmitButton.click()
  await page.waitForNavigation()
}

// 登录状态检查
const loginCheck = async (page) => {
  await page.goto(LOGIN_HREF)
  const curLocation = await page.evaluate(() => {
    return window.location.href
  })
  return !(curLocation.indexOf('login') > -1)
}

// 上传动作
const upload = async (list, page) => {
  await page.goto(UPLOAD_HREF)
  await genCsv(list)
  const uploadInput = await page.$('#exampleInputFile', {timeout: 1000})
  await wait(1000)
  await uploadInput.uploadFile(`${DATA_FILE_PATH}/${FILE_NAME}`)
  await wait(1000)
  const submitButton = await page.$('button[type=\'submit\']')
  await wait(5000)
  // 开发模式下不点击提交按钮
  if(env !== 'development') {
    await submitButton.click()
    await wait(2000)
  }
}

// 检查上传结果：用数据表里的第一条数据进行检索，如果能检索到结果则认为上传成功
const uploadResultCheck = async (list, page) => {
  await page.goto(UPLOAD_CHECK_HREF)
  await page.evaluate(() => {
    document.getElementById('sell_name').value = "";
  });
  await page.type('#sell_name', list[0].Tel,{delay:100})
  await page.keyboard.press('Enter')
  await wait(5000)
  const resultList = await page.$$('#ajax .list')
  return resultList.length > 0
}

// 生成数据文件
const genCsv = async (list) => {
  fs.writeFileSync(`${DATA_FILE_PATH}/${FILE_NAME}`, '', (err) => {
    console.log(err)
  })
  list.forEach((item,index) => {
    if (index === 0) {
      const keys = Object.keys(item)
      // 生成表头
      fs.appendFileSync(`${DATA_FILE_PATH}/${FILE_NAME}`,(keys) + '\n')
      // 上传后台的bug：上传时会自动吞掉第一行，所以这里加一个空行防止数据丢失
      fs.appendFileSync(`${DATA_FILE_PATH}/${FILE_NAME}`, `"","","","","",""` + '\n')
    }
    const values = Object.values(item)
    // 生成数据
    fs.appendFileSync(`${DATA_FILE_PATH}/${FILE_NAME}`,(`"${values.join('","')}"`) + '\n')
  })
}

const action = async (data) => {
  // 超时自动退出程序，防止单次任务卡死
  const timer = setTimeout(async () => {
    dingding && dingNotice({list, state: false, info: TIMEOUT_ERROR})
    console.log('任务执行超时，10秒后关闭进程')
    await wait(10000)
    process.exit()
  }, TASK_TIMEOUT)

  const { list = [] } = data
  const {page, browser} = await launchBrowser()

  try {
    if(!page || !browser) throw BROWSER_ERROR
    // 登录
    try{
      await login(page)
      await wait(2000)
    } catch(e) {
      throw LOGIN_ERROR
    }
    // 没有数据则结束任务
    if(!list || !list.length) {
      return
    }
    // 检查登录是否成功
    try{
      const isLogin = await loginCheck(page)
      if(!isLogin) throw LOGIN_ERROR
      await wait(2000)
    } catch(e) {
      throw LOGIN_ERROR
    }
    // 上传文件
    try{
      await upload(list, page)
      await wait(2000)
    } catch(e) {
      throw UPLOAD_ERROR
    }
    // 上传结果检查
    try{
      const isUploadSuccess = await uploadResultCheck(list, page)
      if(!isUploadSuccess) throw NO_RESULT_ERROR
    } catch(e) {
      throw NO_RESULT_ERROR
    }
    // 上传成功，通知钉钉
    dingding && dingNotice({list})
  } catch(e) {
    console.error('-----' + new Date() + '-----')
    console.error(e)
    console.error('-----')
    // 上传失败，通知钉钉
    dingding && dingNotice({list, state: false, info: e})
    return
  } finally {
    // 动作执行完毕关闭浏览器
    browser && (await browser.close())
    clearTimeout(timer)
  }
}

module.exports = {
  action
}