<template>
    <div class="m-exam">
        <div class="m-search">
            <img class="u-icon" src="@/assets/img/exam/mobile/search.svg" svg-inline />
            <input class="u-input" type="text" placeholder="输入2个字符以上的关键词搜索~" @input="searchEvent" />
            <i v-if="reqLoading" class="el-icon-loading"></i>
        </div>

        <div class="m-exam-list">
            <div class="m-exam-item" v-for="item in dataList" :key="'exam' + item.rid">
                <div class="u-title">{{ item.title }}</div>
                <div class="u-answer">{{ getAnswer(item) }}</div>
            </div>
        </div>

        <img class="u-no-data" v-if="!dataList.length" src="@/assets/img/exam/mobile/noData.png" />

        <SuspendCommon />
    </div>
</template>
<script>
import { getExamByKey } from "@/service/exam.js";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
export default {
    components: {
        SuspendCommon,
    },
    data() {
        return {
            dataList: [],
            reqLoading: false,
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

            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }

            this.searchTimer = setTimeout(() => {
                if (searchValue.length >= 2) {
                    this.reqLoading = true;
                    getExamByKey({
                        key: searchValue,
                    }).then((res) => {
                        this.dataList = res.data.data;
                        this.reqLoading = false;
                    });
                } else {
                    this.dataList = [];
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

    .m-search {
        position: fixed;
        bottom: 103px;
        left: 12px;
        right: 12px;
        padding: 12px 20px;
        display: flex;
        gap: 10px;
        align-items: center;
        background-color: #282828;
        border-radius: 16px;
        .u-icon {
            .size(24px);
        }
        .u-input {
            flex: 1;
            background-color: transparent;
            color: #fedaa3;
            border: none;
            font-size: 14px;
            line-height: 20px;
            &::placeholder {
                color: #fedaa3;
            }
        }
        .el-icon-loading {
            color: #fedaa3;
        }
    }

    .u-no-data {
        .size(250px);
        display: block;
        margin: 0 auto;
        margin-top: 100px;
    }

    .m-exam-list {
        padding-top: 12px;
        padding-bottom: 120px;
        .m-exam-item {
            background-color: @brand4;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(40, 40, 40, 0.05);
            .u-title {
                color: @brand2;
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

        .m-exam-list {
            .m-exam-item {
                background-color: @brand4-dark;
                .u-title {
                    color: @brand2-dark;
                }
            }
        }
    }
}
</style>
