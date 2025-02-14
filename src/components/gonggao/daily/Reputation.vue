<template>
    <div v-if="reputationList.length" class="m-reputation-list">
        <a
            class="u-reputation"
            v-for="item in reputationList"
            :key="item.id"
            :href="getItemLink(item.id)"
            target="_blank"
        >
            <el-tooltip class="box-item" effect="dark" :content="item.Desc" placement="top">
                <div class="u-reputation-item">
                    <div class="u-reputation-icon" :class="`u-quality-${item.Quality}`">
                        <img :src="iconLink(item.IconID)" :alt="item.Name" />
                    </div>
                    <span class="u-reputation-name">{{ item.Name }}</span>
                </div>
            </el-tooltip>
        </a>
    </div>
</template>

<script>
import dayjs from "@/utils/day";
import { getHomeReputation, getItems } from "@/service/gonggao/spider";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Reputation",
    data() {
        return {
            reputation: {},
        };
    },
    computed: {
        reputationList() {
            return this.reputation?.list || [];
        },
        date() {
            // 当7点以前，请求前面一天的日常 当7~24点，请求当天的日常
            const hour = dayjs.tz().get("hours");
            return 0 <= hour && hour < 7
                ? dayjs.tz().subtract(1, "day").format("YYYY-MM-DD")
                : dayjs.tz().format("YYYY-MM-DD");
        },
        client() {
            return "std";
        },
    },
    watch: {
        date: {
            immediate: true,
            handler() {
                if (this.client === "std") {
                    this.loadReputation();
                }
            },
        },
    },
    methods: {
        iconLink,
        getItemLink(id) {
            return `/item/view/${id}`;
        },
        // 家园声望
        loadReputation() {
            const cache = sessionStorage.getItem(`index_reputation_items`);
            if (cache) {
                const obj = JSON.parse(cache);
                if (obj.date === this.date) {
                    this.reputation = obj;
                    return;
                }
            }
            getHomeReputation(this.date, this.$store.state.server).then((res) => {
                const list = res.data?.data?.list || [];
                if (list.length) {
                    const ids = list.map((item) => {
                        return item.item_type_id + "_" + item.item_id;
                    });
                    this.loadItems(ids);
                }
            });
        },
        loadItems(ids) {
            // 读取本地数据
            if (!ids.length) return;
            getItems(ids).then((res) => {
                const list = res.data?.list || [];
                let newData = {
                    date: this.date,
                    list: list.map((item) => {
                        return {
                            id: item.id,
                            Name: item.Name.replace("声望·", ""),
                            IconID: item.IconID,
                            Quality: item.Quality,
                            Desc: /中(.*)\\\\\\/.exec(item.Desc)[1].trim(),
                        };
                    }),
                };
                this.reputation = newData;
                sessionStorage.setItem(`index_reputation_items`, JSON.stringify(newData));
            });
        },
    },
};
</script>

<style lang="less">
.m-reputation-list {
    padding: 10px;
    width: 100%;
    height: 119px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #ffffff;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin-bottom: 10px;
    overflow-y: auto;
    .scrollbar();

    .u-reputation-item {
        .flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 5px;
        gap: 5px;
        &:hover {
            background: @bg-gray;
            .u-reputation-name {
                color: #ffa500;
            }
        }
    }
    .u-desc {
        color: #999;
    }
    .u-reputation {
        display: flex;
        gap: 10px;
        align-items: center;
        font-size: 14px;
        color: #000;
    }
    .u-reputation-icon {
        @s: 38px;
        .size(@s);
        overflow: hidden;
        .mr(5px);
        img {
            .size(100%);
            .db;

            &:hover {
                filter: brightness(110%) saturate(110%);
            }
        }
        .db;
        .pr;
        &:after {
            content: "";
            .db;
            .size(100%);
            .pa;
            .lt(0);
            border: 1px solid transparent;
            box-sizing: border-box;
            .r(100%);
        }

        &.u-quality-2:after {
            border-color: #00d24b;
        }
        &.u-quality-3:after {
            border-color: #007eff;
        }
        &.u-quality-4:after {
            border-color: #ff2dff;
        }
        &.u-quality-5:after {
            border-color: #ffa500;
        }
    }
}
</style>
