// import { printLine } from './modules/print'
// console.log('Content script works!')
// console.log('Must reload extension for modifications to take effect.')
// printLine("Using the 'printLine' function from the Print Module")

// import getElementXpath from 'element-xpath'
// console.log(getElementXpath)
// window.getElementXpath = getElementXpath

// 提取句子
function extractSentence (str) {
  const segmenterJa = new Intl.Segmenter('zh', { granularity: 'sentence' })
  const segments = segmenterJa.segment(str)
  return Array.from(segments, (s) => s.segment)
}
// 提取单词
function extractWords (str) {
  const segmenterJa = new Intl.Segmenter('zh', { granularity: 'word' })
  const segments = segmenterJa.segment(str)
  return Array.from(segments, (s) => s.segment)
}

// 遍历
function travel (elements, _TEXTS) {
  let targets = []
  for (let child of elements) {
    let childTexts = []
    let res = extractSentence(child.innerText)
    let counts = {}
    for (let r of res) {
      let words = extractWords(r)
      childTexts.push(words)
      // match
      for (const texts of _TEXTS) {
        let isMatch = matchWords(words, texts)
        if (isMatch && isMatch.count > 0) {
          counts = { ...counts, ...isMatch.result }
          // console.log('isMatch:', r, isMatch.html)
        }
      }
    }
    if (Object.keys(counts).length > 0 && child.innerText.trim().length > 0) {
      let tags = unqueArray(Array.from(Object.values(counts), (c) => c.tag))

      childTexts = Array.from(childTexts, (ct) => {
        let emTags = {}
        for (const c of Object.values(counts)) {
          if (ct.join('') == c.words.join('')) {
            // console.log(c)
            emTags[c.id] = c
          }
        }
        for (const tag of Object.values(emTags)) {
          ct[tag.startIndex] =
            `<a href="https://bing.com/search?q=${tag.tag}" style="
              padding: 2px 2px;
              text-decoration: none;
              box-shadow:none;
              font-weight: 800;
              border-bottom: 1px dashed ${getComputedStyle(child).color};">` +
            ct[tag.startIndex]
          ct[tag.endIndex] = ct[tag.endIndex] + '</a>'
        }
        return ct.filter((f) => f).join('')
      })

      let pos = getElementViewPosition(child)

      // console.log(child, child.nodeName)
      if (['A'].includes(child.nodeName) && child.href) {
        // child.classList.add('data-find')
        // child.setAttribute('data-find', tags.join(','))
        // child.setAttribute('data-position', JSON.stringify(pos))
        // child.innerHTML = childTexts.filter((f) => f).join('')
        targets.push({
          pageId: child.href,
          pageTitle: child.innerText,
          pos,
          tags: Array.from(tags, (t) => ({ name: t })),
        })
      }
    }
  }

  targets = targets.sort((a, b) => b.pageTitle.length - a.pageTitle.length)

  return targets
}
// 遍历评论
function travelCommit (elements, commit, pageRelate) {
  // 直接对比h1
  Array.from(document.body.querySelectorAll('h1'), (h1) => {
    if (!h1.getAttribute('data-badge')) {
      addBadge(
        h1,
        'blue',
        null,
        [],
        pageRelate.length,
        [],
        [],
        Array.from(pageRelate, (c) => ({
          tags: c.tags,
          pageId: c.pageId,
          pageTitle: c.pageTitle,
        }))
      )
    }
  })

  for (let child of elements) {
    let check = Array.from(child.childNodes, (c) => c).filter(
      (c) => c.nodeName == '#text'
    )
    if (child.children.length > 0) {
      travelCommit(child.children, commit, pageRelate)
    }

    // 对比#text和commit的匹配
    for (const c of check) {
      // console.log(c.textContent, document.title)
      if (
        c.nodeName == commit.nodeName &&
        c.textContent == commit.textContent
      ) {
        if (!c.parentElement.getAttribute('data-badge'))
          addBadge(
            c.parentElement,
            'red',
            commit.createdAt,
            commit.cfxAddresses,
            commit.count,
            commit.replies,
            commit.tags,
            commit.relate
          )
      } else if (
        c.textContent.trim() == document.title.trim() &&
        !c.parentElement.getAttribute('data-badge')
      ) {
        addBadge(
          c.parentElement,
          'blue',
          null,
          [],
          pageRelate.length,
          [],
          [],
          Array.from(pageRelate, (c) => ({
            tags: Array.from(c.tags, (t) => ({ name: t })),
            pageId: c.url,
            pageTitle: c.title,
          }))
        )
      }
    }
  }
}
function matchWords (
  words = ['meta', '人工', '智能', '无', '监督', '学习'],
  texts = ['无', '监督', '学习']
) {
  let oWords = [...words],
    oTexts = [...texts]
  // 大写
  words = Array.from([...words], (w) => w.toUpperCase())
  texts = Array.from([...texts], (w) => w.toUpperCase())

  let word = words.join('')
  let text = texts.join('')
  // 获得在原字符的位置
  const getIndex = (arr, index) => {
    return [...arr].slice(0, index).join('').length
  }

  let result = {}

  Array.from(new Array(word.length), (_, i) => {
    // 匹配到关键词
    if (word.indexOf(text, i) != -1) {
      let wIndex = word.indexOf(text, i)
      for (let index = 0; index < words.length; index++) {
        if (getIndex(words, index) === wIndex) {
          let isMatch = true
          for (let j = index; j < index + texts.length; j++) {
            if (words[j] !== texts[j - index]) isMatch = false
            // console.log('match',j,words[j],texts[j-index])
          }
          // console.log(
          //   isMatch,
          //   index,
          //   index + texts.length - 1,
          //   '<em>' + words[index],
          //   words[index + texts.length - 1] + '</em>'
          // )
          if (isMatch) {
            let res = {
              startWord: oWords[index],
              endWord: oWords[index + texts.length - 1],
              startIndex: index,
              endIndex: index + texts.length - 1,
              tag: oTexts.join(''),
              words: oWords,
            }
            let id = Object.values(res).join('')
            result[id] = { ...res, id }
          }
        }
      }
    }
  })

  return {
    count: Object.keys(result).length,
    result,
    tag: oTexts.join(''),
  }
}

// 获取元素的绝对位置坐标（像对于浏览器视区左上角）
function getElementViewPosition (element) {
  //计算x坐标
  var actualLeft = element.offsetLeft
  var current = element.offsetParent
  while (current !== null) {
    actualLeft += current.offsetLeft + current.clientLeft
    current = current.offsetParent
  }
  if (document.compatMode == 'BackCompat') {
    var elementScrollLeft = document.body.scrollLeft
  } else {
    var elementScrollLeft = document.documentElement.scrollLeft
  }
  var left = actualLeft - elementScrollLeft
  //计算y坐标
  var actualTop = element.offsetTop
  var current = element.offsetParent
  while (current !== null) {
    actualTop += current.offsetTop + current.clientTop
    current = current.offsetParent
  }
  if (document.compatMode == 'BackCompat') {
    var elementScrollTop = document.body.scrollTop
  } else {
    var elementScrollTop = document.documentElement.scrollTop
  }
  var right = actualTop - elementScrollTop
  //返回结果
  return { x: left, y: right, height: element.offsetHeight }
}

let lastKnownScrollPosition = 0
let ticking = false

import React from 'react'
import { render } from 'react-dom'
import { format } from 'timeago.js'

import {
  Divider,
  Progress,
  Badge,
  Avatar,
  HoverCard,
  Text,
  Rating,
  Button,
} from '@mantine/core'

function getPageUrl () {
  return window.location.href.replace(/\?.*/, '')
}

function getUrlParam (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg) //匹配目标参数
  if (r != null) return r[2]
  return null //返回参数值
}

function getKnowledgeTags () {
  let t = decodeURI(getUrlParam('knowledgeTags') || '')
  if (t) return t.toUpperCase().split(',')
  return
}

function getKnowledgeReply () {
  let t = decodeURI(getUrlParam('knowledgeReply') || '')
  return t
}

// 获取用户划选的内容
function getSelectionByUser () {
  let url = getPageUrl(),
    createdAt = new Date().toLocaleString(),
    tags = getKnowledgeTags()

  let res = {
    pageId: url,
    cfxAddress: 'shadow',
    pageUrl: url,
    pageTitle: document.title,
    createdAt,
    tags,
    // xpath,
  }

  var selObj = window.getSelection()
  if (selObj.type == 'None') {
    res = {
      ...res,
      nodeName: '#text',
      textContent: document.title,
      parentText: document.title,
    }
  } else {
    var range = selObj.getRangeAt(0)
    var nodeName = range.startContainer.nodeName
    var textContent = range.startContainer.textContent
    let parentText = range.startContainer.parentElement.innerText
    // let xpath = getElementXpath(range.startContainer.parentElement)
    // console.log(xpath)
    res = { ...res, nodeName: nodeName, textContent: textContent, parentText }
  }
  return res
}

function getComments () {
  let url = getPageUrl()

  chrome.runtime.sendMessage(
    { cmd: 'get-by-pageId', data: url },
    function (response) {
      console.log('收到来自后台的回复：' + response)
    }
  )
}

function displayComments (cms) {
  // 只保留前4条,标签多的排前面
  let pageRelate = travel(
    document.body.querySelectorAll('a'),
    Array.from(Object.keys(window._knowledgeTags), (w) => {
      w = w.trim()
      if (w) return extractWords(w)
    }).filter((f) => f)
  )
    .slice(0, 4)
    .sort((a, b) => b.tags.length - a.tags.length)

  // 把tags的关联上?
  console.log(pageRelate)

  let textContents = {}
  //   标签
  let tags = {}
  Array.from(cms, (d) => {
    try {
      let json = {
        textContent: d.textContent,
        nodeName: d.nodeName,
        xpath: d.xpath,
        cfxAddress: d.cfxAddress,
        createdAt: new Date(d.createdAt).getTime(),
        tags: d.tags,
        relate: d.relate,
      }
      if (!textContents[d.textContent])
        textContents[d.textContent] = {
          data: [],
          replies: {},
        }
      textContents[d.textContent].data.push(json)
      textContents[d.textContent].replies[d.reply] = 1
    } catch (error) {
      console.log(error)
    }
    for (const tag of d.tags) {
      if (!tags[tag.name])
        tags[tag.name] = {
          count: 0,
          ...tag,
        }
      tags[tag.name].count++
    }
  })

  //
  addRating(Object.keys(textContents).length + pageRelate.length)

  // 排序后
  for (const key in textContents) {
    let data = textContents[key].data
    let replies = textContents[key].replies
    // 评论处理
    replies = Object.keys(replies).filter((f) => f != 'undefined' && f)
    // console.log(replies)
    data.sort((a, b) => b.createdAt - a.createdAt)
    data[0].count = data.length
    data[0].cfxAddresses = unqueArray(Array.from(data, (d) => d.cfxAddress))
    try {
      let json = { ...data[0], replies }
      travelCommit(document.body.children, json, pageRelate)
      // console.log(json)
    } catch (error) {
      console.log(error)
    }
  }
}

function unqueArray (arr) {
  let obj = {}
  for (const a of arr) {
    obj[a] = 1
  }
  return Object.keys(obj)
}

// v3 所导致的安全策略升级
// window.CUSDIS = {}
// let e
// function t (t) {
//   return (
//     e ||
//       ((e = document.createElement('iframe')),
//       (function (e, t) {
//         const s = window.matchMedia('(prefers-color-scheme: dark)'),
//           d = (d) => {
//             try {
//               const i = JSON.parse(d.data)
//               if ('cusdis' === i.from)
//                 switch (i.event) {
//                   case 'onload':
//                     'auto' === t.dataset.theme &&
//                       n('setTheme', s.matches ? 'dark' : 'light')
//                     break
//                   case 'resize':
//                     e.style.height = i.data + 'px'
//                 }
//             } catch (i) {}
//           }
//         function i (e) {
//           const s = e.matches
//           'auto' === t.dataset.theme && n('setTheme', s ? 'dark' : 'light')
//         }
//         window.addEventListener('message', d), s.addEventListener('change', i)
//       })(e, t)),
//     (e.srcdoc = ((e) => {
//       const t = e.dataset.host || 'https://cusdis.com',
//         n = e.dataset.iframe || `${t}/js/iframe.umd.js`
//       return `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="${t}/js/style.css">\n    <base target="_parent" />\n    <link>\n    <script>\n      window.CUSDIS_LOCALE = ${JSON.stringify(
//         window.CUSDIS_LOCALE
//       )}\n      window.__DATA__ = ${JSON.stringify(e.dataset)}\n    <\/script>
//       <style>
//       :root {
//         color-scheme: light;
//       }
//       label{
//         font-size:12px
//       }
//       button{
//         user-select: none;
//     outline: none;
//     background: #e5e7eb;
//     padding: 4px;
//     font-size: 12px;
//     font-weight: 800;
//       }
//       </style>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script src="${n}" type="module">\n      \n    <\/script>\n  </body>\n</html>`
//     })(t)),
//     (e.style.width = '100%'),
//     (e.style.border = '0'),
//     e
//   )
// }
// function n (t, n) {
//   e &&
//     e.contentWindow.postMessage(
//       JSON.stringify({ from: 'cusdis', event: t, data: n })
//     )
// }
// function s (e) {
//   if (e) {
//     e.innerHTML = ''
//     const n = t(e)
//     e.appendChild(n)
//   }
// }
// function d () {
//   let e
//   window.cusdisElementId
//     ? (e = document.querySelector(`#${window.cusdisElementId}`))
//     : document.querySelector('#cusdis_thread')
//     ? (e = document.querySelector('#cusdis_thread'))
//     : document.querySelector('#cusdis') &&
//       (console.warn(
//         'id `cusdis` is deprecated. Please use `cusdis_thread` instead'
//       ),
//       (e = document.querySelector('#cusdis'))),
//     !0 === window.CUSDIS_PREVENT_INITIAL_RENDER || (e && s(e))
// }
// ;(window.renderCusdis = s),
//   (window.CUSDIS.renderTo = s),
//   (window.CUSDIS.setTheme = function (e) {
//     n('setTheme', e)
//   }),
//   (window.CUSDIS.initial = d),
//   d()

function Demo () {
  const [count, setCount] = React.useState(0)

  document.addEventListener('scroll', (event) => {
    lastKnownScrollPosition = window.scrollY

    if (!ticking) {
      window.requestAnimationFrame(() => {
        doSomething(lastKnownScrollPosition)
        ticking = false
      })

      ticking = true
    }
  })

  function doSomething (scrollPos) {
    // Do something with the scroll position
    let countTarget =
      1 -
      targets.filter(
        (f) => f.pos.y + f.pos.height > scrollPos + window.innerHeight
      ).length /
        targets.length
    console.log(
      scrollPos,
      targets.filter(
        (f) => f.pos.y + f.pos.height > scrollPos + window.innerHeight
      )
    )

    setCount(countTarget)
  }

  const colors = [
    '#7AD1DD',
    '#5FCCDB',
    '#44CADC',
    '#2AC9DE',
    '#1AC2D9',
    '#11B7CD',
    '#09ADC3',
    '#0E99AC',
    '#128797',
    '#147885',
  ]

  return (
    <div>
      <Progress
        //   color='violet'
        size='sm'
        radius='sm'
        value={Math.ceil(count * 100)}
        label={`${Math.ceil(count * 100)}%`}
        //   striped
        //   animate
        //   sections={Array.from(targets, (t, i) => {
        //     return {
        //       value: 100 * (i / targets.length),
        //       label: t.keywords,
        //       color: colors[i],
        //     }
        //   })}
      />
    </div>
  )
}

// let div = document.createElement('div')
// // window.document.body.appendChild(div2)
// window.document.body.insertAdjacentElement('beforebegin', div)

// render(<Demo />, div)

// function Demo2 () {
//   return (
//     <ReactCusdis
//       attrs={{
//         host: 'https://cusdis.com',
//         appId: '3b1c9585-0cbe-443f-8d7a-3f303a9fad71',
//         pageId: window.location.href,
//         pageTitle: document.title,
//         pageUrl: window.location.href,
//       }}
//     />
//   )
// }
// render(<Demo2 />, div2)

function addRating (count = 0) {
  if (document.body.getAttribute('data-rating')) return
  let div2 = document.createElement('div')
  div2.style = `position:fixed;top:44px;left:12px;z-index:999999999999999999`
  document.body.insertAdjacentElement('beforeend', div2)
  document.body.setAttribute('data-rating', true)

  render(
    <Badge color='gray' size='lg' sx={{ paddingRight: 3, paddingLeft: 3 }}>
      <Rating defaultValue={count} readOnly={true} />
    </Badge>,
    div2
  )
}

function addBadge (
  element,
  color = 'red',
  createdAt,
  nicknames = [],
  count = 1,
  replies = [],
  tags = [],
  relate
) {
  let div2 = document.createElement('div')
  div2.style = `cursor :pointer;display: inline;
  margin-right: 8px;text-align:left`
  element.insertAdjacentElement('afterbegin', div2)
  element.setAttribute('data-badge', true)

  const countBtn = (
    <Avatar.Group>
      <Avatar variant='filled' radius='lg' size='sm' color={color}>
        <Text fz={createdAt ? 'sm' : 'xs'}>+{count}</Text>
      </Avatar>
    </Avatar.Group>
  )

  // console.log(relate)
  render(
    <HoverCard width={440} shadow='md' zIndex={9999999999}>
      <HoverCard.Target>
        <Badge
          color={color}
          size='lg'
          sx={{ paddingRight: createdAt ? 3 : 0 }}
          leftSection={createdAt ? '' : countBtn}
          rightSection={createdAt ? countBtn : ''}
        >
          {createdAt ? format(createdAt, 'zh_CN') : ''}
        </Badge>
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <Text size='xs' c='dimmed' align='left'>
          {nicknames.join('\n')}
        </Text>

        {replies && replies.length > 0 ? (
          <Text size='sm' align='left'>
            <br />
            <Badge size='xs'>点评</Badge>
            {replies.join('\n')}
          </Text>
        ) : (
          ''
        )}

        {/* {tags && tags.length > 0 ? Array.from(tags,t=><Badge key={t.name} size='xs' color={t.color} >{t.name}</Badge>) :''} */}
        {((replies && replies.length > 0) || nicknames.join('\n')) &&
        relate &&
        relate.length > 0 ? (
          <Divider my='xs' label='相关' labelPosition='left' />
        ) : (
          ''
        )}

        {relate && relate.length > 0
          ? Array.from(relate, (e) => (
              <a
                target='_blank'
                key={e.pageTitle}
                href={e.pageId}
                style={{
                  textDecoration: 'none',
                  boxShadow: 'none',
                  fontSize: '12px',
                  display: 'block',
                  fontWeight: 300,
                  border: 'none',
                  color: '#2196f3',
                  margin: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {color == 'blue'
                  ? Array.from(e.tags, (t) => (
                      <Badge key={t.name} size='xs'>
                        {t.name}
                      </Badge>
                    ))
                  : ''}
                {e.pageTitle}{' '}
                {color == 'red' ? (
                  <Badge key={e.pageTitle} size='xs'>
                    {Array.from(e.tags, (t) => t.name).join(' ')}
                  </Badge>
                ) : (
                  ''
                )}
              </a>
            ))
          : ''}
      </HoverCard.Dropdown>
    </HoverCard>,
    div2
  )
}

// 发现有价值的url
function update () {
  chrome.storage.local.get('tags').then(({ tags }, _) => {
    if (tags) window._knowledgeTags = { ...tags }
    console.log(window._knowledgeTags)
  })
}

// chrome.storage.local.onChanged.addListener(onGot)
// let gettingItem = chrome.storage.local.get()
// gettingItem.then(onGot, onError)
// function onGot (e) {
//   //   console.log(e)
//   if (e.data && e.data.newValue) {
//     // reload
//     update(e.data.newValue)
//   } else if (e.data) {
//     //
//     update(e.data)
//   } else if (e.selection) {
//     // chrome.storage.local.set({
//     //   selectionRes: getSelectionByUser(),
//     // })
//   }
// }
// function onError (e) {
//   console.log(e)
// }

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log(request)
  let isOpenLogin = false
  if (request.cmd == 'mark-run') {
    let res = getSelectionByUser()
    // 弹出modal ，让用户输入评论
    let reply = window.prompt(
      '输入评论',
      getKnowledgeReply() || res.textContent
    )
    if (reply) {
      let data = { ...res, reply }
      // 向bg发送消息
      chrome.runtime.sendMessage(
        { cmd: 'mark-result', data: data },
        function (response) {
          console.log('收到来自后台的回复：' + response)
        }
      )
    }
  } else if (request.cmd == 'login') {
    // alert('请登录anyweb或者填写钱包地址')
    if (window.confirm('请登录anyweb或者填写钱包地址')) {
      if (isOpenLogin == false)
        chrome.runtime.sendMessage({ cmd: 'open-login' }, function (response) {
          console.log('收到来自后台的回复：' + response)
          isOpenLogin = true
        })
    }
  } else if (request.cmd == 'mark-push') {
    alert('已提交')
    // console.log(request.data)
    if (request.data) displayComments(request.data)
  } else if (request.cmd == 'get-by-pageId-result') {
    // console.log(request.data)
    if (request.data) displayComments(request.data)
  }
  sendResponse('我收到了你的消息！')
})

function domContentLoadedDoSomething () {
  console.info('DOM loaded')
  update()
  getComments()
}

if (document.readyState !== 'complete') {
  // 此时加载尚未完成
  document.addEventListener('DOMContentLoaded', domContentLoadedDoSomething)
}
setTimeout(() => domContentLoadedDoSomething(), 200)

document.addEventListener('scroll', (event) => {
  if (
    !ticking &&
    Math.abs(window.scrollY - lastKnownScrollPosition) >
      window.innerHeight * 3.5
  ) {
    window.requestAnimationFrame(() => {
      domContentLoadedDoSomething()
      ticking = false
      lastKnownScrollPosition = window.scrollY
    })
    ticking = true
  }

  if (
    window.location.href.match('https://cusdis.com/dashboard/project') &&
    Math.abs(window.scrollY - lastKnownScrollPosition) > window.innerHeight * 2
  ) {
    Array.from(
      document.querySelectorAll('p'),
      (p) => (p.innerText = decodeURI(p.innerText))
    )
  }
})
