(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3901435b"],{"0481":function(t,e,i){"use strict";var a=i("23e7"),s=i("a2bf"),n=i("7b0b"),r=i("07fa"),o=i("5926"),c=i("65f0");a({target:"Array",proto:!0},{flat:function(){var t=arguments.length?arguments[0]:void 0,e=n(this),i=r(e),a=c(e,0);return a.length=s(a,e,e,i,0,void 0===t?1:o(t)),a}})},"04d1":function(t,e,i){"use strict";var a=i("342f"),s=a.match(/firefox\/(\d+)/i);t.exports=!!s&&+s[1]},"0d67":function(t,e,i){"use strict";i("705b")},"0ecf":function(t,e,i){!function(e,i){t.exports=i()}(0,(function(){"use strict";var t="minute",e=/[+-]\d\d(?::?\d\d)?/g,i=/([+-]|\d\d)/g;return function(a,s,n){var r=s.prototype;n.utc=function(t){var e={date:t,utc:!0,args:arguments};return new s(e)},r.utc=function(e){var i=n(this.toDate(),{locale:this.$L,utc:!0});return e?i.add(this.utcOffset(),t):i},r.local=function(){return n(this.toDate(),{locale:this.$L,utc:!1})};var o=r.parse;r.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),o.call(this,t)};var c=r.init;r.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds()}else c.call(this)};var u=r.utcOffset;r.utcOffset=function(a,s){var n=this.$utils().u;if(n(a))return this.$u?0:n(this.$offset)?u.call(this):this.$offset;if("string"==typeof a&&(a=function(t){void 0===t&&(t="");var a=t.match(e);if(!a)return null;var s=(""+a[0]).match(i)||["-",0,0],n=s[0],r=60*+s[1]+ +s[2];return 0===r?0:"+"===n?r:-r}(a),null===a))return this;var r=Math.abs(a)<=16?60*a:a,o=this;if(s)return o.$offset=r,o.$u=0===a,o;if(0!==a){var c=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(o=this.local().add(r+c,t)).$offset=r,o.$x.$localOffset=c}else o=this.utc();return o};var l=r.format;r.format=function(t){var e=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return l.call(this,e)},r.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*t},r.isUTC=function(){return!!this.$u},r.toISOString=function(){return this.toDate().toISOString()},r.toString=function(){return this.toDate().toUTCString()};var d=r.toDate;r.toDate=function(t){return"s"===t&&this.$offset?n(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():d.call(this)};var f=r.diff;r.diff=function(t,e,i){if(t&&this.$u===t.$u)return f.call(this,t,e,i);var a=this.local(),s=n(t).local();return f.call(a,s,e,i)}}}))},"12d4":function(t){t.exports=JSON.parse('["蝶恋花","龙争虎斗","长安城","幽月轮","斗转星移","剑胆琴心","乾坤一掷","唯我独尊","梦江南","绝代天骄","天鹅坪","破阵子","飞龙在天","青梅煮酒","共結來緣","傲血戰意","巔峰再起","江海雲夢","英雄客","自当狂","九万里","万象长安","山海相逢","有人赴约","眉间雪"]')},1953:function(t,e,i){!function(e,i){t.exports=i()}(0,(function(){"use strict";var t={year:0,month:1,day:2,hour:3,minute:4,second:5},e={};return function(i,a,s){var n,r=function(t,i,a){void 0===a&&(a={});var s=new Date(t),n=function(t,i){void 0===i&&(i={});var a=i.timeZoneName||"short",s=t+"|"+a,n=e[s];return n||(n=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",timeZoneName:a}),e[s]=n),n}(i,a);return n.formatToParts(s)},o=function(e,i){for(var a=r(e,i),n=[],o=0;o<a.length;o+=1){var c=a[o],u=c.type,l=c.value,d=t[u];d>=0&&(n[d]=parseInt(l,10))}var f=n[3],h=24===f?0:f,m=n[0]+"-"+n[1]+"-"+n[2]+" "+h+":"+n[4]+":"+n[5]+":000",v=+e;return(s.utc(m).valueOf()-(v-=v%1e3))/6e4},c=a.prototype;c.tz=function(t,e){void 0===t&&(t=n);var i=this.utcOffset(),a=this.toDate(),r=a.toLocaleString("en-US",{timeZone:t}),o=Math.round((a-new Date(r))/1e3/60),c=s(r,{locale:this.$L}).$set("millisecond",this.$ms).utcOffset(15*-Math.round(a.getTimezoneOffset()/15)-o,!0);if(e){var u=c.utcOffset();c=c.add(i-u,"minute")}return c.$x.$timezone=t,c},c.offsetName=function(t){var e=this.$x.$timezone||s.tz.guess(),i=r(this.valueOf(),e,{timeZoneName:t}).find((function(t){return"timezonename"===t.type.toLowerCase()}));return i&&i.value};var u=c.startOf;c.startOf=function(t,e){if(!this.$x||!this.$x.$timezone)return u.call(this,t,e);var i=s(this.format("YYYY-MM-DD HH:mm:ss:SSS"),{locale:this.$L});return u.call(i,t,e).tz(this.$x.$timezone,!0)},s.tz=function(t,e,i){var a=i&&e,r=i||e||n,c=o(+s(),r);if("string"!=typeof t)return s(t).tz(r);var u=function(t,e,i){var a=t-60*e*1e3,s=o(a,i);if(e===s)return[a,e];var n=o(a-=60*(s-e)*1e3,i);return s===n?[a,s]:[t-60*Math.min(s,n)*1e3,Math.max(s,n)]}(s.utc(t,a).valueOf(),c,r),l=u[0],d=u[1],f=s(l).utcOffset(d);return f.$x.$timezone=r,f},s.tz.guess=function(){return Intl.DateTimeFormat().resolvedOptions().timeZone},s.tz.setDefault=function(t){n=t}}}))},"238b":function(t){t.exports=JSON.parse('{"龙子":{"id":5733,"itemId":"8_5733"},"龙子·燕歌":{"id":27803,"itemId":"8_27803"},"龙子·潮生":{"id":27824,"itemId":"8_27824"},"龙子·踏莎":{"id":27845,"itemId":"8_27845"},"麟驹":{"id":5739,"itemId":"8_5739"},"麟驹·燕歌":{"id":27800,"itemId":"8_27800"},"麟驹·潮生":{"id":27821,"itemId":"8_27821"},"麟驹·踏莎":{"id":27842,"itemId":"8_27842"},"绝尘":{"id":5866,"itemId":"8_5866"},"绝尘·燕歌":{"id":27797,"itemId":"8_27797"},"绝尘·潮生":{"id":27818,"itemId":"8_27818"},"绝尘·踏莎":{"id":27839,"itemId":"8_27839"},"赤蛇":{"id":5869,"itemId":"8_5869"},"赤蛇·燕歌":{"id":27792,"itemId":"8_27792"},"赤蛇·潮生":{"id":27815,"itemId":"8_27815"},"赤蛇·踏莎":{"id":27836,"itemId":"8_27836"},"闪电":{"id":5872,"itemId":"8_5872"},"闪电·燕歌":{"id":27791,"itemId":"8_27791"},"闪电·潮生":{"id":27812,"itemId":"8_27812"},"闪电·踏莎":{"id":27833,"itemId":"8_27833"},"里飞沙·踏秋":{"id":5875,"itemId":"8_5875"},"赤兔·飞虹":{"id":28811,"itemId":"8_28811"},"赤兔":{"id":28811,"itemId":"8_28811"},"的卢":{"id":38642,"itemId":"8_38642"}}')},"24cf":function(t,e,i){"use strict";var a=i("5a0c"),s=i.n(a),n=i("0ecf"),r=i.n(n),o=i("1953"),c=i.n(o),u=i("83dc"),l=i.n(u),d=i("5e77d"),f=i.n(d),h=i("e418"),m=i.n(h);s.a.extend(r.a),s.a.extend(c.a),s.a.extend(f.a),s.a.extend(l.a),s.a.extend(m.a);var v="Asia/Shanghai";s.a.tz.setDefault(v),e["a"]=s.a},"256e":function(t,e,i){"use strict";i("bcb9")},4069:function(t,e,i){"use strict";var a=i("44d2");a("flat")},"498a":function(t,e,i){"use strict";var a=i("23e7"),s=i("58a8").trim,n=i("c8d2");a({target:"String",proto:!0,forced:n("trim")},{trim:function(){return s(this)}})},"4e82":function(t,e,i){"use strict";var a=i("23e7"),s=i("e330"),n=i("59ed"),r=i("7b0b"),o=i("07fa"),c=i("083a"),u=i("577e"),l=i("d039"),d=i("addb"),f=i("a640"),h=i("04d1"),m=i("d998"),v=i("2d00"),p=i("512ce"),g=[],y=s(g.sort),_=s(g.push),b=l((function(){g.sort(void 0)})),D=l((function(){g.sort(null)})),C=f("sort"),k=!l((function(){if(v)return v<70;if(!(h&&h>3)){if(m)return!0;if(p)return p<603;var t,e,i,a,s="";for(t=65;t<76;t++){switch(e=String.fromCharCode(t),t){case 66:case 69:case 70:case 72:i=3;break;case 68:case 71:i=4;break;default:i=2}for(a=0;a<47;a++)g.push({k:e+a,v:i})}for(g.sort((function(t,e){return e.v-t.v})),a=0;a<g.length;a++)e=g[a].k.charAt(0),s.charAt(s.length-1)!==e&&(s+=e);return"DGBEFHACIJK"!==s}})),x=b||!D||!C||!k,I=function(t){return function(e,i){return void 0===i?-1:void 0===e?1:void 0!==t?+t(e,i)||0:u(e)>u(i)?1:-1}};a({target:"Array",proto:!0,forced:x},{sort:function(t){void 0!==t&&n(t);var e=r(this);if(k)return void 0===t?y(e):y(e,t);var i,a,s=[],u=o(e);for(a=0;a<u;a++)a in e&&_(s,e[a]);d(s,I(t)),i=o(s),a=0;while(a<i)e[a]=s[a++];while(a<u)c(e,a++);return e}})},"4ec9":function(t,e,i){"use strict";i("6f48")},"512ce":function(t,e,i){"use strict";var a=i("342f"),s=a.match(/AppleWebKit\/(\d+)\./);t.exports=!!s&&+s[1]},"55dc":function(t,e,i){},"58e7":function(t,e,i){"use strict";i("55dc")},"5e77d":function(t,e,i){!function(e,i){t.exports=i()}(0,(function(){"use strict";var t="day";return function(e,i,a){var s=function(e){return e.add(4-e.isoWeekday(),t)},n=i.prototype;n.isoWeekYear=function(){return s(this).year()},n.isoWeek=function(e){if(!this.$utils().u(e))return this.add(7*(e-this.isoWeek()),t);var i,n,r,o,c=s(this),u=(i=this.isoWeekYear(),n=this.$u,r=(n?a.utc:a)().year(i).startOf("year"),o=4-r.isoWeekday(),r.isoWeekday()>4&&(o+=7),r.add(o,t));return c.diff(u,"week")+1},n.isoWeekday=function(t){return this.$utils().u(t)?this.day()||7:this.day(this.day()%7?t:t-7)};var r=n.startOf;n.startOf=function(t,e){var i=this.$utils(),a=!!i.u(e)||e;return"isoweek"===i.p(t)?a?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):r.bind(this)(t,e)}}}))},6231:function(t,e,i){"use strict";i.r(e);var a=i("5530"),s=(i("4de4"),i("b0c0"),i("d3b7"),function(){var t=this,e=t._self._c;return e("div",{staticClass:"horse-home-wrapper"},[e("CommonToolbar",{ref:"toolbar",staticClass:"m-horse-tabs",attrs:{active:t.active,color:"#d16400",search:"",types:t.list},on:{update:t.updateToolbar},scopedSlots:t._u([{key:"filter",fn:function(){return[e("div",{staticClass:"u-filter"},[e("el-popover",{ref:"popover",attrs:{placement:t.isPhone?"right":"bottom",width:!t.isPhone&&420,trigger:"click"}},[e("div",{staticClass:"filter-content"},[t._l(t.searchType,(function(i,a){return e("div",{key:a,staticClass:"filter-item"},[e("div",{staticClass:"check-box-wrapper"},[e("div",{staticClass:"name"},[t._v(t._s(i.name))]),e("el-checkbox-group",{model:{value:t.searchType[a].checked,callback:function(e){t.$set(t.searchType[a],"checked",e)},expression:"searchType[i].checked"}},t._l(i.list,(function(t){return e("el-checkbox-button",{key:t.value,attrs:{label:t.label}})})),1)],1)])})),e("el-row",[e("el-col",{attrs:{offset:20,span:4}},[e("el-button",{attrs:{size:"mini",type:"info",plain:""},on:{click:t.reset}},[t._v("重置")])],1)],1)],2),e("template",{slot:"reference"},[e("svg",{attrs:{width:"40",height:"40",viewBox:"0 0 40 40",fill:"none",xmlns:"http://www.w3.org/2000/svg","svg-inline":"",role:"presentation",focusable:"false",tabindex:"-1"},on:{click:function(e){t.filter=!0}}},[e("rect",{attrs:{width:"40",height:"40",rx:"20",fill:"transparent"}}),e("path",{attrs:{d:"M12.25 13.61C14.27 16.2 18 21 18 21v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39a.998.998 0 00-.79-1.61H13.04c-.83 0-1.3.95-.79 1.61z",fill:"tranparent"}})])])],2)],1)]},proxy:!0}])}),e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],ref:"listRef",staticClass:"m-horse-content"},[""===t.active?["std"===t.client?e("HorseBroadcastV2"):t._e(),t._l(t.typeList,(function(i,s){return e("div",{key:s,staticClass:"m-list-wrapper"},[i.list&&i.list.length?[e("CardBannerList",{attrs:{count:t.count,data:Object(a["a"])(Object(a["a"])({},t.itemData),{},{type:i.type}),items:i.list},on:{"update:load":t.handleLoad},scopedSlots:t._u([{key:"title",fn:function(){return[e("div",[t._v(t._s(i.name))])]},proxy:!0},{key:"action",fn:function(){return[e("div",{attrs:{v:i.value},on:{click:function(e){return t.clickTabs(i.value)}}},[t._v("查看全部")])]},proxy:!0},{key:"default",fn:function(a){var s=a.item;return[2!==i.type?[e("HorseCard",{key:s.ID,attrs:{item:s,reporter:{aggregate:t.listId(t.list)}}})]:[e("SameItem",{key:s.ID,attrs:{item:s,reporter:{aggregate:t.listId(t.list)}}})]]}}],null,!0)})]:t._e()],2)}))]:e("div",{staticClass:"m-horse-list"},[e("div",{staticClass:"u-type u-all-type"},[e("div",{staticClass:"u-title"},[t._v(t._s(t.typeName))]),""!==t.active?e("div",{staticClass:"m-operate"},t._l(t.showTypes,(function(i){return e("div",{key:i.value,staticClass:"m-item",class:t.showType===i.value&&"active",on:{click:function(e){t.showType=i.value}}},[t._v(" "+t._s(i.label)+" ")])})),0):t._e()]),t.subList.length?["card"===t.showType?e("div",{staticClass:"m-horse-list--card"},[2!==t.active?t._l(t.subList,(function(i){return e("HorseCard",{key:i.ID,style:t.isPhone?"":"width: calc(100% / ".concat(t.count," - 20px)"),attrs:{item:i,reporter:{aggregate:t.listId(t.subList)}}})})):t._l(t.subList,(function(i){return e("SameItem",{key:i.ID,style:t.isPhone?"":"width: calc(100% / ".concat(t.count," - 20px)"),attrs:{item:i,reporter:{aggregate:t.listId(i.list)}}})}))],2):t._e(),"list"===t.showType?e("div",{staticClass:"m-horse-list--list"},[e("ListHead"),t._l(t.subList,(function(i){return e("HorseItem",{key:i.ID,attrs:{item:i,reporter:{aggregate:t.listId(t.subList)}}})}))],2):t._e()]:t._e(),e("el-button",{directives:[{name:"show",rawName:"v-show",value:t.hasNextPage,expression:"hasNextPage"}],staticClass:"m-archive-more",attrs:{type:"primary",plain:"",loading:t.loading,icon:"el-icon-arrow-down"},on:{click:t.appendPage}},[t._v("加载更多")]),e("el-pagination",{staticClass:"m-archive-pages",attrs:{background:"",layout:"total, prev, pager, next, jumper","hide-on-single-page":!0,"page-size":t.per,total:t.total,"current-page":t.page},on:{"current-change":t.changePage}})],2)],2)],1)}),n=[],r=(i("7db0"),i("c740"),i("a15b"),i("d81d"),i("14d9"),i("fb6a"),i("ac1f"),i("841c"),i("159b"),i("f252")),o=i("c42f"),c=i("e5d7"),u=(i("a9e3"),function(){var t=this,e=t._self._c;return e("div",{staticClass:"m-horse-broadcast"},[e("div",{staticClass:"m-horse-broadcast__header"},[e("div",{staticClass:"u-title"},[t._v("抓马播报")]),e("el-select",{staticClass:"u-select",attrs:{placeholder:"请选择服务器",size:"mini"},model:{value:t.server,callback:function(e){t.server=e},expression:"server"}},t._l(t.servers,(function(t){return e("el-option",{key:t,attrs:{label:t,value:t}})})),1)],1),t.listData.length&&t.listData[t.active].map_id?e("div",{staticClass:"m-horse-broadcast__list"},[e("jx3box-map",{key:t.listData[t.active].map_id,staticClass:"u-horse-map",attrs:{mapId:Number(t.listData[t.active].map_id),overview:!1,datas:t.listData[t.active].mapDatas&&t.listData[t.active].mapDatas[t.listData[t.active].map_id]||[]}}),e("div",{staticClass:"m-list"},[t._l(t.listData,(function(i,a){return e("div",{key:a,staticClass:"m-item"},[i.is_chitu?t._e():e("div",{staticClass:"m-horse",class:{active:t.active===a},on:{click:function(e){return t.changeHorse(i,a)}}},[i.fromTime?e("div",{staticClass:"u-col u-times",class:"foreshow"===i.subtype&&"u-times-lately"},[e("span",[t._v(t._s(i.fromTime))]),e("span",[t._v(" ~ ")]),e("span",[t._v(t._s(i.toTime))])]):t._e(),e("span",{staticClass:"u-col u-name"},[t._v(t._s(i.map_name))]),i.horses&&i.horses.length?e("div",{staticClass:"u-col"},t._l(t.horseList(i),(function(i){return e("div",{key:i,staticClass:"u-horse",on:{click:function(e){return t.go(i)}}},[e("el-tooltip",{staticClass:"item",attrs:{effect:"dark",content:i,placement:"top"}},[e("el-image",{staticClass:"u-image",attrs:{src:t.getImgSrc(i)}},[e("div",{staticClass:"image-slot",attrs:{slot:"error"},slot:"error"},[e("img",{attrs:{src:t.getImgSrc(i,!0)},on:{error:t.replaceByDefault}})])])],1)],1)})),0):t._e()])])})),t.hasExist?e("div",{staticClass:"m-horse is-chitu"},[e("div",{staticClass:"u-col u-times"},[e("div",[t._v("本CD赤兔已刷新")]),e("div",[t._v(t._s(t.existData.time))])]),e("span",{staticClass:"u-col u-name"},[t._v(t._s(t.existData.map_name))]),e("div",{staticClass:"u-col u-horse"},[e("el-image",{staticClass:"item",attrs:{src:t.getImgSrc("赤兔")}})],1)]):e("span",{staticClass:"m-horse no-horse"},[t._v("本CD赤兔尚未刷新")]),t.diluHasExist?e("div",{staticClass:"m-horse is-dilu"},[e("div",{staticClass:"u-col u-times"},[e("div",[t._v("本周的卢已刷新")]),e("div",[t._v(t._s(t.diluExistData.time))])]),e("span",{staticClass:"u-col u-name"},[t._v(t._s(t.diluExistData.map_name))]),e("div",{staticClass:"u-col u-horse"},[e("el-image",{staticClass:"item",attrs:{src:t.getImgSrc("的卢")}})],1)]):e("span",{staticClass:"m-horse no-horse"},[t._v("本周的卢尚未刷新")])],2)],1):e("div",{staticClass:"w-no-data"},[t._v(t._s(t.server)+" 暂无播报")])])}),l=[],d=i("3835"),f=(i("99af"),i("cb29"),i("0481"),i("4e82"),i("4069"),i("4ec9"),i("25f0"),i("3ca3"),i("466d"),i("498a"),i("ddb0"),i("abab")),h=i("c9d2"),m=i("12d4"),v=i("a59a"),p=i("ef56"),g=i("238b"),y=i("24cf"),_={name:"HorseBroadcast",components:{Jx3boxMap:f["a"]},inject:["__imgRoot2"],data:function(){return{list:[],timer:null,server:"",chituMap:{"方问":411,"小赤":216,"杨新":411},hasExist:!1,existData:{},chituTip:"\n                <p>CD: 周二7点 ~ 下周一7点。</p>\n                <p>地图: 黑戈壁、阴山大草原、鲲鹏岛。</p>\n                <p>必备: <卦文龟甲>交大战时有几率获得，赤兔刷新后再到信使处领取，有效期7天。</p>\n            ",chituLoading:!1,active:0,diluHasExist:!1,diluExistData:{}}},computed:{params:function(){return{pageIndex:1,pageSize:50,type:"horse",server:this.server}},client:function(){return this.$store.state.client},servers:function(){return"std"==this.client?m:v},listData:function(){var t=this,e=Math.floor((document.body.clientWidth-460)/350);e=e>2?2:e;var i=this.list||[],a=this.isPhone?[]:new Array(4*e-1-i.length).fill({});return i=i.sort((function(e,i){return t.convertTime(e.fromTime)-t.convertTime(i.fromTime)})),i.concat(a)||[]},isPhone:function(){return document.documentElement.clientWidth<=820}},watch:{server:function(){this.list=[],this.existData={},this.getGameReporter(),this.loadChituData(),this.loadDiluData()}},methods:{loadDiluData:function(){var t=this,e=this.server,i="dilu-horse";this.chituLoading=!0,Object(r["e"])(i,e).then((function(e){var i,a,s=(null===(i=e.data)||void 0===i||null===(a=i.data)||void 0===a?void 0:a.list)||[];if(s.length){var n=y["a"].tz((null===s||void 0===s?void 0:s[0].created_at)||y["a"].tz()),r=y["a"].tz(),o=r.day(),c=r.day(1).hour(10).minute(0).second(0).millisecond(0),u=c.add(1,"week").add(-10,"hour").add(-1,"millisecond");o<1&&(c=y["a"].tz(c).add(-1,"week"),u=y["a"].tz(u).add(-1,"week"));var l=y["a"].tz(n).isBetween(c,u);if(t.diluHasExist=l,l){var d,f=(null===s||void 0===s||null===(d=s[0])||void 0===d?void 0:d.content)||"",h=f.match(/的卢已经出现在(\S*)中/)?f.match(/的卢已经出现在(\S*)中/)[1]:"";t.diluExistData={map_name:h,time:y["a"].tz(n).format("YYYY-MM-DD HH:mm:ss")}}}})).finally((function(){t.chituLoading=!1}))},loadChituData:function(){var t=this,e=this.server,i="chitu-horse";this.chituLoading=!0,Object(r["e"])(i,e).then((function(e){var i,s,n,r,o=(null===(i=e.data)||void 0===i||null===(s=i.data)||void 0===s?void 0:s.list)||[],c=(null===o||void 0===o||null===(n=o[0])||void 0===n?void 0:n.content)||"",u=/\]\[(.*)\]大声喊/.exec(c)[1].trim()||"",l=216,d=(null===(r=t.chituMap)||void 0===r?void 0:r[u])||l,f=p[d],h={},m=f.coordinates[0],v=["赤兔·飞虹"],g=f.mapName;h[d]=[Object(a["a"])({content:"".concat(v.join(),"\n                    <br />坐标：(").concat(m.x,",").concat(m.y,",").concat(m.z,")")},m)];var _=y["a"].tz((null===o||void 0===o?void 0:o[0].created_at)||y["a"].tz()),b=y["a"].tz(),D=b.day(),C=b.hour(),k=b.day(2).hour(7).minute(0).second(0).millisecond(0),x=k.add(1,"week").add(-1,"millisecond");(D<=1||2===D&&C<7)&&(k=y["a"].tz(k).add(-1,"week"),x=y["a"].tz(x).add(-1,"week"));var I=y["a"].tz(_).isBetween(k,x);t.hasExist=I;var w={horses:v,map_name:g,map_id:d+"",mapDatas:h,is_chitu:!0,time:""};I&&(w.time=y["a"].tz(_).format("YYYY-MM-DD HH:mm:ss")),t.existData=w})).finally((function(){t.chituLoading=!1}))},replaceByDefault:function(t){t.target.src=i("d47d")},go:function(t){var e,i=(null===(e=g[t])||void 0===e?void 0:e.itemId)||0,a=1;this.$router.push({path:"".concat(i),query:{type:a}})},getImgSrc:function(t){var e,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=i?this.client:"std",s=(null===(e=g[t])||void 0===e?void 0:e.id)||0;return this.__imgRoot2+"".concat(a,"/")+s+".png"},getOriginDatas:function(t){var e="",i="",s=[],n={},r=[];if("npc_chat"===t.subtype)e=t.map_id,i=t.map_name,s=p[e].coordinates,r=p[e].horses[t.horseIndex];else for(var o in i=t.content.match(/在(\S*)出没/)?t.content.match(/在(\S*)出没/)[1]:"",p)p[o].mapName===i&&(e=o,s=p[o].coordinates,r=p[e].horses.flat());var c=s[0];n[e]=[Object(a["a"])({content:"".concat(r.join(),"\n                    <br />坐标：(").concat(c.x,",").concat(c.y,",").concat(c.z,")")},c)];var u={mapDatas:n,map_id:e,map_name:i,horses:r};return u},getGameReporter:function(){var t=this,e=this.params;Object(r["c"])(e).then((function(e){var i,s=null===e||void 0===e||null===(i=e.data)||void 0===i?void 0:i.data,n=(null===s||void 0===s?void 0:s.list)||[],r=new Map,o=n.filter((function(t){return t.map_id&&!r.has(t.map_id)&&r.set(t.map_id,1)})),c=n.filter((function(t){return!t.map_id&&((new Date).valueOf()-new Date(t.created_at).valueOf())/1e3/60<=15})),u=[];o.forEach((function(t){t.content.split("\n\n").forEach((function(e,i){if(e&&(e.match(/还有(\S*)分钟/)||e.match("即将出世"))){var s=e.match(/还有(\S*)分钟/)?Number(e.match(/还有(\S*)分钟/)[1]):0,n=new Date(t.created_at).valueOf()+60*(s+15)*1e3>=(new Date).valueOf();n&&u.push(Object(a["a"])(Object(a["a"])({},t),{},{id:i?Number(i+t.id.toString()):t.id,content:e,minute:s,horseIndex:i}))}}))}));var l=u.concat(c);t.list=l.map((function(e){var i="",s="";return"minute"in e?(i=y["a"].tz(new Date(e.created_at).valueOf()+60*(e.minute+5)*1e3).format("HH:mm"),s=y["a"].tz(new Date(e.created_at).valueOf()+60*(e.minute+10)*1e3).format("HH:mm")):(i=y["a"].tz(new Date(e.created_at).valueOf()+3e5).format("HH:mm"),s=y["a"].tz(new Date(e.created_at).valueOf()+6e5).format("HH:mm")),Object(a["a"])(Object(a["a"])(Object(a["a"])({},e),t.getOriginDatas(e)),{},{fromTime:i,toTime:s})}))}))},convertTime:function(t){var e=t.split(":").map(Number),i=Object(d["a"])(e,2),a=i[0],s=i[1];return 60*a+s},horseList:function(t){return this.isPhone?t.horses:t.horses.slice(0,3)},changeHorse:function(t,e){t.map_id&&(this.active=e)}},mounted:function(){var t=this;h["a"].isLogin()?Object(r["g"])().then((function(e){var i,a;t.server=(null===(i=e.data)||void 0===i||null===(a=i.data)||void 0===a?void 0:a.jx3_server)||"梦江南"})):this.server="梦江南",this.timer=setInterval((function(){t.getGameReporter()}),3e4)},beforeDestroy:function(){clearInterval(this.timer),this.timer=null}},b=_,D=(i("256e"),i("2877")),C=Object(D["a"])(b,u,l,!1,null,null,null),k=C.exports,x=i("2efc"),I=function(){var t=this,e=t._self._c;return e("a",{staticClass:"same-item",attrs:{href:t.getLink(t.item),target:"_blank"}},[e("div",{staticClass:"info-wrap"},[e("div",{staticClass:"img-wrap",class:"u-quality-bg--"+t.item.Quality},[15===t.item.SubType?e("el-image",{staticClass:"u-image",attrs:{src:t.getImgSrc(t.item)}},[e("div",{staticClass:"image-slot",attrs:{slot:"error"},slot:"error"},[e("img",{attrs:{src:t.getImgSrc(t.item,!0)},on:{error:t.replaceByDefault}})])]):e("item-icon",{attrs:{item_id:String(t.item.ItemID),isLink:!1,size:48,onlyIcon:!0}})],1),e("div",{staticClass:"m-info"},[e("div",{staticClass:"info-item name"},[t._v(t._s(t.item.Name))]),e("div",{staticClass:"info-item id"},[t._v("ID: "+t._s(t.item.ID))])])]),e("div",{staticClass:"info-item"},[t._l(t.MagicAttributes,(function(i,a){return e("el-tooltip",{key:a,attrs:{trigger:"hover",placement:"top"}},[e("div",{staticClass:"u-attr-pop",attrs:{slot:"content"},slot:"content"},[i.name?e("div",{staticClass:"u-attr-name"},[t._v(" "+t._s((i.name||"")+(Number(i.level)?i.level+"级":""))+" ")]):t._e(),e("div",{staticClass:"u-attr-desc"},[t._v(t._s(i.desc))])]),e("img",{staticClass:"u-attr-icon",attrs:{src:i.iconUrl,alt:i.name}})])})),t.count?e("span",{staticClass:"u-more"},[t._v("+"+t._s(t.count))]):t._e()],2)])},w=[],O=(i("5319"),i("ed08")),T=i("bf15"),$={name:"SameItem",props:{item:{type:Object,required:!0}},components:{ItemIcon:T["a"]},computed:{isPhone:function(){return Object(O["b"])()},MagicAttributes:function(){return this.isPhone&&this.item.MagicAttributes,this.item.MagicAttributes.length<=4?this.item.MagicAttributes:this.item.MagicAttributes.slice(0,3)||[]},count:function(){return this.isPhone||this.item.MagicAttributes.length<=4?0:this.item.MagicAttributes.slice(3).length}},methods:{getLink:function(t){var e=t.ItemID,i=15===t.SubType?1:2;return"/horse/".concat(e,"?type=").concat(i)},replaceByDefault:function(t){t.target.src=i("d47d")},getImgSrc:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=e?this.client:"std",a=t.ImgPath;if(a){var s=a.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/),n=null===s||void 0===s?void 0:s[1].replace(/\\/g,"/");return"default"==(null===s||void 0===s?void 0:s[1])?this.__imgRoot+"homeland/".concat(i)+"/default/default.png":this.__imgRoot+"homeland/".concat(i)+n+".png"}return this.__imgRoot2+"".concat(i,"/")+t.ID+".png"}}},S=$,L=(i("eace"),Object(D["a"])(S,I,w,!1,null,null,null)),M=L.exports,z=function(t,e){return e._m(0)},j=[function(t,e){return t("div",{staticClass:"m-list-head list-sticky-head"},[t("div",[e._v("名称")]),t("div",[e._v("类型")]),t("div",[e._v("骑乘")]),t("div",[e._v("品质等级")]),t("div",[e._v("跑速")]),t("div",[e._v("喂食饲料")]),t("div",[e._v("获取方式")]),t("div",[e._v("属性")])])}],H={name:"ListHead"},N=H,A=(i("58e7"),Object(D["a"])(N,z,j,!0,null,null,null)),P=A.exports,Y=function(){var t=this,e=t._self._c;return e("div",{staticClass:"m-horse-item",on:{click:function(e){return t.go(t.item)}}},[e("div",{staticClass:"u-name"},[e("item-icon",{attrs:{item_id:String(t.item.ItemID),size:36,vertical:!0}})],1),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.typeName))]),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.modeName))]),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.Level))]),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.speed))]),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.feedName))]),e("div",{staticClass:"u-desc"},[t._v(t._s(t.item.GetType))]),e("div",{staticClass:"u-attr-wrap"},t._l(t.item.MagicAttributes||[],(function(i,a){return e("div",{key:a,staticClass:"u-attr"},[e("el-tooltip",{attrs:{trigger:"hover",placement:"top"}},[e("div",{staticClass:"u-attr-pop",attrs:{slot:"content"},slot:"content"},[i.name?e("div",{staticClass:"u-attr-name"},[t._v(" "+t._s((i.name||"")+(Number(i.level)?i.level+"级":""))+" ")]):t._e(),e("div",{staticClass:"u-attr-desc"},[t._v(t._s(i.desc))])]),e("img",{staticClass:"u-attr-icon",attrs:{src:i.iconUrl,alt:i.name}})])],1)})),0)])},E=[],B={name:"HorseItem",components:{ItemIcon:T["a"]},props:{item:{type:Object,required:!0}},methods:{go:function(t){var e=t.ItemID,i=15===t.SubType?1:2;this.$router.push({path:"".concat(e),query:{type:i}})}},computed:{client:function(){return this.$store.state.client}}},U=B,W=(i("dd43"),Object(D["a"])(U,Y,E,!1,null,null,null)),R=W.exports,J=i("2ef0"),F=i("85e4"),Z=i("023b"),q={name:"HorseHome",components:{SameItem:M,HorseCard:x["a"],HorseBroadcastV2:k,CardBannerList:Z["a"],CommonToolbar:c["a"],ListHead:P,HorseItem:R},data:function(){return{loading:!1,showType:"card",keyword:"",active:"",page:1,total:0,per:0,count:0,itemData:{color:"#E86F00",width:"220"},appendMode:!1,feeds:[],attrs:[],filter:!1,typeList:[],list:o["a"],searchType:o["b"],showTypes:o["c"]}},computed:{client:function(){return this.$store.state.client},params:function(){var t={client:this.client,per:this.per};return this.keyword&&(t.keyword=this.keyword),""!==this.active&&(t.type=this.active),t},hasNextPage:function(){var t=this,e=this.typeList.filter((function(e){return e.type===t.active}))[0].pages;return e>1&&this.page<e},typeName:function(){var t=this;return this.typeList.filter((function(e){return e.type==t.active}))[0].name},subList:function(){var t=this;return""===this.active?null:this.typeList.filter((function(e){return e.type===t.active}))[0].list},isPhone:function(){return Object(O["b"])()}},watch:{list:{immediate:!0,handler:function(t){this.typeList=Object(J["cloneDeep"])(t)}},params:{deep:!0,handler:function(){this.loadData()}},searchType:{deep:!0,handler:function(){var t=this.searchType[0].checked.join(","),e=this.searchType[1].checked.join(",");this.page=1,this.filter&&this.loadData(Object(a["a"])(Object(a["a"])({},this.params),{},{feed:t,attr:e}))}}},methods:{iconLink:F["k"],clickTabs:function(t){var e=this.typeList.filter((function(e){return e.value==t}))[0].type;this.active=e,this.typeList=this.typeList.map((function(t){return t.page=1,t})),console.log(),this.$refs.toolbar.changeType(t),this.page=1},loadInfoData:function(){var t=this;Object(r["b"])({client:this.client}).then((function(e){var i=e.data.map((function(t){var e=t.tip.indexOf("【"),i=t.tip.indexOf("】");return t.feed=t.tip.slice(e+1,i),t})),a=[];i.forEach((function(t){var e=a.findIndex((function(e){return e.feed===t.feed}));e>-1?a[e].id+=","+t.id:a.push(t)})),t.feeds=a.map((function(t){return{label:t.feed,value:t.id}})),t.searchType[0].list=t.feeds})),Object(r["a"])({client:this.client}).then((function(e){var i=e.data,a=i.map((function(t){return{label:t.name,value:t.name}}));t.attrs=a,t.searchType[1].list=t.attrs}))},getFeed:function(t){var e="";return 15===t.SubType&&(e=this.feeds.find((function(e){return e.id===t.DetailType}))?this.feeds.find((function(e){return e.id===t.DetailType})).feed:""),e},canDouble:function(t){var e="";return 15===t.SubType&&t.MagicAttributes&&t.MagicAttributes.length&&(e=t.MagicAttributes.find((function(t){return"15650"===t.id}))?t.MagicAttributes.find((function(t){return"15650"===t.id})).name:"单骑"),e},getType:function(t){var e="";return 15===t.SubType?e=0===t.DetailType?"普通坐骑":"奇趣坐骑":23===t.SubType&&(e=0===t.DetailType?"头饰":1===t.DetailType?"鞍饰":2===t.DetailType?"足饰":3===t.DetailType?"马饰":"马具"),e},listId:function(t){return null!==t&&void 0!==t&&t.length?t.map((function(t){return t.ID})):[]},changePage:function(t){this.page=t,this.loadData()},showCount:function(){var t;if(this.isPhone)return this.per=8,void(this.count=8);var e=(null===(t=this.$refs.listRef)||void 0===t?void 0:t.clientWidth)-120;this.count=Math.floor(e/this.itemData.width),this.per=this.count},appendPage:function(){this.appendMode=!0,this.handleLoad(this.active,!0)},handleLoad:function(t,e){var i=this.typeList.filter((function(e){return e.type===t}))[0].page,a=Object(J["cloneDeep"])(this.params);a.page=i+1,a.per=e?3*this.count:this.count,a.type=t,this.loadList(a,t)},loadData:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.params;if(this.loading=!0,e=Object(J["omit"])(e,["type","value","label"]),""===this.active){var i=this.typeList.filter((function(t){return""!==t.type}));i.forEach((function(i){e.page=i.page,e.type=i.type,e.per=t.count,t.loadList(e,i.type)}))}else e.page=this.page,e.per=3*this.count,this.loadList(Object(a["a"])(Object(a["a"])({},e),{},{type:this.active}),this.active)},loadList:function(t,e){var i=this,a=this.typeList.findIndex((function(t){return t.type===e}));this.typeList[a].pages<t.page&&""===this.active&&(t.page=1),Object(r["f"])(t).then((function(t){var e=t.data,s=e.list,n=e.total,r=e.pages,o=e.page,c=e.per,u=i.appendMode?Object(J["concat"])(i.typeList[a].list,s):s,l=u.map((function(t){return t.typeName=i.getType(t),t.modeName=i.canDouble(t),t.feedName=i.getFeed(t),t.MoveSpeed&&(t.speed=t.MoveSpeedDesc.split("移动速度提高")[1]),t.MagicAttributes&&t.MagicAttributes.length&&t.MagicAttributes.map((function(t){return t.iconUrl=i.iconLink(t.icon),t})),t}));i.typeList[a].list=l||[],i.typeList[a].page=o||1,i.typeList[a].pages=r||1,""!==i.active&&(i.page=o||1),i.total=n,i.per=c})).finally((function(){i.loading=!1,i.appendMode=!1}))},checkboxChange:function(t){var e=this.checkboxData[t];this[t]=e.join(",")},reset:function(){this.searchType=this.searchType.map((function(t){return t.checked=[],t})),this.feed=[],this.attr=[]},updateToolbar:function(t){var e=t.type,i=t.search;this.keyword=i,this.clickTabs(e)}},mounted:function(){this.showCount(),this.loadInfoData()}},G=q,K=(i("0d67"),Object(D["a"])(G,s,n,!1,null,null,null));e["default"]=K.exports},"6f48":function(t,e,i){"use strict";var a=i("6d61"),s=i("6566");a("Map",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),s)},"705b":function(t,e,i){},"80e1":function(t,e,i){},a2bf:function(t,e,i){"use strict";var a=i("e8b5"),s=i("07fa"),n=i("3511"),r=i("0366"),o=function(t,e,i,c,u,l,d,f){var h,m,v=u,p=0,g=!!d&&r(d,f);while(p<c)p in i&&(h=g?g(i[p],p,e):i[p],l>0&&a(h)?(m=s(h),v=o(t,e,h,m,v,l-1)-1):(n(v+1),t[v]=h),v++),p++;return v};t.exports=o},a59a:function(t){t.exports=JSON.parse('["缘起稻香","天宝盛世"]')},bcb9:function(t,e,i){},c42f:function(t){t.exports=JSON.parse('{"a":[{"type":"","value":-1,"name":"全部","label":"全部","page":1,"pages":1,"list":[]},{"type":0,"value":1,"name":"普通坐骑","label":"普通坐骑","page":1,"pages":1,"list":[]},{"type":1,"value":2,"name":"奇趣坐骑","label":"奇趣坐骑","page":1,"pages":1,"list":[]},{"type":2,"value":3,"name":"马具","label":"马具","page":1,"pages":1,"list":[]}],"b":[{"key":"feed","type":"checkbox","name":"喂食饲料","list":[],"checked":[]},{"key":"attr","type":"checkbox","name":"属性","list":[],"checked":[]}],"c":[{"value":"list","label":"列表"},{"value":"card","label":"卡片"}]}')},c8d2:function(t,e,i){"use strict";var a=i("5e77").PROPER,s=i("d039"),n=i("5899"),r="​᠎";t.exports=function(t){return s((function(){return!!n[t]()||r[t]()!==r||a&&n[t].name!==t}))}},d998:function(t,e,i){"use strict";var a=i("342f");t.exports=/MSIE|Trident/.test(a)},dd43:function(t,e,i){"use strict";i("dfc2")},dfc2:function(t,e,i){},e418:function(t,e,i){!function(e,i){t.exports=i()}(0,(function(){"use strict";return function(t,e,i){e.prototype.isBetween=function(t,e,a,s){var n=i(t),r=i(e),o="("===(s=s||"()")[0],c=")"===s[1];return(o?this.isAfter(n,a):!this.isBefore(n,a))&&(c?this.isBefore(r,a):!this.isAfter(r,a))||(o?this.isBefore(n,a):!this.isAfter(n,a))&&(c?this.isAfter(r,a):!this.isBefore(r,a))}}}))},eace:function(t,e,i){"use strict";i("80e1")}}]);
//# sourceMappingURL=chunk-3901435b.d3f3310d.js.map