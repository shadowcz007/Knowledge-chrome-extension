import React from 'react'
import logo from '../../assets/img/icon-128.png'
import './Popup.css'

import { Button, Text, Space, Flex, Switch } from '@mantine/core'

import { Md5 } from 'ts-md5'

const getId = (t) => {
  return Md5.hashStr(t)
}

// var bg = chrome.extension.getBackgroundPage();
// bg.test();//test()是background中的一个方法

// content_scripts向popup主动发消息的前提是popup必须打开！否则需要利用background作中转
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const { cmd } = request

  //  console.log(cmd)
  sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request))
})

const Popup = () => {
  const [notionTitle, setNotionTitle] = React.useState('')
  const [funs, setFuns] = React.useState({
    'page-set-contenteditable': {
      label: '编辑全文',
      value: false,
    },
  })
  const name = chrome.runtime.getManifest().name.trim()
  const [description, url] = chrome.runtime
    .getManifest()
    .description.trim()
    .split(',')
  const descriptions = description.split('|')

  chrome.storage.local.get('currentNotion', (sData) => {
    // console.log('run',sData)
    if (sData && sData.currentNotion) {
      if (
        sData.currentNotion.title &&
        sData.currentNotion.title !== notionTitle
      )
        setNotionTitle(sData.currentNotion.title)
    }
    // if(sData&&sData.pageSet){
    //   if(getId(JSON.stringify(sData.pageSet))!=getId(JSON.stringify(funs))) setFuns(sData.pageSet)
    // }
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

                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  function (tabs) {
                    chrome.tabs.sendMessage(
                      tabs[0].id,
                      { cmd: 'display-translate-pannel' },
                      function (response) {
                        console.log(response)
                      }
                    )
                  }
                )
              }}
            >
              打开采集助手
            </Button>
            <Space h='xl' />
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
          </Flex>{' '}
          <Space h='xl' />
          {/*<Switch.Group
             
              defaultValue={(()=>{
                let items=[];
                for (const key in funs) {
                   if(funs[key].value===true) items.push(key)
                }
                console.log(items)
                return items
              })()}
              label="功能开关"
              description="#$%^"
              offset="sm"
              onChange={items=>{
                let newFuns={...funs};

                for (const key in newFuns) {
                  newFuns[key].value=false;
                }

                if(items.length>0){

                  for (const item of items) {
                    newFuns[item].value=true;
                  }
                } 

                chrome.storage.local.set({
                  pageSet:newFuns
                }).then(()=>setFuns(newFuns))
                

                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                      cmd: 'page-set',
                      data:newFuns
                    },
                    function (response) {
                      // console.log(response)
                    }
                  )
                })


              }}
            >
              {Array.from(Object.keys(funs),(key,i)=>{
                return <Switch key={i} value={key} label={funs[key].label} />
              })}
            </Switch.Group> */}
        </>
      </header>
    </div>
  )
}

export default Popup
