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
    console.log(d)
  })
  return us
}

function login () {
  return new Promise((res, rej) => {
    const provider = new Provider({
      // logger: console,
      appId: '5a125145-87fc-4634-ba4e-c82dcff9cde8',
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
      address: 'cfx:aak6ggzrc7m38e29gew5wvs0ehmhgcu6fy778ce76c',
      urls: {},
      addressIsCheck: false,
      loading: false,
      currentNotionProperties: [],
      currentNotionDatabaseId: '1be3bd9842fb43dbbe2e944870632415',
      currentNotionToken: 'secret_8X2Ryn7H8qsmTQ4c1gEQeP6A6Mw4QZgErwh7SwKKewO',
      notions: {},
      alert: {
        display: false,
        title: '',
        text: '',
      },
      /*
      {
        id:{
          notionDatabaseId,notionToken
        }
      }
      */
    }

    this.getData = this.getData.bind(this)
    this.login = this.login.bind(this)
    this.init = this.init.bind(this)
    this.parseData = this.parseData.bind(this)
    this.updateCfxAddress = this.updateCfxAddress.bind(this)
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

  setAlert (display = false, title, text) {
    this.setState({
      alert: {
        display,
        title,
        text,
      },
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

  updateCfxAddress (address, addressIsCheck = false) {
    let that = this
    if (!address) addressIsCheck = false
    that.setState({ address, addressIsCheck })
    // console.log(address, addressIsCheck)
    chrome.storage.sync.set({
      cfxAddress: { address, addressIsCheck },
    })
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

  updateNotion (currentNotionToken = null, currentNotionDatabaseId = null) {
    // console.log(this.testRef)
    if (currentNotionDatabaseId != undefined && currentNotionDatabaseId != null)
      this.setState({
        currentNotionDatabaseId,
      })
    if (currentNotionToken != undefined && currentNotionToken != null)
      this.setState({
        currentNotionToken,
      })
  }

  addNotionToken (token, databaseId) {
    let that = this
    if (
      databaseId != undefined &&
      databaseId != null &&
      token != undefined &&
      token != null
    ) {
      that.setState({ loading: true })

      // console.log(notions)
      // 发到后台
      chrome.runtime.sendMessage(
        {
          cmd: 'add-notion-token',
          data: {
            token,
            databaseId,
            id: token + databaseId,
          },
        },
        function (response) {
          setTimeout(() => that.setState({ loading: false }), 5000)
          console.log('add-notion-token 收到来自后台的回复：' + response)
        }
      )
    }
  }

  // 选择使用哪个notion库
  selectNotion (id) {
    let that = this
    let n = this.state.notions[id]

    that.setState({
      urls: {},
      addressIsCheck: false,
      currentNotionId: '',
      currentNotionTitle: '',
      currentNotionProperties: [],
      currentNotionMatchKeywords: [],
    })

    if (n) {
      console.log('n.matchKeywords', n.matchKeywords)
      chrome.storage.local
        .set({
          currentNotion: {
            databaseId: n.databaseId,
            token: n.token,
            title: n.title,
            notionId: id,
            matchKeywords: n.matchKeywords,
          },
        })
        .then(() => {
          that.setAlert(
            true,
            '当前notion',
            `${n.title} : ${n.url} \n\n  键值对 ${Array.from(
              Object.values(n.properties),
              (p) => `${p.key} - ${p.type}`
            )}`
          )
          let { properties, keywords } = that.matchToolsKeys(
            Object.values(n.properties)
          )
          // if(n.matchKeywords)
          that.setState({
            currentNotionId: id,
            currentNotionTitle: n.title,
            currentNotionProperties: properties,
            currentNotionMatchKeywords: n.matchKeywords || keywords,
          })
        })
    } else {
      that.setAlert(true, '请添加or选择notion', `-`)
    }
  }

  // 把notion和本插件的key对应起来
  matchToolsKeys (properties) {
    let keywords = {}
    Array.from(
      `网站链接 url
    标题 title
    创建时间 createdAt
    标签 tags
    划选的文字 text
    评论 reply
    钱包地址 cfxAddress
    `
        .split('\n')
        .filter((f) => f.trim()),
      (r) => {
        let rs = r.trim().split(' ')
        let key = rs[1]

        keywords[key] = {
          key,
          name: rs[0],
        }

        let matchKey = properties.filter((f) =>
          f.key.toLowerCase().match(key.toLowerCase())
        )[0]
        // console.log(key, matchKey)
        if (matchKey && matchKey.key)
          keywords[key] = {
            key,
            name: rs[0],
            // 对应的数据库字段
            notionProperties: matchKey,
            // 用来select显示默认值，和匹配选择用
            value: matchKey.key + matchKey.type,
          }
      }
    )
    return {
      keywords: Object.values(keywords),
      properties,
    }
  }

  login () {
    let that = this
    that.loading(true)
    login().then((res) => {
      if (res) {
        that.updateCfxAddress(res)
      }
      that.loading(false)
    })
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
      } else if (request.cmd == 'add-notion-token-result') {
        // console.log(request)
        if (request.success == false) {
          that.setAlert(true, '提示', `失败,请稍后再试 ${request.info}`)
        } else {
          that.setAlert(true, '提示', '添加成功')
        }
      }
      that.setLoading(false)
      sendResponse('new-tab-onMessage')
    })

    chrome.storage.sync.get('cfxAddress').then((data) => {
      if (data && data.cfxAddress) {
        that.updateCfxAddress(data.cfxAddress.address, false)
      } else if (that.state.address) {
        that.updateCfxAddress(that.state.address, false)
      } else {
        that.setAlert(true, '提示', '请登录anyweb或者填写钱包地址')
      }
    })

    chrome.storage.local.get('notions').then((data) => {
      if (data && data.notions) {
        that.setState({
          notions: data.notions,
        })
      }
    })

    chrome.storage.local.onChanged.addListener(() => that.storageChange())
  }

  storageChange (e) {
    // console.log(e)
    let that = this
    chrome.storage.local.get().then((res) => {
      // console.log(that.state)
      if (res.addNotion && res.addNotion.id) {
        const { id } = res.addNotion
        let notions = { ...that.state.notions }

        notions[id] = { ...res.addNotion }

        that.setState({
          notions,
          currentNotionId: '',
          currentNotionTitle: '',
          currentNotionProperties: [],
          currentNotionMatchKeywords: [],
        })

        chrome.storage.local
          .set({
            notions: notions,
          })
          .then(() => {
            chrome.storage.local.set({ addNotion: null })
          })
      }
      that.setLoading(false)
    })
  }

  updateLocalNotions () {
    let that = this
    let currentNotionMatchKeywords = this.state.currentNotionMatchKeywords,
      id = this.state.currentNotionId
    let notions = { ...this.state.notions }
    notions[id] = {
      ...notions[id],
      matchKeywords: currentNotionMatchKeywords,
    }
    // console.log(notions)

    chrome.storage.local
      .set({
        currentNotion: {
          ...notions[id],
        },
        notions,
      })
      .then(() => {
        that.setState({ notions })
        that.setAlert(true, '当前notion', `${JSON.stringify(notions[id])}`)
      })
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
    let notionsList = Array.from(Object.values(this.state.notions), (n) => ({
      value: n.id,
      label: n.title ? n.title : '更新中',
      isSelected: n.isSelected,
    }))
    notionsList.sort((b, a) => a.isSelected - b.isSelected)
    notionsList = Array.from(notionsList, (n) => ({
      value: n.value,
      label: n.label,
    }))
    // console.log(notionsList)

    return (
      <div className='App'>
        <LoadingOverlay visible={this.state.loading} />
        <header className='App-header'>
          <Space h='xl' />
          {that.state.alert.display ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={that.state.alert.title}
              color='indigo'
              withCloseButton
              variant='filled'
              onClose={() => that.setAlert(false)}
            >
              {that.state.alert.text}
            </Alert>
          ) : (
            ''
          )}

          <Space h='xl' />
          {that.state.currentNotionTitle &&
          that.state.currentNotionProperties &&
          that.state.currentNotionProperties.length > 0
            ? [
                Array.from(that.state.currentNotionMatchKeywords, (mKey) => (
                  <MySelect
                    key={mKey.key}
                    label={mKey.name}
                    placeholder={mKey.name + ' ' + mKey.key}
                    defaultValue={mKey.value}
                    data={Array.from(
                      that.state.currentNotionProperties,
                      (p) => ({
                        value: p.key + p.type,
                        label: p.key,
                      })
                    )}
                    onChange={(e) => {
                      console.log('匹配字段', e)
                      // 用来更新匹配 工具里的字段和notion数据库字段
                      let currentNotionMatchKeywords = [
                        ...that.state.currentNotionMatchKeywords,
                      ]

                      if (e) {
                        // 匹配
                        Array.from(
                          that.state.currentNotionProperties,
                          (notionPro) => {
                            if (notionPro.key + notionPro.type == e) {
                              // console.log(notionPro, mKey, that.state.currentNotionMatchKeywords)
                              currentNotionMatchKeywords = Array.from(
                                currentNotionMatchKeywords,
                                (ck) => {
                                  if (
                                    ck.key == mKey.key &&
                                    mKey.name == ck.name
                                  ) {
                                    ck.notionProperties = notionPro
                                    ck.value = notionPro.key + notionPro.type
                                  }
                                  return ck
                                }
                              )
                            }
                          }
                        )
                      } else {
                        // 取消匹配
                        currentNotionMatchKeywords = Array.from(
                          currentNotionMatchKeywords,
                          (ck) => {
                            if (ck.key == mKey.key && mKey.name == ck.name) {
                              delete ck.notionProperties
                              delete ck.value
                            }
                            return ck
                          }
                        )
                      }

                      that.setState({
                        currentNotionMatchKeywords,
                      })
                      // console.log(that.state.currentNotionMatchKeywords)
                    }}
                  ></MySelect>
                )),
                <Button
                  key='update-notion-btn'
                  onClick={() => that.updateLocalNotions()}
                >
                  更新
                </Button>,
              ]
            : ''}
          <Space h='xl' />

          <Flex
            gap='sm'
            justify='flex-end'
            align='center'
            direction='row'
            wrap='wrap'
          >
            <TextInput
              placeholder='Notion数据库地址 1be3bd9842fb43dbbe2e944870632415'
              value={that.state.currentNotionDatabaseId}
              onChange={(event) => {
                console.log(event.currentTarget.value.trim())
                that.updateNotion(null, event.currentTarget.value.trim())
              }}
            />
            <TextInput
              placeholder='Notion机器人token secret_8X2Ryn7H8qsmTQ4c1gEQeP6A6Mw4QZgErwh7SwKKewO'
              value={that.state.currentNotionToken}
              onChange={(event) => {
                that.updateNotion(event.currentTarget.value.trim(), null)
              }}
              // ref={that.testRef}
            />

            <Button
              onClick={() => {
                that.addNotionToken(
                  that.state.currentNotionToken,
                  that.state.currentNotionDatabaseId
                )
              }}
            >
              添加Notion
            </Button>

            <MySelect
              label={`notion知识库数量 ${notionsList.length}`}
              placeholder='all'
              data={notionsList}
              defaultValue={notionsList.length > 0 ? notionsList[0].value : ''}
              onChange={(notionId) => {
                // console.log(notionId)
                that.selectNotion(notionId)
              }}
            ></MySelect>
          </Flex>
          <Space h='xl' />

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

            <Button onClick={() => that.login()}>登陆anyweb</Button>
          </Flex>
          <Space h='xl' />

          <Flex
            gap='sm'
            justify='flex-end'
            align='center'
            direction='row'
            wrap='wrap'
          >
            <Button onClick={() => that.checkAddressIsCanGetKnowledge()}>
              登陆
            </Button>
            {/* <Button onClick={() => that.getData('my')}>获取知识库内容</Button> */}
          </Flex>

          <Space h='xl' />
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
