import React from 'react';
import './Options.css';

import { ActionIcon, Badge, Group,TextInput,Button } from '@mantine/core';
import { IconX } from '@tabler/icons';


interface Props {
  title: string;
}


// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// if (request.cmd == 'get-all-tags-result') {
//   console.log(request.data)
// }
// sendResponse('我收到了你的消息！')
// })

const Options: React.FC<Props> = ({ title }: Props) => {
  const [texts, setTexts] = React.useState([''])
  const [value, setValue] = React.useState('');

  const getTags=()=>{
    let gettingItem = chrome.storage.local.get('tags')
    gettingItem.then(onGot, onError)
    function onGot (e: any) {
      if(e.tags) setTexts(e.tags)
      
    }
    function onError (e: any) {
      console.log(e)
    }
  }
  

  const updateText=(t: string)=>{
    let textsNew=Array.from(texts,te=>te.trim()).filter(f=>f);
    textsNew.push(t.trim());
    
    // console.log(t.target.value)
    setTexts(textsNew);
    chrome.storage.local.set({
      tags:textsNew
    });
  }

 
  const removeButton = (
    <ActionIcon size="xs" color="blue" radius="xl" variant="transparent" onClick={(event) => {
      event.preventDefault();
      if(event.currentTarget.parentElement) {
        let id=event.currentTarget.parentElement.parentElement?.getAttribute('data-id');
        let nts=Array.from(Array.from(texts,t=>t.trim()).filter(f=>f),(t,i)=>{
          if(`${t}_${i}`!=id) return t
        }).filter(f=>f);
        setTexts(nts as [string]);
        // console.log(nts)
        chrome.storage.local.set({
          tags:nts
        });
      }
    }}>
      <IconX size={10} />
    </ActionIcon>
  );

  getTags()

  return <div>
    <div className="OptionsContainer">{title} Page</div>
    
    <Group>
    <TextInput
      placeholder="例如：人工智能"
      label="关键词"
      withAsterisk
      value={value} onChange={(event) => {
        // console.log(event)
        setValue(event.currentTarget.value);
      }}
    />
    <Button onClick={(event) => {
      event.preventDefault();
      updateText(value.trim());
    }}>ADD</Button>
      
      <Button onClick={(event) => {
      event.preventDefault();
      getTags();
    }}>UPDATE</Button>

    </Group>

    
    <Group>{Array.from(Array.from(texts,t=>t.trim()).filter(f=>f),(t,i)=>{
    
      return <Badge variant="outline" sx={{ paddingRight: 3 }} rightSection={removeButton} key={i} data-id={`${t}_${i}`}>
      {t}
    </Badge>
    })}
    </Group>

  </div>;
};

export default Options;
