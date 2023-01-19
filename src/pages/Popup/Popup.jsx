import React from 'react'
import logo from '../../assets/img/icon-128.png'
import './Popup.css'

import { Button, Text, Space, Flex } from '@mantine/core'

const Popup = () => {
  const [notionTitle, setNotionTitle] = React.useState('')
  const name = chrome.runtime.getManifest().name.trim()
  const [description, url] = chrome.runtime
    .getManifest()
    .description.trim()
    .split(',')
  const descriptions = description.split('|')

  chrome.storage.local.get('currentNotion').then((sData) => {
    if (sData && sData.currentNotion) {
      if (
        sData.currentNotion.title &&
        sData.currentNotion.title !== notionTitle
      )
        setNotionTitle(sData.currentNotion.title)
    }
  })
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <a className='App-link' href={url} target='_blank'>
          {name}
        </a>
        <p>{descriptions[0]}</p>
        <p>{descriptions[1]}</p>
        <>
          <Space h='xl' />
          <Text fz='xs'>当前Notion: {notionTitle}</Text>
          <Space h='xl' />
          <Flex
            justify='flex-end'
            align='center'
            direction='column'
            wrap='wrap'
          >
            <Button
              onClick={(event) => {
                event.preventDefault()
                chrome.tabs.create({
                  url: chrome.runtime.getURL('newtab.html'),
                })
              }}
            >
              打开知识库
            </Button>
            <Space h='xl' />
            <Button
              onClick={(event) => {
                event.preventDefault()
                chrome.tabs.create({
                  url: chrome.runtime.getURL('options.html'),
                })
              }}
            >
              打开配置页面
            </Button>
            <Space h='xl' />
            <Button
              variant='outline'
              color='gray'
              compact
              onClick={(event) => {
                event.preventDefault()
                chrome.tabs.create({ url: 'https://www.baidu.com' })
              }}
            >
              问题反馈
            </Button>
          </Flex>
        </>
      </header>
    </div>
  )
}

export default Popup
