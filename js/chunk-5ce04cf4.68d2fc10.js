(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5ce04cf4"],{"25f0":function(t,e,i){"use strict";var a=i("e330"),s=i("5e77").PROPER,n=i("6eeb"),c=i("825a"),r=i("3a9b"),o=i("577e"),l=i("d039"),u=i("ad6d"),d="toString",p=RegExp.prototype,f=p[d],m=a(u),v=l((function(){return"/a/b"!=f.call({source:"a",flags:"b"})})),g=s&&f.name!=d;(v||g)&&n(RegExp.prototype,d,(function(){var t=c(this),e=o(t.source),i=t.flags,a=o(void 0===i&&r(p,t)&&!("flags"in p)?m(t):i);return"/"+e+"/"+a}),{unsafe:!0})},"2d4f":function(t,e,i){"use strict";i("ea20")},"3ac3":function(t,e,i){"use strict";i("c98d")},4649:function(t){t.exports=JSON.parse('[{"source":"","name":"所有途径"},{"source":5,"name":"世界奇遇"},{"source":6,"name":"积分回馈"},{"source":7,"name":"秘境奇遇"},{"source":8,"name":"门派特有"},{"source":9,"name":"游戏活动"},{"source":10,"name":"限时宠物"},{"source":11,"name":"运营活动"}]')},"4d63":function(t,e,i){var a=i("83ab"),s=i("da84"),n=i("e330"),c=i("94ca"),r=i("7156"),o=i("9112"),l=i("9bf2").f,u=i("241c").f,d=i("3a9b"),p=i("44e7"),f=i("577e"),m=i("ad6d"),v=i("9f7f"),g=i("6eeb"),h=i("d039"),_=i("1a2d"),b=i("69f3").enforce,k=i("2626"),C=i("b622"),x=i("fce3"),y=i("107c"),I=C("match"),w=s.RegExp,P=w.prototype,L=s.SyntaxError,O=n(m),j=n(P.exec),S=n("".charAt),E=n("".replace),T=n("".indexOf),R=n("".slice),D=/^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/,N=/a/g,$=/a/g,M=new w(N)!==N,A=v.MISSED_STICKY,W=v.UNSUPPORTED_Y,z=a&&(!M||A||x||y||h((function(){return $[I]=!1,w(N)!=N||w($)==$||"/a/i"!=w(N,"i")}))),F=function(t){for(var e,i=t.length,a=0,s="",n=!1;a<=i;a++)e=S(t,a),"\\"!==e?n||"."!==e?("["===e?n=!0:"]"===e&&(n=!1),s+=e):s+="[\\s\\S]":s+=e+S(t,++a);return s},B=function(t){for(var e,i=t.length,a=0,s="",n=[],c={},r=!1,o=!1,l=0,u="";a<=i;a++){if(e=S(t,a),"\\"===e)e+=S(t,++a);else if("]"===e)r=!1;else if(!r)switch(!0){case"["===e:r=!0;break;case"("===e:j(D,R(t,a+1))&&(a+=2,o=!0),s+=e,l++;continue;case">"===e&&o:if(""===u||_(c,u))throw new L("Invalid capture group name");c[u]=!0,n[n.length]=[u,l],o=!1,u="";continue}o?u+=e:s+=e}return[s,n]};if(c("RegExp",z)){for(var J=function(t,e){var i,a,s,n,c,l,u=d(P,this),m=p(t),v=void 0===e,g=[],h=t;if(!u&&m&&v&&t.constructor===J)return t;if((m||d(P,t))&&(t=t.source,v&&(e="flags"in h?h.flags:O(h))),t=void 0===t?"":f(t),e=void 0===e?"":f(e),h=t,x&&"dotAll"in N&&(a=!!e&&T(e,"s")>-1,a&&(e=E(e,/s/g,""))),i=e,A&&"sticky"in N&&(s=!!e&&T(e,"y")>-1,s&&W&&(e=E(e,/y/g,""))),y&&(n=B(t),t=n[0],g=n[1]),c=r(w(t,e),u?this:P,J),(a||s||g.length)&&(l=b(c),a&&(l.dotAll=!0,l.raw=J(F(t),i)),s&&(l.sticky=!0),g.length&&(l.groups=g)),t!==h)try{o(c,"source",""===h?"(?:)":h)}catch(_){}return c},q=function(t){t in J||l(J,t,{configurable:!0,get:function(){return w[t]},set:function(e){w[t]=e}})},Q=u(w),U=0;Q.length>U;)q(Q[U++]);P.constructor=J,J.prototype=P,g(s,"RegExp",J)}k("RegExp")},"60f8":function(t){t.exports=JSON.parse('[{"class":"","type":0,"name":"所有种类"},{"class":1,"type":1,"name":"水族"},{"class":3,"type":2,"name":"走兽"},{"class":2,"type":3,"name":"禽鸟"},{"class":4,"type":4,"name":"机关"}]')},"7ceb":function(t,e,i){"use strict";i("ffe5")},"9b7f":function(t,e,i){"use strict";i.d(e,"c",(function(){return o})),i.d(e,"a",(function(){return l})),i.d(e,"d",(function(){return u})),i.d(e,"b",(function(){return d}));var a=i("41cb"),s=i("65c2"),n=i("bc3a"),c=i.n(n),r=Object(a["e"])();function o(t){return r.get("/pets",{params:t})}function l(t,e){return r.get("/pet/".concat(t),{params:e})}function u(t){var e=t.item_type,i=t.item_id,a=t.client,s=void 0===a?"std":a;return r.get("/shop",{params:{client:s,itemType:e,itemId:i}})}function d(){return c.a.get(s["__iconPath"]+"pvx/pet/output/pet_lucky.json")}},a15b:function(t,e,i){"use strict";var a=i("23e7"),s=i("e330"),n=i("44ad"),c=i("fc6a"),r=i("a640"),o=s([].join),l=n!=Object,u=r("join",",");a({target:"Array",proto:!0,forced:l||!u},{join:function(t){return o(c(this),void 0===t?",":t)}})},b03f:function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.pet?i("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticClass:"v-pet-single"},[i("div",{staticClass:"m-pet-navigation"},[i("el-button",{staticClass:"u-goback",attrs:{size:"medium",icon:"el-icon-arrow-left",plain:""},on:{click:t.goBack}},[t._v("返回列表")]),i("div",{staticClass:"m-pet-links"},[i("a",{staticClass:"u-link u-item",attrs:{href:t.getLink("item",t.item_id),target:"_blank"}},[i("i",{staticClass:"el-icon-collection-tag"}),t._v("物品信息")]),t.achievement_id?[i("em",[t._v(" | ")]),i("a",{staticClass:"u-link u-achievement",attrs:{href:t.getLink("cj",t.achievement_id),target:"_blank"}},[i("i",{staticClass:"el-icon-trophy"}),t._v("成就信息")])]:t._e()],2)],1),i("div",{staticClass:"m-pet-content flex"},[i("petCard",{attrs:{petObject:t.pet,lucky:t.luckyList}}),i("div",{staticClass:"m-pet-info"},[i("h1",{staticClass:"u-title"},[i("span",{staticClass:"u-name"},[t._v(t._s(t.pet.Name))]),i("span",{staticClass:"u-type"},[t._v(t._s(t.getPetType(t.pet.Class))+" · "+t._s(t.getPetSource(t.pet.Source)))]),i("i",{staticClass:"u-stars"},t._l(t.pet.Star,(function(t){return i("i",{key:t,staticClass:"el-icon-star-on"})})),0)]),t.petWiki?i("div",{staticClass:"m-pet-skills"},t._l(t.petWiki.skills,(function(e,a){return i("div",{key:a,staticClass:"u-skill"},[i("el-popover",{attrs:{trigger:"hover","popper-class":"m-pet-skill","visible-arrow":!1,placement:"top"}},[i("div",{staticClass:"u-skill-pop"},[i("div",{staticClass:"u-skill-name"},[t._v(t._s(e.Name))]),i("div",{staticClass:"u-skill-desc"},[t._v(t._s(e.Desc))])]),i("img",{staticClass:"u-skill-icon",attrs:{slot:"reference",src:t._f("iconLink")(e.IconID),alt:e.Name},slot:"reference"})])],1)})),0):t._e(),i("div",{staticClass:"u-metas"},[i("div",{staticClass:"u-meta u-score"},[i("span",{staticClass:"u-meta-label"},[t._v("宠物分数：")]),t._v(t._s(t.pet.Score))]),i("div",{staticClass:"u-meta u-desc"},[i("span",{staticClass:"u-meta-label"},[t._v("宠物说明：")]),i("span",{staticClass:"u-meta-value"},[t._l(t.getPetDesc(t.pet.Desc),(function(e,a){return[i("span",{key:a,domProps:{innerHTML:t._s(e.text)}})]}))],2)]),i("div",{staticClass:"u-meta u-source"},[i("span",{staticClass:"u-meta-label"},[t._v("获取线索：")]),t._l(t.getPetDesc(t.pet.OutputDes),(function(e){return[i("span",{key:e.text},[t._v(t._s(t._f("cleanResourceText")(e.text)))])]}))],2),t.shopInfo.RewardsPrice||t.shopInfo.CoinPrice?i("div",{staticClass:"u-meta u-shop"},[i("span",{staticClass:"u-meta-label"},[t._v("商城价格：")]),i("span",{staticClass:"u-price"},[t.shopInfo.RewardsPrice>0?i("el-tag",{staticClass:"u-price-item u-rewards"},[t._v("积分"),i("b",[t._v(t._s(t.shopInfo.RewardsPrice))]),i("i",{staticClass:"u-icon-rewards"})]):t._e(),i("el-tag",{staticClass:"u-price-item u-coin"},[t._v("通宝"),i("b",[t._v(t._s(t.shopInfo.CoinPrice))]),i("i",{staticClass:"u-icon-coin"})])],1)]):t._e()])])],1),t.medalList&&t.medalList.length?i("div",{staticClass:"m-pet-fetters"},[i("div",{staticClass:"u-header"},[i("svg",{class:"u-icon",attrs:{xmlns:"http://www.w3.org/2000/svg",width:"31.531",height:"31.531",viewBox:"0 0 31.531 31.531","svg-inline":"",role:"presentation",focusable:"false",tabindex:"-1"}},[i("path",{attrs:{d:"M11.872 24.961l-2.539.412a2.59 2.59 0 01-1.961-.468 2.606 2.606 0 01-1.043-1.72l-.223-1.482-4.407 4.407a.835.835 0 00.438 1.413l2.801.523.523 2.801a.838.838 0 001.413.438l5.755-5.755-.422-.427a.471.471 0 00-.335-.142z"}}),i("path",{attrs:{d:"M19.91 23.932l2.458.404a1.554 1.554 0 001.794-1.303l.37-2.458c.075-.492.383-.917.829-1.141l2.224-1.111a1.564 1.564 0 00.686-2.111L27.129 14a1.518 1.518 0 010-1.403l1.144-2.211c.19-.37.227-.802.098-1.199a1.57 1.57 0 00-.785-.911l-2.223-1.112a1.53 1.53 0 01-.829-1.14l-.37-2.458a1.556 1.556 0 00-.624-1.026 1.555 1.555 0 00-1.17-.279l-2.457.405a1.52 1.52 0 01-1.335-.434L16.828.459A1.568 1.568 0 0015.766 0a1.566 1.566 0 00-1.061.459l-1.75 1.773a1.52 1.52 0 01-1.335.434l-2.457-.405a1.554 1.554 0 00-1.17.279 1.556 1.556 0 00-.624 1.026l-.37 2.458a1.532 1.532 0 01-.83 1.14L3.947 8.276a1.568 1.568 0 00-.785.912c-.129.396-.093.829.097 1.199l1.144 2.211c.229.439.229.964 0 1.403l-1.143 2.21a1.563 1.563 0 00.687 2.111l2.224 1.111c.446.224.753.649.829 1.141l.37 2.458c.062.412.288.783.624 1.026a1.55 1.55 0 001.17.277l2.458-.404c.489-.082.987.08 1.335.436l1.75 1.771a1.55 1.55 0 001.059.459 1.55 1.55 0 001.059-.459l1.75-1.771a1.517 1.517 0 011.335-.435zm-4.144-1.39c-5.205-.026-9.431-4.266-9.431-9.477 0-5.21 4.226-9.451 9.431-9.478 5.205.026 9.432 4.268 9.432 9.478-.001 5.211-4.227 9.451-9.432 9.477z"}}),i("path",{attrs:{d:"M15.766 4.955c-4.444.028-8.05 3.648-8.05 8.097 0 4.447 3.606 8.068 8.05 8.096 4.444-.027 8.05-3.648 8.05-8.096-.001-4.448-3.606-8.069-8.05-8.097zM29.833 26.11l-4.407-4.407-.223 1.482a2.615 2.615 0 01-3.004 2.188l-2.539-.412a.468.468 0 00-.335.143l-.422.427 5.755 5.755a.838.838 0 001.413-.438l.522-2.801 2.801-.523a.837.837 0 00.439-1.414z"}})]),t._v(" "),i("span",{staticClass:"u-txt"},[t._v("宠物羁绊")])]),t._l(t.medalList,(function(t){return i("petFetters",{key:t.ID,attrs:{info:t}})}))],2):t._e(),i("div",{staticClass:"m-pet-wiki"},[i("detail",{attrs:{achievement_id:t.achievement_id,item_id:t.item_id,title:"宠物攻略",real_type:"pet"}})],1),i("div",{staticClass:"m-pvx-comment"},[i("Comment",{attrs:{id:t.id,category:"pz",order:"desc"}})],1)]):t._e()},s=[],n=i("2909"),c=(i("d3b7"),i("7db0"),i("b0c0"),i("4d63"),i("c607"),i("ac1f"),i("2c3e"),i("25f0"),i("5319"),i("fb6a"),i("99af"),i("6062"),i("3ca3"),i("ddb0"),i("159b"),i("caad"),i("2532"),i("a15b"),i("d81d"),i("4de4"),i("2ca0"),i("9b7f")),r=i("c967"),o=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"m-pet-card"},[i("img",{staticClass:"u-image",attrs:{src:t.getImgSrc(t.petObject.BgPath)}}),i("img",{staticClass:"u-frame",attrs:{src:t.getFrameSrc(t.petObject.Quality)}}),i("div",{staticClass:"u-stars"},[i("i",{staticClass:"u-star",class:"u-star-"+t.petObject.Star})]),t.getLucky(t.petObject.Index)?i("i",{staticClass:"u-lucky"}):t._e(),i("div",{staticClass:"u-score flex"},[t._v(" "+t._s(t.petObject.Score||"？")+" ")]),i("span",{staticClass:"u-name"},[t._v(t._s(t.petObject.Name))])])},l=[],u=(i("466d"),i("65c2")),d={props:{petObject:{},lucky:{}},data:function(){return{}},methods:{getImgSrc:function(t){if(t){var e=t.match(/.*[\/,\\](.*?).tga/);return u["__iconPath"]+"pvx/pet/images/"+e[1]+".png"}},getFrameSrc:function(t){var e="";if(t){switch(t){case 2:e="/greenborder.png";break;case 3:e="/blueborder.png";break;case 4:e="/purpleborder.png";break;case 5:e="/purpleborder.png";break}return u["__iconPath"]+"pvx/pet/frame"+e}},getLucky:function(t){var e;if(t)return-1!=(null===(e=this.lucky)||void 0===e?void 0:e.indexOf(t.toString()))}}},p=d,f=(i("2d4f"),i("2877")),m=Object(f["a"])(p,o,l,!1,null,null,null),v=m.exports,g=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"m-fetters"},[i("div",{staticClass:"m-fetters-title"},[i("div",{staticClass:"u-title"},[i("i",{staticClass:"el-icon-star-on"}),t._v(t._s(t.info.Name))]),i("div",{staticClass:"u-desc"},[t._v(t._s(t.showPetterDesc(t.info.Des)))])]),i("div",{staticClass:"m-fetters-list"},t._l(t.info.petList,(function(e){return i("router-link",{key:e.Index,staticClass:"u-fetter",attrs:{to:"/pet/"+e.Index}},[i("i",{staticClass:"u-fetter-icon",class:["u-quality-"+e.Quality,{isActive:e.Index==t.id}]},[i("img",{attrs:{src:t.iconLink(e.IconID)}})]),i("span",{staticClass:"u-fetter-name"},[t._v(t._s(e.Name))])])})),1)])},h=[],_=i("85e4"),b={name:"Fetters",props:["info"],components:{},data:function(){return{}},computed:{id:function(){return this.$route.params.id}},methods:{getImgSrc:function(t){if(t){var e=t.match(/.*[\/,\\](.*?).tga/);return u["__iconPath"]+"pvx/pet/images/"+e[1]+".png"}},getLink:function(t){t!=this.$route.params.id&&this.$router.push({name:"single",params:{id:t}})},iconLink:_["iconLink"],showPetterDesc:function(t){var e=Object(_["extractTextContent"])(t);return e[0]["text"]}}},k=b,C=(i("7ceb"),Object(f["a"])(k,g,h,!1,null,null,null)),x=C.exports,y=i("c599"),I=i("60f8"),w=i("4649"),P=i("23d8"),L=i("9616"),O={name:"PetSingle",props:[],components:{petCard:v,petFetters:x,Detail:y["a"],Comment:P["a"]},data:function(){return{pet:"",petWiki:"",shopInfo:"",luckyList:[],medalList:[],loading:!1}},computed:{id:function(){return this.$route.params.id},item_id:function(){var t,e;return(null===(t=this.pet)||void 0===t?void 0:t.ItemTabType)+"_"+(null===(e=this.pet)||void 0===e?void 0:e.ItemTabIndex)},achievement_id:function(){var t;return null===(t=this.petWiki)||void 0===t?void 0:t.achievement_id},client:function(){return this.$store.state.client},title:function(){var t;return null===(t=this.pet)||void 0===t?void 0:t.Name},params:function(){return{client:this.client}}},watch:{id:function(){this.getPetInfo()}},methods:{getPetInfo:function(){var t=this;this.loading=!0,Object(c["a"])(this.id,this.params).then((function(e){t.pet=e.data,t.medalList=e.data.medal_list,t.getPetWiki(),t.getShopInfo(),t.getPetMedal(),Object(L["b"])("pet",t.id)})).finally((function(){t.loading=!1}))},getPetWiki:function(){var t=this;this.item_id&&Object(r["a"])("item",this.item_id).then((function(e){var i,a,s;t.petWiki=null===e||void 0===e||null===(i=e.data)||void 0===i||null===(a=i.data)||void 0===a||null===(s=a.source)||void 0===s?void 0:s.pet}))},getShopInfo:function(){var t=this,e={item_type:this.pet.ItemTabType,item_id:this.pet.ItemTabIndex};Object(c["d"])(e).then((function(e){t.shopInfo=(null===e||void 0===e?void 0:e.data)||""}))},getPetType:function(t){var e=I.find((function(e){return e.class===t}));return(null===e||void 0===e?void 0:e.name)||""},getPetSource:function(t){var e=w.find((function(e){return~~t===~~e.source}));return(null===e||void 0===e?void 0:e.name)||""},getPetDesc:function(t){var e,i=new RegExp("<text>text=([\\s\\S]*?)font=(\\d+)[\\s\\S]*?<\\/text>","gimy"),a=[];while(e=i.exec(t))a.push(e);for(var s=[],n=0,c=a;n<c.length;n++){var r=c[n];s.push({font:~~r[2],text:r[1].slice(1,-2).replace(/[\\n]/g,"")})}return s},goBack:function(){this.$router.push({name:"list"})},goItem:function(){var t=this.pet,e=t.ItemTabType,i=t.ItemTabIndex,a=Object(_["getLink"])("item","".concat(e,"_").concat(i));window.open(a,"_blank")},getPetLucky:function(){var t=this;Object(c["b"])().then((function(e){var i=e.data.std,a=new Date,s=a.getMonth()+1+""+a.getDate();t.luckyList=i[s]}))},getLink:_["getLink"],getPetMedal:function(){var t=this,e=new Set;this.medalList.forEach((function(t){for(var i in t.pets=[],t)i.includes("PetIndex")&&t[i]&&(t.pets=[].concat(Object(n["a"])(t.pets),[t[i]]),e.add(t[i]))})),Object(c["c"])({ids:Object(n["a"])(e).join(","),client:this.client}).then((function(e){var i=e.data.list;t.medalList.map((function(e){var a=i.filter((function(t){return e.pets.includes(t.Index)}));return t.$set(e,"petList",a),e}))}))}},filters:{iconLink:_["iconLink"],cleanResourceText:function(t){return t&&t.startsWith("获取线索：")?t.replace("获取线索：",""):t}},created:function(){this.getPetLucky()},mounted:function(){this.getPetInfo()}},j=O,S=(i("3ac3"),Object(f["a"])(j,a,s,!1,null,null,null));e["default"]=S.exports},c607:function(t,e,i){var a=i("da84"),s=i("83ab"),n=i("fce3"),c=i("c6b6"),r=i("9bf2").f,o=i("69f3").get,l=RegExp.prototype,u=a.TypeError;s&&n&&r(l,"dotAll",{configurable:!0,get:function(){if(this!==l){if("RegExp"===c(this))return!!o(this).dotAll;throw u("Incompatible receiver, RegExp required")}}})},c98d:function(t,e,i){},ea20:function(t,e,i){},ffe5:function(t,e,i){}}]);
//# sourceMappingURL=chunk-5ce04cf4.68d2fc10.js.map