import { __imgPath } from "@/utils/config";

/**
 * 格式化列表项数据
 * @param {Object} item - 原始数据项
 * @param {String} type - 类型：'face' | 'body'
 * @returns {Object} 格式化后的数据
 */
export function formatItemData(item, type) {
    return {
        id: item.id,
        title: item.title || '未命名',
        cover: item.images?.[0] || getDefaultCover(type),
        author: {
            id: item.user_id,
            name: item.author_name || item.display_name || '匿名',
            avatar: item.user_avatar,
            link: item.author_link
        },
        isNew: item.is_unlimited === 1,
        isStar: !!item.star,
        isPay: !!~~item.price_type && !!item.price_count,
        price: item.price_count || 0,
        priceType: item.price_type,
        createdAt: formatDate(item.created_at),
        type: type,
        codeMode: item.code_mode,
        isNewFace: item.is_new_face,
        client: item.client
    };
}

/**
 * 格式化详情数据
 * @param {Object} data - 原始详情数据
 * @param {String} type - 类型：'face' | 'body'
 * @returns {Object} 格式化后的数据
 */
export function formatDetailData(data, type) {
    return {
        header: {
            title: data.title,
            desc: data.description,
            author: {
                id: data.user_id,
                name: data.display_name || data.author_name || '匿名',
                avatar: data.user_avatar,
                link: data.author_link
            },
            tags: formatTags(data, type),
            createdAt: formatDate(data.created_at),
            updatedAt: formatDate(data.updated_at),
            status: data.status,
            isOriginal: data.original,
            client: data.client
        },
        images: data.images || [],
        dataSection: {
            content: data.data || {},
            hasData: !!(data.data || data.bodydata || data.facedata)
        },
        payData: {
            price: data.price_count || 0,
            priceType: data.price_type,
            isPay: !!~~data.price_type && !!data.price_count,
            files: data.files || []
        },
        topic: data.topic_info || null
    };
}

/**
 * 格式化日期
 * @param {Number|String} timestamp - 时间戳或日期字符串
 * @returns {String} 格式化后的日期
 */
export function formatDate(timestamp) {
    if (!timestamp) return '';
    
    let date;
    if (typeof timestamp === 'number') {
        date = new Date(timestamp * 1000);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 格式化标签
 * @param {Object} data - 数据对象
 * @param {String} type - 类型：'face' | 'body'
 * @returns {Array} 标签数组
 */
export function formatTags(data, type) {
    const tags = [];
    
    if (data.original) {
        tags.push({ text: '原创', type: 'original', color: '#f39' });
    }
    
    if (type === 'face') {
        tags.push({ 
            text: data.is_new_face ? '写实' : '写意', 
            type: data.is_new_face ? 'new' : 'old',
            color: data.is_new_face ? '#53b27f' : '#23abe5'
        });
    }
    
    if (type === 'body' && data.body_type) {
        const bodyTypeMap = {
            1: { text: '成男', color: '#00aaff' },
            2: { text: '成女', color: '#aaaaff' },
            5: { text: '正太', color: '#3fbd5c' },
            6: { text: '萝莉', color: '#ffaaff' }
        };
        const bodyType = bodyTypeMap[data.body_type];
        if (bodyType) {
            tags.push({ text: bodyType.text, type: 'bodytype', color: bodyType.color });
        }
    }
    
    if (data.client) {
        const clientMap = {
            std: { text: '正式服', color: '#f0b400' },
            origin: { text: '怀旧服', color: '#0eb7ce' }
        };
        const client = clientMap[data.client];
        if (client) {
            tags.push({ text: client.text, type: 'client', color: client.color });
        }
    }
    
    if (data.star) {
        tags.push({ text: '推荐', type: 'star', color: '#786cbb' });
    }
    
    return tags;
}

/**
 * 获取默认封面图
 * @param {String} type - 类型：'face' | 'body'
 * @returns {String} 默认封面图URL
 */
function getDefaultCover(type) {
    return type === 'face' 
        ? __imgPath + "image/face/null2.png"
        : require('@/assets/img/body/body_null.png');
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化价格
 * @param {Number} price - 价格
 * @param {Number} priceType - 价格类型：1=盒币，2=金箔
 * @returns {String} 格式化后的价格文本
 */
export function formatPrice(price, priceType) {
    if (!price || price === 0) return '免费';
    
    const unit = priceType === 1 ? '盒币' : '金箔';
    return `${price} ${unit}`;
}

/**
 * 格式化作者信息
 * @param {Object} user - 用户对象
 * @returns {Object} 格式化后的作者信息
 */
export function formatAuthor(user) {
    return {
        id: user.ID || user.id,
        name: user.display_name || user.name || '匿名',
        avatar: user.avatar || user.user_avatar,
        link: `/author/${user.ID || user.id}`,
        bio: user.bio || '',
        level: user.lv || 1
    };
}
