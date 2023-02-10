DIY 一个 web3 的知识采集工具。

- chrome 插件模版：
  https://github.com/lxieyang/chrome-extension-boilerplate-react

- notion 数据库
  https://www.notion.so/my-integrations

- anyweb 树图钱包
  https://anyweb.cc

- UI
  https://mantine.dev/

#TODO
需要梳理下几种事件的先后顺序

- 获取标签全集
- 获取知识库（按时间、贡献）
- 获取页面标注

- 触发：
  chrome.runtime.onInstalled
  chrome.action.onClicked
  chrome.contextMenus.onClicked
  chrome.runtime.onMessage
  chrome.storage.local.onChanged

- 翻译
https://github.com/vitalets/google-translate-api



## Installing and Running

1 开通 notion 开发者账号，获得 api 的 token
2 新建 notion，添加数据库，获得数据库 id
(一定要确定是数据库，拷贝数据库链接,ps 有时间加截图教程)
例如：
https://www.notion.so/c5793ba3dd85463d9e08cfd9a4ffdbe8

id 是 c5793ba3dd85463d9e08cfd9a4ffdbe8

3 数据库里的字段，需建一个 cfxAddress ，type 是 Text （rich_text）

### Procedures:
Run `npm install` to install the dependencies.
Run `npm start`


