(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-9f1f831c"],{"154f":function(t,a,e){"use strict";e("4a74")},"20c3":function(t,a,e){"use strict";e.r(a);var n=function(){var t=this,a=t._self._c;return a("div",{staticClass:"v-homeland-tutorial"},[a("div",{staticClass:"m-homeland-info"},[a("div",{staticClass:"m-homeland-games"},t._l(t.game_data,(function(e,n){return a("div",{key:"game-"+n,staticClass:"u-game"},[t.showGameTip(e.szTip)?a("el-popover",{attrs:{placement:"top",width:"200",trigger:"hover",content:t.showGameTip(e.szTip),"popper-class":"m-homeland-games-pop"}},[a("div",{staticClass:"u-box",attrs:{slot:"reference"},slot:"reference"},[a("i",{staticClass:"u-pic"},[a("img",{attrs:{src:t.showGamePic(e.nUnLockFrame)}})]),t._v(" "),a("span",{staticClass:"u-name"},[t._v(t._s(e.szName))])])]):[a("div",{staticClass:"u-box"},[a("i",{staticClass:"u-pic"},[a("img",{attrs:{src:t.showGamePic(e.nUnLockFrame)}})]),t._v(" "),a("span",{staticClass:"u-name"},[t._v(t._s(e.szName))])])]],2)})),0),a("div",{staticClass:"m-homeland-levels"},[a("el-table",{attrs:{data:t.level_data,stripe:""}},[a("el-table-column",{attrs:{align:"center"}},[a("template",{slot:"header"},[a("h2",{staticClass:"u-header"},[a("i",{staticClass:"el-icon-s-home"}),t._v(" 家园升级需求")])]),a("el-table-column",{attrs:{prop:"Level",label:"等级",align:"center",width:"100px"}}),a("el-table-column",{attrs:{prop:"Record",label:"收藏分",align:"center"}}),a("el-table-column",{attrs:{prop:"Currency",label:"园宅币",align:"center"}})],2)],1)],1)])])},s=[],o=e("ab27"),c=e("cc9a"),i=e("65c2"),r={name:"Tutorial",props:[],inject:["__imgRoot"],components:{},data:function(){return{level_data:[],game_data:[],posts:[]}},computed:{},watch:{},methods:{loadInfo:function(){var t=this;Object(o["f"])().then((function(a){t.level_data=null===a||void 0===a?void 0:a.data})),Object(o["e"])().then((function(a){t.game_data=null===a||void 0===a?void 0:a.data}))},loadData:function(){var t=this;Object(c["b"])("homeland_rec").then((function(a){t.posts=a||[]}))},showGamePic:function(t){return i["__imgPath"]+"/image/game/homeland/seasonfurniture_"+t+".png"},showGameTip:function(t){var a=null===t||void 0===t?void 0:t.split("\\n");return a.length>0?a[1]:""}},mounted:function(){this.loadInfo()}},l=r,u=(e("154f"),e("2877")),m=Object(u["a"])(l,n,s,!1,null,null,null);a["default"]=m.exports},"4a74":function(t,a,e){},ab27:function(t,a,e){"use strict";e.d(a,"f",(function(){return r})),e.d(a,"e",(function(){return l})),e.d(a,"d",(function(){return u})),e.d(a,"b",(function(){return m})),e.d(a,"c",(function(){return d})),e.d(a,"a",(function(){return p}));var n=e("bc3a"),s=e.n(n),o=e("65c2"),c=e("41cb"),i=s.a.create({baseURL:o["__dataPath"]+"pvx/homeland/output/"});function r(){return i.get("house_level_up.json")}function l(){return i.get("homeland_game_play.json")}function u(t){return i.get("landinfo/".concat(t,".json"))}function m(){return i.get("homeland_category.json")}function d(t){return Object(c["a"])({mute:!0}).get("/api/cms/game/furniture/match",{params:t})}function p(t){return Object(c["a"])({mute:!0}).get("/api/cms/posts",{params:t})}}}]);
//# sourceMappingURL=chunk-9f1f831c.975d1445.js.map