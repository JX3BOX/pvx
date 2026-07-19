<template>
    <PvxPageShell class="p-pvx-manufacture">
        <div class="m-pvx-manufacture__layout" v-loading="loading">
            <PvxSurface class="m-pvx-manufacture__hero" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-manufacture__header"
                    :title="$t('pages.pvg.manufacture.ui.title')"
                    :description="$t('pages.pvg.manufacture.ui.description')"
                    level="h1"
                >
                    <template #icon><Tools /></template>
                    <template #action>
                        <div class="m-pvx-manufacture__hero-actions">
                            <el-select
                                class="u-manufacture-server-select"
                                v-model="server"
                                :placeholder="$t('pages.pvg.manufacture.ui.serverPlaceholder')"
                            >
                                <el-option v-for="item in serverList" :key="item" :label="item" :value="item" />
                            </el-select>
                            <el-button
                                class="u-manufacture-plans-trigger"
                                plain
                                @click="planDrawerVisible = true"
                            >
                                <el-icon><Collection /></el-icon>
                                {{ $t("pages.pvg.manufacture.ui.cart.plans") }}
                            </el-button>
                        </div>
                    </template>
                </PvxSectionHeader>
            </PvxSurface>

            <PvxToolbar class="m-pvx-manufacture__toolbar">
                <nav class="m-pvx-manufacture__tabs" :aria-label="$t('pages.pvg.manufacture.ui.navigation')">
                    <button
                        v-for="item in craftList"
                        :key="item.value"
                        type="button"
                        class="u-craft-tab"
                        :class="{ 'is-active': active === item.value }"
                        :aria-pressed="active === item.value"
                        @click="selectCraft(item.value)"
                    >
                        {{ item.label }}
                    </button>
                </nav>
                <el-input
                    v-model="search"
                    class="u-manufacture-search"
                    clearable
                    :placeholder="$t('pages.pvg.manufacture.ui.searchPlaceholder')"
                >
                    <template #prefix><Search /></template>
                </el-input>
            </PvxToolbar>

            <div class="m-pvx-manufacture__workspace">
                <PvxSurface class="m-pvx-manufacture__recipes" padding="medium">
                    <PvxSectionHeader
                        class="m-pvx-manufacture__section-header"
                        :title="craftName || $t('pages.pvg.manufacture.ui.sections.recipes.title')"
                        :description="$t('pages.pvg.manufacture.ui.sections.recipes.description')"
                        level="h2"
                    />
                    <Recipe
                        v-show="hasRecipes"
                        :list="showList"
                        :craft-key="craftKey"
                        :server="server"
                        @addCartItem="onAddCartItem"
                        ref="recipe"
                    />
                    <PvxEmptyState
                        v-if="!loading && !hasRecipes"
                        class="m-pvx-manufacture__empty"
                        :title="$t('pages.pvg.manufacture.ui.empty.title')"
                        :description="$t('pages.pvg.manufacture.ui.empty.description')"
                    >
                        <template #icon><Search /></template>
                    </PvxEmptyState>
                </PvxSurface>

                <aside class="m-pvx-manufacture__aside">
                    <PvxSurface class="m-pvx-manufacture__cart" padding="medium">
                        <Cart
                            :data="cartItem"
                            :server="server"
                            ref="cart"
                            :craft-list="list"
                            @material-make="onMaterialMake"
                            @update-plan="onPlanUpdate"
                        />
                    </PvxSurface>

                </aside>
            </div>
        </div>

        <el-drawer
            v-model="planDrawerVisible"
            class="m-manufacture-plans-drawer"
            direction="rtl"
            size="min(520px, calc(100vw - 24px))"
            :with-header="false"
            append-to-body
        >
            <MyList
                ref="plan-list"
                drawer-mode
                @close="planDrawerVisible = false"
                @view-plan="onViewPlan"
                @merge-plan="onMergePlan"
            />
        </el-drawer>
    </PvxPageShell>
</template>

<script>
import { getCraftJson, getManufactures } from "@/service/manufacture/manufacture";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import manufactureData from "@/assets/data/manufacture.json";
import Recipe from "@/components/manufacture/Recipe.vue";
import Cart from "@/components/manufacture/Cart.vue";
import MyList from "@/components/manufacture/MyList.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import { Collection, Search, Tools } from "@element-plus/icons-vue";
const { craft_types } = manufactureData;

export default {
    name: "Manufacture",
    components: {
        Recipe,
        Cart,
        MyList,
        PvxPageShell,
        PvxEmptyState,
        PvxSectionHeader,
        PvxSurface,
        PvxToolbar,
        Search,
        Tools,
        Collection,
    },
    provide() {
        return {
            isMiniProgram: this.isMiniProgram,
        };
    },
    data: function () {
        return {
            craftKey: "",
            craftTypes: craft_types,
            craftList: [],

            search: "",
            craftName: "",
            index: -1,
            list: [],
            server: "蝶恋花",
            cartItem: {},
            active: "",
            loading: false,
            planDrawerVisible: false,
        };
    },
    computed: {
        isMiniProgram() {
            return document.getElementsByClassName("v-miniprogram")?.length > 0;
        },
        client() {
            return this.$store.state.client;
        },
        isStd() {
            return this.client == "std";
        },
        serverList() {
            return this.isStd ? servers_std : servers_origin;
        },
        showList() {
            if (!this.search) return this.list;
            return [
                {
                    BelongName: this.$t("pages.pvg.manufacture.ui.searchResults"),
                    list: this.list.reduce((acc, cur) => {
                        acc.push(...cur.list.filter((item) => item.Name.includes(this.search)));
                        return acc;
                    }, []),
                },
            ];
        },
        hasRecipes() {
            return this.showList.some((group) => group.list?.length);
        },
    },
    methods: {
        // 获取数据
        load() {
            getCraftJson()
                .then((res) => {
                    const { std, origin } = res.data;
                    const list = this.client == "std" ? this.toCraftList(std) : this.toCraftList(origin);
                    this.craftList =
                        list.map((item) => {
                            item.value = item.key;
                            item.label = item.name;
                            return item;
                        }) || [];
                    if (this.craftList.length) this.index = 0;
                    this.active = this.craftList[0].value;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取配方列表 && 合并入配方分类
        loadList(type, index) {
            getManufactures({ client: this.client, type, mode: "simple" }).then((res) => {
                // 配方分类
                const list = this.craftList[index].list;

                // 配方数据进行分组
                const data = res.data.reduce((acc, cur) => {
                    cur.item_id = cur.CreateItemType1 + "_" + cur.CreateItemIndex1;
                    acc[cur.Belong] ? acc[cur.Belong].push(cur) : (acc[cur.Belong] = [cur]);
                    return acc;
                }, {});

                // 合并数据配方分类
                this.list = list
                    .map((item) => {
                        if (data[item.BelongID]) {
                            item.list = data[item.BelongID];
                            item.list.sort((a, b) => Number(b.ID) - Number(a.ID));
                        }
                        return item;
                    })
                    .filter((item) => item.list);
                this.craftKey = type;
            });
        },
        // 处理技艺列表
        toCraftList(data) {
            const type = this.craftTypes[this.client];
            // 1. 将列表按ProfessionID分类
            const craftData = data.reduce((acc, cur) => {
                acc[cur.ProfessionID] ? acc[cur.ProfessionID].push(cur) : (acc[cur.ProfessionID] = [cur]);
                return acc;
            }, {});

            // 2.为分类添加name和key值
            return type.map((item) => {
                if (craftData[item.ProfessionID]) item.list = craftData[item.ProfessionID];
                return item;
            });
        },
        // 切换技艺
        changeCraft(i) {
            this.index = this.craftList.findIndex((item) => item.value == i);
        },
        selectCraft(value) {
            this.active = value;
            this.changeCraft(value);
        },
        // 选择新添配方
        onAddCartItem(recipe) {
            this.$refs.cart.add(recipe);
            const name = recipe?.item?.item_info?.Name || recipe?.recipe?.Name || "";
            this.$message.success(
                this.$t("pages.pvg.manufacture.ui.messages.addedToCart", {
                    name,
                })
            );
        },
        onMaterialMake(params) {
            this.$refs.recipe.addCartItemAsMaterial(params);
        },
        onPlanUpdate() {
            this.$refs["plan-list"].load();
        },
        onViewPlan(payload) {
            this.$refs.cart.loadPlan(payload);
            this.planDrawerVisible = false;
        },
        onMergePlan(items) {
            this.$refs.cart.mergePlan(items);
            this.planDrawerVisible = false;
        },
    },

    watch: {
        index(i) {
            const { name, key } = this.craftList[i];
            this.craftName = name;
            this.loadList(key, i);
        },
    },
    mounted() {
        this.load();
        this.$store.dispatch("getRoles").then(() => {
            const roles = this.$store.state.roles;
            if (roles?.length) {
                const role = roles.reduce((acc, cur) => {
                    if (cur.priority > acc.priority) return cur;
                    return acc;
                });
                this.server = role.server;
            } else {
                this.server = this.$store.state.server;
            }
        }).catch(() => {});
    },
};
</script>

<style lang="less">
@import "~@/assets/css/modules/manufacture-theme.less";
</style>
