<template>
    <div :class="['m-pvx-list_mobile', `m-${type}-list_mobile`]">
        <SuspendCommon 
            :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }" 
            @search="handleSearch"
        >
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="handleSwitchType">
                        <img class="u-icon" :src="currentTypeIcon" svg-inline />
                        {{ currentTypeName }}
                    </div>
                    <div class="u-btn-item" @click="handleShowFilter">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <el-drawer 
            v-model="showDrawer" 
            direction="btt" 
            :with-header="false" 
            :modal-append-to-body="false" 
            append-to-body
            class="c-drawer"
        >
            <slot name="drawer-content" :active="activeType" :setActive="setActiveType">
                <transition :name="cutshowTra ? 'slide-up' : ''">
                    <div class="m-cut" v-if="cutShow">
                        <div 
                            class="u-cut-all" 
                            :class="{ 'is-active': activeType === -1 }" 
                            @click="setActiveType(-1)"
                        >
                            <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline /> 
                            全部{{ typeLabel }}
                        </div>
                        <div class="u-cut-box">
                            <div 
                                class="u-cut-item" 
                                v-for="(item, index) in typeOptions" 
                                :key="index"
                                :class="{ 'is-active': activeType === item.value }" 
                                @click="setActiveType(item.value)"
                            >
                                <img class="u-icon" :src="item.icon" svg-inline />
                                <span>{{ item.label }}</span>
                            </div>
                        </div>
                        <div class="u-cut-btn">
                            <div class="u-report-btn" @click="handleReset">重置</div>
                            <div class="u-confirm-btn" :class="{ active: showHighlightConfirm }" @click="handleConfirm">确定</div>
                        </div>
                    </div>
                </transition>

                <div class="m-filtrate" v-if="filtrateShow">
                    <slot name="filter-content" :filters="filters" :setFilter="setFilter">
                        <div class="u-filtrate-title">标签</div>
                        <div class="u-box">
                            <div 
                                class="u-item all" 
                                :class="{ active: !hasActiveFilters }"
                                @click="clearFilters"
                            >
                                全部
                            </div>
                            <div 
                                v-for="(filter, key) in availableFilters" 
                                :key="key"
                                class="u-item" 
                                :class="{ active: filters[key] }"
                                @click="setFilter(key, !filters[key])"
                            >
                                {{ filter.label }}
                            </div>
                        </div>
                    </slot>
                </div>
            </slot>
        </el-drawer>

        <div class="m-list-content">
            <slot name="list" :list="list" :loading="loading">
                <div class="m-list-grid">
                    <ListItem 
                        v-for="item in list" 
                        :key="item.id" 
                        :type="type" 
                        :item="item"
                    />
                </div>
            </slot>

            <div v-if="loading" class="m-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                加载中...
            </div>

            <div v-if="!loading && !hasMore && list.length > 0" class="m-no-more">
                没有更多了
            </div>

            <div v-if="!loading && list.length === 0" class="m-empty">
                <el-empty description="暂无数据" />
            </div>
        </div>
    </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue';
import SuspendCommon from "@/components/common/SuspendCommon.vue";
import ListItem from "../ListItem.vue";

export default {
    name: "MiniappListPage",
    components: { SuspendCommon, ListItem, Loading },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ['face', 'body'].includes(value)
        },
        loading: {
            type: Boolean,
            default: false
        },
        list: {
            type: Array,
            default: () => []
        },
        hasMore: {
            type: Boolean,
            default: true
        },
        typeOptions: {
            type: Array,
            default: () => []
        },
        availableFilters: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            showDrawer: false,
            cutShow: false,
            filtrateShow: false,
            cutshowTra: true,
            activeType: -1,
            filters: {},
            showHighlightConfirm: false
        };
    },
    computed: {
        typeLabel() {
            return this.type === 'face' ? '脸型' : '体型';
        },
        currentTypeName() {
            if (this.activeType === -1) return `全部${this.typeLabel}`;
            const type = this.typeOptions.find(t => t.value === this.activeType);
            return type ? type.label : `全部${this.typeLabel}`;
        },
        currentTypeIcon() {
            if (this.activeType === -1) {
                return require('@/assets/img/pvxsuspension/switch_touchbar.svg');
            }
            const type = this.typeOptions.find(t => t.value === this.activeType);
            return type ? type.icon : require('@/assets/img/pvxsuspension/switch_touchbar.svg');
        },
        hasActiveFilters() {
            return Object.values(this.filters).some(v => v);
        }
    },
    methods: {
        handleSearch(keyword) {
            this.$emit('search', keyword);
        },
        handleSwitchType() {
            this.cutshowTra = true;
            this.cutShow = true;
            this.filtrateShow = false;
            this.showDrawer = true;
        },
        handleShowFilter() {
            this.cutshowTra = false;
            this.cutShow = false;
            this.filtrateShow = true;
            this.showDrawer = true;
        },
        setActiveType(value) {
            this.activeType = value;
            this.showHighlightConfirm = true;
        },
        setFilter(key, value) {
            this.filters = {
                ...this.filters,
                [key]: value
            };
            this.$emit('filter-change', this.filters);
        },
        clearFilters() {
            this.filters = {};
            this.$emit('filter-change', this.filters);
        },
        handleReset() {
            this.activeType = -1;
            this.showHighlightConfirm = false;
        },
        handleConfirm() {
            this.$emit('type-change', this.activeType);
            this.showDrawer = false;
        }
    }
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body-mixins.less";

.m-pvx-list_mobile {
    .pvx-miniapp-list-mixin();
}
</style>
