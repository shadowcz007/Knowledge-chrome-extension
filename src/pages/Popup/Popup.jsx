import React from 'react'
import logo from '../../assets/img/logo.svg'
import './Popup.css'

import { Button } from '@mantine/core'

const Popup = () => {
  const name = chrome.runtime.getManifest().name.trim()
  const [description, url] = chrome.runtime
    .getManifest()
    .description.trim()
    .split(',')
  const descriptions = description.split('|')

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>{descriptions[0]}</p>
        <p>{descriptions[1]}</p>
        <a className='App-link' href={url} target='_blank'>
          {name}
        </a>

        <Button
          onClick={(event) => {
            event.preventDefault()
            chrome.runtime.sendMessage(
              {
                cmd: 'open-option-page',
              },
              function (response) {
                // _console('收到来自后台的回复：' + response)
              }
            )
          }}
        >
          打开配置页面
        </Button>
      </header>
    </div>
  )
}

export default Popup
