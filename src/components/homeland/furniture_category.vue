<template>
    <div class="m-furniture-category">
        <div class="u-tabs flexNormal">
            <div
                class="u-item"
                v-for="item in list"
                :key="item.id"
                @click="onQueryKey(item.nCatag2Index)"
                @mouseenter="hoverCategory(item)"
                @mouseleave="leaveCategory"
                :class="item.nCatag2Index == query.key ? 'active' : ''"
            >
                <span class="u-img" :class="itemClass(item)" :style="itemStyle(item)"></span>
                <span>{{ item.szName }}</span>
            </div>
        </div>

        <div class="u-box flexNormal">
            <!-- <el-input
                :disabled="match"
                class="u-input u-margin"
                v-model="score"
                placeholder="输入 ≥ 分值，如：2600"
                oninput="value=value.replace(/[^\d]/g,'')"
            >
                <el-select :disabled="match" v-model="select" slot="prepend" placeholder="请选择">
                    <el-option
                        v-for="item in categoryData.categoryList"
                        :key="item.key"
                        :label="item.name"
                        :value="item.key"
                    >
                    </el-option>
                </el-select>
            </el-input> -->
            <el-select class="u-source u-select u-margin" v-model="select" slot="prepend" placeholder="排序方式">
                <span slot="prefix" class="u-prefix">排序方式</span>
                <el-option label="不限制" value=""></el-option>
                <el-option
                        v-for="item in categoryData.categoryList"
                        :key="item.key"
                        :label="item.name"
                        :value="item.key"
                    >
                </el-option>
            </el-select>
            <el-select class="u-source u-select u-margin" v-model="source" slot="prepend" placeholder="来源途径" clearable>
                <span slot="prefix" class="u-prefix">来源途径</span>
                <el-option label="全部" value=""></el-option>
                <el-option v-for="item in source_types" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
            <el-select class="u-level u-select u-margin" v-model="level" slot="prepend" placeholder="家园等级">
                <span slot="prefix" class="u-prefix">家园等级</span>
                <el-option
                    v-for="item in categoryData.levelList"
                    :key="item.level"
                    :label="item.name"
                    :value="item.level"
                >
                </el-option>
            </el-select>
            <div class="flexNormal">
                <el-checkbox :checked="interact" v-model="interact">可交互</el-checkbox>
                <el-checkbox :checked="set" v-model="set">庐园广记</el-checkbox>
                <el-checkbox v-model="match" @change="matchChange" :disabled="!matchFurniture">
                    园宅会赛
                    <el-popover trigger="hover" v-if="matchFurniture" popper-class="m-match-furniture-pop">
                        <div>
                            <div class="u-header">本周园宅会赛：</div>
                            <div>{{ matchProperty.content }}</div>
                            <div>{{ matchFurniture.content | formatMatchFurniture }}</div>
                        </div>
                        <i class="el-icon-info" slot="reference"></i>
                    </el-popover>
                </el-checkbox>
            </div>
        </div>
    </div>
</template>
<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import source_types from "@/assets/data/furniture_source.json";
export default {
    name: "Category",
    data: function () {
        return {
            key: "", // 二级分类
            // score: "", // 分值
            select: "", // 属性 风水，观赏，使用，坚固，趣味
            source: "", // 来源
            level: "", // 等级
            interact: false, //交互
            set: false, //庐远广记
            hover: "",
            source_types,
            match: false, // 园宅会赛
        };
    },
    props: ["list", "categoryData", "isChange", "furniture"],
    inject: ["__imgRoot"],
    computed: {
        itemClass() {
            return (item) => {
                const category = +item.nCatag1Index * 10000 + item.nCatag2Index * 100;
                const type = this.key == item.nCatag2Index ? "checked" : this.hover == category ? "hover" : "normal";
                let data = "";

                this.categoryData.categoryCss.forEach((el) => {
                    if (el.name == item.szName) {
                        data = el;
                    }
                });

                if (data) {
                    const x = data.attr[type] % 19;
                    const y = Math.floor(data.attr[type] / 19);
                    return `u-icon-${x}-${y}`;
                }
            };
        },
        query() {
            return {
                key: this.key,
                // score: this.score,
                select: this.select,
                source: this.source,
                level: this.level,
                interact: this.interact,
                set: this.set,
            };
        },
        matchFurniture() {
            return this.furniture && this.furniture.find(item => item.subtype === 'category') || ''
        },
        matchProperty() {
            return this.furniture && this.furniture.find(item => item.subtype === 'property') || ''
        },
    },
    methods: {
        onQueryKey(id) {
            this.key = id;
            this.$emit("onCategoryKey", this.toParams(this.query));
        },
        itemStyle(item) {
            let img = "";

            this.categoryData.categoryCss.forEach((el) => {
                if (el.name == item.szName) {
                    img = el.attr.icon;
                }
            });
            return img !== "" ? { backgroundImage: "url(" + __imgPath + "image/game/homeland/" + img + ")" } : "";
        },

        hoverCategory(item) {
            this.hover = +item.nCatag1Index * 10000 + item.nCatag2Index * 100;
        },
        leaveCategory() {
            this.hover = "";
        },
        defaultQuery() {
            this.key = "";
            this.score = "";
            this.select = "";
            this.source = "";
            this.level = "";
            this.interact = false;
            this.set = false;
        },
        // 搜索关键词转换
        toParams(obj) {
            let newObj = {};
            for (const key in obj) {
                if (obj[key] == "") delete obj[key];
                switch (key) {
                    case "key":
                        newObj["nCatag2Index"] = obj[key];
                        break;
                    case "source":
                        obj[key] !== "all" ? (newObj["szSource"] = obj[key]) : "";
                        break;
                    case "select":
                        if (obj.select) {
                            newObj["Attribute" + obj.select] = 1;
                        }
                        break;
                    case "level":
                        newObj["LevelLimit"] = obj[key];
                        break;
                    case "interact":
                        obj[key] ? (newObj["bInteract"] = 1) : "";
                        break;
                    case "set":
                        obj[key] ? (newObj["isSet"] = 1) : "";
                        break;
                }
            }
            for (const key in newObj) {
                if (typeof newObj[key] == "undefined") delete newObj[key];
            }
            if (newObj.LevelLimit == "all") delete newObj.LevelLimit;
            return newObj;
        },
        // 园宅会赛
        matchChange(val) {
            this.defaultQuery();
            this.$emit("match", val);

            if (val) {
                let _select = this.categoryData.categoryList.find(item => this.matchProperty?.content.includes(item.name));
                if (_select) this.select = _select.key;
            }
        },
        setMatch(val) {
            this.match = val
        }
    },
    watch: {
        query: {
            handler: function (obj) {
                this.$emit("onCategoryKey", this.toParams(obj));
            },
            deep: true,
        },
        isChange(val) {
            if (val) this.defaultQuery();
        },
    },
    filters: {
        formatMatchFurniture(val) {
            return val.replace('+', "");
        },
    }
};
</script>
