// console.log('This is the background page.')
// console.log('Put the background scripts here.', chrome.contextMenus)
const { Client, APIErrorCode } = require('@notionhq/client')

// const { notionToken: token, notionDatabaseId: databaseId } =
//   chrome.runtime.getManifest().config
// console.log(token, databaseId, chrome.action)

function initNotion (token) {
  const notion = new Client({
    auth: token,
  })
  return notion
}

async function getCurrentNotion () {
  let sData = await chrome.storage.local.get('currentNotion')
  if (sData && sData.currentNotion) {
    return {
      title: sData.currentNotion.title,
      token: sData.currentNotion.token,
      databaseId: sData.currentNotion.databaseId,
      matchKeywords: sData.currentNotion.matchKeywords,
    }
  } else {
    return {
      title: null,
      token: null,
      databaseId: null,
      matchKeywords: [],
    }
  }
}

async function queryNotion0 (query, token) {
  // let { databaseId, token } = await getCurrentNotion()
  let notion = initNotion(token)
  let success = false
  let result, info
  try {
    result = await notion.databases.query(query)
    success = true
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      // For example: handle by asking the user to select a different database
    } else {
      // Other error handling code
      console.error(error)
    }
    info = error
  }
  if (success) {
    // console.log('result.results', result.results)
    result = await Promise.all(
      Array.from(result.results, async (r) => (await parseData(r))[0])
    )
  }
  return { result, success, info }
}

async function createNotion0 (data, token) {
  // let { databaseId, token } = await getCurrentNotion()
  let notion = initNotion(token)
  let success = false
  let result, info
  try {
    result = await notion.pages.create(data)
    // result = await notion.databases.query(query)
    success = true
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      //
      // For example: handle by asking the user to select a different database
      //
    } else {
      // Other error handling code
      console.error(error)
    }
    info = error
  }
  if (success) {
    result = await Promise.all(
      Array.from([result], async (r) => (await parseData(r))[0])
    )
  }
  return { result, success, info }
}

function changeKeyForNotion (userData = {}, matchKeywords = []) {
  // 预处理
  let key2notion = {}
  for (const item of matchKeywords) {
    key2notion[item.key] = item.notionProperties
  }
  let newData = {}
  for (const key in userData) {
    if (key2notion[key]) {
      newData[key] = { ...key2notion[key], value: userData[key] }
    }
  }
  return Object.values(newData)
}

function changeNotionKeyForTool (properties = {}) {
  return new Promise(async (res, rej) => {
    let currentNotion = await getCurrentNotion()
    // 预处理
    let key2Tool = {}
    // console.log(
    //   'changeNotionKeyForTool',
    //   properties,
    //   currentNotion.matchKeywords
    // )
    for (const item of currentNotion.matchKeywords) {
      key2Tool[item.key] = properties[item.notionProperties['key']]
    }
    res({ ...key2Tool })
  })
}

async function parseData (res) {
  let properties = { ...res.properties }
  let result = {
    nodeName: '#text',
  }
  // 用来记录数据类型和字段名称
  // let _notion_properties = {}

  for (const key in properties) {
    let type = properties[key].type
    // _notion_properties[key] = {
    //   type,
    //   key,
    // }
    let value = null
    if (type == 'title') {
      value = properties[key].title[0]?.plain_text
    } else if (type == 'rich_text') {
      value = properties[key].rich_text[0]?.plain_text
    } else if (type == 'multi_select') {
      value = Array.from(properties[key].multi_select, (t) => ({
        color: t.color,
        name: t.name,
        id: t.id,
      }))
    } else if (type == 'url') {
      value = properties[key].url
    }
    result[key] = value
  }

  // 转化为工具的字段
  result = await changeNotionKeyForTool(result)
  /*
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
*/
  return [{ ...result }]
}

let cfxAddress,
  isOpenLogin = false

chrome.runtime.onInstalled.addListener(async () => {
  // chrome.contextMenus.create({
  //   id: 'keyword',
  //   title: '收集关键词',
  //   type: 'normal',
  //   contexts: ['selection'],
  // })

  // if(buding){}
  // chrome.storage.sync.clear()
  // chrome.storage.local.clear()

  chrome.contextMenus.create({
    id: 'mark',
    title: '标注',
    type: 'normal',
    contexts: ['selection'],
  })

  // let gettingItem = chrome.storage.local.get()
  // gettingItem.then(onGot, onError)

  // function onGot (e) {
  //   // console.log(e)
  //   if (e.data == undefined)
  //     chrome.storage.local.set({
  //       data: ['元宇宙', '人工智能', 'web3', 'Web3', '大模型'],
  //     })
  // }

  // function onError (e) {
  //   console.log(e)
  // }
})

chrome.action.onClicked.addListener(function (tab) {
  // 当点击扩展图标时，执行...
  console.log('browserAction.onClicked')
  chrome.tabs.create(
    {
      url: chrome.runtime.getURL('options.html'),
    },
    function (tab) {}
  )
  getAllTags().then(({ result, success, info }) => updateTags(result))
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
    if (data && data.cfxAddress && data.cfxAddress.address)
      cfxAddress = data.cfxAddress.address

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

function updateTags (data = []) {
  let tags = {}
  return new Promise((res, rej) => {
    chrome.storage.local.get('tags').then((r, _) => {
      if (r && r.tags) tags = { ...r.tags }
      if (data && data.length > 0) {
        Array.from(data, (d) => {
          Array.from(d.tags, (tag) => {
            tags[tag.name] = d
          })
        })
        chrome.storage.local
          .set({
            tags,
          })
          .then(() => res(tags))
      } else {
        res(tags)
      }
    })
  })
}

// 支持title、rich_text、url 、multi_select 4种
// datas=[{type,key,value}]
function createProperties (datas) {
  let properties = {}
  const add = (type, key, value) => {
    if (type == 'title') {
      properties[key] = {
        title: [
          {
            type: 'text',
            text: {
              content: value,
            },
          },
        ],
      }
    } else if (type == 'rich_text') {
      properties[key] = {
        rich_text: [
          {
            type: 'text',
            text: {
              content: value,
            },
          },
        ],
      }
    } else if (type == 'url') {
      properties[key] = {
        url: value,
      }
    } else if (type == 'multi_select' && value && typeof value == 'string') {
      properties[key] = {
        multi_select: Array.from(value.split(','), (t) => ({ name: t })),
      }
    }
  }
  for (const data of datas) {
    add(data.type, data.key, data.value)
  }

  return properties
}

function createFilterForUrl (data) {
  let filter = {}

  const { key, type, value } = data

  if (type == 'title') {
    filter = {
      property: key,
      title: {
        contains: value,
      },
    }
  } else if (type == 'rich_text') {
    filter = {
      property: key,
      rich_text: {
        contains: value,
      },
    }
  } else if (type == 'url') {
    //
  } else if (type == 'multi_select') {
    filter = {
      property: key,
      multi_select: {
        contains: value,
      },
    }
  }

  return filter
}

async function saveToNotion (data) {
  const { token, matchKeywords, databaseId } = await getCurrentNotion()
  // TODO 替换key
  let items = changeKeyForNotion(data, matchKeywords)

  // items = [
  //   ...items,
  //   { key: 'cfxAddress', value: cfxAddress, type: 'rich_text' },
  // ]

  // let newJson = [
  //   { type: 'title', key: 'pageTitle', value: json['pageTitle'] },
  //   { type: 'rich_text', key: 'cfxAddress', value: json['cfxAddress'] },
  //   { type: 'rich_text', key: 'pageId', value: json['pageId'] },
  //   { type: 'rich_text', key: 'reply', value: json['reply'] },
  //   { type: 'rich_text', key: 'textContent', value: json['textContent'] },
  //   { type: 'rich_text', key: 'createdAt', value: json['createdAt'] },
  // ]
  // if (json['tags']) {
  //   newJson.push({
  //     type: 'multi_select',
  //     key: 'tags',
  //     value: json['tags'],
  //   })
  // }

  let properties = createProperties(items)

  // let { databaseId, token } = await getCurrentNotion()

  let json = {
    parent: { database_id: databaseId },
    properties: { ...properties },
  }

  const { result, success, info } = await createNotion0(json, token)

  return { result, success, info }
}

async function queryByCfxAddress (address) {
  let { databaseId, token } = await getCurrentNotion()

  // TODO
  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter: {
        property: 'cfxAddress',
        rich_text: {
          equals: address,
        },
      },
    },
    token
  )

  return { result, success, info }
}

// {url}
async function queryByPageId (data = {}) {
  let { databaseId, token, matchKeywords } = await getCurrentNotion()

  let newList = changeKeyForNotion(data, matchKeywords)
  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter: createFilterForUrl(newList[0]),
    },
    token
  )

  return { result, success, info }
}

async function queryByTag (tag, page_size = 5) {
  let { databaseId, token } = await getCurrentNotion()

  let sorts = [
    {
      property: 'createdAt',
      direction: 'descending',
    },
  ]

  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter: {
        property: 'tags',
        multi_select: {
          contains: tag,
        },
      },
      sorts,
      page_size,
    },
    token
  )

  return { result, success, info }
}

async function getAllTags () {
  let { databaseId, token, matchKeywords } = await getCurrentNotion()

  let keys = changeKeyForNotion(
    {
      createdAt: 'createdAt',
      tags: 'tags',
    },
    matchKeywords
  )

  let sorts = [],
    filter = {}

  //TODO 需要测试下，更换tags和createAt字段名 对不对
  let createdAtKey = keys.filter((f) => f.value === 'createdAt')
  if (createdAtKey[0] && createdAtKey[0].key) {
    sorts = [
      {
        property: createdAtKey[0].key,
        direction: 'descending',
      },
    ]
  }

  let tagsKey = keys.filter((f) => f.value === 'tags')
  if (tagsKey[0] && tagsKey[0].key && tagsKey[0].type == 'multi_select') {
    filter = {
      property: tagsKey[0].key,
      multi_select: {
        is_not_empty: true,
      },
    }
  }

  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter,
      sorts,
    },
    token
  )
  return { result, success, info }
}

// 用来初始化字段，验证notion访问是否正常
async function queryNotionDataBase (token, databaseId) {
  const notion = initNotion(token)
  let result,
    success = false,
    info
  try {
    result = await notion.databases.retrieve({
      database_id: databaseId,
    })
    success = true
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      //
      // For example: handle by asking the user to select a different database
      //
    } else {
      // Other error handling code
      console.error(error)
    }
    info = error
  }

  if (success) {
    const title = result.title[0].plain_text,
      url = result.url

    const properties = result.properties
    let notionProperties = {}
    for (const key in properties) {
      let type = properties[key].type
      notionProperties[key] = {
        type,
        key,
      }
    }

    result = {
      token: token,
      databaseId: databaseId,
      properties: notionProperties,
      title,
      url,
      id: token + databaseId,
    }
  }

  return { result, success, info }
}

async function queryNotEmptyOfReply (timestamp = null) {
  // if (isQueryNotEmptyOfReply == false) {

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

  let { databaseId, token } = await getCurrentNotion()
  const { result, success, info } = await queryNotion0(
    { database_id: databaseId, filter: filter, sorts: sorts },
    token
  )

  return { result, success, info }
}

// 用于监听发到bg的消息
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const { cmd } = request
  // console.log('收到来自content-script的消息：', request, cmd)

  if (cmd == 'mark-result') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress && data.cfxAddress.address)
      cfxAddress = data.cfxAddress.address
    if (!cfxAddress) {
      console.log('请登录')
    } else {
      saveToNotion({ ...request.data, cfxAddress }).then(
        ({ result, success, info }) => {
          // 通知页面
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                { cmd: 'mark-push', data: result, success, info },
                function (response) {
                  console.log(response)
                }
              )
            }
          )
        }
      )
    }
  } else if (cmd == 'cfx-address') {
    cfxAddress = request.data
    if (cfxAddress)
      chrome.storage.sync.set({
        cfxAddress: {
          address: cfxAddress,
          addressIsCheck: false,
        },
      })
  } else if (cmd == 'get-address') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress && data.cfxAddress.address)
      cfxAddress = data.cfxAddress.address
    if (cfxAddress) sendResponse(cfxAddress)
  } else if (cmd == 'check-cfx-address' && request.data) {
    // 检查是否有贡献,设置贡献条件
    queryByCfxAddress(request.data).then(({ result, success, info }) => {
      // console.log('$$$bg-check-cfx-address', result, success)
      // 通知页面
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'check-cfx-address-result',
            success,
            info,
            data: result,
            address: request.data,
          },
          function (response) {
            // console.log(response)
          }
        )
      })
    })
  } else if (cmd == 'add-notion-token') {
    const { token, databaseId } = request.data
    queryNotionDataBase(token, databaseId).then(({ result, success, info }) => {
      if (success) {
        chrome.storage.local.set({
          addNotion: result,
        })
      }

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            cmd: 'add-notion-token-result',
            success,
            info,
          },
          function (response) {
            // console.log(response)
          }
        )
      })
    })
  } else if (cmd == 'get-by-pageId') {
    // 转换下 字段

    queryByPageId(request.data).then(({ result, info, success }) => {
      updateTags().then((tags) => {
        result = Array.from(result, (d) => {
          d.relate = Array.from(d.tags, (tag) => tags[tag.name]).filter(
            (f) => f && f.url != d.url
          )
          return d
        })
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                cmd: 'get-by-pageId-result',
                data: result,
                info,
                success,
              },
              function (response) {
                console.log(response)
              }
            )
          }
        )
      })
    })
  } else if (cmd == 'new-reply') {
    if (request.isMy && request.address) {
      // 我的贡献
      queryByCfxAddress(request.address).then(({ result, success, info }) => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                cmd: 'new-reply',
                data: result,
                success,
                info,
              },
              function (response) {
                console.log(response)
              }
            )
          }
        )
      })
    } else {
      //获取知识库内容
      queryNotEmptyOfReply(request.timestamp).then(
        ({ result, success, info }) => {
          // isQueryNotEmptyOfReply = false
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  cmd: 'new-reply-result',
                  data: result,
                  success,
                  info,
                },
                function (response) {
                  console.log(response)
                }
              )
            }
          )
        }
      )
    }

    getAllTags().then(({ result, success, info }) => updateTags(result))
  } else if (cmd == 'open-login' && isOpenLogin == false) {
    chrome.tabs.create({ url: 'newtab.html' })
    isOpenLogin = true
  } else if (cmd == 'find-by-tag' && request.data) {
    queryByTag(request.data).then(({ result, success, info }) => {
      updateTags(result).then((data) => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                cmd: 'find-by-tag-result',
                data: data,
                success,
                info,
              },
              function (response) {
                console.log(response)
              }
            )
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
