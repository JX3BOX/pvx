<template>
    <div class="m-body">
        <template v-if="!isLogin">
            <div class="u-bind_role">
                <el-empty description="您还没有登录" :image="__imgPath + `/img/common/empty.png`" :image-size="200">
                    <a class="u-btn el-button el-button--primary" :href="login_url"
                        >前往登录 <i class="el-icon-arrow-right"></i
                    ></a>
                </el-empty>
            </div>
        </template>
        <template v-else-if="noRole">
            <div class="u-bind_role">
                <el-empty description="当前暂未绑定角色" :image="__imgPath + `/img/common/empty.png`" :image-size="200">
                    <a class="u-btn el-button el-button--primary" href="/team/role/bind"
                        >前往绑定 <i class="el-icon-arrow-right"></i
                    ></a>
                </el-empty>
            </div>
        </template>
        <template v-else>
            <div class="m-related-roles">
                <el-select
                    v-model="currentRole"
                    value-key="ID"
                    placeholder="请选择当前角色"
                    :disabled="!isLogin"
                    popper-class="m-related-roles-options"
                    size="small"
                >
                    <span slot="prefix" class="u-prefix">
                        角色名称
                        <el-tooltip
                            v-if="!isVirtual && !isSync"
                            class="item"
                            effect="dark"
                            content="请先在游戏中同步成就"
                            placement="top"
                        >
                            <a href="/tool/74559" target="_blank"><i class="el-icon-warning-outline"></i></a>
                        </el-tooltip>
                    </span>
                    <el-option v-for="role in roleList" :key="role.ID" :value="role" :label="role.name">
                        <span class="u-role">
                            <span class="u-role-name"
                                ><img class="u-role-icon" :src="showSchoolIcon(role.mount)" />{{ role.name }}</span
                            >
                            <span class="u-role-server">{{ role.server }}</span>
                        </span>
                    </el-option>
                </el-select>
                <el-select
                    v-model="currentCamp"
                    placeholder="请选择阵营"
                    popper-class="m-related-roles-options"
                    size="small"
                >
                    <span slot="prefix" class="u-prefix">所在阵营</span>
                    <el-option value="hq" label="浩气盟阵营"> </el-option>
                    <el-option value="er" label="恶人谷阵营"> </el-option>
                </el-select>
                <el-button class="u-refresh" size="small" @click="onRefresh">
                    <i class="el-icon-refresh"></i>刷新卷轴</el-button
                >
            </div>

            <div id="capture" ref="capture" v-if="!noRole">
                <portraitContent
                    :__img-root="__imgRoot"
                    :user-achievement="userAchievement"
                    :role-info="roleInfo"
                    :add-class="addClass"
                    :is-over="isOver"
                    :content-zoom="contentZoom"
                    :current-camp="currentCamp"
                ></portraitContent>
            </div>
            <!-- <button v-if="isOver" @click="saveAsImage" class="u-btn m-hide el-button el-button--primary">
                保存图片
            </button> -->
        </template>
    </div>
</template>

<script>
import { getUserRoles, refreshAchievementsTask } from "@/service/adventure/treasure.js";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import getData from "@/assets/js/treasure.js";
import User from "@jx3box/jx3box-common/js/user";
import html2canvas from "html2canvas";
import { __Links, __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
import portraitContent from "./portraitContent.vue";
export default {
    name: "portrait",
    inject: ["__imgRoot", "__imgPath"],
    components: {
        portraitContent,
    },
    data: () => ({
        addClass: false,
        isOver: false,
        contentZoom: "",
        userAchievement: false,
        roleList: [],
        noRole: false,
        currentRole: "",
        currentCamp: "",
        roleInfo: {},
        isLogin: User.isLogin(),
        virtualRole: {
            ...User.getInfo(),
            jx3id: 0,
            ID: ~~User.getInfo().uid,
        },
        isSync: false,
        login_url: __Links.account.login + "?redirect=" + location.href,
    }),
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    watch: {
        currentRole: {
            deep: true,
            handler(val) {
                this.roleInfo = val;
                if (val.jx3id) {
                    this.loadRole(val.jx3id);
                }
            },
        },
        virtualRole: {
            immediate: true,
            deep: true,
            handler(virtualRole) {
                this.currentRole = virtualRole;
            },
        },
    },
    created() {
        if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
            let metaViewport = document.querySelector('meta[name="viewport"]');
            metaViewport.setAttribute('content', '');
        }
        // this.userAchievement={
        //     "pet": [
        //         {
        //             "dwID": 146,
        //             "szName": "燕啼松",
        //             "nNameFrame": 43,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yantisong.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\yantisong_Open.tga"
        //         },
        //         {
        //             "dwID": 145,
        //             "szName": "匿沙影",
        //             "nNameFrame": 41,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\nishaying.tga",
        //             "szTaskTracePath": "\\ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/nishaying_Open.tga"
        //         },
        //         {
        //             "dwID": 141,
        //             "szName": "故人愿",
        //             "nNameFrame": 36,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\gurenyuan.tga",
        //             "szTaskTracePath": "\\ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\故人愿_Open.tga"
        //         },
        //         {
        //             "dwID": 140,
        //             "szName": "语不休",
        //             "nNameFrame": 37,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yubuxiu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\yubuxiu_Open.tga"
        //         },
        //         {
        //             "dwID": 139,
        //             "szName": "风花雪",
        //             "nNameFrame": 35,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\fenghuaxue.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\fenghuaxue_Open.tga"
        //         },
        //         {
        //             "dwID": 131,
        //             "szName": "义千金",
        //             "nNameFrame": 31,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yiqianjin.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\yiqianjin_Open.tga"
        //         },
        //         {
        //             "dwID": 129,
        //             "szName": "路投石",
        //             "nNameFrame": 29,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\lutoushi.tga",
        //             "szTaskTracePath": "\\ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\路投石_Open.tga"
        //         },
        //         {
        //             "dwID": 127,
        //             "szName": "觅知音",
        //             "nNameFrame": 30,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\mizhiyin.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\mizhiyin_Open.tga"
        //         },
        //         {
        //             "dwID": 120,
        //             "szName": "解心语",
        //             "nNameFrame": 19,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\jiexinyu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\jiexinyu_Open.tga"
        //         },
        //         {
        //             "dwID": 119,
        //             "szName": "破巧言",
        //             "nNameFrame": 20,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\poqiaoyan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\poqiaoyan_Open.tga"
        //         },
        //         {
        //             "dwID": 117,
        //             "szName": "醉烟波",
        //             "nNameFrame": 24,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\zuiyanbo.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\zuiyanbo_Open.tga"
        //         },
        //         {
        //             "dwID": 116,
        //             "szName": "乱红鸾",
        //             "nNameFrame": 22,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\luanhongluan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\乱红鸾_Open.tga"
        //         },
        //         {
        //             "dwID": 115,
        //             "szName": "夜哀鸣",
        //             "nNameFrame": 23,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yeaiming.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\yeaiming_Open.tga"
        //         },
        //         {
        //             "dwID": 109,
        //             "szName": "故岁辞",
        //             "nNameFrame": 9,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\gusuici.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\故岁辞_Open.tga"
        //         },
        //         {
        //             "dwID": 108,
        //             "szName": "重洋客",
        //             "nNameFrame": 10,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\chongyangke.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/chongyangke_Open.tga"
        //         },
        //         {
        //             "dwID": 107,
        //             "szName": "子夜歌",
        //             "nNameFrame": 11,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\ziyege.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\子夜歌_Open.tga"
        //         },
        //         {
        //             "dwID": 105,
        //             "szName": "枉叹恨",
        //             "nNameFrame": 6,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\wangtanhen.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\枉叹恨_Open.tga"
        //         },
        //         {
        //             "dwID": 103,
        //             "szName": "幽海牧",
        //             "nNameFrame": 5,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\youhaimu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\幽海牧_Open.tga"
        //         },
        //         {
        //             "dwID": 102,
        //             "szName": "鸠雀记",
        //             "nNameFrame": 4,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\jiuqueji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\鸠雀记_Open.tga"
        //         },
        //         {
        //             "dwID": 97,
        //             "szName": "风雨意",
        //             "nNameFrame": 0,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\fengyuyi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\风雨意_Open.tga"
        //         },
        //         {
        //             "dwID": 96,
        //             "szName": "念旧林",
        //             "nNameFrame": 2,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\nianjiulin.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\念旧林_Open.tga"
        //         },
        //         {
        //             "dwID": 95,
        //             "szName": "童蒙志",
        //             "nNameFrame": 1,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\tongmengzhi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\童蒙志_Open.tga"
        //         },
        //         {
        //             "dwID": 92,
        //             "szName": "捉贼记",
        //             "nNameFrame": 79,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\zhuozeiji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\捉贼记_Open.tga"
        //         },
        //         {
        //             "dwID": 91,
        //             "szName": "丹青记",
        //             "nNameFrame": 80,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\danqingji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\丹青记_Open.tga"
        //         },
        //         {
        //             "dwID": 89,
        //             "szName": "一枝栖",
        //             "nNameFrame": 78,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yizhiqi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\一枝栖_Open.tga"
        //         },
        //         {
        //             "dwID": 87,
        //             "szName": "尘网中",
        //             "nNameFrame": 76,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\chenwangzhong.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\尘网中_Open.tga"
        //         },
        //         {
        //             "dwID": 86,
        //             "szName": "白月皎",
        //             "nNameFrame": 74,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\baiyuejiao.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\白月皎_Open.tga"
        //         },
        //         {
        //             "dwID": 85,
        //             "szName": "话玄虚",
        //             "nNameFrame": 75,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\huaxuanxu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\话玄虚_Open.tga"
        //         },
        //         {
        //             "dwID": 81,
        //             "szName": "瀛洲梦",
        //             "nNameFrame": 70,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yingzhoumeng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\瀛洲梦_Open.tga"
        //         },
        //         {
        //             "dwID": 80,
        //             "szName": "莫贪杯",
        //             "nNameFrame": 71,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\motanbei.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\莫贪杯_Open.tga"
        //         },
        //         {
        //             "dwID": 77,
        //             "szName": "露园事",
        //             "nNameFrame": 69,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\luyuanshi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\露园事_Open.tga"
        //         },
        //         {
        //             "dwID": 75,
        //             "szName": "江湖录",
        //             "nNameFrame": 63,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\jianghulu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\江湖录_Open.tga"
        //         },
        //         {
        //             "dwID": 74,
        //             "szName": "缘来会·铃",
        //             "nNameFrame": 65,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yuanlaihuiling.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\缘来会·铃_Open.tga"
        //         },
        //         {
        //             "dwID": 73,
        //             "szName": "缘来会·瓜",
        //             "nNameFrame": 64,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yuanlaihuigua.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\缘来会·瓜_Open.tga"
        //         },
        //         {
        //             "dwID": 72,
        //             "szName": "沧海笛",
        //             "nNameFrame": 60,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\canghaidi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\沧海笛_Open.tga"
        //         },
        //         {
        //             "dwID": 71,
        //             "szName": "谜书生",
        //             "nNameFrame": 62,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\mishusheng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\谜书生_Open.tga"
        //         },
        //         {
        //             "dwID": 70,
        //             "szName": "滴水恩",
        //             "nNameFrame": 61,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\dishuien.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\滴水恩_Open.tga"
        //         },
        //         {
        //             "dwID": 69,
        //             "szName": "客江干",
        //             "nNameFrame": 57,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\kejianggan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\kejianggan_Open.tga"
        //         },
        //         {
        //             "dwID": 68,
        //             "szName": "秘宝图",
        //             "nNameFrame": 58,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\mibaotu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\mibaotu_Open.tga"
        //         },
        //         {
        //             "dwID": 67,
        //             "szName": "太行道",
        //             "nNameFrame": 59,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\taihangdao.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\taixingdao_Open.tga"
        //         },
        //         {
        //             "dwID": 64,
        //             "szName": "归安志·志",
        //             "nNameFrame": 54,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/guianzhizhi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/归安志志_Open.tga"
        //         },
        //         {
        //             "dwID": 63,
        //             "szName": "归安志·归",
        //             "nNameFrame": 53,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/guianzhigui.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/归安志归_Open.tga"
        //         },
        //         {
        //             "dwID": 62,
        //             "szName": "归安志·安",
        //             "nNameFrame": 52,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/guianzhian.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/归安志安_Open.tga"
        //         },
        //         {
        //             "dwID": 61,
        //             "szName": "烟花戏·风",
        //             "nNameFrame": 4,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/yanhuaxifeng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/烟花戏风_Open.tga"
        //         },
        //         {
        //             "dwID": 60,
        //             "szName": "烟花戏·秋",
        //             "nNameFrame": 5,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/yanhuaqiqiu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/烟花戏秋_Open.tga"
        //         },
        //         {
        //             "dwID": 59,
        //             "szName": "烟花戏·春",
        //             "nNameFrame": 3,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/yanhuaqichun.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/烟花戏春_Open.tga"
        //         },
        //         {
        //             "dwID": 58,
        //             "szName": "烟花戏·月",
        //             "nNameFrame": 6,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/yanhuaxiyue.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/烟花戏月_Open.tga"
        //         },
        //         {
        //             "dwID": 57,
        //             "szName": "白雪忆",
        //             "nNameFrame": 0,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/baixueyi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/白雪忆_Open.tga"
        //         },
        //         {
        //             "dwID": 56,
        //             "szName": "戎马边",
        //             "nNameFrame": 2,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/rongmabian.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/戎马边_Open.tga"
        //         },
        //         {
        //             "dwID": 55,
        //             "szName": "一念间",
        //             "nNameFrame": 7,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/yinianjian.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/一念间_Open.tga"
        //         },
        //         {
        //             "dwID": 54,
        //             "szName": "锻剑女",
        //             "nNameFrame": 1,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/duanjiannv.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/锻剑女_Open.tga"
        //         },
        //         {
        //             "dwID": 49,
        //             "szName": "儿女事",
        //             "nNameFrame": 48,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/ernvshi.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/儿女事_Open.tga"
        //         },
        //         {
        //             "dwID": 48,
        //             "szName": "烹调法",
        //             "nNameFrame": 50,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/pengtiaofa.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/烹调法_Open.tga"
        //         },
        //         {
        //             "dwID": 47,
        //             "szName": "锋芒展",
        //             "nNameFrame": 49,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/fengmangzhan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/锋芒展_Open.tga"
        //         },
        //         {
        //             "dwID": 44,
        //             "szName": "关外商",
        //             "nNameFrame": 46,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\gws.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\gws_Open.tga"
        //         },
        //         {
        //             "dwID": 43,
        //             "szName": "东海客",
        //             "nNameFrame": 45,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\dhk.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\dhk_Open.tga"
        //         },
        //         {
        //             "dwID": 42,
        //             "szName": "北行镖",
        //             "nNameFrame": 44,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/bxb.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/北行镖_Open.tga"
        //         },
        //         {
        //             "dwID": 37,
        //             "szName": "滇南行",
        //             "nNameFrame": 39,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/滇南行_Open.tga"
        //         },
        //         {
        //             "dwID": 36,
        //             "szName": "青草歌",
        //             "nNameFrame": 40,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/青草歌_Open.tga"
        //         },
        //         {
        //             "dwID": 35,
        //             "szName": "稚子心",
        //             "nNameFrame": 41,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/稚子心_Open.tga"
        //         },
        //         {
        //             "dwID": 34,
        //             "szName": "兽王佩",
        //             "nNameFrame": 36,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\swp_Open.tga"
        //         },
        //         {
        //             "dwID": 30,
        //             "szName": "至尊宝",
        //             "nNameFrame": 34,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\zzb_Open.tga"
        //         },
        //         {
        //             "dwID": 29,
        //             "szName": "竹马情",
        //             "nNameFrame": 35,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\zmq_Open.tga"
        //         },
        //         {
        //             "dwID": 28,
        //             "szName": "破晓鸣",
        //             "nNameFrame": 33,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\pxm_Open.tga"
        //         },
        //         {
        //             "dwID": 27,
        //             "szName": "荆轲刺",
        //             "nNameFrame": 28,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\荆轲刺_Open.tga"
        //         },
        //         {
        //             "dwID": 26,
        //             "szName": "石敢当",
        //             "nNameFrame": 30,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\石敢当_Open.tga"
        //         },
        //         {
        //             "dwID": 25,
        //             "szName": "沙海谣",
        //             "nNameFrame": 29,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\沙海谣_Open.tga"
        //         },
        //         {
        //             "dwID": 18,
        //             "szName": "孩童书",
        //             "nNameFrame": 2,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\一杠_Open.tga"
        //         },
        //         {
        //             "dwID": 17,
        //             "szName": "捉妖记",
        //             "nNameFrame": 9,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\酒客_Open.tga"
        //         },
        //         {
        //             "dwID": 16,
        //             "szName": "红衣歌",
        //             "nNameFrame": 3,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\红绸_Open.tga"
        //         },
        //         {
        //             "dwID": 15,
        //             "szName": "枫林酒",
        //             "nNameFrame": 0,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/pet/枫林客_Open.tga"
        //         },
        //         {
        //             "dwID": 14,
        //             "szName": "归乡路",
        //             "nNameFrame": 1,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\童心客_Open.tga"
        //         },
        //         {
        //             "dwID": 13,
        //             "szName": "胜负局",
        //             "nNameFrame": 5,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\蟹胜蟹负_Open.tga"
        //         },
        //         {
        //             "dwID": 12,
        //             "szName": "清茗经",
        //             "nNameFrame": 4,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/cwqy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\pet\\清茗小龟_Open.tga"
        //         }
        //     ],
        //     "normal": [
        //         {
        //             "dwID": 148,
        //             "szName": "生花笔",
        //             "nNameFrame": 44,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\shenghuabi.tga",
        //             "szTaskTracePath": "ui/Image/UICommon/LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\shb_open.tga"
        //         },
        //         {
        //             "dwID": 144,
        //             "szName": "福运满载",
        //             "nNameFrame": 40,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\fuyunmanzai.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\fymz_open.tga"
        //         },
        //         {
        //             "dwID": 134,
        //             "szName": "侠者成歌",
        //             "nNameFrame": 32,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\xiazhechengge.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\xzcg_open.tga"
        //         },
        //         {
        //             "dwID": 125,
        //             "szName": "泛天河",
        //             "nNameFrame": 27,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\fantianhe.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\泛天河_open.tga"
        //         },
        //         {
        //             "dwID": 124,
        //             "szName": "空谷回音",
        //             "nNameFrame": 25,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\kongguhuiyin.tga",
        //             "szTaskTracePath": "\\ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\kghy_open.tga"
        //         },
        //         {
        //             "dwID": 123,
        //             "szName": "赴九幽",
        //             "nNameFrame": 26,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\赴九幽-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\赴九幽_Open.tga"
        //         },
        //         {
        //             "dwID": 113,
        //             "szName": "拜春擂",
        //             "nNameFrame": 15,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\拜春擂-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\拜春擂_Open.tga"
        //         },
        //         {
        //             "dwID": 101,
        //             "szName": "庆舞良宵",
        //             "nNameFrame": 3,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\qingwuliangxiao.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\庆舞良宵_Open.tga"
        //         },
        //         {
        //             "dwID": 99,
        //             "szName": "度人心",
        //             "nNameFrame": 84,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\durenxin.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\度人心_Open.tga"
        //         },
        //         {
        //             "dwID": 98,
        //             "szName": "凌云梯",
        //             "nNameFrame": 85,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\凌云梯-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\凌云梯-触发奇遇奖励.tga"
        //         },
        //         {
        //             "dwID": 94,
        //             "szName": "旧宴承欢",
        //             "nNameFrame": 83,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\旧宴承欢-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\旧宴承欢-触发奇遇奖励.tga"
        //         },
        //         {
        //             "dwID": 93,
        //             "szName": "寻猫记",
        //             "nNameFrame": 82,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\xunmaoji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\寻猫记_Open.tga"
        //         },
        //         {
        //             "dwID": 82,
        //             "szName": "劝学记",
        //             "nNameFrame": 72,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\quanxueji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\劝学记_Open.tga"
        //         },
        //         {
        //             "dwID": 79,
        //             "szName": "白日梦",
        //             "nNameFrame": 68,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\bairimeng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\白日梦_Open.tga"
        //         },
        //         {
        //             "dwID": 65,
        //             "szName": "惜往日",
        //             "nNameFrame": 56,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\xiwangri.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\xwr_Open.tga"
        //         },
        //         {
        //             "dwID": 46,
        //             "szName": "故园风雨",
        //             "nNameFrame": 47,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\gyfy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\故园风雨_Open.tga"
        //         },
        //         {
        //             "dwID": 41,
        //             "szName": "平生心愿",
        //             "nNameFrame": 42,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\psxy.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\psxy_Open.tga"
        //         },
        //         {
        //             "dwID": 40,
        //             "szName": "雪山恩仇",
        //             "nNameFrame": 43,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/xsec.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/xsec_Open.tga"
        //         },
        //         {
        //             "dwID": 33,
        //             "szName": "乱世舞姬",
        //             "nNameFrame": 37,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\lswj.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\lswj_Open.tga"
        //         },
        //         {
        //             "dwID": 32,
        //             "szName": "虎啸山林",
        //             "nNameFrame": 32,
        //             "szFirstPagePath": "ui/Image/Adventure/catalogue/hxsl.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\hxsl_Open.tga"
        //         },
        //         {
        //             "dwID": 31,
        //             "szName": "护佑苍生",
        //             "nNameFrame": 38,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\bxtx.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\hycs_Open.tga"
        //         },
        //         {
        //             "dwID": 22,
        //             "szName": "天涯无归",
        //             "nNameFrame": 27,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\tywg.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\tywg_Open.tga"
        //         },
        //         {
        //             "dwID": 20,
        //             "szName": "扶摇九天",
        //             "nNameFrame": 10,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\fuyaojiutian.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\fuyaojiutian_Open.tga"
        //         },
        //         {
        //             "dwID": 8,
        //             "szName": "生死判",
        //             "nNameFrame": 25,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\shengsipan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\生死判_Open.tga"
        //         },
        //         {
        //             "dwID": 7,
        //             "szName": "茶馆奇缘",
        //             "nNameFrame": 20,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\chaguanqiyuan.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\茶馆奇缘_Open.tga"
        //         },
        //         {
        //             "dwID": 6,
        //             "szName": "少年行",
        //             "nNameFrame": 24,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\shaonianxing.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\少年行_Open.tga"
        //         }
        //     ],
        //     "perfect": [
        //         {
        //             "dwID": 142,
        //             "szName": "孤沙影寂",
        //             "nNameFrame": 39,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\gushayingji.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\gushayingji_Open.tga",
        //             "isAct": false,
        //             "hasClass": "gsyj",
        //             "zIndex": 16
        //         },
        //         {
        //             "dwID": 136,
        //             "szName": "昆吾余火",
        //             "nNameFrame": 33,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\kunwuyuhuo.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\kwyh\\",
        //             "isAct": false,
        //             "hasClass": "kwyh",
        //             "zIndex": 17
        //         },
        //         {
        //             "dwID": 135,
        //             "szName": "浮光织梦",
        //             "nNameFrame": 34,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\浮光织梦-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\浮光织梦_Open.tga",
        //             "isAct": false,
        //             "hasClass": "fgzm",
        //             "zIndex": 13
        //         },
        //         {
        //             "dwID": 126,
        //             "szName": "塞外西风",
        //             "nNameFrame": 28,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\saiwaixifeng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\swxf_Open.tga",
        //             "isAct": false,
        //             "hasClass": "swxf",
        //             "zIndex": 12
        //         },
        //         {
        //             "dwID": 121,
        //             "szName": "入蛟宫",
        //             "nNameFrame": 18,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\入蛟宫_首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\入蛟宫_Open.tga",
        //             "isAct": false,
        //             "hasClass": "rjg",
        //             "zIndex": 21
        //         },
        //         {
        //             "dwID": 111,
        //             "szName": "追魂骨",
        //             "nNameFrame": 13,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\追魂骨_首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\追魂骨_Open.tga",
        //             "isAct": false,
        //             "hasClass": "zhg",
        //             "zIndex": 9
        //         },
        //         {
        //             "dwID": 106,
        //             "szName": "千秋铸",
        //             "nNameFrame": 8,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\千秋铸-首页图片.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\qqz\\",
        //             "isAct": false,
        //             "hasClass": "qqj",
        //             "zIndex": 13
        //         },
        //         {
        //             "dwID": 104,
        //             "szName": "万灵当歌",
        //             "nNameFrame": 7,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\万灵当歌-首页图片.tga",
        //             "szTaskTracePath": "\\ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "\\ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui/Image/Adventure/reward/Open/万灵当歌_Open.tga",
        //             "isAct": false,
        //             "hasClass": "wldg",
        //             "zIndex": 22
        //         },
        //         {
        //             "dwID": 90,
        //             "szName": "流年如虹",
        //             "nNameFrame": 81,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\liunianruhong.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\流年如虹_Open.tga",
        //             "isAct": false,
        //             "hasClass": "lnrh",
        //             "zIndex": 8
        //         },
        //         {
        //             "dwID": 88,
        //             "szName": "侠行囧途",
        //             "nNameFrame": 77,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\xiaxingjiongtu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\侠行囧途_Open.tga",
        //             "isAct": true,
        //             "hasClass": "xxjt",
        //             "zIndex": 15
        //         },
        //         {
        //             "dwID": 83,
        //             "szName": "争铸吴钩",
        //             "nNameFrame": 73,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\zzwg.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\zzwg\\",
        //             "isAct": false,
        //             "hasClass": "zzwg",
        //             "zIndex": 18
        //         },
        //         {
        //             "dwID": 78,
        //             "szName": "兔江湖",
        //             "nNameFrame": 67,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\tujianghu.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\兔江湖_Open.tga",
        //             "isAct": true,
        //             "hasClass": "tjh",
        //             "zIndex": 19
        //         },
        //         {
        //             "dwID": 66,
        //             "szName": "济苍生",
        //             "nNameFrame": 55,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\jcs.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\jcs\\",
        //             "isAct": false,
        //             "hasClass": "jcs",
        //             "zIndex": 17
        //         },
        //         {
        //             "dwID": 21,
        //             "szName": "塞外宝驹",
        //             "nNameFrame": 18,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\swbj.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\swbj_Open.tga",
        //             "isAct": false,
        //             "hasClass": "swbj",
        //             "zIndex": 11
        //         },
        //         {
        //             "dwID": 3,
        //             "szName": "阴阳两界",
        //             "nNameFrame": 26,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\yinyangliangjie.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\阴阳两界_Open.tga",
        //             "isAct": false,
        //             "hasClass": "yylj",
        //             "zIndex": 10
        //         },
        //         {
        //             "dwID": 2,
        //             "szName": "三尺青锋",
        //             "nNameFrame": 22,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\sanchiqingfeng.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\weapon\\",
        //             "isAct": true,
        //             "hasClass": "scqf",
        //             "zIndex": 20
        //         },
        //         {
        //             "dwID": 1,
        //             "szName": "三山四海",
        //             "nNameFrame": 23,
        //             "szFirstPagePath": "ui\\Image\\Adventure\\catalogue\\sanshansihai.tga",
        //             "szTaskTracePath": "ui\\Image\\UICommon\\LuckyMeeting.UITex",
        //             "szOpenPath": "ui\\Image\\UICommon\\LuckyMeeting7.UITex",
        //             "szOpenRewardPath": "ui\\Image\\Adventure\\reward\\Open\\三山四海_Open.tga",
        //             "isAct": true,
        //             "hasClass": "sssh",
        //             "zIndex": 7
        //         }
        //     ],
        //     "updated_at": "2025年07月04日 00:43:03",
        //     "perfectAllNum": 17,
        //     "perfectNowNum": 4,
        //     "normalAllNum": 35,
        //     "normalNowNum": 26,
        //     "petAllNum": 76,
        //     "petNowNum": 74,
        //     "progress": "81.25"
        // }
        // this.isSync =true
        // this.addClass = false;
        // this.isOver = false;
        // this.$nextTick((_) => {
        //     this.start();
        // });
    },
    mounted() {
        getUserRoles().then((res) => {
            if (res.data.data.list.length) {
                this.noRole = false;
                this.roleList =
                    res.data?.data?.list.filter((item) => {
                        return !!item.player_id;
                    }) || [];
                if (this.roleList.length) {
                    this.currentRole = this.roleList[0];
                }
            } else {
                this.noRole = true;
                this.$message.error("未获取到角色信息");
            }
        });
    },
    methods: {
        onRefresh() {
            refreshAchievementsTask({
                mode: "portrait",
                role: this.currentRole.name,
                server: this.currentRole.server,
            }).then(() => {
                this.$message.success("刷新卷轴成功");
            });
        },
        async saveAsImage() {
            try {
                let oldZoom = this.contentZoom;
                this.contentZoom = 1;
                await new Promise((resolve) => {
                    this.$nextTick(() => {
                        resolve();
                    });
                });

                const element = this.$refs.capture; // 获取需要保存为图片的元素
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                }); // 将元素转换成canvas

                this.contentZoom = oldZoom;
                const img = canvas.toDataURL("image/png"); // 将canvas转换成图片数据
                const a = document.createElement("a"); // 创建一个a标签
                a.href = img; // 设置下载链接
                a.download = "downloaded-image.png"; // 设置下载文件名
                a.click(); // 模拟点击触发下载
            } catch (error) {
                console.error("Error saving image:", error);
            }
        },
        loadRole(userJx3Id) {
            getData(userJx3Id).then((res) => {
                this.isSync = !!userJx3Id; // 是否在游戏中同步
                this.userAchievement = res;
                this.addClass = false;
                this.isOver = false;
                this.$nextTick((_) => {
                    this.start();
                });
            });
        },
        start() {
            this.addClass = true;
            setTimeout(() => {
                this.addClass = false;
                this.isOver = true;
            }, 2000);
            window.addEventListener("resize", this.handleScreenWidthChange);
            window.addEventListener("load", this.handleScreenWidthChange);
            this.handleScreenWidthChange();
        },
        isVirtual() {
            // 是否是虚拟角色 - 魔盒账号
            return !this.currentRole?.jx3id;
        },
        getImgUrl(item) {
            const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (item.szRewardType === "camp")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (item.szRewardType === "school")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/school_${this.force}_open.png`;
            return defaultImg;
        },
        handleScreenWidthChange() {
            var screenWidth = window.innerWidth - 40;
            var boxWidth = 900;
            var scale = screenWidth / boxWidth;
            var zoom = 1;
            if (screenWidth <= boxWidth) {
                zoom = scale;
            }
            this.contentZoom = zoom;
        },
        showSchoolIcon,
        getCdnImgUrl(img) {
            return `${__cdn}design/treasure/${img}`;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/adventure/treasure.less";
</style>
