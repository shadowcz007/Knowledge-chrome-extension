// console.log('This is the background page.')
// console.log('Put the background scripts here.', chrome.contextMenus)

// background.js
import { translate } from '@vitalets/google-translate-api'


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

async function getNotionsMatchId (id) {
  let sData = await chrome.storage.local.get('notions')
  if (sData && sData.notions && sData.notions[id]) {
    let currentNotion = sData.notions[id]
    return {
      id: currentNotion.id,
      title: currentNotion.title,
      token: currentNotion.token,
      databaseId: currentNotion.databaseId,
      matchKeywords: currentNotion.matchKeywords,
    }
  } else {
    return {
      id: null,
      title: null,
      token: null,
      databaseId: null,
      matchKeywords: [],
    }
  }
}

async function setCurrentNotion (notion = {}) {
  if (
    notion.id &&
    notion.title &&
    notion.token &&
    notion.databaseId &&
    notion.matchKeywords
  )
    await chrome.storage.local.set({
      currentNotion: notion,
    })
}

async function getCurrentNotion () {
  let sData = await chrome.storage.local.get('currentNotion')
  if (sData && sData.currentNotion) {
    return {
      id: sData.currentNotion.id,
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
  // console.log('query:',query)
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
    // 用来翻页
    info={
      next_cursor:result.next_cursor,
      has_more:result.has_more
    }

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
    let key2Tool = {
      _currentNotion: currentNotion,
    }
    // console.log(
    //   'changeNotionKeyForTool',
    //   properties,
    //   currentNotion.matchKeywords
    // )
    for (const item of currentNotion.matchKeywords) {
      if (item.notionProperties && item.notionProperties['key'])
        key2Tool[item.key] = properties[item.notionProperties['key']]
    }
    res({ ...key2Tool })
  })
}

async function parseData (res) {
  // console.log(res.id,'!!!!!!')
  let properties = { ...res.properties }
  let result = {
    nodeName: '#text'
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
  result = await changeNotionKeyForTool(result);
  result={...result, 
    // notion的原始字段
    _id:res.id,
    _url:res.url
  }
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

let cfxAddress

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'find',
    title: `${chrome.runtime.getManifest().name} 发现`,
    type: 'normal',
    contexts: ['page'],
  })

  // chrome.contextMenus.create({
  //   id: 'page-set-contenteditable',
  //   title: `${chrome.runtime.getManifest().name} 全文编辑`,
  //   type: 'normal',
  //   contexts: ['page'],
  // })

  // if(buding){}
  // chrome.storage.sync.clear()
  // chrome.storage.local.clear()

  chrome.contextMenus.create({
    // parentId:0,
    id: 'mark',
    title: `${chrome.runtime.getManifest().name} 标注`,
    type: 'normal',
    contexts: ['selection'],
  })

  // chrome.contextMenus.create({
  //   // parentId:1,
  //   id: 'translate',
  //   title: `翻译`,
  //   type: 'normal',
  //   contexts: ['selection'],
  // })
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
})

// Open a new search tab when the user clicks a context menu
chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  const id = item.menuItemId
  console.log(id, item, tab)
  if (!tab.url.match('http')) return
  if (id == 'find') {
    // 可以弹出notion数据库的选择

    //  发现页面
    getAllTags()
      .then(({ result, success, info }) => updateTags(result || []))
      .then(() => {
        // 通知页面进行
        chrome.tabs.sendMessage(
          tab.id,
          { cmd: 'get-by-pageId-run', tabId: tab.id },
          function (response) {
            console.log(response)
          }
        )
      })
  } else if (id == 'mark') {
    // 右键菜单选择了标注
    await markCanRun(tab.id)
  }else if(id=='translate'){
   // 通知页面返回文字
   chrome.tabs.sendMessage(
    tab.id,
    { cmd: 'translate-run', tabId: tab.id },
    function (response) {
      console.log(response)
    }
  )
  }

  // console.log(item)
  // let url = new URL(`https://bing.com/search`)
  // url.searchParams.set('q', item.selectionText)
  // chrome.tabs.create({ url: url.href, index: tab.index + 1 })
})

async function markCanRun(tabId,reply){
  const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress && data.cfxAddress.address)
      cfxAddress = data.cfxAddress.address

    if (!cfxAddress) {
      // 通知页面进行标注
      chrome.tabs.sendMessage(
        tabId,
        { cmd: 'login', tabId },
        function (response) {
          console.log(response)
        }
      )
    } else {
      // 通知页面进行标注
      chrome.tabs.sendMessage(
        tabId,
        { cmd: 'mark-run', tabId,reply },
        function (response) {
          console.log(response)
        }
      )
    }
}


function updateTags (items = []) {
  let tags = {}
  return new Promise(async (res, rej) => {

    let data = await chrome.storage.local.get('tags')
    if (data && data.tags) tags = { ...data.tags }
    if (items && items.length > 0) {
      Array.from(items, (d) => {
        Array.from(d.tags, (tag) => {
          tags[tag.name] = d
        })
      })
      await chrome.storage.local.set({
        tags,
      })
    }
    res(tags)
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
    } else if (type == 'multi_select' && value && typeof value == 'object') {
      // value=[1,2]
      // 去掉空值
      properties[key] = {
        multi_select: Array.from(value, (t) => ({ name: t })).filter(
          (f) => f.name && typeof f.name == 'string' && f.name.trim()
        ),
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
  // if(data)
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
    filter = {
      property: key,
      url: {
        contains: value,
      },
    }
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
  const { notionId } = data
  const { token, matchKeywords, databaseId, title, id } =
    await getNotionsMatchId(notionId)
  await setCurrentNotion({
    token,
    matchKeywords,
    databaseId,
    title,
    id,
  })
  // const { token, matchKeywords, databaseId } = await getCurrentNotion()
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
  let { databaseId, token, matchKeywords, title } = await getCurrentNotion()

  let newList = changeKeyForNotion(data, matchKeywords)
  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter: newList[0] ? createFilterForUrl(newList[0]) : {},
    },
    token
  )

  return { result, success, info }
}

async function queryByTag (tag, page_size = 5) {
  let { databaseId, token,matchKeywords } = await getCurrentNotion()

  
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
        contains: tag,
      },
    }
  }

  const { result, success, info } = await queryNotion0(
    {
      database_id: databaseId,
      filter,
      sorts,
      page_size,
    },
    token
  )

  return { result, success, info }
}

async function getAllTags (start_cursor=null,page_size=100) {
  // console.log('start_cursor----getAllTags',start_cursor)
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

  if (Object.keys(filter).length > 0 && sorts.length > 0) {
    let q={
      database_id: databaseId,
      filter,
      sorts,
      page_size,
    };
    if(start_cursor) q['start_cursor']=start_cursor;
    const { result, success, info } = await queryNotion0(
      q,
      token
    )
    return { result, success, info }
  } else {
    return { result: [], success: false, info: 'null' }
  }
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
  let { databaseId, token, matchKeywords, title } = await getCurrentNotion()

  let matchKeywordsMap={}
  for (const mk of matchKeywords) {
    if(mk.notionProperties&&mk.notionProperties.key){
      matchKeywordsMap[mk.key]={
       ...mk.notionProperties
      }
    }
  }

  let sorts;
  if(matchKeywordsMap['createdAt']){
    sorts=[
      {
        property: matchKeywordsMap['createdAt'].key,
        direction: 'descending',
      },
    ]
  }
  

  let filter={
    and: []
  };
  if(matchKeywordsMap['reply']){
    filter.and.push( {
      property: matchKeywordsMap['reply'].key,
      rich_text: {
        is_not_empty: true,
      },
    })
  }


  if (timestamp == 'this_week') {
    filter.and.push({
      timestamp: 'created_time',
      created_time: {
        this_week: {},
      },
    })
    
    if(matchKeywordsMap['tags']){
      sorts = [
        {
          property: matchKeywordsMap['tags'].key,
          direction: 'ascending',
        },
      ]
    }
  } else if (timestamp == 'past_week') {
    filter.and.push({
      timestamp: 'created_time',
      created_time: {
        past_week: {},
      },
    })

    if(matchKeywordsMap['tags']){
      sorts = [
        {
          property: matchKeywordsMap['tags'].key,
          direction: 'ascending',
        },
      ]
    }
  }

 let json={database_id: databaseId};
 if(filter) json[filter]=filter;
 if(sorts) json[sorts]=sorts;

  const { result, success, info } = await queryNotion0(
    json,
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

  if(cmd=='mark-run'){

    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        await markCanRun(tabs[0].id,request.reply)
      }
    )

  }else if (cmd == 'mark-result') {
    const data = await chrome.storage.sync.get('cfxAddress')
    if (data && data.cfxAddress && data.cfxAddress.address)
      cfxAddress = data.cfxAddress.address
    if (!cfxAddress) {
      console.log('请登录')
    } else if (request.data.notionId) {
      // 钱包地址已经传过来了
      saveToNotion({ ...request.data }).then(({ result, success, info }) => {
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
      })
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
      // info 里是翻页信息
      chrome.storage.local.set({
        info:{...info,_des:'翻页信息',cmd:'check-cfx-address'},
      });
      
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
    const { token, databaseId,contenteditable } = request.data
    queryNotionDataBase(token, databaseId).then(({ result, success, info }) => {
      if (success) {
        result._contenteditable=contenteditable;
        chrome.storage.local.set({
          addNotion: result,
        })

        // getAllTags()
        //   .then(({ result, success, info }) => updateTags(result || []))
        //   .then(() => {})
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
    // chrome.runtime.getURL('options.html')
    // !=chrome.runtime.getURL('options.html')&&url!=chrome.runtime.getURL('newtab.html')
    const { url } = request.data

    //  判断是http后
    // 转换下 字段
    if (url.match('http'))
      queryByPageId(request.data).then(({ result, info, success }) => {
        updateTags(result || []).then((tags) => {
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
        updateTags(result || [])
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
          updateTags(result || [])
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

    // getAllTags().then(({ result, success, info }) => updateTags(result))
  } else if (cmd == 'open-login') {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') })
  } else if (cmd == 'open-option-page') {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL('options.html'),
      },
      function (tab) {}
    )
  } else if (cmd == 'get-all-tags') {
    let startCursor=request.data&&request.data.start_cursor?request.data.start_cursor:undefined;
    let pageSize=request.data&&request.data.page_size?request.data.page_size:100;
    getAllTags(startCursor,pageSize).then(({ result, success, info }) => {
      // info 里是翻页信息 cmd用来标记是哪个接口发的
      chrome.storage.local.set({
        info:{...info,_des:'翻页信息',cmd:'get-all-tags'},
      });

      updateTags(result || []);

    })
  } else if (cmd == 'find-by-tag' && request.data) {

    queryByTag(request.data,request.pageSize).then(({ result, success, info }) => {
        updateTags(result || [])
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
      
    })

  }else if(cmd==='translate'&& request.data){
    const data=request.data;
    let success=false,result,info;
    try {
      const { text } = await translate(data, {
        to: 'zh'
      })
      success=true;
      result={
        zh:text,
        en:data
      };
    } catch (e) {
      info=e; 
    };

    if(request.storageOnChanged){
      chrome.storage.local.set({
        'translate':{
          ...result,success,info
        }
      })
    }else{
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              cmd: 'translate-result',
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
    

    

  }else if(cmd==='download-something'){
     
  //   let json=await exportNotionSetupJson();
  //   console.log(json)
  //   chrome.downloads.download({
  //     url: url,
  //     filename: json.title+'.json',
  //     saveAs: true
  // });
  }else if(cmd=='set-badge-text'){
    const data=request.data;
    chrome.action.setBadgeText({text: data.text});
    // const canvas = new OffscreenCanvas(16, 16);
    // const context = canvas.getContext('2d');
    // context.clearRect(0, 0, 16, 16);
    // context.fillStyle = '#00FF00';  // Green
    // context.fillRect(0, 0, 16, 16);
    // const imageData = context.getImageData(0, 0, 16, 16);
    // chrome.action.setIcon({imageData: imageData}, () => {
    //   console.log('set')
    //  });
    chrome.action.setBadgeBackgroundColor({color:data.color|| [0, 0, 0, 255]});
  }

  sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request))
})


// chrome.tabs.onUpdated.addListener(function (tabId, info) {
//   if (info.status === 'complete') {
//     // your code ...
//   }
// })
