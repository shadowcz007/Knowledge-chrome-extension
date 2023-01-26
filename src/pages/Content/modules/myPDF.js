import React from 'react'

import {
  Flex,
  Button,
  Space,
  Textarea,CopyButton,Switch ,Indicator
} from '@mantine/core'
 
class MyPDFSwitch extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        checked:false
      }
    }
    render(){
      let that=this;
      return  <Switch label="开始收集"
      size="md"
      color="cyan" checked={this.state.checked} onChange={(event) =>{
        that.setState({
          checked:event.currentTarget.checked
        })
        if(that.props.domId) document.querySelector('#'+that.props.domId).style.display=event.currentTarget.checked?'block':'none'
      }} />
    }
  
  }
  
  
  class MyPdfRead extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        text:props.text||'',
        ticking:false,
        lastKnownScrollPosition:0,
        currentPageAnnotations:[]
      }
    }
     extractCurrentPageNum(){
      let index=parseInt(document.querySelector('#pageNumber').value);
      let currentPage=document.querySelector('#numPages').innerText.split('/');
      let count=parseInt(currentPage[1].split(')').join('').trim())
      return {pageNum:index,count}
    }

    initPagesData(){
      const {count}=this.extractCurrentPageNum()
      return JSON.parse(JSON.stringify((new Array(count)).fill([])));
    }
    
    // pages=[{zh,en}]
   async getPDFAnnotations(){
      
      var pages=this.initPagesData();
      try {
        let data=await chrome.storage.local.get('pdfAllPages');
        if(data&&data.pdfAllPages) pages=data.pdfAllPages;
        // pages=JSON.parse(localStorage.getItem('_pdf_all_pages_'))
      } catch (error) {
        pages=this.initPagesData();
      }
      return pages
    }
  
    // data=[string]
   async getCurrentPageAnnotations(){
       // 当前页码
      const {pageNum,count}=this.extractCurrentPageNum()
       // 加载缓存
      let pages=await this.getPDFAnnotations();
      let res={pageNum,count,data:[]};
      if(pages.length==count&&pages[pageNum-1]){
        res.data=Array.from(pages[pageNum-1],p=>p.en+'\n\n'+p.zh).unque()
      }
      return res
    }
  
    // pages=[{zh,en}]
    async savePDFAnnotations(){
      var pages=await this.getPDFAnnotations();
      let pagesElement=document.body.querySelectorAll('.page');
     if(pages.length==pagesElement.length){
      for (let index = 0; index < pagesElement.length; index++) {
        pages[index]=[...pages[index],...Array.from(pagesElement[index].querySelectorAll('.freeTextEditor'),text=>({zh:'',en:text.innerText}))]
        // pages[index]=pages[index].unque();
        // pages[index]=Array.from(pages[index],p=>({zh:'',en:p}))
      }
      // localStorage.setItem('_pdf_all_pages_',JSON.stringify(pages))
      await chrome.storage.local.set({
        pdfAllPages:pages
      })
     }
      
    }
  
    init(){
      let that = this;
      let view=document.querySelector('#viewerContainer');
      view.addEventListener('scroll', (event) => {
        let scrollY=view.scrollTop,innerHeight=view.clientHeight;
        if (
          !that.state.ticking &&
          Math.abs(scrollY - that.state.lastKnownScrollPosition) >
            innerHeight*0.5
        ) {
          window.requestAnimationFrame(async() => {
            let {pageNum,count,data}=await that.getCurrentPageAnnotations()
            that.setState({
              ticking : false,
              lastKnownScrollPosition:scrollY,
              currentPageAnnotations:data,
              text:data.join('\n------------\n'),
              pageNum,count
            });
          })
          that.setState({ticking : true});
        }
      })
  
      document.addEventListener("selectionchange",async event => {
        const selection = window.getSelection();
        if (selection.type =='Range') {
          const oRange = selection.getRangeAt(0)
          let startContainer = oRange.startContainer
          
          // 排除插件的ui
          if(startContainer.parentElement.className.match("mantine-"))return
        
          let text = selection.toString();
          // pdf 划选复制
          let pdfTextDiv=document.querySelector('#knowlege-pdf-read-new');
          if(pdfTextDiv&&window.location.href.match('https://mozilla.github.io/pdf.js/web/viewer.html')){
            
            if(startContainer.parentElement.className.match("knowlege-pdf-read") ||startContainer.parentElement.parentElement.className.match("knowlege-pdf-read")|| text.format2().length<2)return
            if(startContainer.parentElement.className.match('internal')) return
            if(startContainer.parentElement.parentElement&&startContainer.parentElement.parentElement.className.match('freeTextEditor')) return
  
            let nt=text.format2();
            that.setState({text:nt})
            // pdfTextDiv.querySelector('textarea').value=nt;
            // pdfTextDiv.setAttribute('selection-text',nt)
          }
        }else if(selection.type=='Caret'){
          // pdf的标注
          // let textLocal=localStorage.getItem('_pdf_current_input_')
          // let textLocal=(await that.getCurrentPageAnnotations()).join('\n')
          // let t=(textLocal||'').trim();
          // // document.execCommand('insertText', false, 'pasteText');
          // if(selection.anchorNode.className&&selection.anchorNode.className.match('internal')&&t.length>0){
          //   document.execCommand('insertText', false,t);
          //   // localStorage.setItem('_pdf_current_input_','')
          //   // await that.savePDFAnnotations()
          // }
        }
      });
    }
    componentDidMount () {
      this.init()
    }
    render () {
      let that = this
      return (<Flex 
      direction='column'
      align='flex-start'
      justify='flex-start'
      style={{maxWidth:'400px',
      backgroundColor:'#eee',padding:'12px',borderRadius:'12px'}}
      >
        <Button.Group>  
            <Indicator label={that.state.currentPageAnnotations.length} inline size={22}>
              <Button variant='outline' color={'dark'} onClick={async(e)=>{
                    let data=await chrome.storage.local.get('pdfAllPages');
                    // 当前页码
                    const {pageNum,count}=that.extractCurrentPageNum()
                    let pages= JSON.parse(JSON.stringify((new Array(count)).fill([])));
                  
                    if(data&&data.pdfAllPages) pages=data.pdfAllPages;
                    if(pages.length!=count){
                      pages=this.initPagesData()
                    }
                    if(pages.length==count&&pages[pageNum-1]){
                        // let pdfTextDiv=  document.querySelector('#knowlege-pdf-read-new');
                        let text=that.state.text;
                        pages[pageNum-1].push({zh:'',en:text});
                        // pages[pageNum-1]=pages[pageNum-1].filter(f=>f&&f.trim())
                        // pages[pageNum-1]=pages[pageNum-1].unque();
  
                        await chrome.storage.local.set({
                          pdfAllPages:pages
                        });
  
                        let {data}=await that.getCurrentPageAnnotations()
                        that.setState({
                          currentPageAnnotations:data,
                          text:data.join('\n------------\n'),
                          pageNum,count
                        });
  
                        // console.log(pageNum,pages)
                      };
                  }}>收集</Button>
              </Indicator>
              <Space w='xl' />
              <CopyButton value={that.state.text}>
                {({ copied, copy }) => (
                  <Button variant='outline' color={copied ? 'teal' : 'dark'} onClick={copy}>
                    {copied ? '已复制到剪切板' : '拷贝'}
                  </Button>
                )}
              </CopyButton>
              <Space w='xl' />
              <Button variant='outline'
                          color='dark' onClick={async ()=>{
                            const {count}=that.extractCurrentPageNum();
                            let pages=JSON.parse(JSON.stringify((new Array(count)).fill([])));
                            that.setState({text:'',currentPageAnnotations:[]});
                            await chrome.storage.local.set({pdfAllPages:pages})
                  }}>新建</Button>
          </Button.Group>
          <Space h='xl' />
        <Textarea
            style={{ 
            minWidth:'360px',
            }}
              autosize
              placeholder="划选记录"
              label={`当前页面 ${that.state.currentPageAnnotations.length}记录`+`${that.state.pageNum?`，${that.state.pageNum} / ${that.state.count}页`:''}`}
              description="采集后使用谷歌翻译"
              value={this.state.text}
              minRows={5}
              maxRows={24}
              onChange={event=>{
                let val = event.currentTarget.value;
                that.setState({
                  text:val
                });
                // localStorage.setItem('_pdf_current_input_',val);
                // let pdfTextDiv=  document.querySelector('#knowlege-pdf-read-new');
                // pdfTextDiv.setAttribute('selection-text',val)
            }}    
            />
    
        </Flex>)
    }
  }
  export { MyPDFSwitch,MyPdfRead };  