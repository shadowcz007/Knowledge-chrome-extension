// import { printLine } from './modules/print'
// _console('Content script works!')
// _console('Must reload extension for modifications to take effect.')
// printLine("Using the 'printLine' function from the Print Module")

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
// 只保留前4条,标签多的排前面
function findPageLinks (elements, tags, count = 4) {
  // 去重
  let targets = [],
    urlsIndex = {}

  for (let child of elements) {
    let sentence = child.innerText
    let { sentenceTexts, result } = sentenceMatchTags(sentence, tags)

    // 12个字符以上 && sentence不等于标签本身
    // link不等于本页面
    let link = parseUrl(child.href || '')

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
        let pos = getElementViewPosition(child)
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
    }
  }

  targets = targets.sort((a, b) => b.pageTitle.length - a.pageTitle.length)

  // 排序，精简
  targets = targets
    .slice(0, count)
    .sort((a, b) => b.tags.length - a.tags.length)

  return targets
}

function getColor (element) {
  return getComputedStyle(element).color
}

function addMarkForLinks (element, pageRelate, tags) {
  // _console(
  //   !element.getAttribute('data-badge'),
  //   pageRelate,
  //   pageRelate.length > 0
  // )
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
      commit.relate
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
      currentNode.textContent.trim() == commit.text.trim()
    ) {
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
import { type } from 'os'

function getPageUrl () {
  return parseUrl(window.location.href)
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
  if (t) return t.toUpperCase()
  return
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
function getSelectionByUser () {
  let url = getPageUrl(),
    createdAt = new Date().toLocaleString(),
    tags = getKnowledgeTags()

  let res = {
    id: url,
    cfxAddress: 'shadow',
    url: url,
    title: document.title,
    createdAt,
    tags,
    reply: '',
    text: '',
  }
  var selObj = window.getSelection()
  if (selObj.type == 'None') {
    res = {
      ...res,
      nodeName: '#text',
      textContent: document.title,
      // parentText: document.title,
    }
  } else {
    var range = selObj.getRangeAt(0)
    // var nodeName = range.startContainer.nodeName
    var textContent = range.startContainer.textContent
    // let parentText = range.startContainer.parentElement.innerText
    // let xpath = getElementXpath(range.startContainer.parentElement)
    // _console(xpath)
    res = { ...res, text: textContent }
  }
  return res
}

/* 输出 {
  url:{
    key,type,value
  }
}*/

function getComments () {
  let url = getPageUrl()
  chrome.runtime.sendMessage(
    { cmd: 'get-by-pageId', data: { url } },
    function (response) {
      // _console('收到来自后台的回复：' + response)
    }
  )
}

function displayComments (cms) {
  // 只保留前4条,标签多的排前面
  let pageRelate = findPageLinks(
    document.body.querySelectorAll('a'),
    Object.keys(window._knowledgeTags || []),
    4
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
  let ratingElement = addRating(
    Object.keys(textContents).length + pageRelate.length
  )
  // 把tags的关联上?
  _console(textContents, pageRelate)

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
  if (document.body.getAttribute('data-rating')) return
  document.body.setAttribute('data-rating', true)

  let div2 = document.createElement('div')
  div2.id = 'knowledge-data-rating-icon'
  div2.style = `position:fixed;top:44px;left:12px;z-index:999999999999999999`
  document.body.insertAdjacentElement('beforeend', div2)

  chrome.storage.local.get('markPosition').then((res) => {
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
    // 用来判断是否点击到位，不然会到hover里去了
    // console.log(e.target.className)
    if (e.target.className.match(/mantine\-.*\-root/)) {
      window.isMoveClicked = !window.isMoveClicked
    }
    // e.preventDefault()
    // e.stopPropagation()
  })

  // 跟随鼠标
  document.onmousemove = (event) => {
    if (window.isMoveClicked) {
      // console.dir(span);
      // span.innerText = event.clientX + ', ' + event.clientY

      window.requestAnimationFrame(() => {
        div2.style.setProperty('display', 'inline')
        div2.style.setProperty('top', event.clientY - 12 + 'px')
        div2.style.setProperty('left', event.clientX - 24 + 'px')
        chrome.storage.local.set({
          markPosition: {
            top: event.clientY - 12 + 'px',
            left: event.clientX - 24 + 'px',
          },
        })
      })
      // TODO 记录下来
    }
  }

  // let div3 = document.createElement('div')
  // div2.appendChild(div3)

  // render(
  //   <Badge color='gray' size='lg' sx={{ paddingRight: 3, paddingLeft: 3 }}>
  //     <Rating defaultValue={count} readOnly={true} />
  //   </Badge>,
  //   div3
  // )
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

  // _console(relate)
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
          {createdAt ? format(createdAt, 'zh_CN') : '相关 '}
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
            {Array.from(
              replies.filter((f) => f),
              (r) => (
                <Text key={r}>
                  {r}
                  <br />
                </Text>
              )
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
  return new Promise((res, rej) => {
    chrome.storage.local.get('tags').then(({ tags }, _) => {
      if (tags) window._knowledgeTags = { ...tags }
      // _console(window._knowledgeTags)
      res(window._knowledgeTags)
    })
  })
}

// chrome.storage.local.onChanged.addListener(onGot)
// let gettingItem = chrome.storage.local.get()
// gettingItem.then(onGot, onError)
// function onGot (e) {
//   //   _console(e)
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
//   _console(e)
// }

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // _console(request)
  let isOpenLogin = false
  if (request.cmd == 'mark-run') {
    let userData = getSelectionByUser()

    // 弹出modal ，让用户输入评论
    // TODO：notion选择
    chrome.storage.local.get('notions').then((res) => {
      let notionsForSelect = []
      if (res && res.notions) {
        notionsForSelect = Array.from(Object.values(res.notions), (n) => ({
          title: n.title,
          id: n.id,
          databaseId: n.databaseId,
          token: n.token,
          matchKeywords: n.matchKeywords,
        }))
      }

      console.log(notionsForSelect, userData)
      let reply = window.prompt('输入评论', getKnowledgeReply() || res.text)
      if (reply) {
        let data = {
          ...userData,
          reply,
          cfxAddress: '',
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
      }
    })
  } else if (request.cmd == 'login') {
    // alert('请登录anyweb或者填写钱包地址')
    if (window.confirm('请登录anyweb或者填写钱包地址')) {
      if (isOpenLogin == false)
        chrome.runtime.sendMessage({ cmd: 'open-login' }, function (response) {
          _console('收到来自后台的回复：' + response)
          isOpenLogin = true
        })
    }
  } else if (request.cmd == 'mark-push') {
    alert('已提交')
    if (request.data && request.success) displayComments(request.data)
    if (!request.success) {
      _console(JSON.stringify(request.info))
    }
  } else if (request.cmd == 'get-by-pageId-result') {
    console.log(request)
    if (request.data) displayComments(request.data)
  }
  sendResponse('我收到了你的消息！')
})

function domContentLoadedDoSomething () {
  _console('DOM loaded')
  window.requestAnimationFrame(() => {
    update().then(() => getComments())
  })
}

if (document.readyState !== 'complete') {
  // 此时加载尚未完成
  document.addEventListener('DOMContentLoaded', domContentLoadedDoSomething)
}
domContentLoadedDoSomething()
// setTimeout(() => domContentLoadedDoSomething(), 50)

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
