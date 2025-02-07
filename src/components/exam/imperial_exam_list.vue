<template>
    <div class="m-imperial-list">
        <div class="m-search">
            <el-input v-model="search" placeholder="在此输入内容开始搜索" :minlength="2"></el-input>
            <div class="u-tip" v-if="!search">请输入关键字开始搜索，搜索词长度不少于<span>2个字符</span>。</div>
            <div class="u-tip" v-else>当前搜索关键字“<span>{{ search }}</span>”，返回结果<span>{{ total }}</span>条。</div>
        </div>
        <el-row class="u-list" :gutter="20">
            <el-col :span="24" v-for="item in list" :key="item.rid"
                ><div class="u-item" @click="go(item.rid)">
                    <div class="u-title" v-html="getTitle(item.title)"></div>
                    <div class="u-answer">{{ getAnswer(item) }}</div>
                </div></el-col
            >
        </el-row>
    </div>
</template>

<script>
import { getExamByKey } from "@/service/exam";
export default {
    name: "ImperialExaminationList",
    // props: ["data", "search"],
    computed: {
        // list() {
        //     return this.data.filter((item) => item.answer && JSON.parse(item.answer) && JSON.parse(item.answer).length);
        // },
    },
    data() {
        return {
            search: "",
            total: 0,
            list: [],
        };
    },
    watch: {
        search(key) {
            if (key && key.length > 1) {
                getExamByKey({ key }).then((res) => {
                    this.list = res.data?.data || [];
                    this.total = this.list.length;
                });
            }
            if (!key) {
                this.list = [];
            }
        },
    },
    methods: {
        getAnswer(item) {
            const answers = JSON.parse(item.answer) || [];
            const options = JSON.parse(item.options) || [];
            return options.filter((item, index) => answers.includes(index)).join();
        },
        getTitle(title) {
            if (this.search) {
                title = title.replace(this.search, `<b>${this.search}</b>`);
            }
            return title;
        },
        go(id) {
            // this.$router.push({ name: "gameQuestion", params: { id: id } });
        },
    },
};
</script>

<style lang="less">
.m-imperial-list {
    .m-search {
        .u-tip {
            width: 100%;
            background-color: #fff;
            margin-top: 5px;
            padding: 10px 15px;
            border-radius: 3px;
            font-size: 14px;
            box-sizing: border-box;
            span {
                color: #ff0000;
            }
        }
    }
    .u-list {
        margin-top: 20px;
    }
    .u-item {
        padding: 20px;
        .mb(20px);

        // height: 168px;
        overflow-y: auto;
        box-sizing: border-box;

        background: #ffffff;
        border-radius: 10px;

        .u-title {
            font-weight: 700;
            font-size: 14px;
            line-height: 18px;
            color: #000000;
            .mb(20px);
            b {
                background-color: yellow;
            }
        }
        .u-answer {
            font-weight: 400;
            font-size: 14px;
            line-height: 18px;

            // color: rgba(0, 0, 0, 0.8);
            color: @examColor;
        }
    }
    @media screen and (max-width: @ipad) {
        .u-item {
            width: 100%;
        }
    }
}
// @media screen and (max-width: @ipad) {
//     .m-imperial-list {
//         .el-col {
//             .w(50%);
//         }
//     }
// }
// @media screen and (max-width: @phone) {
//     .m-imperial-list {
//         .el-col {
//             .w(100%);
//         }
//     }
// }
</style>
