(()=>{console.log("This is the background page."),console.log("Put the background scripts here.",chrome.contextMenus);let e,t=!1;const o="1be3bd9842fb43dbbe2e944870632415";async function r(e="",t={}){return(await fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",headers:{Authorization:"Bearer secret_8X2Ryn7H8qsmTQ4c1gEQeP6A6Mw4QZgErwh7SwKKewO","Content-Type":"application/json","Notion-Version":"2021-05-13"},redirect:"follow",referrerPolicy:"no-referrer",body:JSON.stringify(t)})).json()}function n(e){return[{pageTitle:e.properties.pageTitle.title[0]?.plain_text,pageId:e.properties.pageId.rich_text[0]?.plain_text,createdAt:e.properties.createdAt.rich_text[0]?.plain_text,reply:e.properties.reply.rich_text[0]?.plain_text,cfxAddress:e.properties.cfxAddress.rich_text[0]?.plain_text,nodeName:"#text",textContent:e.properties.textContent.rich_text[0]?.plain_text}]}chrome.runtime.onInstalled.addListener((async()=>{chrome.contextMenus.create({id:"mark",title:"标注",type:"normal",contexts:["selection"]}),chrome.storage.local.get().then((function(e){null==e.data&&chrome.storage.local.set({data:["元宇宙","人工智能","web3","Web3","大模型"]})}),(function(e){console.log(e)}))})),chrome.contextMenus.onClicked.addListener((async(t,o)=>{const r=t.menuItemId;if(console.log(r,t,o),"keyword"==r){chrome.storage.local.get().then((function(e){console.log(e);let o=[...e.data,t.selectionText.trim()];chrome.storage.local.set({data:o})}),(function(e){console.log(e)}))}else if("mark"==r){const t=await chrome.storage.sync.get("cfxAddress");t&&t.cfxAddress&&(e=t.cfxAddress),e?chrome.tabs.sendMessage(o.id,{cmd:"mark-run"},(function(e){console.log(e)})):chrome.tabs.sendMessage(o.id,{cmd:"login"},(function(e){console.log(e)}))}})),chrome.runtime.onMessage.addListener((async function(s,c,a){if(console.log("收到来自content-script的消息："),console.log(s,c,a),"mark-result"==s.cmd){const t=await chrome.storage.sync.get("cfxAddress");t&&t.cfxAddress&&(e=t.cfxAddress),e?(d={...s.data,cfxAddress:e},r("https://api.notion.com/v1/pages",{parent:{database_id:o},properties:{pageTitle:{title:[{type:"text",text:{content:d.pageTitle}}]},cfxAddress:{rich_text:[{type:"text",text:{content:d.cfxAddress}}]},pageId:{rich_text:[{type:"text",text:{content:d.pageId}}]},textContent:{rich_text:[{type:"text",text:{content:d.textContent}}]},createdAt:{rich_text:[{type:"text",text:{content:d.createdAt}}]}}})).then((e=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(t){chrome.tabs.sendMessage(t[0].id,{cmd:"mark-push",data:n(e)},(function(e){console.log(e.farewell)}))}))})):console.log("请登录")}else if("cfx-address"==s.cmd)e=s.data,e&&chrome.storage.sync.set({cfxAddress:e});else if("get-address"==s.cmd){const t=await chrome.storage.sync.get("cfxAddress");t&&t.cfxAddress&&(e=t.cfxAddress),e&&a(e)}else"get-by-pageId"==s.cmd?(i=s.data,r(`https://api.notion.com/v1/databases/${o}/query`,{filter:{property:"pageId",rich_text:{contains:i}}})).then((e=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(t){chrome.tabs.sendMessage(t[0].id,{cmd:"get-by-pageId-result",data:Array.from(e.results,(e=>n(e)[0]))},(function(e){console.log(e)}))}))})):"new-reply"==s.cmd?(isQueryNotEmptyOfReply=!0,r(`https://api.notion.com/v1/databases/${o}/query`,{filter:{property:"reply",rich_text:{is_not_empty:!0}},sorts:[{property:"createdAt",direction:"ascending"}]})).then((e=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(t){chrome.tabs.sendMessage(t[0].id,{cmd:"new-reply",data:Array.from(e.results,(e=>n(e)[0]))},(function(e){console.log(e)}))}))})):(s.cmd=0==t)&&(chrome.tabs.create({url:"newtab.html"}),t=!0);var i,d;a("我是后台，我已收到你的消息："+JSON.stringify(s))}))})();