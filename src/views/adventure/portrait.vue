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
            </div>

            <div id="capture" ref="capture" v-if="!noRole">
                <div
                    class="m-content"
                    :style="{
                        zoom: contentZoom,
                    }"
                >
                    <div class="m-top">
                        <img class="u-top__img" :src="getCdnImgUrl('portrait/top.png')" />
                    </div>

                    <!-- 顶部 -->
                    <div class="m-introduce">
                        <div class="m-producer">
                            <img class="u-producer" :src="getCdnImgUrl('producer.png')" />
                            <img class="u-title__icon" :src="getCdnImgUrl('portrait/title_icon.png')" />
                        </div>
                        <div class="m-info">
                            <div class="u-producer__text">*剑网3魔盒提供技术支持，茗伊插件提供数据支持。</div>
                            <div class="m-user">
                                <span class="u-name">{{ roleInfo.name }}</span>
                                <img class="u-icon" :src="showSchoolIcon(roleInfo.mount)" />
                            </div>
                            <div class="u-progress">奇遇进度：{{ userAchievement.progress }}%</div>
                            <div class="u-time">记录时间：{{ userAchievement.updated_at }}</div>
                            <img class="m-tip" :src="getCdnImgUrl('poetry_por.png')" />
                        </div>
                        <img class="u-introduce__bg" :src="getCdnImgUrl('content_bg.png')" />
                    </div>

                    <template v-if="userAchievement">
                        <!-- 绝世奇遇 -->
                        <div class="m-world">
                            <img class="u-world__bg" :src="getCdnImgUrl('world/world_bg.svg')" />
                            <div class="m-world-count">
                                <img class="u-count__img" :src="getCdnImgUrl('portrait/world_qy_bg.png')" />
                                <div class="m-count-info">
                                    {{ userAchievement.perfectNowNum + "/" + userAchievement.perfectAllNum }}
                                </div>
                            </div>
                            <div
                                class="m-world-item"
                                v-for="(item, index) in userAchievement.perfect"
                                :key="index"
                                :class="item.hasClass"
                                :style="{
                                    zIndex: item.zIndex,
                                }"
                            >
                                <img
                                    class="u-item__img"
                                    :src="getCdnImgUrl(`world/${item.dwID}${item.isAct ? '_act' : ''}.png`)"
                                />
                                <div class="m-item__text">
                                    <img
                                        class="u-item__bg"
                                        :src="getCdnImgUrl(`world/text_bg${item.isAct ? '_act' : ''}.png`)"
                                    />
                                    <span class="u-item__text">{{ item.szName }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 普通奇遇 -->
                        <div class="m-qy-box">
                            <div class="m-qy m-ordinary">
                                <div class="m-qy-count">
                                    <img class="u-count__img" :src="getCdnImgUrl('portrait/pt_qy_bg.png')" />
                                    <div class="m-count-info">
                                        {{ userAchievement.normalNowNum + "/" + userAchievement.normalAllNum }}
                                    </div>
                                </div>
                                <div class="m-qy-list" v-if="userAchievement.normal.length">
                                    <div
                                        class="m-qy__item"
                                        v-for="(item, index) in userAchievement.normal"
                                        :key="index"
                                    >
                                        <template v-if="[4, 118].indexOf(item.dwID) > -1">
                                            <img
                                                v-show="currentCamp == 'hq'"
                                                class="u-qy__img"
                                                :src="getCdnImgUrl(`pt/${item.dwID}_hq.png`)"
                                            />
                                            <img
                                                v-show="currentCamp == 'er'"
                                                class="u-qy__img"
                                                :src="getCdnImgUrl(`pt/${item.dwID}_er.png`)"
                                            />
                                        </template>
                                        <el-image v-else class="u-qy__img" :src="getCdnImgUrl(`pt/${item.dwID}.png`)">
                                            <!-- TODO -->
                                            <el-image
                                                slot="error"
                                                class="u-qy__img"
                                                :src="getCdnImgUrl(`pt/default.png`)"
                                            >
                                            </el-image>
                                        </el-image>
                                        <div class="m-qy__text">
                                            <img class="u-qy__bg" :src="getCdnImgUrl('pt/text_bg.png')" />
                                            <span class="u-qy__text">{{ item.szName }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="u-no-qy" v-else>
                                    <img :src="getCdnImgUrl('portrait/no_qy.png')" />
                                </div>
                            </div>
                            <!-- 宠物奇遇 -->
                            <div class="m-qy m-pet">
                                <div class="m-qy-count">
                                    <img class="u-count__img" :src="getCdnImgUrl('portrait/pet_qy_bg.png')" />
                                    <div class="m-count-info">
                                        {{ userAchievement.petNowNum + "/" + userAchievement.petAllNum }}
                                    </div>
                                </div>
                                <div class="m-qy-list" v-if="userAchievement.pet.length">
                                    <div class="m-qy__item" v-for="(item, index) in userAchievement.pet" :key="index">
                                        <img class="u-qy__img" :src="getImgUrl(item)" />
                                        <img class="u-qy__border" :src="getCdnImgUrl('pet_img_border.png')" />
                                    </div>
                                </div>
                                <div class="u-no-qy" v-else>
                                    <img :src="getCdnImgUrl('portrait/no_qy.png')" />
                                </div>
                            </div>
                        </div>
                    </template>

                    <div
                        class="m-bottom"
                        :class="{
                            start: addClass,
                            over: isOver,
                        }"
                    >
                        <img class="u-bottom__img" :src="getCdnImgUrl('portrait/bottom.png')" />
                    </div>
                </div>
            </div>
            <!-- <button v-if="isOver" @click="saveAsImage" class="u-btn m-hide el-button el-button--primary">
                保存图片
            </button> -->
        </template>
    </div>
</template>

<script>
import { getUserRoles } from "@/service/adventure/treasure.js";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import getData from "@/assets/js/treasure.js";
import User from "@jx3box/jx3box-common/js/user";
import html2canvas from "html2canvas";
import { __Links, __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "portrait",
    inject: ["__imgRoot", "__imgPath"],
    data: () => ({
        addClass: false,
        isOver: false,
        contentZoom: "",
        userAchievement: false,
        roleList: [],
        noRole: false,
        currentRole: "",
        currentCamp: "hq",
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
@import "~@/assets/css/adventure/portrait.less";
@import "~@/assets/css/adventure/treasure.less";
</style>
