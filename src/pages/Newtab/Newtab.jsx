import React from 'react'
import './Newtab.css'
import './Newtab.scss'

// import ReactMarkdown from 'react-markdown'

// const Newtab = () => {
//   const [text, setText] = React.useState('')
//   const createDay = () => {
//     let y = new Date().getFullYear(),
//       m = new Date().getMonth() + 1,
//       d = new Date().getDate()

//     return [
//       `https://raw.githubusercontent.com/shadowcz007/awesome-metaverse/main/MetaverseDaily/${y}-${m}-${d}.md`,
//       `${y}-${m}-${d}`,
//     ]
//   }
//   let [url, title] = createDay()
//   fetch(url)
//     .then((res) => res.text())
//     .then((res) => {
//       setText(res)
//       console.log(text)
//     })

//   return (
//     <div className='App'>
//       <header className='App-header'>
//         <p>{title}</p>
//       </header>
//       <div>
//         <ReactMarkdown>{text}</ReactMarkdown>
//       </div>
//     </div>
//   )
// }

import {
  ActionIcon,
  Badge,
  Group,
  TextInput,
  Button,
  Card,
  Title,
  Text,
  Flex,
  Space,
  Container,
} from '@mantine/core'

let allUrls = {}

import { Provider } from '@idealight-labs/anyweb-js-sdk'
const provider = new Provider({
  logger: console,
  appId: '5a125145-87fc-4634-ba4e-c82dcff9cde8',
})

function unqueArray (arr) {
  let obj = {}
  for (const a of arr) {
    obj[a] = 1
  }
  return Object.keys(obj)
}

function parseData (data) {
  let us = { ...allUrls }
  Array.from(data, (d) => {
    if (!us[d.pageId])
      us[d.pageId] = {
        address: {},
        title: d.pageTitle,
        replies: [d.reply],
        content: [d.textContent],
        createdAt: [new Date(d.createdAt).getTime()],
      }
    us[d.pageId].address[d.cfxAddress] = 1
    us[d.pageId].replies = unqueArray([...us[d.pageId].replies, d.reply])
    us[d.pageId].content = unqueArray([...us[d.pageId].content, d.textContent])
    if (!us[d.pageId].createdAt) us[d.pageId].createdAt = []
    us[d.pageId].createdAt = [
      ...us[d.pageId].createdAt,
      new Date(d.createdAt).getTime(),
    ]
    // console.log(us[d.page.url].createdAt)
  })
  allUrls = us
}

window.isNew = false

const Newtab = () => {
  const [address, setAddress] = React.useState('')
  const [urls, setUrls] = React.useState({})
  const createDay = (n) => {
    n = n || new Date()
    let y = new Date(n).getFullYear(),
      m = new Date(n).getMonth() + 1,
      d = new Date(n).getDate()
    return `${y}/${m}/${d}`
  }

  const getData = (page = 1) => {
    // 向bg发送消息
    if (window.isNew) return
    window.isNew = true
    chrome.runtime.sendMessage({ cmd: 'new-reply' }, function (response) {
      console.log('new-reply 收到来自后台的回复：' + response)
    })
  }

  getData()

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    // console.log('new-reply:', request)
    if (request.cmd == 'new-reply') {
      let res = request.data
      parseData(res)
      setUrls(allUrls)
    }
  })

  provider.on('ready', () => {
    chrome.storage.sync.get('cfxAddress').then((data) => {
      if (data && data.cfxAddress) {
        setAddress(data.cfxAddress)
      } else {
        alert('请登录anyweb或者填写钱包地址')
      }
    })
    // window.isNew = false
    // getData()
    // console.log('@@@@', window.isNew)
    // getData()
  })

  async function login () {
    if (
      await provider.request({
        method: 'anyweb_loginstate',
      })
    ) {
      await provider.request({
        method: 'anyweb_revoke',
      })
    }
    // console.log('!!', provider)
    provider
      .request({
        method: 'cfx_accounts',
        params: [
          {
            availableNetwork: [1, 1029],
            scopes: ['baseInfo', 'identity'],
          },
        ],
      })
      .then((data) => {
        const { chainId, networkId, address, code } = data
        console.log('DApp 获取到的授权结果', data)
        provider.networkId = networkId
        if (provider.networkId === 1) {
          console.log('测试网')
        }
        // alert(address)
        if (address[0]) setAddress(address[0])
        chrome.storage.sync.set({ cfxAddress: address[0] })
      })
      .catch(async (e) => {
        console.error('调用失败', e)
        if (
          await provider.request({
            method: 'anyweb_loginstate',
          })
        ) {
          // reset()
        }
      })
  }

  let cards = [],
    userAddress = {}
  for (const url in urls) {
    let data = urls[url]
    if (!data.createdAt) data.createdAt = []
    data.createdAt.sort((a, b) => b - a)
    if (data.replies.join('\n')) {
      cards.push({
        address: Object.keys(data.address),
        content: data.content.join('\n'),
        replies: data.replies.join('\n'),
        title: data.title,
        url: url,
        createdAt: data.createdAt[0],
      })

      for (const a of Object.keys(data.address)) {
        if (!userAddress[a]) userAddress[a] = 0
        userAddress[a]++
      }
    }
  }

  let userAddressRank = []
  for (const key in userAddress) {
    userAddressRank.push({
      address: key,
      count: userAddress[key],
    })
    // userAddressRank.push({
    //   address: key + '3',
    //   count: userAddress[key],
    // })
    // userAddressRank.push({
    //   address: key + '33',
    //   count: userAddress[key],
    // })
    // userAddressRank.push({
    //   address: key + '3f',
    //   count: userAddress[key],
    // })
  }
  userAddressRank.sort((a, b) => b.count - a.count)
  cards.sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className='App'>
      <header className='App-header'>
        <Flex
          gap='sm'
          justify='flex-end'
          align='center'
          direction='row'
          wrap='wrap'
        >
          <TextInput
            placeholder='你的 cfx address'
            value={address}
            onChange={(event) => {
              // console.log(event)
              setAddress(event.currentTarget.value)
              chrome.storage.sync.set({
                cfxAddress: event.currentTarget.value,
              })
            }}
          />

          <Button onClick={login}>登陆anyweb</Button>
        </Flex>
      </header>
      <Flex
        bg='#282c34'
        gap='lg'
        justify='flex-start'
        align='center'
        direction='column'
        wrap='wrap'
      >
        <Space h='xl' />
        <Container size={440} px={12}>
          <Card shadow='sm' p='lg' radius='md'>
            <Space h='xs' />
            <Card.Section>
              <Container size={440} px={12}>
                <Title order={3} align='left'>
                  MetaverseDaily{' '}
                  <Badge color='violet' variant='light' size='xs'>
                    {createDay()}
                  </Badge>
                  <Badge color='violet' variant='light' size='xs'>
                    共{cards.length}条
                  </Badge>
                </Title>
                <Space h='xs' />
                <Title order={6} align='left'>
                  贡献者
                </Title>
              </Container>
            </Card.Section>
            <Group position='apart' mt='md' mb='xs'>
              {Array.from(userAddressRank, (r, i) => {
                if (i < 3)
                  return (
                    <Badge
                      color='gray'
                      size='xs'
                      variant='light'
                      key={r.address}
                    >
                      {r.address}
                    </Badge>
                  )
              })}
              {userAddressRank.length > 3 ? (
                <Badge color='violet' variant='light'>
                  +{userAddressRank.length - 3}
                </Badge>
              ) : (
                ''
              )}
            </Group>
          </Card>
        </Container>

        <Space h='xl' />
        {Array.from(cards, (c) => {
          return (
            <Container size={440} px={12} key={c.title}>
              <Card shadow='sm' p='lg' radius='md'>
                <Space h='xl' />
                <a
                  href={c.url}
                  target='_blank'
                  style={{ textDecoration: 'none', color: '#1e1e1e' }}
                >
                  <Card.Section>
                    <Container size={440} px={12}>
                      <Title order={3} align='left'>
                        {c.title}{' '}
                        <Badge color='orange' variant='light'>
                          {createDay(c.createdAt)}
                        </Badge>
                      </Title>
                    </Container>
                  </Card.Section>
                </a>
                <Group position='apart' mt='md' mb='xs'>
                  <Badge color='pink' variant='light'>
                    +{c.address.length}
                  </Badge>
                </Group>

                <Space h='xl' />
                {c.replies ? (
                  <Text size='sm' color='dimmed' align='left'>
                    <Badge size='xs'>点评</Badge>
                    {c.replies}
                  </Text>
                ) : (
                  ''
                )}
              </Card>
            </Container>
          )
        })}
        <Space h='xl' />
      </Flex>
    </div>
  )
}

export default Newtab
