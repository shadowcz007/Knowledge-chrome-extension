import React from 'react'
import { render } from 'react-dom'
import logo from '../../assets/img/icon-128.png'
import './index.css'

import {
  CopyButton,
  Badge,
  Group,
  FileInput,
  Button,
  Card,
  Title,
  Text,
  Flex,
  Space,
  Container,
  Select,
  LoadingOverlay,
  Timeline,
  Menu,
  Alert,
} from '@mantine/core'

import { IconDatabase, IconMessageDots } from '@tabler/icons'

function getAppInfo () {
  return {
    name: chrome.runtime.getManifest().name,
    description: chrome.runtime
      .getManifest()
      .description.split(',')[0]
      .split('|')[1],
  }
}

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
    if (a) obj[a] = 1
  }
  return Object.keys(obj)
}

function parseData (data) {
  let us = {}
  Array.from(data, (d) => {
    if (!d.url) d.url = '-'
    if (!us[d.url])
      us[d.url] = {
        address: {},
        title: d.title,
        replies: [d.reply],
        content: [d.text],
        createdAt: [new Date(d.createdAt).getTime()],
        tags: d.tags,
        // notion原始字段
        _id: d._id,
        _url: d._url,
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
      <Container size={380} px={12}>
        <Title order={3} align='left'>
          {title}
          <Badge color='violet' variant='light' size='xs'>
            {date}
          </Badge>
          {tag}
        </Title>
        <Space h='xs' />
        <Title
          order={6}
          align='left'
          weight={100}
          style={{
            whiteSpace: 'nowrap',
            /* 文字用省略号代替超出的部分 */
            textOverflow: 'ellipsis',
            /* 匀速溢出内容，隐藏 */
            overflow: 'hidden',
          }}
        >
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
      <Container size={440}>
        <Title order={4}>概览</Title>
        <Space h='xs' />
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
      <Container
        size={380}
        px={12}
        // key={(new Date()).getTime()}
        style={{
          minWidth: '380px',
          padding: '24px',
        }}
      >
        <Card
          shadow='sm'
          p='lg'
          radius='md'
          style={{
            padding: '32px',
          }}
        >
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
                  c.tags && c.tags.length > 0 ? (
                    <Flex
                      wrap={'wrap'}
                      style={{
                        margin: '4px',
                      }}
                    >
                      {Array.from(c.tags, (t, i) => (
                        <Badge
                          key={t.name + i}
                          size='xs'
                          color={t.color}
                          style={{ margin: '4px' }}
                          variant='outline'
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    ''
                  )
                }
                text={c.url || ''}
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
              <Badge size='xs' style={{ marginRight: '12px' }}>
                记录
              </Badge>
              {Array.from(c.replies, (cr, i) => (
                <Text key={i}>
                  {Array.from(cr.split('\n'), (cc, cci) => (
                    <Text key={cc + cci}>{cc}</Text>
                  ))}
                </Text>
              ))}
            </Text>
          ) : (
            ''
          )}
          <Space h='xl' />
          <Flex justify={'space-between'}>
            <Flex>
              <CopyButton
                value={`${Array.from(c.tags, (t) => t.name).join('#')} \n \n${
                  c.replies
                } \n \n -${c.title}\n${c.url} `}
              >
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
              <Button
                leftIcon={<IconDatabase />}
                variant='white'
                color='gray'
                onClick={() => {
                  window.open(c._url)
                }}
                style={{ marginLeft: '12px' }}
              >
                编辑
              </Button>
            </Flex>
            <Button
              variant='white'
              color='gray'
              onClick={() => {
                // this.props.addToWorkflowStep();
                this.props.addToWorkflow(c)
              }}
            >
              添加到工作流
            </Button>
          </Flex>
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
      currentNotion: {},
      notions: {},
      tags: {},
      // notionTitle: '',
      displayLoginBtn: true,
      // 工作流
      workflowShow: false,
      workflow: [],
    }

    this.getData = this.getData.bind(this)
    this.init = this.init.bind(this)
    this.parseData = this.parseData.bind(this)

    this.setAlert = this.setAlert.bind(this)
    this.setLoading = this.setLoading.bind(this)

    this.addToWorkflow = this.addToWorkflow.bind(this)
    this.addToWorkflowStep = this.addToWorkflowStep.bind(this)
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
      getDataEvent: e,
    })

    this.setLoading(true)

    let that = this
    chrome.runtime.sendMessage(
      {
        cmd: 'new-reply',
        timestamp: e,
        isMy: e === 'my',
        address: that.state.address,
        start_cursor: this.state.next_cursor,
        page_size: 100,
      },
      function (response) {
        that.setAlert(true, '正在获取', '请耐心等待')
      }
    )
  }

  // 有个bug，matchKeywords 没有的notion，不能登陆！！需要提示配置
  checkAddressIsCanGetKnowledge () {
    // console.log(this.state)
    const { address, currentNotion } = this.state
    if (!currentNotion.id || currentNotion['matchKeywords'] == undefined) {
      this.setState({
        displayLoginBtn: false,
      })
      return this.setAlert(
        true,
        'Notion数据库',
        '请配置' +
          (currentNotion['matchKeywords'] == undefined ? '字段信息并保存' : ''),
        chrome.runtime.getURL('options.html')
      )
    }

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

  getMetaverseDailyIndex () {
    let that = this
    fetch(
      'https://shadowcz007.github.io/MetaverseDaily/data/index_extract_html.json'
    )
      .then((res) => res.json())
      .then((res) => {
        that.setState({
          extractHtml: Array.from(
            res,
            (r) => 'https://shadowcz007.github.io/MetaverseDaily/' + r
          ),
        })
      })
  }

  init () {
    let that = this
    this.setLoading(false)
    if (this.state.displayLoginBtn) {
      this.getMetaverseDailyIndex()
    }

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      // console.log('@@@request', request)

      //获取知识库内容 - 结果
      if (request.cmd == 'new-reply-result') {
        let res = request.data
        // console.log('new-reply-result', request.info)
        if (request.success) {
          let next_cursor = null
          if (
            request.info &&
            request.info.has_more &&
            request.info.next_cursor
          ) {
            next_cursor = request.info.next_cursor
          }
          that.setState({
            urls: {
              ...that.state.urls,
              ...parseData(res),
            },
            next_cursor,
          })
          that.setAlert(true, '成功', `共 ${res.length}`)
        } else {
          that.setAlert(true, '获取失败', `${JSON.stringify(request.info)}`)
        }
      } else if (request.cmd == 'check-cfx-address-result') {
        // console.log(request)
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
              displayLoginBtn: false,
            })
          } else {
            that.setState({ addressIsCheck: false, displayLoginBtn: false })
            that.setAlert(true, '提示', '贡献了10条以上才能看')
          }
        } else {
          that.setAlert(true, '提示', `${JSON.stringify(request.info)}`)
        }
      } else if (request.cmd == 'find-by-tag-result') {
        // 标签搜索结果
        console.log(request.data)
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
        const { name, description } = getAppInfo()
        that.setAlert(
          true,
          name + ' * ' + description,
          '请完成配置 --> ',
          chrome.runtime.getURL('options.html')
        )
      }
    })

    chrome.storage.local.get(['currentNotion', 'notions', 'tags'], (data) => {
      if (
        data &&
        data.currentNotion &&
        data.notions &&
        data.notions[data.currentNotion.id]
      ) {
        that.setState({
          notions: data.notions,
          currentNotion: data.currentNotion,
          // displayLoginBtn:data.notions&&Object.keys(data.notions).length>0
        })
      } else if (!(data.notions && Object.keys(data.notions).length > 0)) {
        that.setState({
          displayLoginBtn: false,
        })

        // that.setAlert()
        that.setAlert(
          true,
          'Notion数据库',
          '请配置',
          chrome.runtime.getURL('options.html')
        )
      }
      if (data && data.tags) {
        that.setState({ tags: data.tags })
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
        // console.log(data)
        if (!data.createdAt) data.createdAt = []
        data.createdAt.sort((a, b) => b - a)

        if (data.replies.join('\n')) {
          cards.push({
            address: Object.keys(data.address),
            content: data.content.join('\n'),
            replies: Array.from(
              data.replies,
              (reply, i) =>
                `${data.replies.length > 2 ? ' ' + (i + 1) + '- ' : ''}${reply}`
            ),
            title: data.title,
            url: url,
            createdAt: createDay(data.createdAt[0]),
            tags: data.tags,
            // notion原始字段
            _id: data._id,
            _url: data._url,
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
      if (key && key.trim())
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
      return `${i + 1}- #${Array.from(c.tags, (t) => t.name).join('#')}\n \n*${
        c.replies
      }\n\n${c.title}\n${c.url}\n\n`
    }).join('')
  }

  addToWorkflow (data) {
    let workflow = this.state.workflow
    if (!workflow || (workflow && workflow.length <= 0)) {
      // console.log(this.state, this)
      workflow = this.addToWorkflowStep()
    }
    if (workflow && workflow.length > 0) {
      workflow[workflow.length - 1].items.push(data)
      this.setState({ workflow })
    }
    // console.log(data)
  }

  addToWorkflowStep () {
    if (this.state.currentTag) {
      let workflow = this.state.workflow
      workflow.push({
        tag: this.state.currentTag,
        items: [],
      })
      this.setState({
        workflow,
      })
      this.setAlert(false)
      return workflow
    }
  }

  componentDidMount () {
    this.init()
  }

  render () {
    let that = this
    const { userAddressRank, cards } = that.parseData()
    const date = createDay()
    const timelineRef = React.createRef()
    // 分成4组
    let cardsSplitThree = []
    for (let i = 0; i < cards.length; i += cards.length / 3) {
      cardsSplitThree.push(cards.slice(i, i + cards.length / 3))
    }
    console.log('cardsSplitThree', cards, cardsSplitThree)

    return (
      <div className='App'>
        <LoadingOverlay
          visible={this.state.loading}
          style={{
            position: 'fixed',
            top: 0,
          }}
          zIndex={9999999999}
        />
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
              style={{ zIndex: 999999999999999999 }}
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

          {this.state.address && this.state.displayLoginBtn ? (
            <Alert
              style={{ overflow: 'unset' }}
              icon={<img src={logo} className='App-logo' alt='logo' />}
              title={(() => {
                const { name, description } = getAppInfo()
                return name + ' * ' + description
              })()}
              color='indigo'
            >
              <Flex justify='flex-start' align='flex-end'>
                <Select
                  label={'当前Notion'}
                  placeholder={'请配置Notion数据库'}
                  data={(() => {
                    let items = []
                    for (const id in that.state.notions) {
                      items.push({
                        label: that.state.notions[id].title,
                        value: id,
                      })
                    }
                    return items
                  })()}
                  dropdownPosition='bottom'
                  value={that.state.currentNotion.id}
                  onChange={async (newId) => {
                    let cn = that.state.notions[newId]
                    await chrome.storage.local.set({
                      currentNotion: {
                        databaseId: cn.databaseId,
                        id: cn.id,
                        matchKeywords: cn.matchKeywords,
                        title: cn.title,
                        token: cn.token,
                      },
                    })

                    that.setState({ currentNotion: cn })
                  }}
                  allowDeselect={false}
                />

                <Space w='xl' />

                <Button
                  variant='outline'
                  color='dark'
                  // 有个bug，matchKeywords 没有的notion，不能登陆！！需要提示配置
                  onClick={() => that.checkAddressIsCanGetKnowledge()}
                >
                  🚀 登陆
                </Button>
              </Flex>

              <Flex
                justify='flex-end'
                align='flex-start'
                direction='column'
                style={{ marginTop: '24px' }}
              >
                <Text>#快捷功能 Tools</Text>
                <Space h='xs' />
                <Flex wrap={'wrap'}>
                  {Array.from(
                    [
                      {
                        url: 'https://mozilla.github.io/pdf.js/web/viewer.html?file=',
                        name: 'PDF浏览器',
                      },
                      {
                        url: 'https://translate.google.com/',
                        name: '谷歌翻译',
                      },
                      {
                        url: 'https://www.perplexity.ai/',
                        name: 'perplexity搜索引擎',
                      },
                    ],
                    (d) => {
                      return (
                        <Button
                          key={d.url + d.name}
                          variant='outline'
                          color='dark'
                          size='xs'
                          onClick={() =>
                            chrome.tabs.create({
                              url: d.url,
                            })
                          }
                          style={{ margin: '2px' }}
                        >
                          {d.name}
                        </Button>
                      )
                    }
                  )}
                </Flex>
              </Flex>

              <Flex
                justify='flex-end'
                align='flex-start'
                direction='column'
                style={{ marginTop: '24px' }}
              >
                <Text>#趋势 Trending</Text>
                <Space h='xs' />
                <Flex wrap={'wrap'}>
                  {Array.from(
                    [
                      {
                        url: 'https://a16z.com/',
                        name: "It's time to build",
                      },
                      {
                        url: 'https://www.producthunt.com/',
                        name: 'Is the next 🦄 here?',
                      },
                      {
                        url: 'https://paperswithcode.com/',
                        name: 'Research',
                      },
                      {
                        url: 'https://huggingface.co/?trending=space',
                        name: 'Huggingface',
                      },
                      {
                        url: 'https://github.com/trending/python?since=daily',
                        name: 'Github',
                      },
                      {
                        url: 'https://codepen.io/trending',
                        name: 'Codepen',
                      },
                      {
                        url: 'https://news.ycombinator.com/',
                        name: 'Hacker News',
                      },
                      {
                        url: 'https://www.theverge.com/tech',
                        name: 'technology daily',
                      },
                      {
                        url: 'https://www.digitaltrends.com/',
                        name: 'digitaltrends',
                      },
                      {
                        url: 'https://www.buzzfeednews.com/section/tech',
                        name: 'buzzfeednews tech',
                      },
                      {
                        url: 'https://futurism.com/latest',
                        name: 'futurism',
                      },
                      {
                        url: 'https://twitter.com',
                        name: 'twitter',
                      },
                      {
                        url: 'https://www.youtube.com/feed/trending',
                        name: 'youtube',
                      },
                    ],
                    (d) => {
                      return (
                        <Button
                          key={d.url + d.name}
                          variant='outline'
                          color='dark'
                          size='xs'
                          onClick={() =>
                            chrome.tabs.create({
                              url: d.url,
                            })
                          }
                          style={{ margin: '2px' }}
                        >
                          {d.name}
                        </Button>
                      )
                    }
                  )}
                </Flex>
              </Flex>

              <Flex
                justify='flex-end'
                align='flex-start'
                direction='column'
                style={{ marginTop: '24px' }}
              >
                <Text>#MetaverseDaily</Text>
                <Space h='xs' />
                {this.state.extractHtml ? (
                  <Flex wrap={'wrap'}>
                    {Array.from(this.state.extractHtml.reverse(), (h) => {
                      return (
                        <Button
                          key={h}
                          variant='outline'
                          color='dark'
                          size='xs'
                          onClick={() =>
                            chrome.tabs.create({
                              url: h,
                            })
                          }
                          style={{ margin: '2px' }}
                        >
                          {h.replace('_extract.html', '').replace(/.*\//, '')}
                        </Button>
                      )
                    })}
                    <Button
                      variant='outline'
                      color='dark'
                      size='xs'
                      onClick={() =>
                        chrome.tabs.create({
                          url: 'https://github.com/shadowcz007/MetaverseDaily',
                        })
                      }
                      style={{ margin: '2px' }}
                    >
                      仓库地址
                    </Button>
                  </Flex>
                ) : (
                  ''
                )}
              </Flex>
            </Alert>
          ) : (
            ''
          )}

          <Space h='xl' />
        </header>

        <Flex
          bg='#eeeeee'
          gap='lg'
          justify='flex-start'
          align='flex-start'
          direction='column'
          wrap='wrap'
          style={{
            paddingLeft: '44px',
            display: that.state.addressIsCheck ? 'flex' : 'none',
          }}
        >
          <Space h='xl' />
          <Flex
            bg='#eeeeee'
            gap='lg'
            justify='flex-start'
            align='flex-start'
            direction='column'
            wrap='wrap'
          >
            <Flex
              style={{ marginLeft: '14px' }}
              mih={50}
              gap='md'
              justify='flex-end'
              align='flex-start'
              direction='row'
              wrap='nowrap'
            >
              <Title order={2}>知识库</Title>
              <MySelect
                label='选择范围'
                placeholder='all'
                defaultValue='my'
                data={[
                  { value: 'my', label: '我的贡献' },
                  { value: 'this_week', label: '本周' },
                  { value: 'past_week', label: '上一周' },
                  { value: null, label: '所有' },
                ]}
                onChange={(event) => {
                  this.setLoading(false)
                  this.setState({ urls: {} })
                  this.getData(event)
                }}
              />
            </Flex>
            <Space h='xl' />
            <UsersRank
              count={cards.length}
              users={userAddressRank}
              date={date}
              title={this.state.currentNotion.title || ' - '}
            />
          </Flex>

          <Flex
            gap='lg'
            justify='flex-start'
            align='flex-start'
            direction='column'
            wrap='nowrap'
          >
            <Title
              order={4}
              style={{
                marginLeft: '14px',
              }}
            >
              标签集
            </Title>

            <Select
              style={{
                marginLeft: '14px',
              }}
              // label='标签'
              data={(() => {
                let ts = []
                let tags = Object.keys(this.state.tags)

                for (const tag of tags) {
                  if (
                    this.state.tags[tag] &&
                    this.state.tags[tag]._currentNotion &&
                    this.state.currentNotion &&
                    this.state.tags[tag]._currentNotion.id ==
                      this.state.currentNotion.id
                  ) {
                    ts.push({
                      // name: tag.trim(),
                      value: tag.trim(),
                      label: tag.trim(),
                      // _currentNotion: this.state.tags[tag]._currentNotion,
                    })
                  }
                }
                return ts
              })()}
              // defaultValue={Array.from(this.state.tags, (t) => t.value)}
              searchable
              onChange={(newTags) => {
                console.log(newTags)
                if (newTags) {
                  // console.log(t.name)
                  this.setLoading(true)
                  this.setState({ urls: {}, currentTag: newTags })
                  chrome.runtime.sendMessage({
                    cmd: 'find-by-tag',
                    data: newTags,
                    pageSize: 30,
                  })
                } else {
                  this.setState({ currentTag: null })
                }
              }}
            />

            <Button
              style={{
                marginLeft: '14px',
              }}
              color='teal'
              onClick={() => {
                this.addToWorkflowStep()
              }}
            >
              添加到工作流
            </Button>

            <Button
              style={{
                marginLeft: '14px',
              }}
              color='teal'
              onClick={() => {
                if (this.state.currentTag) {
                  chrome.tabs.create({
                    url: `https://bing.com/search?q=${this.state.currentTag} use case`,
                  })
                }
              }}
            >
              搜索更多用例
            </Button>

            {/* <Group style={{ marginLeft: '24px' }}>
              {(() => {
                let ts = []
                let tags = Object.keys(this.state.tags)

                for (const tag of tags) {
                  if (
                    this.state.tags[tag] &&
                    this.state.tags[tag]._currentNotion &&
                    this.state.currentNotion &&
                    this.state.tags[tag]._currentNotion.id ==
                      this.state.currentNotion.id
                  ) {
                    ts.push({
                      name: tag.trim(),
                      _currentNotion: this.state.tags[tag]._currentNotion,
                    })
                  }
                }
                return Array.from(ts, (t, i) => {
                  return (
                    <Badge
                      style={{ userSelect: 'none', cursor: 'pointer' }}
                      variant='outline'
                      sx={{ paddingRight: 8, paddingLeft: 8 }}
                      // rightSection={removeButton}
                      onClick={() => {
                        // console.log(t.name)
                        that.setLoading(true)
                        that.setState({ urls: {} })
                        chrome.runtime.sendMessage({
                          cmd: 'find-by-tag',
                          data: t.name,
                          pageSize: 30,
                        })
                      }}
                      key={i}
                    >
                      {t.name}
                    </Badge>
                  )
                })
              })()}
            </Group> */}
          </Flex>
          <Flex
            gap='lg'
            justify='flex-end'
            align='flex-end'
            direction='row'
            wrap='nowrap'
          >
            <Title
              order={4}
              style={{
                marginLeft: '14px',
              }}
            >
              知识卡片 {cards.length}
            </Title>

            <CopyButton value={that.extractData(cards)}>
              {({ copied, copy }) => (
                <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                  {copied ? '已复制到剪切板' : '拷贝全部'}
                </Button>
              )}
            </CopyButton>

            {this.state.next_cursor ? (
              <Button
                color='teal'
                onClick={() => {
                  //  this.state.next_cursor
                  this.getData(this.state.getDataEvent)
                }}
              >
                加载更多
              </Button>
            ) : (
              ''
            )}
          </Flex>

          <Flex
            // bg='#eeeeee'
            gap='lg'
            justify='center'
            align='flex-start'
            direction='row'
            wrap='nowrap'
          >
            {Array.from(cardsSplitThree, (cards, i) => (
              <Flex
                gap='lg'
                justify='flex-start'
                align='flex-start'
                direction='column'
                wrap='nowrap'
                key={i}
              >
                {Array.from(cards, (c, j) => {
                  return (
                    <KnowledgeCard
                      data={c}
                      key={i + '_' + j}
                      addToWorkflow={this.addToWorkflow}
                      // addToWorkflowStep={this.addToWorkflowStep}
                    />
                  )
                })}
              </Flex>
            ))}
          </Flex>
          <Space h='xl' />
        </Flex>

        {this.state.workflow && this.state.workflow.length > 0 ? (
          <div
            style={{
              maxWidth: 320,
              margin: 'auto',
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 999999999,
              backgroundColor: '#edf2ff',
              padding: '56px',
            }}
          >
            <CopyButton
              value={(async () => {
                return new Promise((res, rej) => {
                  // this.state.workflow
                  setTimeout(() => {
                    if (timelineRef.current) res(timelineRef.current.innerHTML)
                  }, 1000)
                })
                // console.log(timelineRef)
              })()}
            >
              {({ copied, copy }) => (
                <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                  {copied ? '已复制到剪切板' : '拷贝全部'}
                </Button>
              )}
            </CopyButton>

            <Timeline color='red' active={0} lineWidth={4} ref={timelineRef}>
              {Array.from(this.state.workflow, (wf, i) => (
                <Timeline.Item
                  title={wf.tag}
                  bulletSize={24}
                  lineVariant={i > 1 ? 'dashed' : 'solid'}
                  // bullet={i>1?<IconMessageDots size={12} />:''}
                  key={i}
                >
                  {Array.from(wf.items, (d, _i) => {
                    return (
                      <CardTitle
                        title={d.title}
                        tag={
                          d.tags && d.tags.length > 0 ? (
                            <Flex
                              wrap={'wrap'}
                              style={{
                                margin: '4px',
                              }}
                            >
                              {Array.from(d.tags, (t, i) => (
                                <Badge
                                  key={t.name + i}
                                  size='xs'
                                  color={t.color}
                                  style={{ margin: '4px' }}
                                  variant='outline'
                                >
                                  {t.name}
                                </Badge>
                              ))}
                            </Flex>
                          ) : (
                            ''
                          )
                        }
                        text={d.url || ''}
                        key={_i}
                      />
                    )
                  })}
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

render(<Newtab2 />, window.document.querySelector('#app-container'))

if (module.hot) module.hot.accept()
