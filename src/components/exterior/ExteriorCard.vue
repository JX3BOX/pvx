<template>
    <router-link :to="{ name: 'exterior-list', query: { id: item.key } }" class="m-exterior-card group">
        <div class="m-exterior-card__image">
            <el-image v-if="portrait" :key="portrait" :src="portrait" alt="" lazy fit="cover" class="size-full">
                <template #error>
                    <div class="grid size-full place-items-center">
                        <img :src="itemIcon" alt="" loading="lazy" class="m-exterior-card__icon" />
                    </div>
                </template>
            </el-image>
            <img v-else :src="itemIcon" alt="" loading="lazy" class="m-exterior-card__icon" />
        </div>
        <span class="m-exterior-card__name group-hover:text-indigo-700">{{ item.name }}</span>
    </router-link>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "ExteriorCard",
    props: { item: { type: Object, required: true } },
    computed: {
        itemIcon() {
            return iconLink(this.item.icon_id, this.$store.state.client);
        },
        portrait() {
            const { images } = this.item;
            if (!images) return;
            return Object.values(images.cover)[0] || Object.values(images.portrait)[0];
        },
    },
};
</script>

<style scoped>
.m-exterior-card {
    display: flex;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: white;
    color: #1e293b;
    text-decoration: none;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.m-exterior-card:hover,
.m-exterior-card:focus-visible {
    border-color: #a5b4fc;
    box-shadow: 0 8px 18px rgb(79 70 229 / 10%);
    transform: translateY(-1px);
}

.m-exterior-card__image {
    display: grid;
    aspect-ratio: 4 / 5;
    place-items: center;
    overflow: hidden;
    border-bottom: 1px solid #e2e8f0;
    background: radial-gradient(ellipse at top, #eef2ff, #f8fafc 65%);
}

.m-exterior-card__icon {
    width: 44px;
    height: 44px;
    margin: auto;
    border-radius: 8px;
}

.m-exterior-card__name {
    padding: 10px 12px;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    overflow-wrap: anywhere;
}
</style>
