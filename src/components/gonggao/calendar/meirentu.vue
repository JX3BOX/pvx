<template>
    <div v-if="today" class="m-special-item m-meirentu-item">
        <div>美人图</div>
        <div>
            <el-tooltip class="item" effect="dark" :content="(meirentu && meirentu.desc) || '无'" placement="bottom">
                <div>
                    {{ (meirentu && meirentu.name) || "今日暂无画像" }}
                </div>
            </el-tooltip>
        </div>
    </div>
</template>

<script>
import { getMeirentu } from "@/service/gonggao/gonggao";
export default {
    data() {
        return {
            meirentu: {},
        };
    },
    props: {
        today: {
            type: Boolean,
            default: false,
        },
        client: {
            type: String,
            default: "std",
        },
    },
    computed: {
        server() {
            return this.$store.state.server;
        },
    },
    watch: {
        server: {
            immediate: true,
            handler: function (val) {
                this.client === "std" && this.loadMeirentu();
            },
        },
    },
    methods: {
        // 获取美人图
        loadMeirentu() {
            getMeirentu(this.server).then((res) => {
                this.meirentu = res.data?.data || {};
            });
        },
    },
};
</script>
