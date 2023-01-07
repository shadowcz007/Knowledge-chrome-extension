console.log('This is the background page.')
console.log('Put the background scripts here.', chrome.contextMenus)

let cfxAddress,
  isOpenLogin = false

const token = 'secret_8X2Ryn7H8qsmTQ4c1gEQeP6A6Mw4QZgErwh7SwKKewO',
  databaseId = '1be3bd9842fb43dbbe2e944870632415'

chrome.runtime.onInstalled.addListener(async () => {
  // chrome.contextMenus.create({
  //   id: 'keyword',
  //   title: '收集关键词',
  //   type: 'normal',
  //   contexts: ['selection'],
  // })

  chrome.contextMenus.create({
    id: 'mark',
    title: '标注',
    type: 'normal',
    contexts: ['selection'],
  })

  let gettingItem = chrome.storage.local.get()
  gettingItem.then(onGot, onError)
  function onGot (e) {
    // console.log(e)
    if (e.data == undefined)
      chrome.storage.local.set({
        data: ['元宇宙', '人工智能', 'web3', 'Web3', '大模型'],
      })
  }
  function onError (e) {
    console.log(e)
  }
})

// Open a new search tab when the user clicks a context menu
chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  const id = item.menuItemId
  console.log(id, item, tab)

  if (id == 'keyword') {
    let gettingItem = chrome.storage.local.get()
    gettingItem.then(onGot, onError)
    function onGot (e) {
      console.log(e)
      let data = [...e.data, item.selectionText.trim()]

      chrome.storage.local.set({
        data: data,
      })
    }
    function onError (e) {
      console.log(e)
    }
  } else if (id == 'mark') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress) cfxAddress = data.cfxAddress

    if (!cfxAddress) {
      // chrome.tabs.query({}, function (tabs) {
      //   // console.log(tabs)
      //   let isOpen = false
      //   Array.from(tabs, (t) => {
      //     if (t.url.match(/chrome-extension.*newtab.html/)) isOpen = true
      //   })
      //   if (isOpen == false) chrome.tabs.create({ url: 'newtab.html' })
      // })

      // 通知页面进行标注
      chrome.tabs.sendMessage(tab.id, { cmd: 'login' }, function (response) {
        console.log(response)
      })
    } else {
      // 通知页面进行标注
      chrome.tabs.sendMessage(tab.id, { cmd: 'mark-run' }, function (response) {
        console.log(response)
      })
    }
  }

  // console.log(item)
  // let url = new URL(`https://bing.com/search`)
  // url.searchParams.set('q', item.selectionText)
  // chrome.tabs.create({ url: url.href, index: tab.index + 1 })
})

// 发送到后台记录标注
async function postData (url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Notion-Version': '2021-05-13',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  return response.json() // parses JSON response into native JavaScript objects
}
function save (json) {
  // json.content = encodeURI(JSON.stringify(json.content))
  let url = 'https://api.notion.com/v1/pages'
  // postData('https://cusdis.com/api/open/comments', json)

  let data = {
    parent: { database_id: databaseId },
    properties: {
      pageTitle: {
        title: [
          {
            type: 'text',
            text: {
              content: json['pageTitle'],
            },
          },
        ],
      },
      cfxAddress: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: json['cfxAddress'],
            },
          },
        ],
      },
      pageId: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: json['pageId'],
            },
          },
        ],
      },
      // nodeName: {
      //   rich_text: [
      //     {
      //       type: 'text',
      //       text: {
      //         content: json['nodeName'],
      //       },
      //     },
      //   ],
      // },
      textContent: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: json['textContent'],
            },
          },
        ],
      },
      // parentText: {
      //   rich_text: [
      //     {
      //       type: 'text',
      //       text: {
      //         content: json['parentText'],
      //       },
      //     },
      //   ],
      // },
      // pageUrl: {
      //   url: json['pageUrl'],
      // },
      createdAt: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: json['createdAt'],
            },
          },
        ],
      },
    },
  }

  return postData(url, data)
  // chrome.storage.local.set({
  //   mark: json,
  // })
}

function queryByPageId (pageId) {
  let url = `https://api.notion.com/v1/databases/${databaseId}/query`
  return postData(url, {
    filter: {
      property: 'pageId',
      rich_text: {
        contains: pageId,
      },
    },
  })
}

// let isQueryNotEmptyOfReply = false
function queryNotEmptyOfReply () {
  // if (isQueryNotEmptyOfReply == false) {
  isQueryNotEmptyOfReply = true
  let url = `https://api.notion.com/v1/databases/${databaseId}/query`
  return postData(url, {
    filter: {
      property: 'reply',
      rich_text: {
        is_not_empty: true,
      },
    },
    sorts: [
      {
        property: 'createdAt',
        direction: 'ascending',
      },
    ],
  })
  // }
}

function parseData (res) {
  return [
    {
      pageTitle: res.properties.pageTitle.title[0]?.plain_text,
      pageId: res.properties.pageId.rich_text[0]?.plain_text,
      createdAt: res.properties.createdAt.rich_text[0]?.plain_text,
      reply: res.properties.reply.rich_text[0]?.plain_text,
      cfxAddress: res.properties.cfxAddress.rich_text[0]?.plain_text,
      nodeName: '#text',
      textContent: res.properties.textContent.rich_text[0]?.plain_text,
    },
  ]
}

// 用于监听发到bg的消息
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log('收到来自content-script的消息：')
  console.log(request, sender, sendResponse)
  if (request.cmd == 'mark-result') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress) cfxAddress = data.cfxAddress

    if (!cfxAddress) {
      console.log('请登录')
      // login
      // 通知页面进行 登录
      // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //   chrome.tabs.sendMessage(
      //     tabs[0].id,
      //     { cmd: 'login' },
      //     function (response) {
      //       console.log(response.farewell)
      //     }
      //   )
      // })
    } else {
      save({ ...request.data, cfxAddress }).then((res) => {
        // 通知页面
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { cmd: 'mark-push', data: parseData(res) },
              function (response) {
                console.log(response.farewell)
              }
            )
          }
        )
      })
    }
  } else if (request.cmd == 'cfx-address') {
    cfxAddress = request.data
    if (cfxAddress) chrome.storage.sync.set({ cfxAddress })
  } else if (request.cmd == 'get-address') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress) cfxAddress = data.cfxAddress
    if (cfxAddress) sendResponse(cfxAddress)
  } else if (request.cmd == 'get-by-pageId') {
    queryByPageId(request.data).then((res) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'get-by-pageId-result',
            data: Array.from(res.results, (r) => {
              return parseData(r)[0]
            }),
          },
          function (response) {
            console.log(response)
          }
        )
      })
    })
  } else if (request.cmd == 'new-reply') {
    queryNotEmptyOfReply().then((res) => {
      // isQueryNotEmptyOfReply = false
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'new-reply',
            data: Array.from(res.results, (r) => {
              return parseData(r)[0]
            }),
          },
          function (response) {
            console.log(response)
          }
        )
      })
    })
  } else if ((request.cmd = 'open-login' && isOpenLogin == false)) {
    chrome.tabs.create({ url: 'newtab.html' })
    isOpenLogin = true
  }
  sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request))
})

// chrome.tabs.onUpdated.addListener(function (tabId, info) {
//   if (info.status === 'complete') {
//     // your code ...
//   }
// })
