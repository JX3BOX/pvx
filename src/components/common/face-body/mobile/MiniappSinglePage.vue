<template>
    <div :class="['m-pvx-single_mobile', `m-${type}-single_mobile`]">
        <div class="m-single-header">
            <div class="u-back" @click="handleBack">
                <el-icon><ArrowLeft /></el-icon>
                返回
            </div>
            <div class="u-title">{{ post.title || '详情' }}</div>
            <div class="u-actions">
                <slot name="header-actions"></slot>
            </div>
        </div>

        <div class="m-single-content">
            <div class="m-images">
                <el-carousel 
                    :autoplay="false" 
                    indicator-position="outside"
                    height="300px"
                >
                    <el-carousel-item v-for="(image, index) in images" :key="index">
                        <el-image 
                            :src="image" 
                            fit="contain"
                            :preview-src-list="images"
                            :initial-index="index"
                        />
                    </el-carousel-item>
                </el-carousel>
            </div>

            <div class="m-info">
                <div class="m-author" @click="handleAuthorClick">
                    <el-avatar :size="40" :src="post.user_avatar">
                        <el-icon><User /></el-icon>
                    </el-avatar>
                    <div class="u-info">
                        <div class="u-name">{{ post.author_name || '匿名' }}</div>
                        <div class="u-time">{{ formatDate(post.created_at) }}</div>
                    </div>
                </div>

                <div class="m-tags">
                    <el-tag 
                        v-for="(tag, index) in tags" 
                        :key="index"
                        :color="tag.color"
                        effect="dark"
                        size="small"
                    >
                        {{ tag.text }}
                    </el-tag>
                </div>

                <div class="m-desc" v-if="post.description">
                    {{ post.description }}
                </div>
            </div>

            <slot name="data-section" :data="dataSection" :hasBuy="hasBuy">
                <div class="m-data-section" v-if="dataSection">
                    <div class="u-title">数据分析</div>
                    <slot name="data-content" :data="dataSection"></slot>
                </div>
                <div class="m-buy-prompt" v-else-if="!hasBuy && canBuy">
                    <div class="u-tip">购买后可查看数据分析</div>
                    <el-button type="primary" @click="handleBuy">立即购买</el-button>
                </div>
            </slot>
        </div>

        <div class="m-bottom-bar">
            <div class="m-left">
                <div class="u-item" @click="handleLike">
                    <el-icon><Star /></el-icon>
                    <span>收藏</span>
                </div>
                <div class="u-item" @click="handleShare">
                    <el-icon><Share /></el-icon>
                    <span>分享</span>
                </div>
            </div>
            <div class="m-right">
                <slot name="bottom-actions" :hasBuy="hasBuy" :post="post">
                    <el-button 
                        v-if="!hasBuy && canBuy"
                        type="primary" 
                        @click="handleBuy"
                    >
                        {{ priceText }}
                    </el-button>
                    <el-button 
                        v-if="hasBuy"
                        type="success" 
                        @click="handleDownload"
                    >
                        下载
                    </el-button>
                </slot>
            </div>
        </div>

        <div class="m-random-list" v-if="randomList.length">
            <div class="u-title">推荐</div>
            <div class="m-list">
                <ListItem 
                    v-for="item in randomList" 
                    :key="item.id"
                    :type="type"
                    :item="item"
                    @click="handleItemClick(item)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { ArrowLeft, User, Star, Share } from '@element-plus/icons-vue';
import ListItem from "../ListItem.vue";
import { formatDate, formatTags, formatPrice } from "../utils/format";

export default {
    name: "MiniappSinglePage",
    components: { ListItem, ArrowLeft, User, Star, Share },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ['face', 'body'].includes(value)
        },
        post: {
            type: Object,
            default: () => ({})
        },
        images: {
            type: Array,
            default: () => []
        },
        hasBuy: {
            type: Boolean,
            default: false
        },
        canBuy: {
            type: Boolean,
            default: true
        },
        dataSection: {
            type: Object,
            default: null
        },
        randomList: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        tags() {
            return formatTags(this.post, this.type);
        },
        priceText() {
            if (!this.post.price_count || this.post.price_count === 0) {
                return '免费';
            }
            return formatPrice(this.post.price_count, this.post.price_type);
        }
    },
    methods: {
        formatDate,
        handleBack() {
            this.$emit('back');
        },
        handleAuthorClick() {
            this.$emit('author-click', this.post.user_id);
        },
        handleBuy() {
            this.$emit('buy');
        },
        handleDownload() {
            this.$emit('download');
        },
        handleLike() {
            this.$emit('like');
        },
        handleShare() {
            this.$emit('share');
        },
        handleItemClick(item) {
            this.$emit('item-click', item);
        }
    }
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body-mixins.less";

.m-pvx-single_mobile {
    .pvx-miniapp-single-mixin();
    
    .m-single-header {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        background: #fff;
        border-bottom: 1px solid #eee;
        
        .u-back {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }
        
        .u-title {
            flex: 1;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .u-actions {
            display: flex;
            gap: 10px;
        }
    }
    
    .m-single-content {
        padding: 15px;
        padding-bottom: 70px;
        
        .m-images {
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .m-info {
            margin-bottom: 20px;
            
            .m-author {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                
                .u-info {
                    flex: 1;
                    
                    .u-name {
                        font-size: 14px;
                        font-weight: bold;
                    }
                    
                    .u-time {
                        font-size: 12px;
                        color: #999;
                    }
                }
            }
            
            .m-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .m-desc {
                font-size: 14px;
                line-height: 1.6;
                color: #666;
            }
        }
        
        .m-data-section {
            margin-bottom: 20px;
            
            .u-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }
        }
        
        .m-buy-prompt {
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
            
            .u-tip {
                margin-bottom: 10px;
                color: #999;
            }
        }
    }
    
    .m-bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        background: #fff;
        border-top: 1px solid #eee;
        z-index: 100;
        
        .m-left {
            display: flex;
            gap: 20px;
            
            .u-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 3px;
                font-size: 12px;
                color: #666;
                cursor: pointer;
            }
        }
        
        .m-right {
            display: flex;
            gap: 10px;
        }
    }
    
    .m-random-list {
        margin-top: 20px;
        
        .u-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            padding: 0 15px;
        }
        
        .m-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 0 15px;
        }
    }
}
</style>
