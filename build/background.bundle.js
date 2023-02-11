(()=>{var e={8816:function(e,t,r){"use strict";var a,s,o,n,i,c,u,d,l,p=this&&this.__classPrivateFieldSet||function(e,t,r,a,s){if("m"===a)throw new TypeError("Private method is not writable");if("a"===a&&!s)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!s:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===a?s.call(e,r):s?s.value=r:t.set(e,r),r},h=this&&this.__classPrivateFieldGet||function(e,t,r,a){if("a"===r&&!a)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!a:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?a:"a"===r?a.call(e):a?a.value:t.get(e)};Object.defineProperty(t,"__esModule",{value:!0});const m=r(2197),y=r(3697),f=r(9576),b=r(557),g=r(3300),P=r(3797);class v{constructor(e){var t,r,h,y,k,w;a.set(this,void 0),s.set(this,void 0),o.set(this,void 0),n.set(this,void 0),i.set(this,void 0),c.set(this,void 0),u.set(this,void 0),d.set(this,void 0),l.set(this,void 0),this.blocks={retrieve:e=>this.request({path:b.getBlock.path(e),method:b.getBlock.method,query:(0,f.pick)(e,b.getBlock.queryParams),body:(0,f.pick)(e,b.getBlock.bodyParams),auth:null==e?void 0:e.auth}),update:e=>this.request({path:b.updateBlock.path(e),method:b.updateBlock.method,query:(0,f.pick)(e,b.updateBlock.queryParams),body:(0,f.pick)(e,b.updateBlock.bodyParams),auth:null==e?void 0:e.auth}),delete:e=>this.request({path:b.deleteBlock.path(e),method:b.deleteBlock.method,query:(0,f.pick)(e,b.deleteBlock.queryParams),body:(0,f.pick)(e,b.deleteBlock.bodyParams),auth:null==e?void 0:e.auth}),children:{append:e=>this.request({path:b.appendBlockChildren.path(e),method:b.appendBlockChildren.method,query:(0,f.pick)(e,b.appendBlockChildren.queryParams),body:(0,f.pick)(e,b.appendBlockChildren.bodyParams),auth:null==e?void 0:e.auth}),list:e=>this.request({path:b.listBlockChildren.path(e),method:b.listBlockChildren.method,query:(0,f.pick)(e,b.listBlockChildren.queryParams),body:(0,f.pick)(e,b.listBlockChildren.bodyParams),auth:null==e?void 0:e.auth})}},this.databases={list:e=>this.request({path:b.listDatabases.path(),method:b.listDatabases.method,query:(0,f.pick)(e,b.listDatabases.queryParams),body:(0,f.pick)(e,b.listDatabases.bodyParams),auth:null==e?void 0:e.auth}),retrieve:e=>this.request({path:b.getDatabase.path(e),method:b.getDatabase.method,query:(0,f.pick)(e,b.getDatabase.queryParams),body:(0,f.pick)(e,b.getDatabase.bodyParams),auth:null==e?void 0:e.auth}),query:e=>this.request({path:b.queryDatabase.path(e),method:b.queryDatabase.method,query:(0,f.pick)(e,b.queryDatabase.queryParams),body:(0,f.pick)(e,b.queryDatabase.bodyParams),auth:null==e?void 0:e.auth}),create:e=>this.request({path:b.createDatabase.path(),method:b.createDatabase.method,query:(0,f.pick)(e,b.createDatabase.queryParams),body:(0,f.pick)(e,b.createDatabase.bodyParams),auth:null==e?void 0:e.auth}),update:e=>this.request({path:b.updateDatabase.path(e),method:b.updateDatabase.method,query:(0,f.pick)(e,b.updateDatabase.queryParams),body:(0,f.pick)(e,b.updateDatabase.bodyParams),auth:null==e?void 0:e.auth})},this.pages={create:e=>this.request({path:b.createPage.path(),method:b.createPage.method,query:(0,f.pick)(e,b.createPage.queryParams),body:(0,f.pick)(e,b.createPage.bodyParams),auth:null==e?void 0:e.auth}),retrieve:e=>this.request({path:b.getPage.path(e),method:b.getPage.method,query:(0,f.pick)(e,b.getPage.queryParams),body:(0,f.pick)(e,b.getPage.bodyParams),auth:null==e?void 0:e.auth}),update:e=>this.request({path:b.updatePage.path(e),method:b.updatePage.method,query:(0,f.pick)(e,b.updatePage.queryParams),body:(0,f.pick)(e,b.updatePage.bodyParams),auth:null==e?void 0:e.auth}),properties:{retrieve:e=>this.request({path:b.getPageProperty.path(e),method:b.getPageProperty.method,query:(0,f.pick)(e,b.getPageProperty.queryParams),body:(0,f.pick)(e,b.getPageProperty.bodyParams),auth:null==e?void 0:e.auth})}},this.users={retrieve:e=>this.request({path:b.getUser.path(e),method:b.getUser.method,query:(0,f.pick)(e,b.getUser.queryParams),body:(0,f.pick)(e,b.getUser.bodyParams),auth:null==e?void 0:e.auth}),list:e=>this.request({path:b.listUsers.path(),method:b.listUsers.method,query:(0,f.pick)(e,b.listUsers.queryParams),body:(0,f.pick)(e,b.listUsers.bodyParams),auth:null==e?void 0:e.auth}),me:e=>this.request({path:b.getSelf.path(),method:b.getSelf.method,query:(0,f.pick)(e,b.getSelf.queryParams),body:(0,f.pick)(e,b.getSelf.bodyParams),auth:null==e?void 0:e.auth})},this.comments={create:e=>this.request({path:b.createComment.path(),method:b.createComment.method,query:(0,f.pick)(e,b.createComment.queryParams),body:(0,f.pick)(e,b.createComment.bodyParams),auth:null==e?void 0:e.auth}),list:e=>this.request({path:b.listComments.path(),method:b.listComments.method,query:(0,f.pick)(e,b.listComments.queryParams),body:(0,f.pick)(e,b.listComments.bodyParams),auth:null==e?void 0:e.auth})},this.search=e=>this.request({path:b.search.path(),method:b.search.method,query:(0,f.pick)(e,b.search.queryParams),body:(0,f.pick)(e,b.search.bodyParams),auth:null==e?void 0:e.auth}),p(this,a,null==e?void 0:e.auth,"f"),p(this,s,null!==(t=null==e?void 0:e.logLevel)&&void 0!==t?t:m.LogLevel.WARN,"f"),p(this,o,null!==(r=null==e?void 0:e.logger)&&void 0!==r?r:(0,m.makeConsoleLogger)(P.name),"f"),p(this,n,(null!==(h=null==e?void 0:e.baseUrl)&&void 0!==h?h:"https://api.notion.com")+"/v1/","f"),p(this,i,null!==(y=null==e?void 0:e.timeoutMs)&&void 0!==y?y:6e4,"f"),p(this,c,null!==(k=null==e?void 0:e.notionVersion)&&void 0!==k?k:v.defaultNotionVersion,"f"),p(this,u,null!==(w=null==e?void 0:e.fetch)&&void 0!==w?w:g.default,"f"),p(this,d,null==e?void 0:e.agent,"f"),p(this,l,`notionhq-client/${P.version}`,"f")}async request({path:e,method:t,query:r,body:a,auth:s}){this.log(m.LogLevel.INFO,"request start",{method:t,path:e});const o=a&&0!==Object.entries(a).length?JSON.stringify(a):void 0,p=new URL(`${h(this,n,"f")}${e}`);if(r)for(const[e,t]of Object.entries(r))void 0!==t&&(Array.isArray(t)?t.forEach((t=>p.searchParams.append(e,String(t)))):p.searchParams.append(e,String(t)));const f={...this.authAsHeaders(s),"Notion-Version":h(this,c,"f"),"user-agent":h(this,l,"f")};void 0!==o&&(f["content-type"]="application/json");try{const r=await y.RequestTimeoutError.rejectAfterTimeout(h(this,u,"f").call(this,p.toString(),{method:t.toUpperCase(),headers:f,body:o,agent:h(this,d,"f")}),h(this,i,"f")),a=await r.text();if(!r.ok)throw(0,y.buildRequestError)(r,a);const s=JSON.parse(a);return this.log(m.LogLevel.INFO,"request success",{method:t,path:e}),s}catch(e){if(!(0,y.isNotionClientError)(e))throw e;throw this.log(m.LogLevel.WARN,"request fail",{code:e.code,message:e.message}),(0,y.isHTTPResponseError)(e)&&this.log(m.LogLevel.DEBUG,"failed response body",{body:e.body}),e}}log(e,t,r){(0,m.logLevelSeverity)(e)>=(0,m.logLevelSeverity)(h(this,s,"f"))&&h(this,o,"f").call(this,e,t,r)}authAsHeaders(e){const t={},r=null!=e?e:h(this,a,"f");return void 0!==r&&(t.authorization=`Bearer ${r}`),t}}t.default=v,a=new WeakMap,s=new WeakMap,o=new WeakMap,n=new WeakMap,i=new WeakMap,c=new WeakMap,u=new WeakMap,d=new WeakMap,l=new WeakMap,v.defaultNotionVersion="2022-06-28"},557:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.listComments=t.createComment=t.search=t.createDatabase=t.listDatabases=t.queryDatabase=t.updateDatabase=t.getDatabase=t.appendBlockChildren=t.listBlockChildren=t.deleteBlock=t.updateBlock=t.getBlock=t.getPageProperty=t.updatePage=t.getPage=t.createPage=t.listUsers=t.getUser=t.getSelf=void 0,t.getSelf={method:"get",pathParams:[],queryParams:[],bodyParams:[],path:()=>"users/me"},t.getUser={method:"get",pathParams:["user_id"],queryParams:[],bodyParams:[],path:e=>`users/${e.user_id}`},t.listUsers={method:"get",pathParams:[],queryParams:["start_cursor","page_size"],bodyParams:[],path:()=>"users"},t.createPage={method:"post",pathParams:[],queryParams:[],bodyParams:["parent","properties","icon","cover","content","children"],path:()=>"pages"},t.getPage={method:"get",pathParams:["page_id"],queryParams:["filter_properties"],bodyParams:[],path:e=>`pages/${e.page_id}`},t.updatePage={method:"patch",pathParams:["page_id"],queryParams:[],bodyParams:["properties","icon","cover","archived"],path:e=>`pages/${e.page_id}`},t.getPageProperty={method:"get",pathParams:["page_id","property_id"],queryParams:["start_cursor","page_size"],bodyParams:[],path:e=>`pages/${e.page_id}/properties/${e.property_id}`},t.getBlock={method:"get",pathParams:["block_id"],queryParams:[],bodyParams:[],path:e=>`blocks/${e.block_id}`},t.updateBlock={method:"patch",pathParams:["block_id"],queryParams:[],bodyParams:["embed","type","archived","bookmark","image","video","pdf","file","audio","code","equation","divider","breadcrumb","table_of_contents","link_to_page","table_row","heading_1","heading_2","heading_3","paragraph","bulleted_list_item","numbered_list_item","quote","to_do","toggle","template","callout","synced_block","table"],path:e=>`blocks/${e.block_id}`},t.deleteBlock={method:"delete",pathParams:["block_id"],queryParams:[],bodyParams:[],path:e=>`blocks/${e.block_id}`},t.listBlockChildren={method:"get",pathParams:["block_id"],queryParams:["start_cursor","page_size"],bodyParams:[],path:e=>`blocks/${e.block_id}/children`},t.appendBlockChildren={method:"patch",pathParams:["block_id"],queryParams:[],bodyParams:["children"],path:e=>`blocks/${e.block_id}/children`},t.getDatabase={method:"get",pathParams:["database_id"],queryParams:[],bodyParams:[],path:e=>`databases/${e.database_id}`},t.updateDatabase={method:"patch",pathParams:["database_id"],queryParams:[],bodyParams:["title","description","icon","cover","properties","is_inline","archived"],path:e=>`databases/${e.database_id}`},t.queryDatabase={method:"post",pathParams:["database_id"],queryParams:["filter_properties"],bodyParams:["sorts","filter","start_cursor","page_size","archived"],path:e=>`databases/${e.database_id}/query`},t.listDatabases={method:"get",pathParams:[],queryParams:["start_cursor","page_size"],bodyParams:[],path:()=>"databases"},t.createDatabase={method:"post",pathParams:[],queryParams:[],bodyParams:["parent","properties","icon","cover","title","description","is_inline"],path:()=>"databases"},t.search={method:"post",pathParams:[],queryParams:[],bodyParams:["sort","query","start_cursor","page_size","filter"],path:()=>"search"},t.createComment={method:"post",pathParams:[],queryParams:[],bodyParams:["parent","rich_text","discussion_id"],path:()=>"comments"},t.listComments={method:"get",pathParams:[],queryParams:["block_id","start_cursor","page_size"],bodyParams:[],path:()=>"comments"}},3697:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buildRequestError=t.APIResponseError=t.UnknownHTTPResponseError=t.isHTTPResponseError=t.RequestTimeoutError=t.isNotionClientError=t.ClientErrorCode=t.APIErrorCode=void 0;const a=r(9576);var s,o;!function(e){e.Unauthorized="unauthorized",e.RestrictedResource="restricted_resource",e.ObjectNotFound="object_not_found",e.RateLimited="rate_limited",e.InvalidJSON="invalid_json",e.InvalidRequestURL="invalid_request_url",e.InvalidRequest="invalid_request",e.ValidationError="validation_error",e.ConflictError="conflict_error",e.InternalServerError="internal_server_error",e.ServiceUnavailable="service_unavailable"}(s=t.APIErrorCode||(t.APIErrorCode={})),function(e){e.RequestTimeout="notionhq_client_request_timeout",e.ResponseError="notionhq_client_response_error"}(o=t.ClientErrorCode||(t.ClientErrorCode={}));class n extends Error{}function i(e){return(0,a.isObject)(e)&&e instanceof n}function c(e,t){return i(e)&&e.code in t}t.isNotionClientError=i;class u extends n{constructor(e="Request to Notion API has timed out"){super(e),this.code=o.RequestTimeout,this.name="RequestTimeoutError"}static isRequestTimeoutError(e){return c(e,{[o.RequestTimeout]:!0})}static rejectAfterTimeout(e,t){return new Promise(((r,a)=>{const s=setTimeout((()=>{a(new u)}),t);e.then(r).catch(a).then((()=>clearTimeout(s)))}))}}t.RequestTimeoutError=u;class d extends n{constructor(e){super(e.message),this.name="HTTPResponseError";const{code:t,status:r,headers:a,rawBodyText:s}=e;this.code=t,this.status=r,this.headers=a,this.body=s}}const l={[o.ResponseError]:!0,[s.Unauthorized]:!0,[s.RestrictedResource]:!0,[s.ObjectNotFound]:!0,[s.RateLimited]:!0,[s.InvalidJSON]:!0,[s.InvalidRequestURL]:!0,[s.InvalidRequest]:!0,[s.ValidationError]:!0,[s.ConflictError]:!0,[s.InternalServerError]:!0,[s.ServiceUnavailable]:!0};t.isHTTPResponseError=function(e){return!!c(e,l)};class p extends d{constructor(e){var t;super({...e,code:o.ResponseError,message:null!==(t=e.message)&&void 0!==t?t:`Request to Notion API failed with status: ${e.status}`}),this.name="UnknownHTTPResponseError"}static isUnknownHTTPResponseError(e){return c(e,{[o.ResponseError]:!0})}}t.UnknownHTTPResponseError=p;const h={[s.Unauthorized]:!0,[s.RestrictedResource]:!0,[s.ObjectNotFound]:!0,[s.RateLimited]:!0,[s.InvalidJSON]:!0,[s.InvalidRequestURL]:!0,[s.InvalidRequest]:!0,[s.ValidationError]:!0,[s.ConflictError]:!0,[s.InternalServerError]:!0,[s.ServiceUnavailable]:!0};class m extends d{constructor(){super(...arguments),this.name="APIResponseError"}static isAPIResponseError(e){return c(e,h)}}t.APIResponseError=m,t.buildRequestError=function(e,t){const r=function(e){if("string"!=typeof e)return;let t;try{t=JSON.parse(e)}catch(e){return}if(!(0,a.isObject)(t)||"string"!=typeof t.message||(r=t.code,"string"!=typeof r||!(r in h)))return;var r;return{...t,code:t.code,message:t.message}}(t);return void 0!==r?new m({code:r.code,message:r.message,headers:e.headers,status:e.status,rawBodyText:t}):new p({message:void 0,headers:e.headers,status:e.status,rawBodyText:t})}},1356:(e,t)=>{"use strict";async function*r(e,t){let r=t.start_cursor;do{const a=await e({...t,start_cursor:r});yield*a.results,r=a.next_cursor}while(r)}Object.defineProperty(t,"__esModule",{value:!0}),t.isFullComment=t.isFullUser=t.isFullDatabase=t.isFullPage=t.isFullBlock=t.collectPaginatedAPI=t.iteratePaginatedAPI=void 0,t.iteratePaginatedAPI=r,t.collectPaginatedAPI=async function(e,t){const a=[];for await(const s of r(e,t))a.push(s);return a},t.isFullBlock=function(e){return"type"in e},t.isFullPage=function(e){return"url"in e},t.isFullDatabase=function(e){return"title"in e},t.isFullUser=function(e){return"type"in e},t.isFullComment=function(e){return"created_by"in e}},9267:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isFullComment=t.isFullUser=t.isFullPage=t.isFullDatabase=t.isFullBlock=t.iteratePaginatedAPI=t.collectPaginatedAPI=t.isNotionClientError=t.RequestTimeoutError=t.UnknownHTTPResponseError=t.APIResponseError=t.ClientErrorCode=t.APIErrorCode=t.LogLevel=t.Client=void 0;var a=r(8816);Object.defineProperty(t,"Client",{enumerable:!0,get:function(){return a.default}});var s=r(2197);Object.defineProperty(t,"LogLevel",{enumerable:!0,get:function(){return s.LogLevel}});var o=r(3697);Object.defineProperty(t,"APIErrorCode",{enumerable:!0,get:function(){return o.APIErrorCode}}),Object.defineProperty(t,"ClientErrorCode",{enumerable:!0,get:function(){return o.ClientErrorCode}}),Object.defineProperty(t,"APIResponseError",{enumerable:!0,get:function(){return o.APIResponseError}}),Object.defineProperty(t,"UnknownHTTPResponseError",{enumerable:!0,get:function(){return o.UnknownHTTPResponseError}}),Object.defineProperty(t,"RequestTimeoutError",{enumerable:!0,get:function(){return o.RequestTimeoutError}}),Object.defineProperty(t,"isNotionClientError",{enumerable:!0,get:function(){return o.isNotionClientError}});var n=r(1356);Object.defineProperty(t,"collectPaginatedAPI",{enumerable:!0,get:function(){return n.collectPaginatedAPI}}),Object.defineProperty(t,"iteratePaginatedAPI",{enumerable:!0,get:function(){return n.iteratePaginatedAPI}}),Object.defineProperty(t,"isFullBlock",{enumerable:!0,get:function(){return n.isFullBlock}}),Object.defineProperty(t,"isFullDatabase",{enumerable:!0,get:function(){return n.isFullDatabase}}),Object.defineProperty(t,"isFullPage",{enumerable:!0,get:function(){return n.isFullPage}}),Object.defineProperty(t,"isFullUser",{enumerable:!0,get:function(){return n.isFullUser}}),Object.defineProperty(t,"isFullComment",{enumerable:!0,get:function(){return n.isFullComment}})},2197:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.logLevelSeverity=t.makeConsoleLogger=t.LogLevel=void 0;const a=r(9576);var s;!function(e){e.DEBUG="debug",e.INFO="info",e.WARN="warn",e.ERROR="error"}(s=t.LogLevel||(t.LogLevel={})),t.makeConsoleLogger=function(e){return(t,r,a)=>{console[t](`${e} ${t}:`,r,a)}},t.logLevelSeverity=function(e){switch(e){case s.DEBUG:return 20;case s.INFO:return 40;case s.WARN:return 60;case s.ERROR:return 80;default:return(0,a.assertNever)(e)}}},9576:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isObject=t.pick=t.assertNever=void 0,t.assertNever=function(e){throw new Error(`Unexpected value should never occur: ${e}`)},t.pick=function(e,t){const r=t.map((t=>[t,null==e?void 0:e[t]]));return Object.fromEntries(r)},t.isObject=function(e){return"object"==typeof e&&null!==e}},9009:(e,t,r)=>{"use strict";
/*!
 * http-errors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */var a,s=r(4485)("http-errors"),o=r(6644),n=r(8439),i=r(5717),c=r(2953);function u(e){return Number(String(e).charAt(0)+"00")}function d(e,t){var r=Object.getOwnPropertyDescriptor(e,"name");r&&r.configurable&&(r.value=t,Object.defineProperty(e,"name",r))}function l(e){return"Error"!==e.substr(-5)?e+"Error":e}e.exports=function e(){for(var t,r,a=500,o={},i=0;i<arguments.length;i++){var c=arguments[i],d=typeof c;if("object"===d&&c instanceof Error)a=(t=c).status||t.statusCode||a;else if("number"===d&&0===i)a=c;else if("string"===d)r=c;else{if("object"!==d)throw new TypeError("argument #"+(i+1)+" unsupported type "+d);o=c}}"number"==typeof a&&(a<400||a>=600)&&s("non-error status code; use only 4xx or 5xx status codes");("number"!=typeof a||!n.message[a]&&(a<400||a>=600))&&(a=500);var l=e[a]||e[u(a)];t||(t=l?new l(r):new Error(r||n.message[a]),Error.captureStackTrace(t,e));l&&t instanceof l&&t.status===a||(t.expose=a<500,t.status=t.statusCode=a);for(var p in o)"status"!==p&&"statusCode"!==p&&(t[p]=o[p]);return t},e.exports.HttpError=function(){function e(){throw new TypeError("cannot construct abstract class")}return i(e,Error),e}(),e.exports.isHttpError=(a=e.exports.HttpError,function(e){return!(!e||"object"!=typeof e)&&(e instanceof a||e instanceof Error&&"boolean"==typeof e.expose&&"number"==typeof e.statusCode&&e.status===e.statusCode)}),function(e,t,r){t.forEach((function(t){var a,s=c(n.message[t]);switch(u(t)){case 400:a=function(e,t,r){var a=l(t);function s(e){var t=null!=e?e:n.message[r],i=new Error(t);return Error.captureStackTrace(i,s),o(i,s.prototype),Object.defineProperty(i,"message",{enumerable:!0,configurable:!0,value:t,writable:!0}),Object.defineProperty(i,"name",{enumerable:!1,configurable:!0,value:a,writable:!0}),i}return i(s,e),d(s,a),s.prototype.status=r,s.prototype.statusCode=r,s.prototype.expose=!0,s}(r,s,t);break;case 500:a=function(e,t,r){var a=l(t);function s(e){var t=null!=e?e:n.message[r],i=new Error(t);return Error.captureStackTrace(i,s),o(i,s.prototype),Object.defineProperty(i,"message",{enumerable:!0,configurable:!0,value:t,writable:!0}),Object.defineProperty(i,"name",{enumerable:!1,configurable:!0,value:a,writable:!0}),i}return i(s,e),d(s,a),s.prototype.status=r,s.prototype.statusCode=r,s.prototype.expose=!1,s}(r,s,t)}a&&(e[t]=a,e[s]=a)}))}(e.exports,n.codes,e.exports.HttpError)},4485:e=>{"use strict";
/*!
 * depd
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */function t(e,t){if("function"!=typeof e)throw new TypeError("argument fn must be a function");return e}function r(e,t,r){if(!e||"object"!=typeof e&&"function"!=typeof e)throw new TypeError("argument obj must be object");var a=Object.getOwnPropertyDescriptor(e,t);if(!a)throw new TypeError("must call property on owner object");if(!a.configurable)throw new TypeError("property must be configurable")}e.exports=function(e){if(!e)throw new TypeError("argument namespace is required");function a(e){}return a._file=void 0,a._ignored=!0,a._namespace=e,a._traced=!1,a._warned=Object.create(null),a.function=t,a.property=r,a}},8439:(e,t,r)=>{"use strict";
/*!
 * statuses
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */var a=r(9526);function s(e){if(!Object.prototype.hasOwnProperty.call(o.message,e))throw new Error("invalid status code: "+e);return o.message[e]}function o(e){if("number"==typeof e)return s(e);if("string"!=typeof e)throw new TypeError("code must be a number or string");var t=parseInt(e,10);return isNaN(t)?function(e){var t=e.toLowerCase();if(!Object.prototype.hasOwnProperty.call(o.code,t))throw new Error('invalid status message: "'+e+'"');return o.code[t]}(e):s(t)}e.exports=o,o.message=a,o.code=function(e){var t={};return Object.keys(e).forEach((function(r){var a=e[r],s=Number(r);t[a.toLowerCase()]=s})),t}(a),o.codes=function(e){return Object.keys(e).map((function(e){return Number(e)}))}(a),o.redirect={300:!0,301:!0,302:!0,303:!0,305:!0,307:!0,308:!0},o.empty={204:!0,205:!0,304:!0},o.retry={502:!0,503:!0,504:!0}},5717:e=>{"function"==typeof Object.create?e.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}))}:e.exports=function(e,t){if(t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e}}},3300:(e,t,r)=>{"use strict";var a=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==r.g)return r.g;throw new Error("unable to locate global object")}();e.exports=t=a.fetch,a.fetch&&(t.default=a.fetch.bind(r.g)),t.Headers=a.Headers,t.Request=a.Request,t.Response=a.Response},6644:e=>{"use strict";e.exports=Object.setPrototypeOf||({__proto__:[]}instanceof Array?function(e,t){return e.__proto__=t,e}:function(e,t){for(var r in t)Object.prototype.hasOwnProperty.call(e,r)||(e[r]=t[r]);return e})},2953:e=>{"use strict";
/*!
 * toidentifier
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */e.exports=function(e){return e.split(" ").map((function(e){return e.slice(0,1).toUpperCase()+e.slice(1)})).join("").replace(/[^ _0-9a-z]/gi,"")}},3797:e=>{"use strict";e.exports=JSON.parse('{"name":"@notionhq/client","version":"2.2.3","description":"A simple and easy to use client for the Notion API","engines":{"node":">=12"},"homepage":"https://developers.notion.com/docs/getting-started","bugs":{"url":"https://github.com/makenotion/notion-sdk-js/issues"},"repository":{"type":"git","url":"https://github.com/makenotion/notion-sdk-js/"},"keywords":["notion","notionapi","rest","notion-api"],"main":"./build/src","types":"./build/src/index.d.ts","scripts":{"prepare":"npm run build","prepublishOnly":"npm run checkLoggedIn && npm run lint && npm run test","build":"tsc","prettier":"prettier --write .","lint":"prettier --check . && eslint . --ext .ts && cspell \'**/*\' ","test":"jest ./test","check-links":"git ls-files | grep md$ | xargs -n 1 markdown-link-check","prebuild":"npm run clean","clean":"rm -rf ./build","checkLoggedIn":"./scripts/verifyLoggedIn.sh"},"author":"","license":"MIT","files":["build/package.json","build/src/**"],"dependencies":{"@types/node-fetch":"^2.5.10","node-fetch":"^2.6.1"},"devDependencies":{"@types/jest":"^28.1.4","@typescript-eslint/eslint-plugin":"^5.39.0","@typescript-eslint/parser":"^5.39.0","cspell":"^5.4.1","eslint":"^7.24.0","jest":"^28.1.2","markdown-link-check":"^3.8.7","prettier":"^2.3.0","ts-jest":"^28.0.5","typescript":"^4.8.4"}}')},9526:e=>{"use strict";e.exports=JSON.parse('{"100":"Continue","101":"Switching Protocols","102":"Processing","103":"Early Hints","200":"OK","201":"Created","202":"Accepted","203":"Non-Authoritative Information","204":"No Content","205":"Reset Content","206":"Partial Content","207":"Multi-Status","208":"Already Reported","226":"IM Used","300":"Multiple Choices","301":"Moved Permanently","302":"Found","303":"See Other","304":"Not Modified","305":"Use Proxy","307":"Temporary Redirect","308":"Permanent Redirect","400":"Bad Request","401":"Unauthorized","402":"Payment Required","403":"Forbidden","404":"Not Found","405":"Method Not Allowed","406":"Not Acceptable","407":"Proxy Authentication Required","408":"Request Timeout","409":"Conflict","410":"Gone","411":"Length Required","412":"Precondition Failed","413":"Payload Too Large","414":"URI Too Long","415":"Unsupported Media Type","416":"Range Not Satisfiable","417":"Expectation Failed","418":"I\'m a Teapot","421":"Misdirected Request","422":"Unprocessable Entity","423":"Locked","424":"Failed Dependency","425":"Too Early","426":"Upgrade Required","428":"Precondition Required","429":"Too Many Requests","431":"Request Header Fields Too Large","451":"Unavailable For Legal Reasons","500":"Internal Server Error","501":"Not Implemented","502":"Bad Gateway","503":"Service Unavailable","504":"Gateway Timeout","505":"HTTP Version Not Supported","506":"Variant Also Negotiates","507":"Insufficient Storage","508":"Loop Detected","509":"Bandwidth Limit Exceeded","510":"Not Extended","511":"Network Authentication Required"}')}},t={};function r(a){var s=t[a];if(void 0!==s)return s.exports;var o=t[a]={exports:{}};return e[a].call(o.exports,o,o.exports,r),o.exports}r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{"use strict";var e=r(3300),t=r(9009);const a={from:"auto",to:"en",host:"translate.google.com"};class s{constructor(e,t){this.inputText=e,this.options=Object.assign({},a,t)}async translate(){const t=this.buildUrl(),r=this.buildFetchOptions(),a=await e(t,r);if(!a.ok)throw await this.buildError(a);const s=await a.json();return{text:this.buildResText(s),raw:s}}buildUrl(){const{host:e}=this.options;return[`https://${e}/translate_a/single`,"?client=at","&dt=t","&dt=rm","&dj=1"].join("")}buildBody(){const{from:e,to:t}=this.options,r={sl:e,tl:t,q:this.inputText};return new URLSearchParams(r).toString()}buildFetchOptions(){const{fetchOptions:e}=this.options,t=Object.assign({},e);return t.method="POST",t.headers=Object.assign({},t.headers,{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}),t.body=this.buildBody(),t}buildResText({sentences:e}){return e.filter((e=>"trans"in e)).map((e=>e.trans)).join("")}async buildError(e){if(429===e.status){const a=await e.text(),{ip:s,time:o,url:n}={ip:(r=a).match(/IP address: (.+?)<br>/)?.[1]||"",time:r.match(/Time: (.+?)<br>/)?.[1]||"",url:(r.match(/URL: (.+?)<br>/)?.[1]||"").replace(/&amp;/g,"&")},i=`${e.statusText} IP: ${s}, Time: ${o}, Url: ${n}`;return t(e.status,i)}return t(e.status,e.statusText);var r}}const{Client:o,APIErrorCode:n}=r(9267);function i(e){return new o({auth:e})}async function c(){let e=await chrome.storage.local.get("currentNotion");return e&&e.currentNotion?{id:e.currentNotion.id,title:e.currentNotion.title,token:e.currentNotion.token,databaseId:e.currentNotion.databaseId,matchKeywords:e.currentNotion.matchKeywords}:{title:null,token:null,databaseId:null,matchKeywords:[]}}async function u(e,t){let r,a,s=i(t),o=!1;try{r=await s.databases.query(e),o=!0}catch(e){e.code===n.ObjectNotFound||console.error(e),a=e}return o&&(a={next_cursor:r.next_cursor,has_more:r.has_more},r=await Promise.all(Array.from(r.results,(async e=>(await l(e))[0])))),{result:r,success:o,info:a}}function d(e={},t=[]){let r={};for(const e of t)r[e.key]=e.notionProperties;let a={};for(const t in e)r[t]&&(a[t]={...r[t],value:e[t]});return Object.values(a)}async function l(e){let t={...e.properties},r={nodeName:"#text"};for(const e in t){let a=t[e].type,s=null;"title"==a?s=t[e].title[0]?.plain_text:"rich_text"==a?s=t[e].rich_text[0]?.plain_text:"multi_select"==a?s=Array.from(t[e].multi_select,(e=>({color:e.color,name:e.name,id:e.id}))):"url"==a&&(s=t[e].url),r[e]=s}return r=await function(e={}){return new Promise((async(t,r)=>{let a=await c(),s={_currentNotion:a};for(const t of a.matchKeywords)t.notionProperties&&t.notionProperties.key&&(s[t.key]=e[t.notionProperties.key]);t({...s})}))}(r),r={...r,_id:e.id,_url:e.url},[{...r}]}let p;async function h(e,t){const r=await chrome.storage.sync.get("cfxAddress");r&&r.cfxAddress&&r.cfxAddress.address&&(p=r.cfxAddress.address),p?chrome.tabs.sendMessage(e,{cmd:"mark-run",tabId:e,reply:t},(function(e){console.log(e)})):chrome.tabs.sendMessage(e,{cmd:"login",tabId:e},(function(e){console.log(e)}))}function m(e=[]){let t={};return new Promise((async(r,a)=>{let s=await chrome.storage.local.get("tags");s&&s.tags&&(t={...s.tags}),e&&e.length>0&&(Array.from(e,(e=>{Array.from(e.tags,(r=>{t[r.name]=e}))})),await chrome.storage.local.set({tags:t})),r(t)}))}function y(e){let t={};const{key:r,type:a,value:s}=e;return"title"==a?t={property:r,title:{contains:s}}:"rich_text"==a?t={property:r,rich_text:{contains:s}}:"url"==a?t={property:r,url:{contains:s}}:"multi_select"==a&&(t={property:r,multi_select:{contains:s}}),t}async function f(e){const{notionId:t}=e,{token:r,matchKeywords:a,databaseId:s,title:o,id:c}=await async function(e){let t=await chrome.storage.local.get("notions");if(t&&t.notions&&t.notions[e]){let r=t.notions[e];return{id:r.id,title:r.title,token:r.token,databaseId:r.databaseId,matchKeywords:r.matchKeywords}}return{id:null,title:null,token:null,databaseId:null,matchKeywords:[]}}(t);await async function(e={}){e.id&&e.title&&e.token&&e.databaseId&&e.matchKeywords&&await chrome.storage.local.set({currentNotion:e})}({token:r,matchKeywords:a,databaseId:s,title:o,id:c});let u=function(e){let t={};for(const o of e)r=o.type,a=o.key,s=o.value,"title"==r?t[a]={title:[{type:"text",text:{content:s}}]}:"rich_text"==r?t[a]={rich_text:[{type:"text",text:{content:s}}]}:"url"==r?t[a]={url:s}:"multi_select"==r&&s&&"object"==typeof s&&(t[a]={multi_select:Array.from(s,(e=>({name:e}))).filter((e=>e.name&&"string"==typeof e.name&&e.name.trim()))});var r,a,s;return t}(d(e,a)),p={parent:{database_id:s},properties:{...u}};const{result:h,success:m,info:y}=await async function(e,t){let r,a,s=i(t),o=!1;try{r=await s.pages.create(e),o=!0}catch(e){e.code===n.ObjectNotFound||console.error(e),a=e}return o&&(r=await Promise.all(Array.from([r],(async e=>(await l(e))[0])))),{result:r,success:o,info:a}}(p,r);return{result:h,success:m,info:y}}async function b(e,t,r=100){let{databaseId:a,token:s}=await c(),o={database_id:a,filter:{property:"cfxAddress",rich_text:{equals:e}},page_size:r};t&&(o.start_cursor=t);const{result:n,success:i,info:d}=await u(o,s);return{result:n,success:i,info:d}}async function g(e=null,t=100){let{databaseId:r,token:a,matchKeywords:s}=await c(),o=d({createdAt:"createdAt",tags:"tags"},s),n=[],i={},l=o.filter((e=>"createdAt"===e.value));l[0]&&l[0].key&&(n=[{property:l[0].key,direction:"descending"}]);let p=o.filter((e=>"tags"===e.value));if(p[0]&&p[0].key&&"multi_select"==p[0].type&&(i={property:p[0].key,multi_select:{is_not_empty:!0}}),Object.keys(i).length>0&&n.length>0){let s={database_id:r,filter:i,sorts:n,page_size:t};e&&(s.start_cursor=e);const{result:o,success:c,info:d}=await u(s,a);return{result:o,success:c,info:d}}return{result:[],success:!1,info:"null"}}chrome.runtime.onInstalled.addListener((async()=>{chrome.contextMenus.create({id:"find",title:`${chrome.runtime.getManifest().name} 发现`,type:"normal",contexts:["page"]}),chrome.contextMenus.create({id:"mark",title:`${chrome.runtime.getManifest().name} 标注`,type:"normal",contexts:["selection"]})})),chrome.action.onClicked.addListener((function(e){console.log("browserAction.onClicked")})),chrome.contextMenus.onClicked.addListener((async(e,t)=>{const r=e.menuItemId;console.log(r,e,t),t.url.match("http")&&("find"==r?g().then((({result:e,success:t,info:r})=>m(e||[]))).then((()=>{chrome.tabs.sendMessage(t.id,{cmd:"get-by-pageId-run",tabId:t.id},(function(e){console.log(e)}))})):"mark"==r?await h(t.id):"translate"==r&&chrome.tabs.sendMessage(t.id,{cmd:"translate-run",tabId:t.id},(function(e){console.log(e)})))})),chrome.runtime.onMessage.addListener((async function(e,t,r){const{cmd:a}=e;if("mark-run"==a)chrome.tabs.query({active:!0,currentWindow:!0},(async function(t){await h(t[0].id,e.reply)}));else if("mark-result"==a){const t=await chrome.storage.sync.get("cfxAddress");t&&t.cfxAddress&&t.cfxAddress.address&&(p=t.cfxAddress.address),p?e.data.notionId&&f({...e.data}).then((({result:e,success:t,info:r})=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(a){chrome.tabs.sendMessage(a[0].id,{cmd:"mark-push",data:e,success:t,info:r},(function(e){console.log(e)}))}))})):console.log("请登录")}else if("cfx-address"==a)p=e.data,p&&chrome.storage.sync.set({cfxAddress:{address:p,addressIsCheck:!1}});else if("get-address"==a){const e=await chrome.storage.sync.get("cfxAddress");e&&e.cfxAddress&&e.cfxAddress.address&&(p=e.cfxAddress.address),p&&r(p)}else if("check-cfx-address"==a&&e.data)b(e.data).then((({result:t,success:r,info:a})=>{chrome.storage.local.set({info:{...a,_des:"翻页信息",cmd:"check-cfx-address"}}),chrome.tabs.query({active:!0,currentWindow:!0},(function(s){chrome.tabs.sendMessage(s[0].id,{cmd:"check-cfx-address-result",success:r,info:a,data:t,address:e.data},(function(e){}))}))}));else if("add-notion-token"==a){const{token:t,databaseId:r,contenteditable:a,keywordsSetup:s}=e.data;(async function(e,t,r){const a=i(e);let s,o,c=!1;try{s=await a.databases.retrieve({database_id:t}),c=!0}catch(e){e.code===n.ObjectNotFound||console.error(e),o=e}if(c){const a=s.title[0].plain_text,o=s.url,n=s.properties;let i={};for(const e in n){let t=n[e].type;i[e]={type:t,key:e}}s={token:e,databaseId:t,properties:i,title:a,url:o,id:e+t,keywordsSetup:r}}return{result:s,success:c,info:o}})(t,r,s).then((({result:e,success:t,info:r})=>{t&&(e._contenteditable=a,chrome.storage.local.set({addNotion:e})),chrome.tabs.query({active:!0,currentWindow:!0},(function(e){chrome.tabs.sendMessage(e[0].id,{cmd:"add-notion-token-result",success:t,info:r},(function(e){}))}))}))}else if("get-by-pageId"==a){const{url:t}=e.data;t.match("http")&&async function(e={}){let{databaseId:t,token:r,matchKeywords:a,title:s}=await c(),o=d(e,a);const{result:n,success:i,info:l}=await u({database_id:t,filter:o[0]?y(o[0]):{}},r);return{result:n,success:i,info:l}}(e.data).then((({result:e,info:t,success:r})=>{m(e||[]).then((a=>{e=Array.from(e,(e=>(e.relate=Array.from(e.tags,(e=>a[e.name])).filter((t=>t&&t.url!=e.url)),e))),chrome.tabs.query({active:!0,currentWindow:!0},(function(a){chrome.tabs.sendMessage(a[0].id,{cmd:"get-by-pageId-result",data:e,info:t,success:r},(function(e){console.log(e)}))}))}))}))}else if("new-reply"==a){let t=e.start_cursor,r=e.page_size||100;e.isMy&&e.address?b(e.address,t,r).then((({result:e,success:t,info:r})=>{m(e||[]),chrome.tabs.query({active:!0,currentWindow:!0},(function(a){chrome.tabs.sendMessage(a[0].id,{cmd:"new-reply-result",data:e,success:t,info:r},(function(e){console.log(e)}))}))})):async function(e=null,t,r=100){let a,{databaseId:s,token:o,matchKeywords:n,title:i}=await c(),d={};for(const e of n)e.notionProperties&&e.notionProperties.key&&(d[e.key]={...e.notionProperties});d.createdAt&&(a=[{property:d.createdAt.key,direction:"descending"}]);let l={and:[]};d.reply&&l.and.push({property:d.reply.key,rich_text:{is_not_empty:!0}}),"this_week"==e?(l.and.push({timestamp:"created_time",created_time:{this_week:{}}}),d.tags&&(a=[{property:d.tags.key,direction:"ascending"}])):"past_week"==e&&(l.and.push({timestamp:"created_time",created_time:{past_week:{}}}),d.tags&&(a=[{property:d.tags.key,direction:"ascending"}]));let p={database_id:s,page_size:r};l&&(p.filter=l),a&&(p.sorts=a),t&&(p.start_cursor=t);const{result:h,success:m,info:y}=await u(p,o);return{result:h,success:m,info:y}}(e.timestamp,t,r).then((({result:e,success:t,info:r})=>{m(e||[]),chrome.tabs.query({active:!0,currentWindow:!0},(function(a){chrome.tabs.sendMessage(a[0].id,{cmd:"new-reply-result",data:e,success:t,info:r},(function(e){console.log(e)}))}))}))}else if("open-login"==a)chrome.tabs.create({url:chrome.runtime.getURL("newtab.html")});else if("open-option-page"==a)chrome.tabs.create({url:chrome.runtime.getURL("options.html")},(function(e){}));else if("get-all-tags"==a){g(e.data&&e.data.start_cursor?e.data.start_cursor:void 0,e.data&&e.data.page_size?e.data.page_size:100).then((({result:e,success:t,info:r})=>{chrome.storage.local.set({info:{...r,_des:"翻页信息",cmd:"get-all-tags"}}),m(e||[])}))}else if("find-by-tag"==a&&e.data)(async function(e,t=5){let{databaseId:r,token:a,matchKeywords:s}=await c(),o=d({createdAt:"createdAt",tags:"tags"},s),n=[],i={},l=o.filter((e=>"createdAt"===e.value));l[0]&&l[0].key&&(n=[{property:l[0].key,direction:"descending"}]);let p=o.filter((e=>"tags"===e.value));p[0]&&p[0].key&&"multi_select"==p[0].type&&(i={property:p[0].key,multi_select:{contains:e}});const{result:h,success:m,info:y}=await u({database_id:r,filter:i,sorts:n,page_size:t},a);return{result:h,success:m,info:y}})(e.data,e.pageSize).then((({result:e,success:t,info:r})=>{m(e||[]),chrome.tabs.query({active:!0,currentWindow:!0},(function(a){chrome.tabs.sendMessage(a[0].id,{cmd:"new-reply-result",data:e,success:t,info:r},(function(e){console.log(e)}))}))}));else if("translate"===a&&e.data){const t=e.data;let r,a,o=!1;try{const{text:e}=await async function(e,t){return new s(e,t).translate()}(t,{to:"zh"});o=!0,r={zh:e,en:t}}catch(e){a=e}e.storageOnChanged?chrome.storage.local.set({translate:{...r,success:o,info:a}}):chrome.tabs.query({active:!0,currentWindow:!0},(function(e){chrome.tabs.sendMessage(e[0].id,{cmd:"translate-result",data:r,success:o,info:a},(function(e){console.log(e)}))}))}else if("download-something"===a);else if("set-badge-text"==a){const t=e.data;chrome.action.setBadgeText({text:t.text}),chrome.action.setBadgeBackgroundColor({color:t.color||[0,0,0,255]})}r("我是后台，我已收到你的消息："+JSON.stringify(e))}))})()})();