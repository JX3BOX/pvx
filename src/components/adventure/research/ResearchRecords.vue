<script>
import { formatResearchTime } from "@/utils/adventureResearch";
export default {
    props: { records: { type: Array, default: () => [] }, busy: Boolean },
    emits: ["remove"],
    data() {
        return { confirmId: null };
    },
    methods: { formatResearchTime },
};
</script>
<template>
    <section class="research-card research-records-panel">
        <h2>
            触发记录 <el-tag size="small" effect="light">{{ records.length }} 条</el-tag>
        </h2>
        <el-empty v-if="!records.length" :image-size="64" description="暂无触发记录" />
        <article v-for="record in records" :key="record.id" class="research-record">
            <div class="research-section-title">
                <strong
                    >{{ record.role.name }} <span class="research-muted">· {{ record.role.server }}</span></strong
                ><span class="research-badge">本机记录</span>
            </div>
            <p class="research-muted">
                {{ record.adventure.name }} · {{ record.map || "地图未填写" }} ·
                {{ formatResearchTime(record.triggeredAt) }}
            </p>
            <p class="research-prose">{{ record.activity }}</p>

            <p class="research-muted">
                成就 {{ record.snapshot.completedIds.length }} 项 · 资历 {{ record.snapshot.points ?? "未知" }} · 同步于
                {{ formatResearchTime(record.snapshot.updatedAt) }}
            </p>
            <p v-if="record.completedDailies?.length">当时已完成的日常：{{ record.completedDailies.join("、") }}</p>
            <p v-if="record.notes" class="research-prose">{{ record.notes }}</p>
            <div class="research-images">
                <a v-for="(url, i) in record.images" :key="i" :href="url" target="_blank" rel="noopener"
                    ><img :src="url" alt="玩家补充截图"
                /></a>
            </div>
            <template v-if="record.id.startsWith('local-')"
                ><el-button v-if="confirmId !== record.id" @click="confirmId = record.id">撤回本机记录</el-button>
                <div v-else>
                    <span>确定撤回？</span>
                    <el-button
                        :disabled="busy"
                        @click="
                            $emit('remove', record.id);
                            confirmId = null;
                        "
                    >
                        确定
                    </el-button>
                    <el-button @click="confirmId = null">取消</el-button>
                </div></template
            >
        </article>
    </section>
</template>
