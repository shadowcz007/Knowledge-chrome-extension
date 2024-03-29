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
  Select,
  Flex,
  Button,
  Modal,
  Space,
  MultiSelect,
  Group,
  Textarea,
  CopyButton,
  Alert,
  Menu,
  Switch,
  Indicator,
  List,
  ThemeIcon,
  Paper,
  Transition,
} from '@mantine/core'

import {
  IconCircleCheck,
  IconCircleDashed,
  IconSettings,
  IconMessageCircle,
} from '@tabler/icons'

import { addStyle } from './modules/myStyle'
import { getUserInfo } from './modules/twitter'
import { MyGoogleTranslate } from './modules/translate'
import { MyPDFSwitch, MyPdfRead } from './modules/myPDF'
// console.log(getUserInfo)
// 格式化字符串的功能
// 1. Superheroes
// 2. Supervillains
// 3. Powers
// 4. Action
// 5. Adventure
// 6. Fantasy
// 7. Heroes
// 8. Villains
String.prototype.format = function (start = '', end = '') {
  let ids = {}
  let tx = this.split('\n')
  Array.from(
    tx,
    (t) =>
      (ids[
        (
          start +
          ' ' +
          t.replace(/.*\./gi, '').trim().toLowerCase() +
          ' ' +
          end
        ).trim()
      ] = 1)
  )
  return Object.keys(ids).join('\n')
}

String.prototype.format2 = function () {
  return this.replace(/\n/gi, ' ').split('.').join('.\n\n')
}

String.prototype.format3 = function () {
  let text = this
  let n = '？！。”'.split('')
  text = text.split('\n').filter((f) => f.trim())
  text = Array.from(text, (m1) =>
    !n.includes(m1[m1.length - 1]) ? (m1 += '||') : m1
  )
  text = text.join('\n').replace(/\|\|\n/gi, '')
  return text
}

// 去重
Array.prototype.unque = function () {
  let json = {}
  this.forEach((t) => (json[t] = t))
  return Object.values(json)
}

const _console = (t) => {
  if (typeof t === 'string') {
    console.log(`%c${t}`, 'background:yellow;padding:4px;color:black')
  } else {
    console.log(t)
  }
}

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

function extractWordsForTags (tags = []) {
  return Array.from(tags, (w) => {
    w = w.trim()
    if (w) return extractWords(w)
  }).filter((f) => f)
}

function sentenceMatchTags (sentence, tags = []) {
  tags = extractWordsForTags(tags)

  let sentenceTexts = []
  let sentences = extractSentence(sentence)
  let result = {}
  for (let s of sentences) {
    let words = extractWords(s)
    sentenceTexts.push(words)
    // match
    for (const tag of tags) {
      let isMatch = matchWords(words, tag)
      if (isMatch && isMatch.count > 0) {
        result = { ...result, ...isMatch.result }
      }
    }
  }
  return { sentenceTexts, result }
}

function linkMatchSites (link) {
  // 内置一些好站点，比如
  const sites = {
    'github.com': 'code',
    'github.io': 'project page',
    'arxiv.org/abs/': 'paper',
    'arxiv.org/pdf': 'pdf',
    'huggingface.co/spaces': 'demo',
    'replicate.com': 'demo',
    'youtube.com': 'video',
    'twitter.com': 'social media',
    'discord.gg': 'dao',
  }
  let result = {}

  for (const key in sites) {
    if (link.includes(key)) {
      result[sites[key]] = key
    }
  }

  return result
}

// 把匹配到的tag，塞到原文本里，并变成a标签
function parseSentenceMatchTags (sentenceTexts, sentenceMatchTagsResult, color) {
  let values = Object.values(sentenceMatchTagsResult)
  return Array.from([...sentenceTexts], (texts) => {
    let emTags = {}

    Array.from(values, (c) => {
      if (texts.join('') == c.words.join('')) {
        emTags[c.id] = c
      }
    })

    for (const tag of Object.values(emTags)) {
      texts[tag.startIndex] =
        `<a href="https://bing.com/search?q=${tag.tag}" target='_blank' style="
          padding: 2px 2px;
          text-decoration: none;
          box-shadow:none;
          font-weight: 800;
          border-bottom: 1px dashed ${color};">` + texts[tag.startIndex]
      texts[tag.endIndex] = texts[tag.endIndex] + '</a>'
    }
    return texts.filter((f) => f).join('')
  })
}

// 找到页面的超链接里符合tags的
// 标签多的排前面
function findPageLinks (elements, tags) {
  // 去重
  let targets = [],
    urlsIndex = {}

  for (let child of elements) {
    let sentence = child.innerText
    let { sentenceTexts, result } = sentenceMatchTags(sentence, tags)

    // 12个字符以上 && sentence不等于标签本身
    // link不等于本页面
    let link = parseUrl(child.href || '')

    // 是否是关心的优质网站
    let mSites = linkMatchSites(link)

    let pos = getElementViewPosition(child)

    // sentenceMatchTags 的处理
    if (
      Object.keys(result).length > 0 &&
      sentence.trim().length > 12 &&
      Object.values(result).filter((r) => r.tag != sentence.trim()).length >
        0 &&
      ['A'].includes(child.nodeName) &&
      link &&
      getPageUrl() != link
    ) {
      if (!urlsIndex[link]) {
        urlsIndex[link] = 1
        sentenceTexts = parseSentenceMatchTags(
          sentenceTexts,
          result,
          getColor(child)
        )

        targets.push({
          pageId: link,
          pageTitle: sentence,
          // a标签
          sentenceTexts: sentenceTexts,
          pos,
          // 匹配到的tags
          tags: Array.from(
            unqueArray(Array.from(Object.values(result), (c) => c.tag)),
            (t) => ({ name: t })
          ),
        })
      }
    } else if (
      Object.keys(mSites).length > 0 &&
      !getHostname(link).includes(getPageHostname()) &&
      !getPageHostname().includes(getHostname(link)) &&
      getPageHostname() != getHostname(link)
    ) {
      // 匹配网站的处理
      targets.push({
        pageId: link,
        pageTitle: sentence.trim() || getHostname(link),
        // a标签
        sentenceTexts: sentenceTexts,
        pos,
        // 匹配到的tags
        tags: Array.from(Object.keys(mSites), (c) => ({
          name: c,
          color: 'orange',
        })),
      })
    }
  }

  targets = targets.sort((a, b) => b.pageTitle.length - a.pageTitle.length)

  // 排序，精简
  targets = targets.sort((a, b) => b.tags.length - a.tags.length)

  return targets
}

function getColor (element) {
  return getComputedStyle(element).color
}

function addMarkForLinks (element, pageRelate, tags) {
  if (
    element &&
    !element.getAttribute('data-badge') &&
    pageRelate &&
    pageRelate.length > 0
  ) {
    if (tags && tags.length > 0) {
      let { sentenceTexts, result } = sentenceMatchTags(element.innerText, tags)
      element.innerHTML = parseSentenceMatchTags(
        sentenceTexts,
        result,
        getColor(element)
      ).join('')
    }

    addBadge(
      element,
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
}

function addMarkForCommit (element, commit, tags) {
  if (!element.getAttribute('data-badge')) {
    if (tags && tags.length > 0) {
      let { sentenceTexts, result } = sentenceMatchTags(element.innerText, tags)
      element.innerHTML = parseSentenceMatchTags(
        sentenceTexts,
        result,
        getColor(element)
      ).join('')
    }

    addBadge(
      element,
      'red',
      commit.createdAt,
      commit.cfxAddresses,
      commit.count,
      commit.replies,
      commit.tags,
      commit.relate,
      commit._currentNotion
    )
  }
}

// 遍历评论
function travelCommit (commit) {
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode (node) {
        return NodeFilter.FILTER_ACCEPT
      },
    }
  )
  // console.log('##commit', commit)
  // const nodeList = []
  let currentNode = treeWalker.currentNode

  while (currentNode) {
    // text
    // 对比#text和commit的匹配
    if (
      currentNode.nodeName == '#text' &&
      currentNode.textContent &&
      commit.text &&
      commit.text.trim() != '' &&
      currentNode.textContent.trim() == commit.text.trim() &&
      currentNode.parentElement &&
      !currentNode.parentElement.className.match('mantine-')
    ) {
      // 在原网页插入，不在插件的内容里插入
      console.log(
        'addMarkForCommit',
        commit.text,
        currentNode.parentElement.className
      )
      // if('mantine-Text-root')
      addMarkForCommit(currentNode.parentElement, commit)
    }

    // nodeList.push(currentNode)
    currentNode = treeWalker.nextNode()
  }

  // for (let child of elements) {
  //   if (child.childNodes.length > 0) {
  //     travelCommit(child.childNodes, commit, pageRelate)
  //   } else {
  //     // if (child.textContent.trim() == document.title.trim()) {
  //     //   addMarkForLinks(child.parentElement, pageRelate, tags)
  //     // }
  //   }
  // }
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
          }

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
    isEqual: word == text,
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

function getPageUrl () {
  return parseUrl(window.location.href)
}
function getHostname (url) {
  let u = new URL(url)
  return u.hostname
}
function getPageHostname () {
  return getHostname(window.location.href)
}
function parseUrl (url) {
  return url.replace(/\?.*/, '')
}

function getUrlParam (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg) //匹配目标参数
  if (r != null) return r[2]
  return null //返回参数值
}

// 字符串，逗号分隔
function getKnowledgeTags () {
  let t = decodeURI(getUrlParam('knowledgeTags') || '')
  if (t) return t.toUpperCase().split(',')
  return []
}

function getKnowledgeReply () {
  let t = decodeURI(getUrlParam('knowledgeReply') || '')
  return t
}

// 获取用户划选的内容
// 网站链接 url
//     标题 title
//     创建时间 createdAt
//     标签 tags
//     划选的文字 text
//     评论 reply
async function getSelectionByUser (reply) {
  let url = getPageUrl(),
    createdAt = new Date().toLocaleString(),
    tags = getKnowledgeTags()

  let cfxAddressObj = await getCfxAddress()

  let res = {
    id: url,
    cfxAddress: cfxAddressObj.addressIsCheck ? cfxAddressObj.address : '',
    url: url,
    title: document.title,
    createdAt,
    tags,
    reply: '',
    text: '',
  }
  let selObj = window.getSelection()
  if (selObj.type == 'None') {
    res = {
      ...res,
      nodeName: '#text',
      textContent: document.title,
      // parentText: document.title,
    }
  } else {
    // console.log('selectedText',selectedText)
    let range = selObj.getRangeAt(0)
    // var nodeName = range.startContainer.nodeName
    let textContent = range.startContainer.textContent
    // let parentText = range.startContainer.parentElement.innerText
    // let xpath = getElementXpath(range.startContainer.parentElement)
    // _console(xpath)
    res = { ...res, text: textContent }
  }
  res.reply = (reply || getKnowledgeReply() || getUserInfo() || res.text).trim()

  return res
}

// 返回用户选择的文本
function getSelectionText () {
  let text = ''
  let selObj = window.getSelection()
  if (selObj.type != 'None') {
    text = selObj.toString()
  }
  return text
}

/* 输出 {
  url:{
    key,type,value
  }
}*/

function getComments () {
  let url = getPageUrl()
  if (url.match('http') && chrome && chrome.runtime)
    chrome.runtime.sendMessage(
      { cmd: 'get-by-pageId', data: { url } },
      function (response) {}
    )
}

function displayComments (cms) {
  // 只保留前4条,标签多的排前面
  let pageRelate = findPageLinks(
    document.body.querySelectorAll('a'),
    Object.keys(window._knowledgeTags || [])
  )

  let textContents = {}
  //   标签
  let tags = {}
  Array.from(cms, (d) => {
    // console.log('$$$d', d)
    try {
      let json = {
        text: d.text,
        nodeName: '#text',
        cfxAddress: d.cfxAddress,
        createdAt: new Date(d.createdAt || new Date()).getTime(),
        tags: d.tags,
        relate: d.relate,
        _currentNotion: d._currentNotion,
      }
      if (!textContents[d.text])
        textContents[d.text] = {
          data: [],
          replies: {},
        }
      textContents[d.text].data.push(json)
      textContents[d.text].replies[d.reply] = 1
    } catch (error) {
      _console(error)
    }
    for (const tag of d.tags || []) {
      if (!tags[tag.name])
        tags[tag.name] = {
          count: 0,
          ...tag,
        }
      tags[tag.name].count++
    }
  })

  //
  let ratingElement = addRating(
    Object.keys(textContents).length + pageRelate.length
  )
  // 把tags的关联上?
  _console(textContents, pageRelate)

  // popup的提示显示
  if (Object.keys(textContents).length == 0 && pageRelate.length == 0) {
    setPopup('Mark')
  } else {
    setPopup(`${Object.keys(textContents).length}*${pageRelate.length}`)
  }

  // 页面内值得关注的链接
  addMarkForLinks(
    ratingElement,
    pageRelate,
    Object.keys(window._knowledgeTags || [])
  )

  // 排序后
  for (const key in textContents) {
    let data = textContents[key].data
    let replies = textContents[key].replies
    // 评论处理
    replies = Object.keys(replies).filter((f) => f != 'undefined' && f)
    // _console(replies)
    data.sort((a, b) => b.createdAt - a.createdAt)
    data[0].count = data.length
    data[0].cfxAddresses = unqueArray(Array.from(data, (d) => d.cfxAddress))
    // console.log('####', data[0])
    try {
      let json = { ...data[0], replies }
      travelCommit(json)
    } catch (error) {
      _console(error)
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
    _console(
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

function addRating () {
  let id = 'knowledge-data-rating-icon'
  if (document.querySelector('#' + id)) {
    document.querySelector('#' + id).remove()
  }

  let div2 = document.createElement('div')
  div2.id = id
  div2.style = `position:fixed;top:44px;left:12px;z-index:999999999999999999`
  document.body.insertAdjacentElement('beforeend', div2)

  chrome.storage.local.get('markPosition', (res) => {
    if (
      res &&
      res.markPosition &&
      res.markPosition.left &&
      res.markPosition.top
    ) {
      div2.style.left = res.markPosition.left
      div2.style.top = res.markPosition.top
    }
  })

  window.isMoveClicked = false
  div2.addEventListener('click', (e) => {
    // 用来判断是否点击到位，不然会到hover里去了;
    if (e.target.className.match(/mantine\-.*\-root/)) {
      window.isMoveClicked = !window.isMoveClicked
    }
  })

  // 跟随鼠标
  document.onmousemove = (event) => {
    if (window.isMoveClicked) {
      window.requestAnimationFrame(() => {
        let top = event.clientY - 12 + 'px',
          left = event.clientX - 24 + 'px'
        if (div2.style.display != 'inline') {
          div2.style.setProperty('display', 'inline')
        }
        if (div2.style.top != top) div2.style.setProperty('top', top)
        if (div2.style.left != left) div2.style.setProperty('left', left)
        chrome.storage.local.get('markPosition', (data) => {
          if (
            data &&
            data.markPosition &&
            data.markPosition.top != top &&
            data.markPosition.left != left
          ) {
            chrome.storage.local.set({
              markPosition: {
                top,
                left,
              },
            })
          }
        })
      })
      // TODO 记录下来
    }
  }
  return div2
}

function addBadge (
  element,
  color = 'red',
  createdAt,
  nicknames = [],
  count = 1,
  replies = [],
  tags = [],
  relate,
  currentNotion
) {
  let div2 = document.createElement('div')
  div2.style = `cursor :pointer;display: inline;
  margin-right: 8px;text-align:left`
  element.insertAdjacentElement('afterbegin', div2)
  element.setAttribute('data-badge', true)

  addStyle(
    `
  .mantine-HoverCard-dropdown{
    z-index:999999999999999999 !important
  }`,
    'mantine-HoverCard-dropdown-css'
  )

  const countBtn = (
    <Avatar.Group>
      <Avatar variant='filled' radius='lg' size='sm' color={color}>
        <Text fz={createdAt ? 'sm' : 'xs'}>+{count}</Text>
      </Avatar>
    </Avatar.Group>
  )

  // _console(relate)
  render(
    <HoverCard width={440} shadow='md'>
      <HoverCard.Target>
        <Badge
          color={color}
          size='lg'
          sx={{ paddingRight: createdAt ? 3 : 0 }}
          leftSection={createdAt ? '' : countBtn}
          rightSection={createdAt ? countBtn : ''}
        >
          {createdAt ? format(createdAt, 'zh_CN') : '发现链接*'}
        </Badge>
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <Text size='xs' c='dimmed' align='left'>
          {nicknames.join('\n')}
        </Text>

        {replies && replies.length > 0 ? (
          <Text size='sm' align='left'>
            <br />
            <Badge size='xs'>记录</Badge>

            {Array.from(
              replies.filter((f) => f),
              (r) => (
                <Text
                  key={r}
                  style={{
                    paddingLeft: '4px',
                    color: '#4a4a4a',
                    backgroundColor: 'transparent',
                  }}
                >
                  {r}
                  <br />
                </Text>
              )
            )}
            {currentNotion && currentNotion.title ? (
              <>
                <Space h='xl' />
                <Badge color='gray' size='xs'>
                  来源: {currentNotion.title}
                </Badge>
              </>
            ) : (
              ''
            )}
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
          ? [
              ...Array.from(relate, (e) => (
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
                        <Badge
                          key={t.name}
                          size='xs'
                          color={t.color ? t.color : 'blue'}
                        >
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
              )),
              // <Button variant='outline' color={'dark'} onClick={()=>console.log(Array.from(relate,r=>r.pageTitle))}>翻译</Button>
            ]
          : ''}
      </HoverCard.Dropdown>
    </HoverCard>,
    div2
  )
}

// 发现有价值的url
function update () {
  return new Promise((res, rej) => {
    if (
      window.location.protocol.match('http') &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get('tags', ({ tags }) => {
        if (tags) window._knowledgeTags = { ...tags }
        // _console(window._knowledgeTags)
        res(window._knowledgeTags)
      })
    } else {
      res({})
    }
  })
}

class MyMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: props.title,
      text: props.text,
      result: props.result,
    }
  }
  render () {
    let that = this
    return (
      <Flex
        direction='column'
        align='flex-start'
        justify='flex-start'
        style={{
          maxWidth: '600px',
          backgroundColor: '#eee',
          padding: '12px',
          borderRadius: '12px',
        }}
      >
        <Flex direction='row'>
          <Text fz={'sm'} style={{ maxWidth: '440px', marginLeft: '24px' }}>
            {that.state.result}
          </Text>
          <Text fz={'sm'}>{that.state.text}</Text>
        </Flex>
      </Flex>
    )
  }
}

class MyAlert extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      opened: true,
      title: props.title,
      texts: props.texts,
    }
  }
  render () {
    let that = this
    return (
      <Alert
        // icon={<img src={logo} className='App-logo' alt='logo' />}
        title={that.state.title}
        color='indigo'
        withCloseButton
        // variant='filled'
        onClose={() => that.props.onClose()}
      >
        <Flex justify='flex-start' align='flex-start' style={{ width: '100%' }}>
          {Array.from(that.state.texts, (t, i) => (
            <Flex
              direction={'column'}
              key={t + i}
              style={{ width: '40%', margin: '0 24px' }}
            >
              {Array.from(t.split('\n'), (_t, _i) => (
                <Text key={_i + _t}>
                  {_t}
                  <br />
                </Text>
              ))}
            </Flex>
          ))}
          <Space w='xl' />
          <CopyButton value={that.state.texts.join('\n')}>
            {({ copied, copy }) => (
              <Button
                variant='outline'
                color={copied ? 'teal' : 'dark'}
                onClick={copy}
              >
                {copied ? '已复制到剪切板' : '拷贝'}
              </Button>
            )}
          </CopyButton>
        </Flex>
      </Alert>
    )
  }
}

class Notions extends React.Component {
  constructor (props) {
    super(props)

    const currentNotion = props.notions.filter((n) => n.isSelected)[0]
    let userData = props.userData
    let tags = [],
      _tags = []
    if (userData.tags) {
      tags = userData.tags
      tags = Array.from([...tags], (t) => ({
        label: t,
        value: t,
      })).filter((f) => f.value.trim())
      // userData.tags = ''
    }
    if (userData._tags) {
      _tags = userData._tags
      _tags = Array.from([..._tags], (t) => ({
        label: t,
        value: t,
      })).filter((f) => f.value.trim())
      delete userData._tags
    }

    // label的显示字符串处理，补充用户自定义的新增字段
    let labels = {}
    if (currentNotion.matchKeywords) {
      // 补充用户自定义的新增字段
      Array.from(currentNotion.matchKeywords, (m, i) => {
        if (
          !userData[m.key] &&
          m.notionProperties &&
          m.notionProperties.type == 'rich_text'
        ) {
          userData[m.key] = ''
        }
      })

      Array.from(Object.keys(userData), (key) => {
        let notionKey = currentNotion.matchKeywords.filter(
          (mk) => mk.key == key
        )[0]
        if (notionKey && notionKey.notionProperties)
          labels[key] = `${notionKey.name} _ ${notionKey.notionProperties.key}`
      })
    }

    this.state = {
      opened: props.opened,
      notions: props.notions,
      currentId: currentNotion ? currentNotion.id : '',
      userData: userData,
      tags,
      _tags,
      labels,
    }
  }
  render () {
    let that = this
    return (
      <Modal
        opened={this.state.opened}
        onClose={() => {
          that.setState({ opened: false })
          that.props.onClose()
        }}
        title='即将保存'
        centered
        size='calc(100vw - 98px)'
        zIndex={99999999999999999}
        translate='no'
      >
        <Flex
          miw={'60%'}
          gap='sm'
          justify='flex-start'
          align='flex-start'
          direction='row'
          wrap='wrap'
        >
          <Flex direction='column'>
            <MultiSelect
              label={that.state.labels['tags'] || '标签'}
              data={that.state._tags}
              placeholder='选择一个或新建'
              defaultValue={Array.from(that.state.tags, (t) => t.value)}
              searchable
              creatable
              getCreateLabel={(query) => `+ 新建 ${query}`}
              onChange={(newTags) => {
                newTags = newTags.filter((f) => f.trim())
                // console.log(newTags)
                that.setState({
                  userData: {
                    ...that.state.userData,
                    tags: newTags,
                  },
                })
              }}
              onCreate={(query) => {
                if (query.trim()) {
                  const item = { value: query, label: query }
                  // 新标签
                  if (
                    that.state.tags.filter((t) => t.value != query).length > 0
                  ) {
                    that.setState({
                      tags: [item, ...that.state.tags],
                    })
                  }

                  return item
                }
              }}
            />
            {that.state.userData.reply.length > 2000 ? (
              <Textarea
                style={{ minWidth: '600px' }}
                label={that.state.labels['reply'] || '评论'}
                error={`当前${that.state.userData.reply.length},字符数超过2000，无法提交`}
                withAsterisk
                placeholder='reply'
                value={that.state.userData.reply}
                autosize
                minRows={2}
                onChange={(event) => {
                  let val = event.currentTarget.value
                  that.setState({
                    userData: {
                      ...that.state.userData,
                      reply: val,
                    },
                  })
                }}
              />
            ) : (
              <Textarea
                style={{ minWidth: '600px' }}
                label={that.state.labels['reply'] || '评论'}
                withAsterisk
                placeholder='reply'
                value={that.state.userData.reply}
                autosize
                minRows={2}
                onChange={(event) => {
                  let val = event.currentTarget.value
                  that.setState({
                    userData: {
                      ...that.state.userData,
                      reply: val,
                    },
                  })
                }}
              />
            )}

            <Textarea
              style={{ minWidth: '600px' }}
              label={that.state.labels['title'] || '标题'}
              withAsterisk
              placeholder='title'
              value={that.state.userData.title}
              autosize
              maxRows={4}
              onChange={(event) => {
                let val = event.currentTarget.value.trim()
                that.setState({
                  userData: {
                    ...that.state.userData,
                    title: val,
                  },
                })
              }}
            />
          </Flex>
          <Flex direction='column'>
            {Array.from(Object.keys(that.state.userData), (key, i) => {
              if (
                ![
                  'title',
                  'url',
                  'reply',
                  'id',
                  'cfxAddress',
                  'createdAt',
                  'tags',
                  'text',
                ].includes(key)
              )
                return (
                  <Textarea
                    key={i}
                    style={{ minWidth: '300px' }}
                    label={that.state.labels[key]}
                    value={that.state.userData[key]}
                    autosize
                    maxRows={4}
                    onChange={(event) => {
                      let val = event.currentTarget.value
                      let njson = {}
                      njson[key] = val
                      that.setState({
                        userData: {
                          ...that.state.userData,
                          ...njson,
                        },
                      })
                    }}
                  />
                )
            })}
          </Flex>
        </Flex>
        <Space h='xl' />
        <Flex
          mih={50}
          gap='md'
          justify='flex-start'
          align='flex-start'
          direction='row'
          wrap='nowrap'
        >
          <Select
            label={'当前Notion数据库'}
            placeholder={'保存到哪里？'}
            data={Array.from(this.state.notions, (n) => {
              return {
                label: n.title,
                value: n.id,
              }
            })}
            value={this.state.currentId}
            onChange={(v) => {
              that.setState({ currentId: v })
            }}
            allowDeselect={false}
            dropdownPosition='bottom'
          />
          <Flex
            miw={600}
            gap='sm'
            justify='flex-start'
            align='flex-start'
            direction='column'
            wrap='wrap'
            maw={720}
          >
            <Text fz='xs'>待提交</Text>
            {Array.from(Object.keys(that.state.userData), (key) => {
              if (that.state.labels[key])
                return (
                  <Text fz='xs' key={key}>
                    {that.state.userData[key].length > 2000
                      ? '！！！超出2000字符数限制'
                      : ''}
                    {`- ${that.state.labels[key].split('_')[1].trim()} : ${
                      that.state.userData[key]
                    }`}
                  </Text>
                )
            })}
          </Flex>
        </Flex>
        <Flex
          mih={50}
          gap='lg'
          justify='flex-end'
          align='flex-start'
          direction='column'
          wrap='wrap'
        >
          <Space h='xl' />
          <Button
            style={{
              color: 'white',
              backgroundColor: '#228be6',
            }}
            onClick={() => {
              if (that.state.userData.reply.length > 2000)
                return alert('超出字符数限制')
              console.log(that.state)
              // that.state.userData.tags = [...that.state.tags]
              // 在这里提交
              that.props.onClose()
              that.setState({ opened: false })

              let data = {
                ...that.state.userData,
                notionId: that.state.currentId,
              }
              // 向bg发送消息
              chrome.runtime.sendMessage(
                {
                  cmd: 'mark-result',
                  data: data,
                },
                function (response) {
                  _console('收到来自后台的回复：' + response)
                }
              )
            }}
          >
            提交
          </Button>
        </Flex>
      </Modal>
    )
  }
}

async function getCfxAddress () {
  let data = await chrome.storage.sync.get('cfxAddress')
  if (data && data.cfxAddress) {
    return data.cfxAddress
  } else {
    console.log('请登录')
  }
  return
}

async function chromeStorageGet (k) {
  return new Promise((res, rej) => {
    chrome.storage.local.get(k, (r) => {
      res(r)
    })
  })
}

async function getNotions () {
  let data = await chromeStorageGet(['notions', 'currentNotion'])

  let notionsForSelect = []
  if (data && data.notions) {
    notionsForSelect = Array.from(Object.values(data.notions), (n) => ({
      title: n.title,
      id: n.id,
      databaseId: n.databaseId,
      token: n.token,
      matchKeywords: n.matchKeywords,
    }))
  }
  if (data && data.currentNotion) {
    let currentId = data.currentNotion.id
    notionsForSelect = Array.from(notionsForSelect, (ns) => {
      if (ns.id === currentId) {
        ns.isSelected = true
      }
      return ns
    })
  }
  return notionsForSelect
}

function createAlert (title, texts) {
  let div = document.querySelector('#knowledge-alert-div')
  if (div) div.remove()

  div = document.createElement('div')
  div.id = 'knowledge-alert-div'
  document.body.appendChild(div)

  addStyle(
    `
    #knowledge-alert-div {
      position: fixed;
      right: 0px;
      width: 100%;
      top: 0px;
      overflow-y: scroll;
      z-index: 99999999999999999999;
    }`,
    'knowledge-alert-div-css'
  )

  render(
    <MyAlert title={title} texts={texts} onClose={() => div.remove()} />,
    div
  )
}

async function createPrompt (notions, userData) {
  let div = document.createElement('div')
  div.className = 'notranslate'
  // TODO
  // 读取本地的标签缓存
  let data = await chromeStorageGet('tags')

  if (data && data.tags) {
    userData._tags = [...userData.tags, ...Object.keys(data.tags)].unque()
  }
  render(
    <Notions
      opened={true}
      notions={notions}
      onClose={() => div.remove()}
      userData={userData}
    />,
    div
  )
  document.body.appendChild(div)
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // _console(request)
  if (request.cmd == 'mark-run') {
    let userData = await getSelectionByUser(request.reply)
    let notionsForSelect = await getNotions()
    // 弹出modal ，让用户输入评论
    // notion选择
    await createPrompt(notionsForSelect, userData)
  } else if (request.cmd == 'login') {
    // alert('请登录anyweb或者填写钱包地址')
    if (window.confirm('请登录anyweb填写钱包地址')) {
      chrome.runtime.sendMessage({ cmd: 'open-login' }, function (response) {
        _console('收到来自后台的回复：' + response)
      })
    }
  } else if (request.cmd == 'mark-push') {
    if (request.data && request.success) displayComments(request.data)
    if (!request.success) {
      _console(JSON.stringify(request.info))
    }
    alert('已提交')
    //TODO bug contentScript.bundle.js:55423 Ignored call to 'alert()'. The document is sandboxed, and the 'allow-modals' keyword is not set.
  } else if (request.cmd === 'get-by-pageId-run') {
    domContentLoadedDoSomething()
  } else if (request.cmd == 'get-by-pageId-result') {
    // console.log(request)
    if (request.data) displayComments(request.data)
  } else if (request.cmd == 'translate-run') {
    let text = getSelectionText()
    chrome.runtime.sendMessage(
      { cmd: 'translate', data: text },
      function (response) {
        _console('收到来自后台的回复：' + response)
      }
    )
  } else if (request.cmd == 'translate-result') {
    const { data, success, info } = request
    if (success) {
      _console(data)
      createAlert('翻译结果', [data.en, data.zh])
    }
  } else if (request.cmd == 'page-set-contenteditable') {
    pageSetContenteditable()
    _console(request.data)
  } else if (request.cmd == 'display-translate-pannel') {
    if (document.body.querySelector('#know-insert-google-translate'))
      document.body.querySelector(
        '#know-insert-google-translate'
      ).style.display = 'block'
  }

  sendResponse('我收到了你的消息！')
})

// 页面的功能控制
function pageSetContenteditable () {
  if (document.body.getAttribute('contenteditable')) {
    document.body.removeAttribute('contenteditable')
  } else {
    document.body.setAttribute('contenteditable', true)
  }
}

// 直接使用谷歌翻译，从保存的记录里调取 - pdf
function insertGoogleTranslate () {
  // if(window.location.host!='translate.google.com')return

  let id = 'know-insert-google-translate'
  let div = document.querySelector('#' + id)

  if (!div) {
    div = document.createElement('div')
    div.id = id
    div.className = 'notranslate'
    document.body.appendChild(div)
    addStyle(
      `
    #know-insert-google-translate {
      display:none;
      position: fixed;
      top: 132px;
      left: 20px;
      z-index: 9999999999999999999999999;
      /*background: #fff;
      height: calc(90vh - 120px);
      padding: 12px;
      width: 248px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-top: 0;
      box-shadow: 0 1px 4px 0 rgb(0 0 0 / 37%);*/
    }
    #know-insert-google-translate ::-webkit-scrollbar {
      display: none;
    }
    input.mantine-Select-input{
      width: -webkit-fill-available;
    }
    input.mantine-MultiSelect-searchInput{
      background: none;
      border: none;
    }
    `,
      id + '-css'
    )
  }

  render(<MyGoogleTranslate />, div)
}

function setPopup (t) {
  chrome.runtime.sendMessage(
    { cmd: 'set-badge-text', data: { text: t } },
    function (response) {
      console.log(response)
    }
  )
}

function domContentLoadedDoSomething () {
  _console('DOM loaded')
  console.log(window._run_domContentLoadedDoSomething)
  let t =
    5 * 60 -
    (new Date().getTime() - (window._run_domContentLoadedDoSomething || 0)) /
      1000
  if (t < 0) {
    // 5min 后可以刷新
    console.log('激活状态！5min 后可以刷新')
    window._run_domContentLoadedDoSomething = new Date().getTime()
    setPopup('loaded')
    createPDFDiv()
    insertGoogleTranslate()
    window.requestAnimationFrame(() => {
      update().then(() => getComments())
    })
  } else {
    console.log('激活状态！不刷新', t)
    setPopup('-')
  }
}

if (document.readyState !== 'complete') {
  // 此时加载尚未完成
  document.addEventListener('DOMContentLoaded', domContentLoadedDoSomething)
}
domContentLoadedDoSomething()
// setTimeout(() => domContentLoadedDoSomething(), 50)

window.onfocus = function (e) {
  console.log('激活状态！')

  if (document.readyState == 'complete') domContentLoadedDoSomething()
}

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
})

// https://mozilla.github.io/pdf.js/web/viewer.html?file=
// pdf
function createPDFDiv () {
  let div = document.createElement('div')
  div.id = 'knowlege-pdf-read-new'
  div.className = 'knowlege-pdf-read'
  div.style = `position: fixed;
  width: 420px;
  height: 50vh;
  top: 32px;
  color: black;
  right: 0;
  background-color: #eee;
  display:none;
  z-index: 999;`

  if (
    !document.querySelector('#' + div.id) &&
    window.location.href.match(
      'https://mozilla.github.io/pdf.js/web/viewer.html'
    )
  ) {
    document.body.appendChild(div)
    // toolbarViewerRight
    let toolbarViewerRight = document.body.querySelector('#toolbarViewerRight')
    // 收集开关
    let selectBtn = document.createElement('button')

    render(<MyPDFSwitch domId={div.id} />, selectBtn)

    toolbarViewerRight.insertAdjacentElement('afterbegin', selectBtn)

    render(<MyPdfRead />, div)
  }

  // 样式修改 for .freeTextEditor.internal
  // addStyle(`
  // .freeTextEditor .internal {
  //   background: #eee !important;
  //   padding: 8px;
  //   border-radius: 4px;
  //   font-weight: 300 !important;
  //   white-space: break-spaces !important;
  // }
  // `,'knowlege-pdf-read-new-css');
}
