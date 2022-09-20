const request = require('request')
const { DING_NOTICE_SUCCESS, DING_NOTICE_FAIL } = require('../config/dingding.json')

module.exports = async({list = [], state = 1, info = ''}) => {
  const nowDate = new Date()
  const month = nowDate.getMonth() + 1
  const date = nowDate.getDate()
  const hour = nowDate.getHours() // 东八区时间
  info = info || `本次共上传 ${list.length} 条客户信息，电话号码为：\n\n${list.map(item => item.Tel).join('\n\n')}`
  const options = {
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    json: {
      "msgtype": "markdown",
      "markdown": {
        "title":"上传结果",
        "text": `上传结果：\n\n**状态：**${state ? '成功' : '失败'}\n\n**上传时间：**${month}月${date}日${hour}时\n\n**附加信息：**${info}${!state ? '\n\n@所有人' : ''}`
      },
      "at": {
        "isAtAll": !state
      }
    }
  }
  request.post(state ? DING_NOTICE_SUCCESS : DING_NOTICE_FAIL, options)
}