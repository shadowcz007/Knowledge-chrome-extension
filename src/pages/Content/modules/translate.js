import React from 'react'

import {
  Text,
  Flex,
  Button,
  Space,
  Group,
  Textarea,CopyButton,Indicator,Paper
} from '@mantine/core'
 
class MyGoogleTranslate extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        disabled:true,
        title:props.title,
        pages:props.pages||[],
        currentPage:null,
        saveSuccess:false,
        display:'none'
      }
      // this.init()
    }
    init(){
      let that=this;
      this.getPages().then(pages=>{
        if(pages.length>0){
          that.setState({
            saveSuccess:false,
            pages,disabled:false
          })
        }
      })
    }
    async getPages(){
      let pages=[];
      let data=await chrome.storage.local.get('pdfAllPages');
      if(data&&data.pdfAllPages){
          pages=data.pdfAllPages;
          pages=Array.from(pages,ps=>{
          return Array.from(ps,p=>{
                      return {
                        en:p,
                        zh:''
                      }
                    })
                  });
          console.log(pages)
      }
      return pages
    }
    render () {
      let that = this;
      return (<Flex direction='column' style={{minWidth:'280px'}}>
        <Button styles={{display:!that.state.disabled?'block':'none'}}
        variant="light" color="teal" radius="xl" size="md" uppercase onClick={()=>that.setState({display:'flex'})}>
          翻译助手
        </Button>
  
        <Paper shadow="md" radius="md" p="md" style={{width:'100%',display:that.state.display}}>
        
        <Flex justify='flex-start' align='flex-start' 
        direction='column'
        style={{width:'100%',overflowY:'scroll',height: 'calc(90vh - 132px)'}}>
  
        <Button.Group>
          <Indicator color="cyan" position="bottom-end"
          label={that.state.pages.length} showZero={false} dot={false} overflowCount={999} inline size={22}>
            <Button variant="outline" color="cyan" uppercase
            onClick={async()=>{
              let pages=await that.getPages();
              that.setState({pages,saveSuccess:false})
              }}>读取记录</Button>
            </Indicator>
  
            <Button variant="outline" color="cyan" uppercase
            onClick={async()=>{
              let data=await chrome.storage.local.get('pdfAllPages');
              if(data&&data.pdfAllPages){
                let pages=[...that.state.pages];
                pages=Array.from(pages,ps=>{
                 return Array.from(ps,p=>{
                    return p.en+'\n\n'+p.zh
                  })
                })
                if(data.pdfAllPages.length==pages.length) await chrome.storage.local.set({pdfAllPages:pages});
                
              }
              that.setState({saveSuccess:true});
  
              }}>保存{that.state.saveSuccess?'*':''}</Button>
          </Button.Group>
            <Space h='xl' />
          {
            Array.from(that.state.pages,(texts,i)=> texts.length>0?<Flex 
            direction='column'
            justify='flex-start'
            align='flex-start'
            key={i}
            style={{width:'100%',marginTop:'12px'}}
            >
                <Text fw={700}>P{i+1}</Text>
                <Space h={'xs'} />
                {
                  Array.from(texts,(t,k)=><Flex 
                  direction='column'
                  key={i+'_'+k}
                  style={{width:'100%'}}
                  >
                    <Textarea  label="原文" autosize variant="filled" value={t.en} onChange={(event)=>{
                        let val = event.currentTarget.value.trim();
                        let pages=[...that.state.pages];
                            pages[i][k].en=val;
                            that.setState({
                              currentPage:[i,k],
                              pages
                            })
                    }}/>
                    <Textarea  label="结果" autosize variant="filled" value={t.zh} onChange={(event)=>{
                        let val = event.currentTarget.value.trim();
                        let pages=[...that.state.pages];
                            pages[i][k].zh=val;
                            that.setState({
                              currentPage:[i,k],
                              pages
                            })
                    }}/>
                    <Space h={'xs'} />
                    <Group spacing="sm">
                      <Button variant="light" color="cyan" compact onClick={()=>{
                        let input=document.body.querySelector(`textarea[aria-label="原文"]`);
                        input.value=t.en;
                        input.click()
                        document.execCommand('insertText', false,' ');
                        setTimeout(()=>{
                          let copyBtn=document.body.querySelector(`button[aria-label="复制译文"]`);
                          copyBtn.click();
                          setTimeout(()=>navigator.clipboard.readText().then(text => {
                            console.log(text)
                            let pages=[...that.state.pages];
                            pages[i][k].zh=text;
                            that.setState({
                              currentPage:[i,k],
                              pages
                            })
                          }),500)
                         
                        },1000);
                      }}>翻译
                      </Button>
                      <CopyButton value={t.en+'\n'+t.zh}>
                            {({ copied, copy }) => (
                              <Button variant="light" color={copied ? 'dark' : 'cyan'} compact onClick={copy}>
                                {copied ? '已复制到剪切板' : '拷贝'}
                              </Button>
                            )}
                          </CopyButton>
                    </Group>
                    <Space h={'lg'} />
                    </Flex>)
                }
  
              </Flex>:'' )
          }
          
        </Flex>
        </Paper>
  
      </Flex>
         )
    }
  }


  export { MyGoogleTranslate };