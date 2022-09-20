# 关于本项目

本项目是基于puppeteer框架编写的上传carsome c2b销售线索的自动化脚本，实现了下述流程的自动模拟操作：

> 登录->上传数据->检查上传结果->通知上传结果

数据来源为**其他后端服务**定时发起的post请求。

## 安装依赖：

```bash
npm install
```

```bash
npm install -g pm2
```

此外，还需安装chrome浏览器，版本不限。

## 账号准备：

运行此项目需要准备的账号：

- Carsome CMS 的账号/密码，联系相关人员创建。
- Carsome CMS 账号绑定的邮箱账号/密码，此邮箱必须为谷歌邮箱（本项目没有对其他邮箱进行支持）。**这里需要注意，如果你的邮箱账号开启了两步验证，则需要在谷歌后台生成一个应用特定密码，[官方详细说明在这里](https://support.google.com/mail/answer/185833)**。

准备好账号密码后，写入项目里的配置文件中：`./config/auth.json`

## 运行项目

正式环境：

```bash
npm run server
```

开发环境：

```bash
npm run server-dev
```

开发环境下，可模拟后端向本服务发送请求。这个命令有完整的流程演示，但是不会执行上传操作：

```bash
cd ./test/ && node index
```

可以在`pm2.config.js`里修改服务端口。

## 接口

本项目的服务只有一个接口：

```bash
POST  /auto/carsome/c2b-upload
```

数据格式为：

```javascript
{  
  "list": [
    {
      "Time": "",
      "Tel": "0177976428", 
      "Remarks": "Mazda CX-5;Whatsapp",
      "Name": "60177976428-noemail@carsome.com",
      "Email": "60177976428-noemail@carsome.com",
      "Source": "Wapcar",
      "Car": "Honda City"
    }
  ]
}
```

list里子项object的每个key值在生成数据文件的时候都会被当成表头

## 其他事项

- 在第一次使用前最好将邮箱里的全部邮件清空或者标为已读，邮箱获取验证码是比较容易出错的环节，这样做可以减少干扰。
- 后端或者其他数据服务向本项目发起的请求应该是定时的请求，并且有一定的时间间隔。比如每小时发送过去一小时里收集到的所有数据，而不是每收集到一条数据就发送/上传一次。因为自动化程序的执行需要时间，如果出现短时间内大量上传的情况，则出错的概率也会增加。
- DingDing提醒默认关闭，需要打开的话，则将`pm2.config.js`里`DINGDING`值设置为true。




