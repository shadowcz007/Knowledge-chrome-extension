import React from 'react';
import './Options.css';

import { ActionIcon, Badge, Group,TextInput,Button } from '@mantine/core';
import { IconX } from '@tabler/icons';


interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  const [texts, setTexts] = React.useState([''])
  const [value, setValue] = React.useState('');

  let gettingItem = chrome.storage.local.get()
    gettingItem.then(onGot, onError)
    function onGot (e: any) {
      // console.log(e)
      setTexts(e.data)
      
    }
    function onError (e: any) {
      console.log(e)
    }

  const updateText=(t: string)=>{
    let textsNew=Array.from(texts,te=>te.trim()).filter(f=>f);
    textsNew.push(t.trim());
    // console.log(t.target.value)
    setTexts(textsNew);
    chrome.storage.local.set({
      data:textsNew
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
          data:nts
        });
      }
    }}>
      <IconX size={10} />
    </ActionIcon>
  );

 

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
