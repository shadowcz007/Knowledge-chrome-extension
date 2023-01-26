import React from 'react'

import {
  Text,
  Flex,
  Button,
  Space,
  Group,
  Textarea,CopyButton,Indicator,Paper,Select ,Stepper, Title 
} from '@mantine/core'

import { addStyle } from './myStyle'
 
class MyGoogleTranslate extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        disabled:true,
        title:props.title,
        pages:props.pages||[],
        currentPage:null,
        saveSuccess:false,
        display:'none',
        type:window.location.pathname=='/pdf.js/web/viewer.html'?'pdf':'web',
        webStepActive:0
      }
      this.init()
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
      });
 
    }

   async newPages(_t){
      let type=_t||this.state.type;
      let pages=[];
      let key={
        pdf:'pdfAllPages',
        web:'translateResult'
      }
      let data={}
      data[key[type]]=pages;
      await chrome.storage.local.set(data);
      this.setState({
        saveSuccess:false,
        pages,disabled:false,webStepActive:0
      })
      return pages
    }

    async getPages(_t){
      let type=_t||this.state.type;
      let pages=[];
      let key={
        pdf:'pdfAllPages',
        web:'translateResult'
      }
      let data=await chrome.storage.local.get(key[type]);
      if(data&&data[key[type]]){
        pages=data[key[type]];
      }
      return pages
    }
    async savePages(){
      let type=this.state.type;
      let key={
        pdf:'pdfAllPages',
        web:'translateResult'
      }
      let pages=[];
      let data=await chrome.storage.local.get(key[type]);
      if(data&&data[key[type]]){
        pages=[...this.state.pages];
        if(data[key[type]].length==pages.length) await chrome.storage.local.set({[key[type]]:pages});
      }
      this.setState({saveSuccess:true});
      return pages
    }

    // for web
    checkTranslateDone(){
      let link=Array.from(document.querySelectorAll('link[href]'),link=>link.href)
      .filter(f=>f.match('translate.googleapis.com/translate_static/css/translateelement.css'))
      
      if(link.length>0){
          this.setState({
            webStepActive:2
          });
          return true
      };

    }
    
  // for web 保留原文
  createHoverText(){
    let that=this;
    that.checkTranslateDone()

    addStyle(`
    .knowlege-translate-hovertext:hover {
      background: #2196f326;
      cursor: pointer;
      box-shadow: 0 0 8px #2196f38c;
    }
  
    .knowlege-translate-hovertext{
      /*border-left: 0.5px dashed #9e9e9e;*/
      background: #2196f326;
    }
    `,'knowlege-translate-hovertext-css')

    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode (node) {
          return NodeFilter.FILTER_ACCEPT
        },
      }
    )
    // const nodeList = []
    let currentNode = treeWalker.currentNode
    while (currentNode) {
  
        let textElement=currentNode.parentElement;
        // 排除插件的ui 和功能性html
        if(textElement.nodeName=='P') console.log(textElement,textElement&&textElement.className&&typeof(textElement.className)=='string'&&!textElement.className.match("mantine-")
        &&!['BUTTON','A','BODY','HTML','FOOTER','SCRIPT','STYLE','HEADER','NAV','SECTION'].includes(textElement.nodeName))

       if(textElement&&typeof(textElement.className)=='string'&&!textElement.className.match("mantine-")
        &&!['BUTTON','A','BODY','HTML','FOOTER','SCRIPT','STYLE','HEADER','NAV','SECTION'].includes(textElement.nodeName)){
          
            textElement.setAttribute('data-hover-text',textElement.innerText.trim())
          
            console.log(textElement)
            if(Array.from(textElement.childNodes,c=>(c.nodeName=='#text')&&c.textContent.trim()).filter(f=>f).length&&
            !textElement.classList.contains('knowlege-translate-hovertext')&&
            textElement.parentElement&&
            !textElement.parentElement.classList.contains('knowlege-translate-hovertext')
            ) {
              textElement.classList.add('knowlege-translate-hovertext')
              // textElement.addEventListener('click',e=>{
              //   let zh=textElement.innerText,en=textElement.getAttribute('data-hover-text');
              //   console.log('翻译结果',[en,zh])
              // })
            }
             
       }
      // nodeList.push(currentNode)
      currentNode = treeWalker.nextNode()
  
    }
  
  }

    // for web
    async createTranslatePagesData(){
      let data=Array.from(document.body.querySelectorAll('.knowlege-translate-hovertext'),d=>{
          let res={zh:d.innerText.trim(),en:d.getAttribute('data-hover-text').trim()}
        if(res.zh&&res.en&&res.zh!=res.en) return res
      }).filter(f=>f);
    
      await chrome.storage.local.set({
        translateResult:[
          [...data]
        ]
      });
      return [
        [...data]
      ]
    }

    render () {
      let that = this;
      return (
      <Flex direction='column' style={{minWidth:'280px'}}>
        
        <Title>
          翻译整理助手
        </Title>
  
        <Paper shadow="md" radius="md" p="md" style={{width:'100%'}}>
        
        <Flex 
        justify='flex-start' 
        align='flex-start' 
        direction='column'
        style={{width:'100%',overflowY:'scroll',height: 'calc(90vh - 132px)'}}>

      <Stepper 
        active={that.state.webStepActive} 
        color="teal" size="sm"
        breakpoint="sm" 
        >
        <Stepper.Step label="First step" description="保留英文" >
          Step 1 保留英文
        </Stepper.Step>
        <Stepper.Step label="Second step" description="右键->翻成中文">
          {'Step 2 右键->翻成中文'}
        </Stepper.Step>
        <Stepper.Completed>
          完成
        </Stepper.Completed>
      </Stepper>

      {that.state.webStepActive!=2?<Button variant="outline" color="cyan" uppercase
              onClick={async ()=>{

                let webStepActive=that.state.webStepActive;
                if(webStepActive==2)return
                let next=false;
                if(webStepActive==0){
                  that.createHoverText()
                  next=true;
                }else if(webStepActive==1){
                  next=that.checkTranslateDone();
                  if(next){
                    let pages=await that.createTranslatePagesData()
                    that.setState({pages,saveSuccess:false,type:'web'})
                  }
                }

                if(next) that.setState({
                    webStepActive:webStepActive+1,
                  })
              }}
                >{{
                  0:'下一步',
                  1:'提取',
                  2:'完成'
                }[that.state.webStepActive]}</Button>:''}
          

          <Space h='xl' />
        <Flex direction={'row'} justify='flex-start' align='flex-end'>
            <Indicator 
                color="cyan" 
                position="bottom-end"
                label={(()=>{
                  let c=0;
                  Array.from(that.state.pages,ps=>c+=ps.length)
                  return c
                })()} 
                showZero={false}
                dot={false} 
                overflowCount={999} inline size={22}>
              <Select
                label={'来源'}
                // placeholder={placeholder}
                data={[{
                  label:'pdf',value:'pdf'
                },{
                  label:'web',value:'web'
                }]}
                value={that.state.type}
                defaultValue={that.state.type}
                onChange={val=>{
                  that.setState({type:val})
                }}
                allowDeselect={false}
                style={{width:'88px'}}
              /> </Indicator>

          
            <Button variant="outline" color="cyan" uppercase
              style={{marginLeft:'16px'}}
              onClick={async()=>{
                let pages=await that.getPages();
                that.setState({pages,saveSuccess:false})
                }}
                >读取记录</Button>
            
            
              <Button 
              variant="outline" 
              color="cyan" 
              uppercase
              style={{marginLeft:'8px'}}
              onClick={async()=>{
                let pages=await that.savePages();
                // 透传reply
                chrome.runtime.sendMessage({ cmd: 'mark-run',reply:Array.from(pages,ps=>Array.from(ps,p=>p.en+'\n'+p.zh).join('\n\n')).join('\n\n') }, function (response) {});

              }}
              >保存并提交{that.state.saveSuccess?'*':''}</Button>
           
           <Button 
              variant="outline" 
              color="cyan" 
              uppercase
              style={{marginLeft:'8px'}}
              onClick={async()=>{
                await that.newPages()
              }}
              >新建</Button>
          </Flex>

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
                    <Textarea  
                    label="原文" 
                    autosize 
                    variant="filled" 
                    value={t.en} 
                    onChange={(event)=>{
                        let val = event.currentTarget.value.trim();
                        let pages=[...that.state.pages];
                            pages[i][k].en=val;
                            that.setState({
                              currentPage:[i,k],
                              pages
                            })
                    }}/>
                    <Textarea  
                    label="结果" 
                    autosize 
                    variant="filled" 
                    value={t.zh} 
                    onChange={(event)=>{
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
                            // console.log(text)
                            let pages=[...that.state.pages];
                            pages[i][k].zh=text;
                            that.setState({
                              currentPage:[i,k],
                              pages
                            })
                          }),500)
                         
                        },1000);
                      }}
                      style={{display:window.location.host=='translate.google.com'?'block':'none'}}
                      >翻译
                      </Button>

                      <CopyButton value={t.en+'\n'+t.zh}>
                            {({ copied, copy }) => (
                              <Button variant="light" color={copied ? 'dark' : 'cyan'} compact onClick={copy}>
                                {copied ? '已复制到剪切板' : '拷贝'}
                              </Button>
                            )}
                          </CopyButton>

                          <Button variant="light" color={'cyan'} compact onClick={()=>{
                              let pages=[...that.state.pages];
                              pages[i][k]=null;
                              pages[i]=pages[i].filter(m=>m!=null);
                              that.setState({
                                currentPage:[i,k],
                                pages
                              })
                          }}>删除</Button>

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



  export { MyGoogleTranslate};