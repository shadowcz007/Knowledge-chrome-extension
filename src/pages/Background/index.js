console.log('This is the background page.')
console.log('Put the background scripts here.', chrome.contextMenus)

let cfxAddress,
  isOpenLogin = false

const { notionToken: token, notionDatabaseId: databaseId } =
  chrome.runtime.getManifest().config
console.log(token, databaseId)

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
    // 右键菜单选择了标注
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
      chrome.tabs.sendMessage(
        tab.id,
        { cmd: 'login', tabId: tab.id },
        function (response) {
          console.log(response)
        }
      )
    } else {
      // 通知页面进行标注
      chrome.tabs.sendMessage(
        tab.id,
        { cmd: 'mark-run', tabId: tab.id },
        function (response) {
          console.log(response)
        }
      )
    }
  }

  // console.log(item)
  // let url = new URL(`https://bing.com/search`)
  // url.searchParams.set('q', item.selectionText)
  // chrome.tabs.create({ url: url.href, index: tab.index + 1 })
})

const fetchRequest = (url, params = {}, timeout = 10000) => {
  let isTimeout = false
  return new Promise(function (resolve, reject) {
    const TO = setTimeout(function () {
      isTimeout = true
      resolve()
    }, timeout)

    fetch(url, params)
      .then((res) => {
        clearTimeout(TO)
        if (!isTimeout) {
          resolve(res)
        }
      })
      .catch((e) => {
        resolve()
      })
  })
}

// 发送到后台记录标注
async function postData (url = '', data = {}) {
  // Default options are marked with *
  const response = await fetchRequest(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  if (response && response.status == 200) {
    // console.log('response', response)
    return response.json()
  }
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
      reply: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: json['reply'],
            },
          },
        ],
      },
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
      // xpath: {
      //   rich_text: [
      //     {
      //       type: 'text',
      //       text: {
      //         content: json['xpath'],
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
  if (json['tags']) {
    data.properties['tags'] = {
      multi_select: Array.from(json['tags'], (t) => ({ name: t })),
    }
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

function queryByTag (tag, page_size = 5) {
  let url = `https://api.notion.com/v1/databases/${databaseId}/query`
  let sorts = [
    {
      property: 'createdAt',
      direction: 'descending',
    },
  ]
  return postData(url, {
    filter: {
      property: 'tags',
      multi_select: {
        contains: tag,
      },
    },
    sorts,
    page_size,
  })
}

function getAllTags () {
  let url = `https://api.notion.com/v1/databases/${databaseId}/query`
  let sorts = [
    {
      property: 'createdAt',
      direction: 'descending',
    },
  ]
  // console.log('getAllTags')
  return postData(url, {
    filter: {
      property: 'tags',
      multi_select: {
        is_not_empty: true,
      },
    },
    sorts,
  })
}

function findByTag (tag) {
  let urls = {}
  return new Promise((res, rej) => {
    if (tag) {
      queryByTag(tag).then((data) => {
        Array.from(data.results, (r) => {
          let d = parseData(r)[0]
          urls[d.pageId] = { tag, pageTitle: d.pageTitle, pageId: d.pageId }
        })

        res(Object.values(urls))
      })
    } else {
      res()
    }
  })
}

// 获取几天前时间
function getTimestamp (n = 1) {
  let t = new Date()
  return new Date(t.getTime() - 1000 * 60 * 60 * 24 * n)
    .toLocaleString()
    .split(' ')[0]
}

// let isQueryNotEmptyOfReply = false
function queryNotEmptyOfReply (timestamp = null) {
  // if (isQueryNotEmptyOfReply == false) {
  isQueryNotEmptyOfReply = true
  let url = `https://api.notion.com/v1/databases/${databaseId}/query`

  let sorts = [
    {
      property: 'createdAt',
      direction: 'descending',
    },
  ]

  let filter = {
    and: [
      {
        property: 'reply',
        rich_text: {
          is_not_empty: true,
        },
      },
    ],
  }

  if (timestamp == 'this_week') {
    filter.and.push({
      timestamp: 'created_time',
      created_time: {
        this_week: {},
      },
    })
    sorts = [
      {
        property: 'tags',
        direction: 'ascending',
      },
    ]
  } else if (timestamp == 'past_week') {
    filter.and.push({
      timestamp: 'created_time',
      created_time: {
        past_week: {},
      },
    })

    sorts = [
      {
        property: 'tags',
        direction: 'ascending',
      },
    ]
  }

  return postData(url, {
    filter: filter,
    sorts: sorts,
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
      // xpath: res.properties.xpath.rich_text[0]?.plain_text,
      tags: Array.from(res.properties.tags.multi_select, (t) => ({
        color: t.color,
        name: t.name,
        id: t.id,
      })),
    },
  ]
}

// 用于监听发到bg的消息
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log('收到来自content-script的消息：', request)

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
              { cmd: 'mark-push', data: res ? parseData(res) : null },
              function (response) {
                console.log(response)
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
      // tags
      let tags = {},
        data = Array.from(res && res.results ? res.results : [], (r) => {
          let rs = parseData(r)[0]
          Array.from(rs.tags, (t) => (tags[t.name] = 1))
          return rs
        })

      findByTag(Object.keys(tags)[0]).then((tagRes) => {
        if (tagRes) {
          Array.from(data, (d) => {
            d.relate = tagRes.filter((f) => {
              return (
                d.tags.filter((t) => t.name == f.tag).length > 0 &&
                f.pageId != d.pageId
              )
            })
          })
        }

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                cmd: 'get-by-pageId-result',
                data: data,
              },
              function (response) {
                console.log(response)
              }
            )
          }
        )
      })
    })
  } else if (request.cmd == 'new-reply') {
    // console.log(request)
    queryNotEmptyOfReply(request.timestamp).then((res) => {
      // isQueryNotEmptyOfReply = false
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'new-reply',
            data: Array.from(res && res.results ? res.results : [], (r) => {
              return parseData(r)[0]
            }),
          },
          function (response) {
            console.log(response)
          }
        )
      })

      let nTags = {}
      getAllTags().then((tRes) => {
        // console.log(tRes, res)
        let results = []
        if (tRes && tRes.results) {
          results = [...tRes.results]
        }
        if (res && res.results) {
          results = [...res.results, ...results]
        }
        Array.from(results, (r) => {
          Array.from(parseData(r)[0].tags, (t) => {
            nTags[t.name] = 1
          })
        })
        chrome.storage.local.get('tags').then(({ tags }, _) => {
          Array.from(tags, (t) => (nTags[t] = 1))
          chrome.storage.local.set({
            tags: Object.keys(nTags),
          })
        })
      })
    })
  } else if ((request.cmd = 'open-login' && isOpenLogin == false)) {
    chrome.tabs.create({ url: 'newtab.html' })
    isOpenLogin = true
  } else if (request.cmd == 'find-by-tag' && request.data) {
    queryByTag(request.data).then((res) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'find-by-tag-result',
            data: Array.from(res && res.results ? res.results : [], (r) => {
              return parseData(r)[0]
            }),
          },
          function (response) {
            console.log(response)
          }
        )
      })
    })
  }

  sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request))
})

// chrome.tabs.onUpdated.addListener(function (tabId, info) {
//   if (info.status === 'complete') {
//     // your code ...
//   }
// })
