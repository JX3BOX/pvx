<template>
    <PvxSurface v-loading="loading" tag="section" padding="medium" class="grid min-h-32 gap-4">
        <PvxSectionHeader :title="$t('exterior.showcase')" />
        <PvxEmptyState v-if="error" :title="$t('exterior.loadError')" :description="error">
            <template #action
                ><el-button @click="load">{{ $t("exterior.retry") }}</el-button></template
            >
        </PvxEmptyState>
        <div v-else-if="posts.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <figure v-for="(post, index) in posts" :key="post.ID" class="m-0 grid min-w-0 gap-2">
                <el-image
                    :src="post.post_banner"
                    :alt="post.post_title"
                    :preview-src-list="images"
                    :initial-index="index"
                    fit="cover"
                    preview-teleported
                    class="aspect-video w-full rounded-xl bg-slate-50"
                >
                    <template #error
                        ><span class="grid h-full place-items-center">{{
                            $t("exterior.imageUnavailable")
                        }}</span></template
                    >
                </el-image>
                <figcaption class="grid gap-1">
                    <strong>{{ post.post_title }}</strong>
                    <span class="text-sm text-slate-500">{{ post.author_info.display_name }}</span>
                </figcaption>
            </figure>
        </div>
        <PvxEmptyState v-else-if="!loading" :title="$t('exterior.emptyShowcase')" />
    </PvxSurface>
</template>

<script>
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import { getExteriorShowcase } from "@/service/exterior";

export default {
    name: "ExteriorShowcase",
    components: { PvxSurface, PvxSectionHeader, PvxEmptyState },
    props: { exteriorId: { type: String, required: true } },
    data() {
        return { posts: [], loading: true, error: "" };
    },
    computed: {
        images() {
            return this.posts.map((post) => post.post_banner);
        },
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            this.error = "";
            try {
                this.posts = await getExteriorShowcase(this.exteriorId);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
