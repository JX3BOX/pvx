<script>
import { InfoFilled } from "@element-plus/icons-vue";
import Nav from "@/components/Nav_v5.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import ResearchForm from "@/components/adventure/research/ResearchForm.vue";
import ResearchRecords from "@/components/adventure/research/ResearchRecords.vue";
import ResearchAnalysis from "@/components/adventure/research/ResearchAnalysis.vue";
import { listResearchRecords, saveResearchRecord, removeResearchRecord } from "@/service/adventure/research";
export default {
    components: { InfoFilled, Nav, PvxPageShell, ResearchForm, ResearchRecords, ResearchAnalysis },
    data() {
        return {
            navStatusClass: "is-regular",
            tab: "submit",
            aboutVisible: false,
            adventureType: "",
            adventureId: "",
            records: [],
            busy: false,
            error: "",
            notice: "",
            tabs: [
                { id: "submit", label: "提交记录", number: "01" },
                { id: "records", label: "记录列表", number: "02" },
                { id: "analysis", label: "共有项分析", number: "03" },
            ],
        };
    },
    computed: {
        adventures() {
            return [
                ...new Map(
                    this.records
                        .filter((r) => !this.adventureType || r.adventure.type === this.adventureType)
                        .map((r) => [r.adventure.id, r.adventure])
                ).values(),
            ];
        },
        filtered() {
            return this.records
                .filter((r) => r.client === "std" && r.adventure.id === this.adventureId)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        },
    },
    watch: {
        adventureType() {
            this.adventureId = this.adventures[0]?.id || "";
        },
    },
    created() {
        this.reload();
    },
    methods: {
        async reload() {
            this.error = "";
            try {
                this.records = await listResearchRecords();
                if (!this.adventures.some((a) => a.id === this.adventureId))
                    this.adventureId = this.adventures[0]?.id || "";
            } catch (e) {
                this.error = `读取本机记录失败：${e.message}`;
            }
        },
        async save(record) {
            this.busy = true;
            this.error = "";
            this.notice = "";
            try {
                await saveResearchRecord(record);
                await this.reload();
                this.adventureType = record.adventure.type;
                await this.$nextTick();
                this.adventureId = record.adventure.id;
                this.$refs.form.resetAfterSave();
                this.tab = "records";
                this.notice = "已保存到当前浏览器。后端接入前，其他玩家无法看到这条记录。";
            } catch (e) {
                this.error = `保存失败，表单已保留：${e.message}`;
            } finally {
                this.busy = false;
            }
        },
        async remove(id) {
            this.busy = true;
            this.error = "";
            try {
                await removeResearchRecord(id);
                await this.reload();
                this.notice = "已撤回本机记录";
            } catch (e) {
                this.error = `撤回失败：${e.message}`;
            } finally {
                this.busy = false;
            }
        },
    },
};
</script>
<template>
    <div class="p-adventure-research">
        <CommonHeader /><Nav @statusChange="navStatusClass = $event" />
        <Main
            class="research-main"
            :class="navStatusClass"
            :withoutRight="true"
            :withoutLeft="true"
            :withoutBread="true"
        >
            <PvxPageShell class="research-shell" :full-height="false">
                <div class="research-toolbar">
                    <h1 class="research-title">奇遇前置反推</h1>
                    <div class="research-tabs" role="tablist" aria-label="工具页面">
                        <el-button
                            v-for="item in tabs"
                            :key="item.id"
                            role="tab"
                            :aria-selected="tab === item.id"
                            :class="{ active: tab === item.id }"
                            @click="tab = item.id"
                        >
                            <span class="research-tab-number">{{ item.number }}</span
                            >{{ item.label }}
                        </el-button>
                    </div>
                    <el-button class="research-about-button" plain @click="aboutVisible = true"
                        ><el-icon><InfoFilled /></el-icon><span>关于本工具</span></el-button
                    >
                </div>
                <el-dialog
                    v-model="aboutVisible"
                    title="关于本工具"
                    class="research-about-dialog"
                    width="min(640px, calc(100vw - 32px))"
                    append-to-body
                >
                    <ol>
                        <li>基于奇遇触发玩家的行为共性，反推奇遇触发前置。</li>
                        <li>
                            当触发后，你需要绑定角色，用于获取你的成就完成情况做对比，输入一些必要的信息，工具自动汇总。
                        </li>
                        <li>
                            本功能基于玩家共建，所有的猜测条件基于已触发玩家的共性获得，转载或根据本功能获得的猜测均可自行使用，无需授权。
                        </li>
                        <li>
                            在前期统计时期，贡献者可获得5000通宝奖励（尽力了，魔盒也没钱），有爱江湖感恩贡献。请提前加群：123456789。
                        </li>
                    </ol>
                    <template #footer
                        ><el-button type="primary" @click="aboutVisible = false">我知道了</el-button></template
                    >
                </el-dialog>
                <p v-if="error" role="alert" class="research-error">{{ error }}</p>
                <p v-if="notice" role="status" class="research-success">{{ notice }}</p>
                <ResearchForm v-show="tab === 'submit'" ref="form" :busy="busy" @submit="save" />
                <template v-if="tab !== 'submit'"
                    ><div class="research-filters research-card research-record-filters">
                        <label
                            >奇遇类型<el-select
                                popper-class="research-control-popper"
                                v-model="adventureType"
                                clearable
                                placeholder="全部类型"
                                ><el-option label="绝世奇遇" value="perfect" /><el-option
                                    label="普通奇遇"
                                    value="normal" /></el-select></label
                        ><label
                            >奇遇<el-select
                                popper-class="research-control-popper"
                                v-model="adventureId"
                                filterable
                                :placeholder="adventures.length ? '选择奇遇' : '暂无奇遇'"
                                :disabled="!adventures.length"
                                aria-label="筛选奇遇"
                                ><el-option
                                    v-for="a in adventures"
                                    :key="a.id"
                                    :value="a.id"
                                    :label="a.name" /></el-select></label
                        ><el-button @click="reload">刷新记录</el-button>
                    </div>
                    <ResearchRecords
                        v-if="tab === 'records'"
                        :records="filtered"
                        :busy="busy"
                        @remove="remove" /><ResearchAnalysis v-else :records="filtered" :adventure-id="adventureId"
                /></template>
            </PvxPageShell> </Main
        ><CommonFooter />
    </div>
</template>
<style lang="less">
@import "~@/assets/css/adventure/research.less";
</style>
