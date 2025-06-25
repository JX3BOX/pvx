<template>
    <div class="m-exam">
        <!-- 添加背景遮罩 -->
        <transition name="fade">
            <div class="m-mask" v-if="inputFocus"></div>
        </transition>

        <div class="m-search" :class="{ 'search-bottom': isFirstSearch }">
            <div
                class="m-icon active"
                :class="{
                    // active: isFirstSearch || inputFocus || searchVal.length > 0,
                }"
            >
                <img class="u-icon" src="@/assets/img/exam/mobile/search.svg" svg-inline />
                <div class="u-hide">输入2个关键词搜索</div>
                <img class="u-icon" src="@/assets/img/exam/mobile/search.svg" svg-inline />
            </div>
            <input
                class="u-input"
                @focus="inputFocus = true"
                @blur="inputFocus = false"
                type="text"
                :placeholder="inputFocus ? '' : '输入2个关键词搜索'"
                @keyup.enter="searchEvent"
                v-model="searchVal"
            />
            <i v-if="reqLoading" class="el-icon-loading"></i>
        </div>

        <transition name="fade">
            <div class="m-exam-list" v-if="dataList.length">
                <div class="m-exam-item" v-for="item in dataList" :key="'exam' + item.rid">
                    <div class="u-title">{{ item.title }}</div>
                    <div class="u-answer">{{ getAnswer(item) }}</div>
                </div>
            </div>
        </transition>
        <!-- 列表遮罩 -->
        <transition name="fade">
            <div class="m-list-mask" v-if="dataList.length"></div>
        </transition>
        <transition name="fade">
            <div class="m-no-data" v-if="!dataList.length">
                <img class="u-no-data" src="@/assets/img/exam/mobile/noData.png" />
                <div class="m-search-result" v-if="isFirstSearch && !reqLoading && searchVal.length > 2">
                    <div class="u-tip">没有找到包含以下关键词的内容</div>
                    <div class="u-keyword">{{ searchVal }}</div>
                </div>
            </div>
        </transition>

        <!-- <SuspendCommon /> -->
    </div>
</template>
<script>
import { getExamByKey } from "@/service/exam.js";
// import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
export default {
    components: {
        // SuspendCommon,
    },
    data() {
        return {
            dataList: [],
            reqLoading: false,

            searchVal: "",
            searchTimer: null, // 搜索定时器
            inputFocus: false, // 输入框是否聚焦

            isFirstSearch: false, // 是否是第一次搜索
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    created() {},
    methods: {
        searchEvent(event) {
            const searchValue = event.target.value;
            this.reqLoading = true;

            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }

            this.searchTimer = setTimeout(() => {
                if (searchValue.length >= 2) {
                    this.isFirstSearch = true;
                    getExamByKey({
                        key: searchValue,
                    }).then((res) => {
                        this.reqLoading = false;
                        if (res.data.data != null) {
                            this.dataList = res.data.data;
                        } else {
                            this.dataList = [];
                        }
                    });
                } else {
                    this.reqLoading = false;
                }
            }, 300);
        },
        getAnswer(item) {
            const answers = JSON.parse(item.answer) || [];
            const options = JSON.parse(item.options) || [];
            return options.filter((item, index) => answers.includes(index)).join();
        },
    },
};
</script>
<style lang="less">
@brand4: #ffffff;
@brand4-dark: #282828;
@brand2: #24292e;
@brand2-dark: #fedaa3;
@brand3: #24292e;
@black80: rgba(28, 28, 28, 0.8);
@black80-dark: rgba(255, 255, 255, 0.8);

.m-exam {
    position: relative;
    z-index: 1;
    &::after {
        content: "";
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fafafa;
        z-index: -1;
    }

    .m-list-mask {
        pointer-events: none;
        position: fixed;
        z-index: 1;
        bottom: 0;
        left: 0;
        right: 0;
        height: 271px;
        background: linear-gradient(180deg, rgba(249, 249, 249, 0) 0%, #f5f5f5 100%);
    }

    .m-mask {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.2);
        z-index: 2;
    }

    /* 遮罩层渐隐渐显效果 */
    .fade-enter-active,
    .fade-leave-active {
        transition: all 0.3s ease;
    }

    .fade-enter-active {
        opacity: 0;
    }
    .fade-enter-to {
        opacity: 1;
    }

    .fade-leave-active {
        opacity: 1;
    }
    .fade-leave-to {
        opacity: 0;
    }

    .m-search {
        position: fixed;
        bottom: 45vh;
        left: 12px;
        right: 12px;
        padding: 12px 40px;
        display: flex;
        align-items: center;
        background-color: #282828;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 3;
        transition: all 0.3s ease;

        &.search-bottom {
            bottom: 30px;
            background-color: #24292e;
        }

        .m-icon {
            display: flex;
            align-items: center;
            gap: 10px;
            position: absolute;
            left: 50%;
            right: 0;
            transform: translateX(-50%);
            pointer-events: none;
            transition: all 0.3s ease;

            .u-icon {
                .size(24px);
                &:last-child {
                    opacity: 0;
                }
            }
            .u-hide {
                font-size: 14px;
                line-height: 20px;
                opacity: 0;
            }

            &.active {
                left: 12px;
                transform: translateX(0);
            }
        }
        .u-input {
            flex: 1;
            background-color: transparent;
            color: #fedaa3;
            border: none;
            font-size: 14px;
            line-height: 20px;
            text-align: left;
            &::placeholder {
                color: #fedaa3;
            }
        }
        .el-icon-loading {
            color: #fedaa3;
            position: absolute;
            right: 12px;
        }
    }

    .m-no-data {
        z-index: 1;
        position: fixed;
        bottom: 45vh;
        left: 0;
        right: 0;
        text-align: center;
        .u-no-data {
            .size(250px);
            display: block;
            margin: 0 auto;
        }
        .m-search-result {
        }
    }

    .m-exam-list {
        padding-top: 12px;
        padding-bottom: 120px;
        position: relative;
        z-index: 1;
        .m-exam-item {
            background-color: @brand4;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(40, 40, 40, 0.05);
            .u-title {
                color: @black80;
                font-size: 16px;
                font-weight: bold;
                line-height: 24px;
            }
            .u-answer {
                margin-top: 12px;
                color: #00c7be;
                font-size: 14px;
                line-height: 20px;
            }
            &:not(:last-child) {
                margin-bottom: 12px;
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-exam {
        &::after {
            background: #000;
        }
        .m-list-mask {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000 100%);
        }
        .m-search {
            &.search-bottom {
                background-color: @brand2-dark;
                .u-icon {
                    path {
                        fill: @brand3;
                    }
                }
                .u-input {
                    color: @brand3;
                }
                .el-icon-loading {
                    color: @brand3;
                }
            }
        }

        .m-exam-list {
            .m-exam-item {
                background-color: @brand4-dark;
                .u-title {
                    color: @black80-dark;
                }
            }
        }
    }
}
</style>
