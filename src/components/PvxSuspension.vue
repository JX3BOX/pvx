<template>
    <div class="m-pvx-suspension" :class="navStatusClass" @touchstart="handleTouchStart" @touchend="handleTouchEnd"
        @touchcancel="handleTouchCancel">
        <div :class="`m-pvx-suspension_box ${navStatus ? 'open' : 'close'}`"
            :style="{ width: options.length * 34 + 100 + localList.length * 34 + 'px' }" @click="toRight">
            <template v-if="navStatus">
                <div class="u-btn-box">
                    <!-- 固定按钮 -->
                    <div class="u-immobilization">
                        <div class="u-item" style="transform: scaleX(-1);" @click.stop="toLeft">
                            <img class="u-icon" src="@/assets/img/pvxsuspension/right.svg" svg-inline
                                v-if="!isDarkModeStatus" />
                            <img class="u-icon" src="@/assets/img/pvxsuspension/right_dark.svg" svg-inline v-else />
                        </div>
                        <div class="u-item" v-for="item in options" :key="item.label" @click.stop="itemClick(item)">
                            <img class="u-icon"
                                :src="item.isJudge ? isCollect ? isDarkModeStatus ? item.icon_active_dark : item.icon_active : isDarkModeStatus ? item.icon_dark : item.icon : isDarkModeStatus ? item.icon_dark : item.icon"
                                svg-inline />
                        </div>
                    </div>
                    <!-- 标定的列表 -->
                    <div class="u-list" v-if="isType == 'single'">
                        <div class="u-item" v-for="item in localList" :key="item.id" @click.stop="pinnedClick(item)">
                            {{ item.title?.match(/[\u4e00-\u9fa5]/)?.[0] || '-' || '-' }}
                        </div>
                    </div>
                </div>
            </template>
            <div class="u-btn" v-else @mouseenter="toRight">
                <div class="u-btn-item">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/right.svg" svg-inline
                        v-if="!isDarkModeStatus" />
                    <img class="u-icon" src="@/assets/img/pvxsuspension/right_dark.svg" svg-inline v-else />
                </div>
            </div>
        </div>
        <!-- 稍后再看的webview -->
        <el-drawer :visible.sync="drawer" direction="btt" custom-class="p-drawer" size="100%" append-to-body>
            <template slot="title">
                <div class="u-drawer-title" @click="cancelPinned" v-if="!removeIframePinned"><img
                        src="@/assets/img/pvxsuspension/pinned_dark.svg" svg-inline style="fill: black;" />取消
                </div>
            </template>
            <iframe :src="iframeInfo?.url" frameborder="0" width="100%" height="100%" />
        </el-drawer>
        <!-- 长按弹出 -->
        <el-drawer :visible.sync="drawerLong" direction="btt" custom-class="p-drawer long" size="100%" append-to-body
            wrapper-closable :with-header="false">
            <div class="u-drawer-top">
                <div class="u-item">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/search_dark.svg" svg-inline />
                    <div class="u-text">搜索</div>
                </div>
                <div class="u-item" @click="setCollect()">
                    <img class="u-icon"
                        :src="isCollect ? require('@/assets/img/pvxsuspension/collect_active_dark.svg') : require('@/assets/img/pvxsuspension/collect_dark.svg')"
                        svg-inline />
                    <div class="u-text">加入收藏</div>
                </div>
                <div class="u-item" @click="setLater()">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/pinned_dark.svg" svg-inline />
                    <div class="u-text">固定页面</div>
                </div>
                <div class="u-item">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/share_dark.svg" svg-inline />
                    <div class="u-text">分享内容</div>
                </div>
            </div>
            <div class="u-drawer-top_dark">
                <div class="u-item">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/search.svg" svg-inline />
                    <div class="u-text">搜索</div>
                </div>
                <div class="u-item" @click="setCollect()">
                    <img class="u-icon"
                        :src="isCollect ? require('@/assets/img/pvxsuspension/collect_active.svg') : require('@/assets/img/pvxsuspension/collect.svg')"
                        svg-inline />
                    <div class="u-text">加入收藏</div>
                </div>
                <div class="u-item" @click="setLater()">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/pinned.svg" svg-inline />
                    <div class="u-text">固定页面</div>
                </div>
                <div class="u-item">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/share.svg" svg-inline />
                    <div class="u-text">分享内容</div>
                </div>
            </div>
            <div class="u-drawer-pack_up" @click="drawerLong = false">
                <img class="u-icon" src="@/assets/img/pvxsuspension/ArrowLineRight.svg" svg-inline />
                <img class="u-icon_dark" src="@/assets/img/pvxsuspension/ArrowLineRight_dark.svg" svg-inline />
                <div class="u-text">收起悬浮窗</div>
            </div>
            <div class="u-pinned-list" v-if="localList.length">
                <div class="u-item" v-for="item in localList" :key="item.id">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/ArrowLineLeft.svg" svg-inline />
                    <img class="u-icon_dark" src="@/assets/img/pvxsuspension/ArrowLineLeft_dark.svg" svg-inline />
                    <div class="u-text">{{ item.title }}</div>
                    <div class="u-btn" @click.stop="cancelPinned(item)">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/delete.svg" svg-inline />
                        <img class="u-icon_dark" src="@/assets/img/pvxsuspension/delete_dark.svg" svg-inline />
                    </div>
                </div>
                <div class="u-item" @click.stop="cancelPinnedAll()">
                    <img class="u-icon_delete" src="@/assets/img/pvxsuspension/delete_all.svg" svg-inline />
                    <div class="u-text_delete">清空所有固定内容</div>

                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { compact } from "lodash";
import {
    setCollect,
    getCollectList,
    cancelCollect
} from '@/service/suspension'
export default {
    name: "PvxSuspension",
    props: {
        //所处界面类型，list 或 single及详情页
        isType: {
            type: String,
            default: 'list',
        },
        //所处项目类别,主要用于收藏接口请求，稍微再看区分数据来源，以及搜索和分享区分项目
        type: {
            type: String,
            default: 'face',
        },
        title: {
            type: String,
            default: '',
        },
        //用户收藏状态接口，稍后再看区分数据
        id: {
            type: [String, Number],
            default: '',
        },
        // 小程序跳转搜索界面参数
        miniprogram: {
            type: Object,
            default: () => {
                return {}
            }
        }

    },
    components: {},
    data: function () {
        return {
            navStatus: false,
            options: [],
            isCollect: false,
            collectInfo: null,
            localList: [], //稍后再看本地缓存数据
            isPinned: false,
            drawer: false,
            iframeInfo: null,
            removeIframePinned: false,
            longPress: false, // 用于标记是否为长按
            drawerLong: false, //长按弹窗
            localStorageKey: 'pvx-view-history',
            isDarkModeStatus: false,
        };
    },
    computed: {
        navStatusClass() {
            let text = "";
            const navStatus = this.navStatus;
            if (navStatus) {
                text = "is-opened";
            } else {
                text = "is-closed";
            }
            return text;
        },
        miniprogramParams() {
            const params = [];
            for (const key in this.miniprogram) {
                if (this.miniprogram.hasOwnProperty(key)) {
                    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(this.miniprogram[key]));
                }
            }
            return params.join('&');
        }
    },
    watch: {
        isType: {
            handler(val) {
                if (val === "single") {
                    let arr = [
                        { label: '搜索', icon: require('@/assets/img/pvxsuspension/search.svg'), icon_dark: require('@/assets/img/pvxsuspension/search_dark.svg'), value: 1 },
                        { label: '稍后再看', icon: require('@/assets/img/pvxsuspension/pinned.svg'), icon_dark: require('@/assets/img/pvxsuspension/pinned_dark.svg'), value: 2 },
                        { label: '收藏', icon: require('@/assets/img/pvxsuspension/collect.svg'), icon_active: require('@/assets/img/pvxsuspension/collect_active.svg'), icon_dark: require('@/assets/img/pvxsuspension/collect_dark.svg'), icon_active_dark: require('@/assets/img/pvxsuspension/collect_active_dark.svg'), value: 3, isJudge: true },
                        // { label: '分享', icon: require('@/assets/img/pvxsuspension/share.svg'), value: 4 },
                    ]
                    this.options = arr
                }
                if (val === "list") {
                    let arr = [
                        { label: '搜索', icon: require('@/assets/img/pvxsuspension/search.svg'), value: 1 },
                    ]
                    this.options = arr
                }
            },
            immediate: true,
        },
    },
    methods: {
        isDarkMode() {
            // 使用 window.matchMedia 检查系统是否启用了暗色模式
            const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

            this.isDarkMode = mediaQueryList.matches;
            // return mediaQueryList.matches;
        },
        handleTouchStart(event) {
            // 记录触摸开始的时间
            this.startTime = Date.now();
            clearTimeout(this.longPressTimeout); // 清除之前的长按检测（如果有的话）

            // 设置一个定时器，如果超过预设时间则认为是长按
            this.longPressTimeout = setTimeout(() => {
                this.longPress = true; // 标记为长按
                this.handleLongPress(event); // 处理长按事件
            }, 500); // 设置长按时间为500毫秒
        },
        handleTouchEnd(event) {
            clearTimeout(this.longPressTimeout); // 清除定时器，如果不是长按则不处理后续事件

            this.longPress = false; // 重置长按标记
        },
        handleTouchCancel(event) {
            clearTimeout(this.longPressTimeout); // 如果触摸被取消，也清除定时器
            this.longPress = false; // 重置长按标记
        },
        handleLongPress(event) {
            if (this.isType == 'list') return;
            // 在这里处理长按逻辑
            this.toLeft();
            this.drawerLong = true
        },
        toLeft() {
            this.navStatus = false;
        },
        toRight() {
            this.navStatus = true;
        },
        itemClick(item) {
            //如果是搜索 直接跳转原生搜索界面
            if (item.value == 1) {
                let params = this.miniprogramParams
                console.log(params)
                wx.miniProgram.navigateTo({ url: "/pages/search/search-detail/search-detail?" + params });
            }
            // 定住当前页面
            if (item.value == 2) {
                this.setLater()
            }
            //如果是收藏 收藏或取消收藏
            if (item.value == 3) {
                this.setCollect()
            }
            this.$emit('itemClick', item);
        },
        //设置稍后再看功能
        setLater() {
            //先判断是否存在本地存储
            let history = localStorage.getItem(this.localStorageKey);
            if (history) {
                //判断当前id和type的界面是否存在本地存储，如果存在则忽略，不存在则添加
                let historyList = JSON.parse(history);
                let isExist = historyList.some((item) => {
                    return item.id == this.id && item.type == this.type
                })
                if (!isExist) {
                    //如果historyList长度等于3，提示用户删除一个
                    if (historyList.length == 3) {
                        this.$message({
                            message: '最多保存3个页面，可删除一个后再保存',
                            type: 'warning'
                        })
                        return
                    }
                    //先获取当前界面的链接
                    let url = window.location.href;
                    let json = {
                        url: url,
                        title: this.title || document.title,
                        time: new Date().getTime(),
                        id: this.id,
                        type: this.type
                    }
                    historyList.push(json)
                    localStorage.setItem(this.localStorageKey, JSON.stringify(historyList))
                    this.localList = historyList
                }
            } else {
                let historyList = []
                let url = window.location.href;
                let json = {
                    url: url,
                    title: this.title || document.title,
                    time: new Date().getTime(),
                    id: this.id,
                    type: this.type
                }
                historyList.push(json)
                localStorage.setItem(this.localStorageKey, JSON.stringify(historyList))
                this.localList = historyList
            }
        },
        //取消标定
        cancelPinned(value) {
            //从localList中删除当前id和type的数据,同时更新本地缓存
            let index = null;
            let historyList = this.localList;
            if (value) {
                index = historyList.findIndex((item) => {
                    return item.id == value.id && item.type == value.type
                })
            } else {
                index = historyList.findIndex((item) => {
                    return item.id == this.iframeInfo.id && item.type == this.iframeInfo.type
                })
            }
            if (index != -1) {
                historyList.splice(index, 1)
                localStorage.setItem(this.localStorageKey, JSON.stringify(historyList))
                this.localList = historyList
                this.$message({
                    message: '取消成功',
                    type: 'success'
                })
                this.removeIframePinned = true
            }
        },
        //清除所有固定页面
        cancelPinnedAll() {
            localStorage.removeItem(this.localStorageKey)
            this.localList = []
            this.$message({
                message: '清除成功',
                type: 'success'
            })
        },
        pinnedClick(item) {
            //抽屉式打开引入新页面
            this.iframeInfo = item
            this.drawer = true
            this.removeIframePinned = false
        },
        //设置收藏
        setCollect() {
            if (this.isCollect) {
                cancelCollect(this.collectInfo.id).then((res) => {
                    this.getCollectStatus()
                })
            } else {
                setCollect(this.id, this.type).then((res) => {
                    this.getCollectStatus()
                })
            }
        },
        //获取收藏状态
        getCollectStatus() {
            getCollectList(this.id, this.type).then((res) => {
                let info = res.data.data
                this.collectInfo = info
                this.isCollect = info.id ? true : false
            })
        }
    },
    mounted() {
        if (this.isType == 'list') return
        this.isDarkMode();
        this.getCollectStatus()
        //获取本地存储的稍后再看历史
        let history = localStorage.getItem(this.localStorageKey);
        if (history) {
            let historyList = JSON.parse(history);
            this.localList = historyList
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/suspension.less";
</style>
