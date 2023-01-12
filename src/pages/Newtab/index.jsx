import React from 'react'
import { render } from 'react-dom'
import './index.css'

import { Provider } from '@idealight-labs/anyweb-js-sdk'

import {
  CopyButton,
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
  Select,
  LoadingOverlay,
  Header,
  Menu,
  Center,
  Burger,
} from '@mantine/core'

// console.log(chrome.runtime.getManifest().config.anywebId)

function createDay (n) {
  n = n || new Date()
  let y = new Date(n).getFullYear(),
    m = new Date(n).getMonth() + 1,
    d = new Date(n).getDate()
  return `${y}/${m}/${d}`
}

function unqueArray (arr) {
  let obj = {}
  for (const a of arr) {
    obj[a] = 1
  }
  return Object.keys(obj)
}

function parseData (data) {
  let us = {}
  Array.from(data, (d) => {
    if (!us[d.pageId])
      us[d.pageId] = {
        address: {},
        title: d.pageTitle,
        replies: [d.reply],
        content: [d.textContent],
        createdAt: [new Date(d.createdAt).getTime()],
        tags: d.tags,
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
  return us
}

function login () {
  return new Promise((res, rej) => {
    const provider = new Provider({
      // logger: console,
      appId: chrome.runtime.getManifest().config.anywebId,
    })
    provider.on('ready', async () => {
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
          res(address[0])
          // alert(address)
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
          res()
        })
    })
  })
}

class CardTitle extends React.Component {
  render () {
    let { title, text, date, tag } = this.props
    return (
      <Container size={440} px={12}>
        <Title order={3} align='left'>
          {title}
          <Badge color='violet' variant='light' size='xs'>
            {date}
          </Badge>
          <Badge color='gray' variant='light' size='xs'>
            {tag}
          </Badge>
        </Title>
        <Space h='xs' />
        <Title order={6} align='left' weight={100}>
          {text}
        </Title>
      </Container>
    )
  }
}

class UsersRank extends React.Component {
  render () {
    let count = this.props.count,
      userAddressRank = this.props.users,
      date = this.props.date
    return (
      <Container size={440} px={12}>
        <Card shadow='sm' p='lg' radius='md'>
          <Space h='xs' />
          <Card.Section>
            <CardTitle
              title={document.title}
              date={date}
              tag={'共' + count + '条'}
              text='贡献者'
            />
          </Card.Section>
          <Group position='apart' mt='md' mb='xs'>
            {Array.from(userAddressRank, (r, i) => {
              if (i < 3)
                return (
                  <Badge
                    color='gray'
                    size='xs'
                    variant='light'
                    key={r.address + i}
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
        <Space h='xl' />
      </Container>
    )
  }
}

class KnowledgeCard extends React.Component {
  render () {
    let c = this.props.data
    return (
      <Container size={440} px={12} key={c.title + c.createdAt}>
        <Card shadow='sm' p='lg' radius='md'>
          <a
            href={c.url}
            target='_blank'
            style={{ textDecoration: 'none', color: '#1e1e1e' }}
          >
            <Card.Section>
              <CardTitle
                title={c.title}
                date={c.createdAt}
                tag={
                  c.tags && c.tags.length > 0
                    ? Array.from(c.tags, (t, i) => (
                        <Badge key={t.name + i} size='xs' color={t.color}>
                          {t.name}
                        </Badge>
                      ))
                    : ''
                }
                text={c.url}
              />
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
          <Space h='xl' />
          <CopyButton
            value={`/${Array.from(c.tags, (t) => t.name).join(' ')} \n${
              c.content
            } \n${c.replies}\n -${c.title}\n${c.url} `}
          >
            {({ copied, copy }) => (
              <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CopyButton>
        </Card>
      </Container>
    )
  }
}

class Newtab2 extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      address: '',
      urls: {},
      addressIsCheck: false,
      loading: false,
    }

    this.getData = this.getData.bind(this)
    this.login = this.login.bind(this)
    this.init = this.init.bind(this)
    this.parseData = this.parseData.bind(this)
    this.updateCfxAddress = this.updateCfxAddress.bind(this)
  }

  setLoading (loading = true) {
    this.setState({
      loading: loading,
    })
    // 超时
    if (loading)
      setTimeout(() => {
        this.setState({
          loading: false,
        })
      }, 5000)
  }

  getData (e = 'this_week') {
    console.log(e, this.state.loading)

    // 向bg发送消息
    if (this.state.loading) return
    this.setState({
      urls: {},
    })

    this.setLoading(true)

    let that = this
    chrome.runtime.sendMessage(
      {
        cmd: 'new-reply',
        timestamp: e,
        isMy: e === 'my',
        address: that.state.address,
      },
      function (response) {
        // that.setState({ loading: true })
        // console.log('new-reply 收到来自后台的回复：' + response)
      }
    )
  }

  updateCfxAddress (address, addressIsCheck = false, getDataType = 'my') {
    let that = this
    if (!address) addressIsCheck = false
    that.setState({ address, addressIsCheck })
    // console.log(address, addressIsCheck)
    that.setLoading(true)
    chrome.storage.sync.set({
      cfxAddress: { address, addressIsCheck },
    })

    if (addressIsCheck == false) {
      // 检查是否钱包地址有贡献
      chrome.runtime.sendMessage(
        { cmd: 'check-cfx-address', data: address },
        function (response) {
          console.log('check-cfx-address 收到来自后台的回复：', response)
        }
      )
    } else {
      // 有钱包地址才能获取
      that.getData(getDataType)
    }
  }

  login () {
    let that = this
    login().then((res) => {
      if (res) {
        that.updateCfxAddress(res)
      }
    })
  }

  init () {
    let that = this
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      //获取知识库内容 - 结果
      if (request.cmd == 'new-reply') {
        let res = request.data
        that.setState({
          urls: parseData(res),
        })
      } else if (request.cmd == 'check-cfx-address-result') {
        let data = request.data
        console.log(data)
        if (data && data.length > 10) {
          // 贡献了10条以上才能看

          chrome.storage.sync.set({
            cfxAddress: { address: request.address, addressIsCheck: true },
          })
          that.setState({
            urls: parseData(data),
            addressIsCheck: true,
          })
        } else {
          that.setState({ addressIsCheck: false })
          alert('贡献了10条以上才能看')
        }
      }
      that.setLoading(false)
      sendResponse('new-tab-onMessage')
    })

    chrome.storage.sync.get('cfxAddress').then((data) => {
      if (data && data.cfxAddress) {
        that.updateCfxAddress(
          data.cfxAddress.address,
          !!data.cfxAddress.addressIsCheck
        )
      } else {
        alert('请登录anyweb或者填写钱包地址')
      }
    })
  }

  parseData () {
    let cards = [],
      userAddress = {}
    for (const url in this.state.urls) {
      let data = this.state.urls[url]
      if (!data.createdAt) data.createdAt = []
      data.createdAt.sort((a, b) => b - a)

      if (data.replies.join('\n')) {
        cards.push({
          address: Object.keys(data.address),
          content: data.content.join('\n'),
          replies: data.replies.join('\n'),
          title: data.title,
          url: url,
          createdAt: createDay(data.createdAt[0]),
          tags: data.tags,
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
    return { userAddressRank, cards }
  }

  extractData (cards) {
    return Array.from(cards, (c, i) => {
      return `${i + 1}- #${Array.from(c.tags, (t) => t.name).join('#')}\n${
        c.content
      }\n${c.replies}\n${c.title}\n${c.url}\n\n`
    }).join('')
  }

  componentDidMount () {
    this.init()
  }

  render () {
    let that = this
    const { userAddressRank, cards } = that.parseData()
    const date = createDay()

    return (
      <div className='App'>
        <LoadingOverlay visible={this.state.loading} />
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
              value={that.state.address}
              onChange={(event) =>
                that.updateCfxAddress(event.currentTarget.value.trim(), false)
              }
            />

            <Button onClick={that.login}>登陆anyweb</Button>
          </Flex>
        </header>

        <Flex
          bg='#282c34'
          gap='lg'
          justify='flex-start'
          align='center'
          direction='column'
          wrap='wrap'
          style={{
            display: that.state.addressIsCheck ? 'flex' : 'none',
          }}
        >
          <Flex
            bg='#282c34'
            gap='lg'
            justify='flex-start'
            align='center'
            direction='column'
            wrap='wrap'
          >
            <Space h='xl' />
            <Flex
              bg='#282c34'
              gap='lg'
              justify='flex-start'
              align='center'
              direction='row'
              wrap='wrap'
            >
              <Select
                placeholder='all'
                defaultValue='my'
                data={[
                  { value: 'my', label: '我的贡献' },
                  { value: 'this_week', label: '本周' },
                  { value: 'past_week', label: '上一周' },
                  { value: null, label: '所有' },
                ]}
                onChange={(event) => {
                  that.setLoading(false)
                  that.getData(event)
                }}
              />

              <CopyButton value={() => this.extractData(cards)}>
                {({ copied, copy }) => (
                  <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
            </Flex>

            <UsersRank
              count={cards.length}
              users={userAddressRank}
              date={date}
            />
          </Flex>
          <Flex
            bg='#282c34'
            gap='lg'
            justify='flex-start'
            align='flex-start'
            direction='row'
            wrap='wrap'
          >
            <Space h='xl' />
            {Array.from(cards, (c, i) => {
              return <KnowledgeCard data={c} key={c.title + i} />
            })}
            <Space h='xl' />
          </Flex>
        </Flex>
      </div>
    )
  }
}

render(<Newtab2 />, window.document.querySelector('#app-container'))

if (module.hot) module.hot.accept()
