<template>
    <div v-if="task">
        <div id="mini-task-container" class="m-task-container" v-if="isMiniProgram">
            <div class="m-task-header m-task-item-box">
                <img :src="getImg(info)" class="u-task-img u-task-item-img" />
                <span class="u-task-name u-task-item-name">{{ info.szName }}</span>
            </div>
            <div class="m-task-item m-task-item-box" v-for="(item, i) in task" :key="i">
                <img :src="imgUrl(item.imgurl)" class="u-task-icon u-task-item-img" />
                <div class="m-task-content">
                    <div class="m-task-goal u-task-item-name">{{ item.szGoalMsg }}</div>
                    <div class="u-task-desc">{{ getText(item.szDescribe) }}</div>
                    <div class="u-task-desc">{{ getText(item.szFinishDescribe) }}</div>
                </div>
            </div>
        </div>
        <div class="m-adventure-task" v-else>
            <img class="u-prefix" src="@/assets/img/adventure_bg.png" />
            <img class="u-suffix" src="@/assets/img/adventure_bg.png" />
            <div class="u-content" id="task-box">
                <div class="u-item u-task-name">
                    <img :src="getImg(info)" />
                    <div class="u-info-box">
                        <span class="u-title">{{ info.szName }}</span>
                    </div>
                </div>
                <div class="u-item" v-for="(item, i) in task" :key="i">
                    <img :src="imgUrl(item.imgurl)" />
                    <div class="u-info-box u-desc-box">
                        <div class="u-title">{{ item.szGoalMsg }}</div>
                        <!-- <span class="u-title">{{ item.szTitle }}</span> -->
                        <div class="u-desc">{{ getText(item.szDescribe) }}</div>
                        <div class="u-desc">{{ getText(item.szFinishDescribe) }}</div>
                    </div>
                </div>
            </div>
            <div class="u-btn">
                <span @click="crosswiseScrool($event, 'task-box', 1, 600)" :class="isDisabled('task-box', 1, isUpdate)">
                    <i class="el-icon-arrow-left"></i>
                </span>
                <span
                    @click="crosswiseScrool($event, 'task-box', -1, 600)"
                    :class="isDisabled('task-box', -1, isUpdate)"
                    >继续 <i class="el-icon-arrow-right"></i>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import { getAdventureTask } from "@/service/adventure/adventure";
import { extractTextContent } from "@jx3box/jx3box-common/js/utils";
import { isPhone } from "@/utils/index";
import dayjs from "@/utils/day";
export default {
    name: "task",
    props: ["id", "info"],
    inject: ["__imgRoot"],
    components: {},
    data: function () {
        return {
            task: [],
            isUpdate: false,
            school: "2",
            isMiniProgram: isMiniProgram(),
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        camp() {
            return dayjs.tz().date() % 2 ? 1 : 2;
        },
    },
    methods: {
        //处理特殊的链接
        toSpecial(data) {
            const type = data.szRewardType;
            let str = data.szOpenRewardPath;
            const name = data.szOpenRewardPath.split("\\").filter(Boolean).pop();
            if (type == "school") str = `reward/open/${name}/school_${this.school}_open`;
            if (type == "camp") {
                str = `reward/open/${name}/camp_${this.camp}_open`;
            }
            return this.imgUrl(str);
        },
        imgNameTga: function (link) {
            return link.match(/(\S*)Adventure\/(\S*)\.tga/)[2];
        },
        imgUrl(link) {
            const client = this.client;
            return this.__imgRoot + `adventure/${client}/${link}.png`;
        },
        getImg(info) {
            const type = info.szRewardType;
            if (type === "school" || type === "camp") {
                return this.toSpecial(info);
            } else {
                let img = info.szOpenRewardPath?.toLowerCase().match(/.*[\/,\\]adventure(.*?).tga/) || "";
                let name = "";
                if (img?.[1]) name = img?.[1].replace(/\\/g, "/");
                return this.imgUrl(name);
            }
        },
        getText(item) {
            let text = extractTextContent(item);
            let str = "";
            text.forEach((item) => {
                str += item.text;
            });
            return str;
        },
        loadData() {
            getAdventureTask(this.id, {
                client: this.client,
            }).then((res) => {
                let list = [];
                res.data.forEach((e) => {
                    if (e.szFramePath) {
                        let k = e.szFramePath?.replace(/\\/g, "/");
                        e.imgurl = this.imgNameTga(k);
                        list.push(e);
                    }
                });
                this.task = [...new Set(list)];
            });
        },
        isDisabled(id, detail) {
            // 获取要绑定事件的元素
            const nav = document.getElementById(id);
            if (!nav) return;
            if (nav.scrollLeft == 0 && detail == 1) {
                return "u-disabled";
            }
            if (nav.scrollLeft != 0 && nav.scrollWidth <= nav.scrollLeft + nav.clientWidth && detail == -1) {
                return "u-disabled";
            }
            return "";
        },
        crosswiseScrool(event, id, detail, distance) {
            if (isPhone()) {
                return;
            }
            event.preventDefault();
            // if (this.isDisabled(id, detail) != "") {
            //     return;
            // }
            // 获取要绑定事件的元素
            // const nav = this.$refs[id];
            const nav = document.getElementById(id);
            let scrollWidth = nav.scrollWidth;
            // return;
            if (nav.scrollLeft == 0 && detail == 1) return;

            if (scrollWidth <= nav.scrollLeft + nav.clientWidth && detail == -1) return;
            let step = (distance || 200) / 100;
            let total = 0;
            // 对需要滚动的元素进行滚动操作
            let _this = this;
            scrollFun();

            function scrollFun() {
                total = total + step;
                if (total < distance) {
                    if (detail == 1) {
                        nav.scrollLeft -= step;
                    } else {
                        nav.scrollLeft += step;
                    }
                    setTimeout(scrollFun, 1);
                } else {
                    _this.isUpdate = !_this.isUpdate;
                }
            }
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {
        this.loadData();
    },
};
</script>
