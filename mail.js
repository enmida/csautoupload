const Imap = require('imap')
const MailParser = require("mailparser").MailParser
const { GMAIL_ACCOUNT } = require('./config/auth.json')

const OPT_MAIL_TITLE = 'Carsome CMS login OTP'
const MAIL_READ_ONLY = false

function getMailOtp() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
        user: GMAIL_ACCOUNT.user,
        password: GMAIL_ACCOUNT.password,
        host: 'imap.gmail.com', //邮箱服务器的主机地址
        port: 993, //邮箱服务器的端口地址
        tls: true, //使用安全传输协议
        tlsOptions: { rejectUnauthorized: false } //禁用对证书有效性的检查
    });
    
    imap.once('ready', () => {
      imap.openBox('INBOX', MAIL_READ_ONLY, (err, box) => {
        console.log("打开邮箱")
        if (err) throw err
        imap.search(['UNSEEN'], (err, results) => {
          if(!results.length || err) {
            resolve('')
            imap.end()
            return
          }
          results = results.reverse()
          if (err) throw err
          const f = imap.fetch(results, { bodies: '' , markSeen: true})
          f.on('message', (msg, seqno) => {
            const mailparser = new MailParser()
            msg.on('body', (stream, info) => {
              stream.pipe(mailparser)
              //读取邮件内容
              mailparser.on("headers", (headers) => {
                  const title = headers.get('subject')
                  // const sender = headers.get('from').text
                  //邮件内容
                  if(title === OPT_MAIL_TITLE) {
                    mailparser.on("data", (data) => {
                      if (data.type === 'text') {
                        const code = data.html.match(/<strong>(.+)<\/strong>/)[1]
                        console.log(code)
                        resolve(code)
                      }
                    })
                  }
              })
            })
          })
          f.once('error', (err) => {
            console.log('抓取出现错误: ' + err)
          })
          // f.once('end', function() {
          //   console.log('邮箱关闭')
          // })
          imap.end()
        })
    })
    })
    
    imap.once('error', function(err) {
      resolve('')
      console.log(err)
    })
    
    imap.once('end', function() {
      console.log('关闭邮箱')
    })
    
    imap.connect()
  })
}

module.exports = {
  getMailOtp
}
