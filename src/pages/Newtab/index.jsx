import React from 'react'
import { render } from 'react-dom'
import logo from '../../assets/img/icon-128.png'
import './index.css'

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
  Alert,
} from '@mantine/core'

import { IconAlertCircle } from '@tabler/icons'

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
    if (!us[d.url])
      us[d.url] = {
        address: {},
        title: d.title,
        replies: [d.reply],
        content: [d.text],
        createdAt: [new Date(d.createdAt).getTime()],
        tags: d.tags,
      }
    us[d.url].address[d.cfxAddress] = 1
    us[d.url].replies = unqueArray([...us[d.url].replies, d.reply])
    us[d.url].content = unqueArray([...us[d.url].content, d.text])
    if (!us[d.url].createdAt) us[d.url].createdAt = []
    us[d.url].createdAt = [
      ...us[d.url].createdAt,
      new Date(d.createdAt).getTime(),
    ]
    // console.log(d)
  })
  return us
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
      date = this.props.date,
      title = this.props.title
    return (
      <Container size={440} px={12}>
        <Card shadow='sm' p='lg' radius='md'>
          <Space h='xs' />
          <Card.Section>
            <CardTitle
              title={title}
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

class MySelect extends React.Component {
  render () {
    let { data, label, placeholder, defaultValue, onChange } = this.props
    // [{value,label}]
    return (
      <Select
        label={label}
        placeholder={placeholder}
        data={data}
        defaultValue={defaultValue}
        onChange={onChange}
        allowDeselect={true}
      />
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
      urls: {},
      loading: false,
      alert: {
        display: false,
        title: '',
        text: '',
      },
      notionTitle: '',
    }

    this.getData = this.getData.bind(this)
    this.init = this.init.bind(this)
    this.parseData = this.parseData.bind(this)

    this.setAlert = this.setAlert.bind(this)
    this.setLoading = this.setLoading.bind(this)
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

  setAlert (display = false, title, text, url = null) {
    let obj = {
      display,
      title,
      text,
    }
    if (url) obj.url = url
    this.setState({
      alert: obj,
    })
  }

  getData (e = 'this_week') {
    // console.log(e, this.state.loading)

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
        that.setAlert(true, '正在获取', '请耐心等待')
      }
    )
  }

  checkAddressIsCanGetKnowledge () {
    // console.log(this.state)
    const { address } = this.state
    this.setState({ urls: {} })
    this.setLoading(true)
    // 检查是否钱包地址有贡献
    chrome.runtime.sendMessage(
      { cmd: 'check-cfx-address', data: address },
      function (response) {
        console.log('check-cfx-address 收到来自后台的回复：', response)
      }
    )
  }

  init () {
    let that = this
    this.setLoading(false)
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      // console.log('@@@request', request)

      //获取知识库内容 - 结果
      if (request.cmd == 'new-reply-result') {
        let res = request.data
        console.log('new-reply-result', res)
        if (request.success) {
          that.setState({
            urls: parseData(res),
          })
          that.setAlert(true, '成功', `共 ${res.length}`)
        } else {
          that.setAlert(true, '获取失败', `${JSON.stringify(request.info)}`)
        }
      } else if (request.cmd == 'check-cfx-address-result') {
        if (request.success) {
          let data = request.data

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
            that.setAlert(true, '提示', '贡献了10条以上才能看')
          }
        } else {
          that.setAlert(true, '提示', `${JSON.stringify(request.info)}`)
        }
      }
      that.setLoading(false)
      sendResponse('new-tab-onMessage')
    })

    chrome.storage.sync.get('cfxAddress').then((data) => {
      if (data && data.cfxAddress) {
        that.setState({
          address: data.cfxAddress.address,
          addressIsCheck: data.cfxAddress.address.addressIsCheck,
        })
      } else {
        that.setAlert(
          true,
          chrome.runtime.getManifest().name +
            ' * ' +
            chrome.runtime
              .getManifest()
              .description.split(',')[0]
              .split('|')[1],
          '请完成配置 --> ',
          chrome.runtime.getURL('options.html')
        )
      }
    })

    chrome.storage.local.get('currentNotion').then((sData) => {
      if (sData && sData.currentNotion) {
        if (
          sData.currentNotion.title &&
          sData.currentNotion.title !== that.state.notionTitle
        )
          that.setState({ notionTitle: sData.currentNotion.title })
      }
    })
    // chrome.storage.local.onChanged.addListener(() => that.storageChange())
  }

  parseData () {
    let cards = [],
      userAddress = {}

    // console.log(this.state.urls)

    for (const url in this.state.urls) {
      if (url && this.state.urls[url]) {
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
    // console.log(cards)
    return Array.from(cards || [], (c, i) => {
      return `${i + 1}- #${Array.from(c.tags, (t) => t.name).join('#')}\n${
        c.content
      }\n\n*${c.replies}\n\n${c.title}\n${c.url}\n\n`
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
          <Space h='xl' />
          {that.state.alert.display ? (
            <Alert
              icon={<img src={logo} className='App-logo' alt='logo' />}
              title={that.state.alert.title}
              color='indigo'
              withCloseButton
              // variant='filled'
              onClose={() => that.setAlert(false)}
            >
              <Flex justify='flex-start' align='center'>
                <Text>{that.state.alert.text}</Text>
                <Space w='xl' />
                {that.state.alert.url ? (
                  <Button
                    variant='outline'
                    color='dark'
                    onClick={() =>
                      chrome.tabs.create({
                        url: that.state.alert.url,
                      })
                    }
                  >
                    配置
                  </Button>
                ) : (
                  ''
                )}
              </Flex>
            </Alert>
          ) : (
            ''
          )}

          {this.state.address ? (
            <Flex
              gap='sm'
              justify='center'
              align='center'
              direction='row'
              wrap='wrap'
            >
              <Text fz='xs'>当前Notion: {that.state.notionTitle}</Text>
              <Button onClick={() => that.checkAddressIsCanGetKnowledge()}>
                登陆
              </Button>
            </Flex>
          ) : (
            ''
          )}

          <Space h='xl' />
        </header>

        <Flex
          bg='#eeeeee'
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
            bg='#eeeeee'
            gap='lg'
            justify='flex-start'
            align='center'
            direction='column'
            wrap='wrap'
          >
            <Space h='xl' />
            <Flex
              bg='#eeeeee'
              gap='lg'
              justify='flex-start'
              align='center'
              direction='row'
              wrap='wrap'
            >
              <MySelect
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
              ></MySelect>

              <CopyButton value={that.extractData(cards)}>
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
              title={this.state.currentNotionTitle || ' - '}
            />
          </Flex>
          <Flex
            bg='#eeeeee'
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
