(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-a1296d50"],{4078:function(t,e,n){"use strict";n("4da9")},"4da9":function(t,e,n){},6231:function(t,e,n){"use strict";n.r(e);n("7db0"),n("d3b7"),n("b0c0");var i=function(){var t=this,e=t._self._c;return e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticClass:"horse-home-wrapper"},[e("PvxSearch",{attrs:{items:t.searchProps},on:{search:function(e){return t.searchEvent(e)}}}),e("div",{staticClass:"list-wrapper"},t._l(t.listAll,(function(n,i){return e("div",{key:i,staticClass:"list-item-wrapper"},[e("div",{staticClass:"title-header"},[e("div",{staticClass:"title"},[t._v(" "+t._s(t.searchProps[0].options.find((function(t){return t.type===i}))?t.searchProps[0].options.find((function(t){return t.type===i})).name:"全部")+" ")]),e("a",{attrs:{href:"javascript:;"},on:{click:function(e){return t.toList(i)}}},[t._v("查看全部")])]),e("horse-cross",{attrs:{list:n},scopedSlots:t._u([{key:"default",fn:function(t){return[e("HorseCard",{attrs:{item:t.item}})]}}],null,!0)})],1)})),0)],1)},a=[],r=n("c7eb"),s=n("1da1"),o=(n("d81d"),n("fb6a"),n("e9c4"),n("159b"),n("c740"),n("14d9"),n("b64b"),n("3ca3"),n("ddb0"),n("f252")),c=n("d427"),u=n("0d66"),p=n("2efc"),d=n("85e4"),l=n("ed08"),f={name:"HorseHome",components:{PvxSearch:c["a"],HorseCross:u["a"],HorseCard:p["a"]},data:function(){return{loading:!1,query:{page:1,pageSize:20,client:this.client},listAll:[],searchProps:[{key:"type",name:"类型",type:"radio",options:[{type:"",name:"全部"},{type:0,name:"普通坐骑"},{type:1,name:"奇趣坐骑"},{type:2,name:"马具"}]},{type:"filter",key:"filter",name:"过滤",options:[{key:"feed",type:"checkbox",name:"喂食饲料",options:[]},{key:"attr",type:"checkbox",name:"属性",options:[]}]},{key:"keyword",name:"名称"}]}},computed:{client:function(){return this.$store.state.client}},methods:{iconLink:d["iconLink"],getHorses:function(t){var e=this,n=this.query,i=Object.assign({type:t},n);return new Promise((function(t,n){Object(o["d"])(i).then((function(n){var i=n.data.list.map((function(t){return t.MagicAttributes&&t.MagicAttributes.length&&t.MagicAttributes.map((function(t){return t.iconUrl=e.iconLink(t.icon),t})),t}));t(i)})).catch((function(t){n(t)}))}))},getFeedList:function(){var t=this;return Object(s["a"])(Object(r["a"])().mark((function e(){return Object(r["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,Object(o["b"])().then((function(e){var n=e.data.map((function(t){var e=t.tip.indexOf("【"),n=t.tip.indexOf("】");return t.feed=t.tip.slice(e+1,n),t}));t.feeds=JSON.parse(JSON.stringify(n));var i=[];n.forEach((function(t){var e=i.findIndex((function(e){return e.feed===t.feed}));e>-1?i[e].id+=","+t.id:i.push(t)}));var a=i.map((function(t){return{label:t.feed,value:t.id}}));t.searchProps[1].options[0].options=a}));case 2:case"end":return e.stop()}}),e)})))()},getAttrList:function(){var t=this;return Object(s["a"])(Object(r["a"])().mark((function e(){return Object(r["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,Object(o["a"])().then((function(e){var n=e.data,i=n.map((function(t){return{label:t.name,value:t.name}}));t.searchProps[1].options[1].options=i}));case 2:case"end":return e.stop()}}),e)})))()},searchEvent:function(t){var e=Object.assign({},t);Object.keys(Object(l["a"])(e)).length&&this.$router.push({name:"list",params:Object(l["a"])(e)})},toList:function(t){this.$router.push({name:"list",params:{type:t}})}},mounted:function(){var t=this,e=this.getHorses(0),n=this.getHorses(1),i=this.getHorses(2);this.loading=!0,Promise.all([e,n,i]).then((function(e){t.loading=!1,t.listAll=e})).catch((function(){t.loading=!1})),this.getAttrList(),this.getFeedList()}},h=f,m=(n("4078"),n("2877")),b=Object(m["a"])(h,i,a,!1,null,null,null);e["default"]=b.exports}}]);
//# sourceMappingURL=chunk-a1296d50.660adfa3.js.map