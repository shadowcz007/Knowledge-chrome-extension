import React from 'react';
import './Options.css';

import { ActionIcon, Title,Select,Flex,Space,Badge, Group,TextInput,Button,Alert, Text,LoadingOverlay } from '@mantine/core';
import { IconX,IconAlertCircle } from '@tabler/icons';
import {Md5} from 'ts-md5'
import { Provider } from '@idealight-labs/anyweb-js-sdk'


const getId=(t:string)=>{
  return Md5.hashStr(t)
}

interface Props {
  title: string;
}


interface MySelectProps {
  label:string;
  placeholder:string;
  data:any;
  value:string;
  onChange:any;
  allowDeselect:boolean
}

const MySelect: React.FC<MySelectProps> = ({data, label, placeholder, value, onChange,allowDeselect}:MySelectProps) => {
  
return <Select
        label={label}
        placeholder={placeholder}
        data={data}
        value={value}
        onChange={onChange}
        allowDeselect={allowDeselect||false}
        />
}

interface NotionsProps {
  alertCallback:any;
}

let isInit=false;

// 设置notions
const NotionsSetup: React.FC<NotionsProps> = ({alertCallback}:NotionsProps) => {
  
  const [notions, setNotions] = React.useState( {} as any)
  const [idSelected,setIdSelected]=React.useState('')
  const [setup,setSetup]=React.useState(false)
  const [currentNotionTitle, setCurrentNotionTitle] = React.useState('')
  const [currentNotionProperties, setCurrentNotionProperties] = React.useState( [] as any[])
  const [currentNotionMatchKeywords, setCurrentNotionMatchKeywords] = React.useState( [] as any[])
  const [currentNotionId, setCurrentNotionId] = React.useState('' as any)
  const [currentNotionDatabaseId,setCurrentNotionDatabaseId]=React.useState('' as any)
  const [currentNotionToken,setCurrentNotionToken]=React.useState('' as any)
  // const [isInit,setIsInit]=React.useState(false)

  // console.log('initNotions',isInit)

  if(isInit===false){
    isInit=true;

    chrome.storage.local.get().then(async d=>{
    
      if(d&&d.notions&&Object.keys(d.notions).length>0&&Object.keys(notions).length==0){
        setNotions(d.notions)
        console.log('setNotions')
        
        if(d.currentNotion&&d.currentNotion.id){
          let nP:any=Object.values(d.notions[d.currentNotion.id].properties||{});
          let { properties, keywords } = matchToolsKeys(nP)
          console.log('**',properties)
          await setCurrentNotion(d.currentNotion.id,
            d.currentNotion.title,d.currentNotion.token,
            d.currentNotion.databaseId,properties,d.currentNotion.matchKeywords || keywords);
            
        }
      };
    })

    chrome.storage.local.onChanged.addListener((e) => {
      // if(isInit==false) isInit=true;
      chrome.storage.local.get().then(async(res) => {
        console.log('##onChanged',isInit)
        if (res.addNotion && res.addNotion.id) {
  
          const { id,properties,title,matchKeywords,databaseId,token } = res.addNotion;
          // console.log('notions',Object.keys(notions))
          let _notions = { ...res.notions }
          _notions[id] = { ...res.addNotion }
          
          // console.log('_notions',Object.keys(_notions))
        
          let nP:any=Object.values(properties);
          let { properties:newP, keywords } = matchToolsKeys(nP)
          let nMatchKeywords=matchKeywords||keywords;

          chrome.storage.local
            .set({
              addNotion: null,
              notions: _notions,
              currentNotion: {
                databaseId,
                token,
                title,
                id,
                matchKeywords:nMatchKeywords,
              },
            })
            .then(() => {
              setNotions(_notions)
              setIdSelected(id);
              setCurrentNotionId(id)
              setCurrentNotionTitle(title)
              setCurrentNotionProperties(newP)
              setCurrentNotionMatchKeywords(nMatchKeywords)
            });

          
        }else if(res&&res.currentNotion&&res.currentNotion.id&&notions[res.currentNotion.id]&&res.currentNotion.id!=idSelected){
      
        // let nP:any=Object.values(res.currentNotion.properties||{});
        // let { properties, keywords } = matchToolsKeys(nP)
          
        // await setCurrentNotion(res.currentNotion.id,
        //   res.currentNotion.title,res.currentNotion.token,
        //   res.currentNotion.databaseId,properties,res.currentNotion.matchKeywords || keywords);
  
      }
      })
    })
  }
  

  const setCurrentNotion=(id:string,title:string,token:string,databaseId:string,properties:[],matchKeywords:[])=>{
        return new Promise<void>((res,rej)=>{
          // console.log(currentNotionId!==id,currentNotionId,id)
          if(currentNotionId!==id){
            
            chrome.storage.local
              .set({
                currentNotion: {
                  databaseId,
                  token,
                  title,
                  id,
                  matchKeywords
                },
              })
              .then(() => {
                
                setIdSelected(id);
                setCurrentNotionId(id)
                setCurrentNotionTitle(title)
                setCurrentNotionProperties(properties)
                setCurrentNotionMatchKeywords(matchKeywords)
                setSetup(false);
                
                alertCallback({display:true,
                  title:'当前notion',
                  text:`${title} \n\n  键值对 ${Array.from(
                    properties,
                        (p:any) => `${p.key} - ${p.type}`
                      )}`,loadingDisplay:false}
                  );
  
                res()
                // chrome.storage.local.set({ addNotion: null })
              });
          }else{
            res()
          }
          
        })
        
  }

  // let notionsList:any = 

  // 把notion和本插件的key对应起来
  const matchToolsKeys =(properties:[])=> {
    let keywords:any = {}
    Array.from(
      `网站链接 url
    标题 title
    创建时间 createdAt
    标签 tags
    划选的文字 text
    评论 reply
    钱包地址 cfxAddress`.split('\n')
        .filter((f) => f.trim()),
      (r) => {
        let rs = r.trim().split(' ')
        let key = rs[1];

        keywords[key] = {
          key,
          name: rs[0],
        }

        let matchKey:any = properties.filter((f:any) =>
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

  const resetCurrentNotion=()=>{
    return new Promise<void>((res,rej)=>{
      chrome.storage.local
      .set({
        addNotion:null,
        currentNotion: null,
      })
      .then(() => {
        if(currentNotionId!=''&&idSelected!=''){
          setCurrentNotionId('');
          setCurrentNotionTitle('');
          setCurrentNotionProperties([]);
          setCurrentNotionMatchKeywords([])
          setIdSelected('');
        }
        res();
      })
    })
    
  }

  // console.log('stats notions',notions,setup,currentNotionTitle,
  // currentNotionProperties)
  return <div> 
<Space h='xl' />
<Flex 
    style={{marginLeft:'24px'}}
    direction='column'
    >
      <Title order={4}>/ Notion数据库 <Text fz='xs'>共{Object.keys(notions).length}个</Text></Title>
      
      <Flex  style={{marginLeft:'24px',marginTop:'12px'}}
      mih={50}
      gap="md"
      justify="flex-start"
      align="flex-end"
      direction='row'
      wrap='nowrap'>
          <MySelect
              allowDeselect={false}
              label={`当前数据库`}
              placeholder='all'
              data={(()=>{
                let notionsList:any=Array.from(Object.values(notions), (n:any) => ({
                  value: n.id,
                  label: n.title ? n.title : '更新中',
                  isSelected: n.isSelected,
                }))
                notionsList.sort((b: { isSelected: number; }, a: { isSelected: number; }) => a.isSelected - b.isSelected)
                notionsList = Array.from(notionsList, (n: any) => ({
                  value: n.value,
                  label: n.label,
                }))
                return notionsList
              })()}
              value={idSelected}
              onChange={async (id: any) => {
                 
                  let n:any = notions[id]
                  // console.log('current!!',n,id)

                  // await resetCurrentNotion();
                
                  if (n) {

                    let nP:any=Object.values(n.properties);
                    let { properties, keywords } = matchToolsKeys(nP)

                    await setCurrentNotion(id,n.title,n.token,n.databaseId,properties,n.matchKeywords || keywords);

                    chrome.storage.local
                      .set({
                        addNotion:null
                      });

                  } else {
                    alertCallback({display:true, title:'请添加or选择notion', text:`-`,loadingDisplay:false});
                  }
                
              }}
            />

            <Button variant='outline'
                    color='dark' onClick={()=>setSetup(true)}>配置字段映射关系</Button>
      </Flex>
       
      <Space h='xl' />
      <Flex 
      style={{
        marginLeft:'44px'
      }}
      mih={50}
      gap="md"
      justify="flex-start"
      align="flex-start"
      direction='column'
      wrap='nowrap'>
      {setup&&currentNotionTitle &&
          currentNotionProperties &&
          currentNotionProperties.length > 0
            ? [
                Array.from(currentNotionMatchKeywords, (mKey) => (
                  <MySelect
                  allowDeselect={true}
                    key={mKey.key}
                    label={mKey.name}
                    placeholder={mKey.name + ' ' + mKey.key}
                    value={mKey.value}
                    data={Array.from(
                      currentNotionProperties,
                      (p) => ({
                        value: p.key + p.type,
                        label: p.key,
                      })
                    )}
                    onChange={(e: any) => {
                      console.log('匹配字段', e)
                      // 用来更新匹配 工具里的字段和notion数据库字段
                      let _currentNotionMatchKeywords = [
                        ...currentNotionMatchKeywords,
                      ]

                      if (e) {
                        // 匹配
                        Array.from(
                          currentNotionProperties,
                          (notionPro) => {
                            if (notionPro.key + notionPro.type == e) {
                              // console.log(notionPro, mKey, that.state.currentNotionMatchKeywords)
                              _currentNotionMatchKeywords = Array.from(
                                _currentNotionMatchKeywords,
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
                        _currentNotionMatchKeywords = Array.from(
                          _currentNotionMatchKeywords,
                          (ck) => {
                            if (ck.key == mKey.key && mKey.name == ck.name) {
                              delete ck.notionProperties
                              delete ck.value
                            }
                            return ck
                          }
                        )
                      }

                      setCurrentNotionMatchKeywords(_currentNotionMatchKeywords);
                       
                    }}
                  ></MySelect>
                )),
                <Button
                  key='update-notion-btn'
                  onClick={() => {     
                    let _notions={...notions};
                    _notions[currentNotionId] = {
                      ..._notions[currentNotionId],
                      matchKeywords: currentNotionMatchKeywords,
                    }
                    // console.log('_notions',_notions)
                    setNotions(_notions);
                    chrome.storage.local
                      .set({
                        currentNotion: {
                          ..._notions[currentNotionId],
                        },
                        notions:_notions,
                        addNotion:null
                      })
                      .then(() => {
                        // console.log('notions',notions)
                        alertCallback({display:true, title:'配置完成', text:`${JSON.stringify(notions[currentNotionId])}`,loadingDisplay:false})
                        setSetup(false)
                      })
                  }}
                >更新</Button>, <Space h='xl' key="space"/>
              ]
            : ''}
         
        
      </Flex>
   
      <Title order={5} style={{marginLeft:'24px',marginTop:'12px'}}>添加新的数据库</Title>
        <Flex 
        style={{marginLeft:'24px',marginTop:'12px'}}
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-end"
        direction='row'
        wrap='nowrap'>

            <TextInput
            miw={320}
            label="数据库地址"
            withAsterisk
              placeholder='例如:1be3bd9842fb43dbbe2e944870632415'
              value={currentNotionDatabaseId}
              onChange={(event) => {
                // console.log(event.currentTarget.value.trim())
                setCurrentNotionDatabaseId( event.currentTarget.value.trim())
              }}
            />
            <TextInput
            miw={480}
            label="开放平台token"
            withAsterisk
              placeholder='例如:secret_8X2Ryn7H8qsmTQ4c1gEQeP6A6Mw4QZgErwh7SwKKewO'
              value={currentNotionToken}
              onChange={(event) => {
                setCurrentNotionToken(event.currentTarget.value.trim()) 
              }}
              // ref={that.testRef}
            />

          <Button variant='outline'
                    color='dark'
              onClick={() => {  
                let id=currentNotionToken + currentNotionDatabaseId;
                // console.log(currentNotionDatabaseId,currentNotionToken)  
              if (
                    currentNotionDatabaseId != undefined &&
                    currentNotionDatabaseId != null &&
                    currentNotionToken != undefined &&
                    currentNotionToken != null&&!notions[id]&&currentNotionDatabaseId&&currentNotionToken
                  ) {
                    alertCallback({
                      display:false,
                      title:'添加中',
                      text:'',loadingDisplay:true
                    })
                    // console.log(notions)
                    // 发到后台
                    chrome.runtime.sendMessage(
                      {
                        cmd: 'add-notion-token',
                        data: {
                          token:currentNotionToken,
                          databaseId:currentNotionDatabaseId,
                          id
                        },
                      },
                      function (response) {
                        alertCallback({
                          display:true,
                          title:'添加中',
                          text:`token:${currentNotionToken} databaseId:${currentNotionDatabaseId}`,
                          loadingDisplay:true
                        })
                        console.log('add-notion-token 收到来自后台的回复：' + response)
                      }
                    )
                  }else if(notions[id]){
                    alertCallback({
                      display:true,
                      title:'已添加',
                      text:`token:${currentNotionToken} databaseId:${currentNotionDatabaseId}`,loadingDisplay:false
                    })
                  }
              }}
            >
              添加
            </Button>
            
      </Flex>
      <Space h='xl' />
</Flex>   
  </div>;
};



// 设置标签
let tagsInit=false;

interface TagsSetupProps {
  alertCallback:any;
}
const TagsSetup: React.FC<TagsSetupProps> = ({alertCallback}:TagsSetupProps) => {
  const [texts, setTexts] = React.useState([])
  const [value, setValue] = React.useState('');

  const getTags=()=>{
    alertCallback({
          display:false,
          title:'',
          text:'',loadingDisplay:true
        })
    chrome.runtime.sendMessage(
      { "cmd": 'get-all-tags'},
      function (response) {
        console.log('收到来自后台的回复：' + response)
        setTimeout(()=>{
          alertCallback({
            display:false,
            title:'',
            text:'',loadingDisplay:false
          })
        },3500)
      }
    )
  }

  const getTagsFromLocal=()=>{
    chrome.storage.local.get('tags').then(data=>{
      // console.log(data)
      if(data&&data.tags&&Object.keys(data.tags).length>0){
        let tags:any=Object.keys(data.tags).sort((a:any,b:any)=>a-b)
        if(tags.join(',')!=texts.join(',')) setTexts(tags)
      }
      alertCallback({
        display:false,
        title:'',
        text:'',loadingDisplay:false
      })
    })
  }
  
  if(tagsInit==false) {
    tagsInit=true;
    getTagsFromLocal();
    chrome.storage.local.onChanged.addListener(()=>{
      getTagsFromLocal()
  })}

  const updateText=(t: string)=>{
    let textsNew:any=Array.from(texts,(te:any)=>te.trim()).filter(f=>f);
    textsNew.push(t.trim());
    setTexts(textsNew);
    // console.log(t)
    chrome.runtime.sendMessage(
      { "cmd": 'find-by-tag', data: t.trim() },
      function (response) {
        console.log('收到来自后台的回复：' + response)
      }
    )
  }
  const removeButton = (
    <ActionIcon size="xs" color="blue" radius="xl" variant="transparent" onClick={(event) => {
      event.preventDefault();
      if(event.currentTarget.parentElement) {
        let id=event.currentTarget.parentElement.parentElement?.getAttribute('data-id');
        let nts:any=Array.from(Array.from(texts,(t:any)=>t.trim()).filter(f=>f),(t,i)=>{
          if(`${t}_${i}`!=id) return t
        }).filter(f=>f);
        setTexts(nts);
        // console.log(nts)
        chrome.storage.local.set({
          tags:nts
        });
      }
    }}>
      <IconX size={10} />
    </ActionIcon>
  );

  // getTags()

  return <div>
    <Flex 
    style={{marginLeft:'24px'}}
    direction='column'
    >
      <Title order={4}>/ 标签库 <Text fz='xs'>共{texts.length}个</Text></Title>
      <Flex style={{marginLeft:'24px',marginTop:'12px'}}
      mih={50}
      gap="md"
      justify="flex-start"
      align="flex-end"
      direction='row'
      wrap='nowrap'>

        {/* <TextInput
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
        }}>ADD</Button> */}
          
          <Button variant='outline'
                    color='dark'
                    onClick={(event) => {
          event.preventDefault();
          getTags();
        }}>加载</Button>
      </Flex>
      <Space h='xl'/>
    <Group>
      {Array.from(Array.from(texts,(t:any)=>t.trim()).filter(f=>f),(t,i)=>{
        return <Badge 
        variant="outline" sx={{ paddingRight: 8,paddingLeft:8 }} 
        // rightSection={removeButton}
         key={i} data-id={`${t}_${i}`}>
        {t}</Badge>
      })}
    </Group>

    </Flex>

  </div>;
};


function login () {
  return new Promise<boolean>((res, rej) => {
    const provider:any = new Provider({
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
        .then((data:any) => {
          const { chainId, networkId, address, code } = data
          console.log('DApp 获取到的授权结果', data)
          provider.networkId = networkId
          if (provider.networkId === 1) {
            console.log('测试网')
          }

          chrome.storage.sync.set({
            cfxAddress: { address:address[0].trim(), addressIsCheck:true },
          })
          res(true)
          
          // alert(address)
        })
        .catch(async (e:any) => {
          console.error('调用失败', e)

          if (
            await provider.request({
              method: 'anyweb_loginstate',
            })
          ) {
            // reset()
          }
          res(false)
        })
    })
  })
}

interface AddressProps {
  alertCallback:any;
}


// address
let addressInit=false;
const AddressSetup: React.FC<AddressProps> = ({alertCallback}:AddressProps) => {

  const [address,setAddress]=React.useState('');
  const [addressIsCheck,setAddressIsCheck]=React.useState(false)

  const check=async()=>{
    addressInit=true;
    let data=await chrome.storage.sync.get('cfxAddress')
    if(data&&data.cfxAddress){
      if(address!=data.cfxAddress.address) setAddress(data.cfxAddress.address)
      if(addressIsCheck!=data.cfxAddress.addressIsCheck)setAddressIsCheck(data.cfxAddress.addressIsCheck)
      // if(data.cfxAddress.addressIsCheck){
      //   alertCallback({
      //     display:true,
      //     title:'验证成功',
      //     text:''
      //   })
      // }
    }

  }
  if(addressInit==false) check();

  return  <Flex 
  style={{marginLeft:'24px'}}
  direction='column'
  >
    <Title order={4}>/ 树图钱包</Title>
    <Flex mih={50}
    gap="md"
    justify="flex-start"
    align="flex-end"
    direction='row'
    wrap='nowrap' style={{marginLeft:'24px',marginTop:'12px'}}>
  <TextInput
  style={{minWidth:'440px'}}
  withAsterisk
    label="地址"
    placeholder='请登陆Anyweb，授权钱包地址'
    disabled={true}
    value={address}
    onChange={(event) =>{
      setAddress(event.currentTarget.value)
      setAddressIsCheck(false)
    }
    }
  />
  
  <Button variant='outline'
                    color='dark'
                    onClick={async () =>{
                      alertCallback({
                        display:false,
                        title:'',
                        text:'',loadingDisplay:true
                      })
                      let success=await login();
                      if(success){
                        alertCallback({
                          display:true,
                          title:'验证成功',
                          text:'',loadingDisplay:false
                        })
                        check();
                      }else{
                        alertCallback({
                          display:true,
                          title:'验证失败',
                          text:'稍后再试 or 检查账号',loadingDisplay:false
                        })
                      }
                      

    // let data=await chrome.storage.sync.get('cfxAddress');
    // if(!(data&&data.cfxAddress))data={
    //   cfxAddress:{
    //     address:address,
    //     addressIsCheck:false
    //   }
    // }
    // console.log(data.cfxAddress)
    // if(data&&data.cfxAddress){
    //   // 验证
    //   if(data.cfxAddress.address&&data.cfxAddress.addressIsCheck==false){
    //     alertCallback({
    //       display:true,
    //       title:'正在验证ing',
    //       text:''
    //     })
    //     let success=await login();
        
        
    //   }else if(data.cfxAddress.addressIsCheck){
    //     // console.log(data.cfxAddress.addressIsCheck)
    //     alertCallback({
    //       display:true,
    //       title:'验证成功',
    //       text:''
    //     })
    //   }
    // };
    
    }}>Anyweb登陆</Button>{addressIsCheck?<Badge color='green' size='xs'>✅</Badge>:''}
  </Flex></Flex>
};



interface AlertProps {
  display: boolean;
  title:string;
  text:string,
  alertCallback:any
}

// alert
const AlertSetup: React.FC<AlertProps> = ({display,title,text,alertCallback}:AlertProps) => {
 
  return <div> 
{display ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={title}
              color='indigo'
              withCloseButton
              variant='filled'
              onClose={() => alertCallback({
                display:false
              })}
            >
              {text}
            </Alert>
          ) : (
            ''
          )}
  </div>;
};



const Options: React.FC<Props> = ({ title }: Props) => {

  const [myAlert, setAlert] = React.useState({display:false,title:'x',text:'--'} as any)
  const [addressIsCheck,setAddressIsCheck]=React.useState(false)
  const [loading,setLoading]=React.useState(true)
  
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.cmd == 'check-cfx-address-result') {
      if (request.success) {

        chrome.storage.sync.set({
          cfxAddress: { address: request.address, addressIsCheck: true },
        })
        setAddressIsCheck(true)

        setAlert({display:false, title:'', text:'',loadingDisplay:false})

      } else {
        setAlert({display:true, title:'提示', text:`${JSON.stringify(request.info)}`,loadingDisplay:false})
      }
    } else if (request.cmd == 'add-notion-token-result') {
      // console.log(request)
      if (request.success == false) {
        setAlert({display:true, title:'提示', text:`失败,请稍后再试 ${request.info}`,loadingDisplay:false})
      } else {
        setAlert({display:true, title:'提示', text:'添加成功',loadingDisplay:false})
        // console.log(myAlert)
      }
    }
    // that.setLoading(false)
    sendResponse('from options')
  })

  const updateAlert=(data: { display: any; title: any; text: any;loadingDisplay:any })=>{
    let {display,title,text,loadingDisplay}=data;
    // console.log(data,myAlert,display!=myAlert.display&&title!=myAlert.title&&text!=myAlert.text)
    if(display!=myAlert.display||title!=myAlert.title||text!=myAlert.text) setAlert({display,title,text})
    if(loadingDisplay==true && loading==false) {
      setLoading(true);
      setTimeout(()=>setLoading(false),5000)
    }
    if(loadingDisplay==false) setLoading(false)

  }
  
  return <div>
    <LoadingOverlay visible={loading} />
    <AlertSetup display={myAlert.display} title={myAlert.title} text={myAlert.text} alertCallback={updateAlert}/>
    <Space h='xl'/>
    <Title order={1} style={{marginLeft:'24px'}}>设置</Title>
    <Space h='xl'/>
    <AddressSetup alertCallback={updateAlert}/>
    <Space h='xl'/>
    <NotionsSetup alertCallback={updateAlert}/>
    <Space h='xl'/>
    <TagsSetup alertCallback={updateAlert}/>
  </div>;
};


export default Options;
