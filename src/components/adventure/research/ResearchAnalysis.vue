<script>
import { analyzeResearch } from "@/utils/adventureResearch";
import { getResearchAchievementDetails, getResearchTargetAchievements } from "@/service/adventure/research";
export default {
    props: { records: { type: Array, default: () => [] }, adventureId: String },
    data() {
        return {
            excludedIds: [],
            details: [],
            error: "",
            loading: false,
            requestId: 0,
            onlyCommon: true,
            category: "",
            keyword: "",
            page: 1,
        };
    },
    computed: {
        analysis() {
            return analyzeResearch(this.records, this.excludedIds);
        },
        rows() {
            const lookup = new Map(this.details.map((r) => [r.id, r]));
            return this.analysis.achievements.map((r) => ({
                ...r,
                name: lookup.get(r.id)?.name || `成就 #${r.id}`,
                category: lookup.get(r.id)?.category?.name || "未分类",
                description: lookup.get(r.id)?.shortDescription || "",
            }));
        },
        categories() {
            return [...new Set(this.rows.map((r) => r.category))];
        },
        filtered() {
            return this.rows.filter(
                (r) =>
                    (!this.onlyCommon || r.common) &&
                    (!this.category || r.category === this.category) &&
                    (!this.keyword || r.name.includes(this.keyword) || r.id.includes(this.keyword))
            );
        },
        visible() {
            return this.filtered.slice(0, this.page * 50);
        },
    },
    watch: {
        records: {
            immediate: true,
            handler() {
                this.load();
            },
        },
        onlyCommon() {
            this.page = 1;
        },
        category() {
            this.page = 1;
        },
        keyword() {
            this.page = 1;
        },
    },
    methods: {
        async load() {
            const request = ++this.requestId;
            this.error = "";
            this.excludedIds = [];
            this.details = [];
            this.page = 1;
            this.category = "";
            if (!this.records.length) {
                this.loading = false;
                return;
            }
            this.loading = true;
            try {
                const target = await getResearchTargetAchievements(this.adventureId);
                if (request !== this.requestId) return;
                if (!target?.achievement_id)
                    throw new Error("尚未取得该奇遇的对应成就，无法排除奇遇自身；请稍后重试。");
                this.excludedIds = [String(target.achievement_id)];
                const ids = analyzeResearch(this.records, this.excludedIds).achievements.map((r) => r.id);
                const details = await getResearchAchievementDetails(ids);
                if (request === this.requestId) this.details = details;
            } catch (e) {
                if (request === this.requestId) this.error = e.message || "成就信息加载失败";
            } finally {
                if (request === this.requestId) this.loading = false;
            }
        },
    },
};
</script>
<template>
    <section class="research-analysis-panel">
        <div class="research-metrics">
            <div>
                <span>有效角色样本</span><strong>{{ analysis.sampleCount }}</strong>
            </div>
            <div>
                <span>全部共有成就</span
                ><strong>{{ loading || error ? "—" : analysis.achievements.filter((r) => r.common).length }}</strong>
            </div>
            <div>
                <span>样本最低资历</span><strong>{{ analysis.minimumPoints ?? "—" }}</strong>
            </div>
        </div>
        <p class="research-notice">
            共有项仅为候选线索，不代表必要条件。少于 2 个角色时无法形成交叉验证；最低资历不是触发门槛。
        </p>
        <div class="research-analysis-grid">
            <div class="research-card">
                <h2>成就共有项</h2>
                <p class="research-muted">同一角色只计一次，缺少同步数据的记录不进入统计。</p>
                <p v-if="loading" role="status">正在解析成就详情…</p>
                <p v-else-if="error" role="alert" class="research-error">
                    {{ error }} <el-button @click="load">重试</el-button>
                </p>
                <template v-else
                    ><div class="research-filters research-analysis-filters">
                        <label><el-checkbox v-model="onlyCommon">只看全部共有</el-checkbox></label
                        ><el-select
                            popper-class="research-control-popper"
                            v-model="category"
                            filterable
                            clearable
                            placeholder="全部分类"
                            aria-label="成就分类"
                            ><el-option v-for="c in categories" :key="c" :value="c" :label="c" /></el-select
                        ><el-input v-model="keyword" aria-label="搜索成就" placeholder="搜索名称或 ID" />
                    </div>
                    <el-empty v-if="!filtered.length" :image-size="64" description="暂无符合条件的成就" />
                    <div v-for="row in visible" :key="row.id" class="research-achievement">
                        <div>
                            <strong>{{ row.name }}</strong>
                            <p>
                                {{ row.category }}<span v-if="row.description"> · {{ row.description }}</span>
                            </p>
                        </div>
                        <span :class="{ 'research-common': row.common }"
                            >{{ row.count }}/{{ analysis.sampleCount }} · {{ Math.round(row.rate * 100) }}%</span
                        >
                    </div>
                    <el-button v-if="visible.length < filtered.length" @click="page++">
                        加载更多（共 {{ filtered.length }} 项）
                    </el-button></template
                >
            </div>
            <aside class="research-card">
                <h2 class="research-daily-title">已完成的日常</h2>
                <el-empty v-if="!analysis.dailies.length" :image-size="48" description="暂无日常记录" />
                <div v-for="daily in analysis.dailies" :key="daily.name" class="research-action">
                    <div>
                        {{ daily.name }} <span>{{ daily.count }}/{{ analysis.sampleCount }}</span>
                    </div>
                    <el-progress
                        :percentage="Math.round((daily.count / analysis.sampleCount) * 100)"
                        :show-text="false"
                        :stroke-width="6"
                        :aria-label="daily.name"
                    />
                </div>
            </aside>
        </div>
    </section>
</template>
