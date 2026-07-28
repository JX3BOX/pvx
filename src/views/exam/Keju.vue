<template>
    <PvxPageShell class="p-pvx-exam-index p-pvx-keju-index">
        <div class="m-pvx-exam__layout">
            <PvxSurface class="m-pvx-exam__hero" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-exam__header"
                    :title="$t('pages.keju.title')"
                    :description="$t('pages.exam.ui.sections.imperial.description')"
                    level="h1"
                >
                    <template #icon><Reading /></template>
                    <template #action>
                        <PvxActionButton class="u-contribute" @click="openContribution">
                            <EditPen />
                            {{ $t("pages.keju.contribution.action") }}
                        </PvxActionButton>
                    </template>
                </PvxSectionHeader>
            </PvxSurface>

            <PvxSurface class="m-pvx-exam__content" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-exam__section-header"
                    :title="$t('pages.exam.ui.sections.imperial.title')"
                    :description="$t('pages.exam.ui.sections.imperial.description')"
                    level="h2"
                />
                <ImperialExamList />
            </PvxSurface>
        </div>

        <el-dialog
            v-model="contributionVisible"
            class="m-keju-contribution-dialog"
            :title="$t('pages.keju.contribution.title')"
            width="620px"
            append-to-body
            destroy-on-close
            @closed="resetContribution"
        >
            <div class="m-keju-contribution">
                <div class="u-notice">
                    <InfoFilled />
                    <span>{{ $t("pages.keju.contribution.notice") }}</span>
                </div>
                <el-form label-position="top">
                    <el-form-item :label="$t('pages.keju.contribution.contentLabel')" required>
                        <el-input
                            v-model="contributionContent"
                            type="textarea"
                            :rows="11"
                            resize="vertical"
                            :placeholder="$t('pages.keju.contribution.placeholder')"
                            maxlength="2000"
                            show-word-limit
                        />
                    </el-form-item>
                </el-form>
                <p class="u-tip">{{ $t("pages.keju.contribution.tip") }}</p>
            </div>
            <template #footer>
                <el-button @click="contributionVisible = false">
                    {{ $t("pages.keju.contribution.cancel") }}
                </el-button>
                <el-button type="primary" :loading="submitting" @click="submitContribution">
                    {{ $t("pages.keju.contribution.submit") }}
                </el-button>
            </template>
        </el-dialog>
    </PvxPageShell>
</template>

<script>
import ImperialExamList from "@/components/exam/imperial_exam_list.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { submitFeedback } from "@/service/feedback";
import { __Links } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
import { EditPen, InfoFilled, Reading } from "@element-plus/icons-vue";

const CONTRIBUTION_TEMPLATE = `题目：

选项：
A.
B.
C.
D.

正确答案：

补充说明：`;

export default {
    name: "Keju",
    components: {
        ImperialExamList,
        PvxActionButton,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        EditPen,
        InfoFilled,
        Reading,
    },
    data() {
        return {
            contributionVisible: false,
            contributionContent: CONTRIBUTION_TEMPLATE,
            submitting: false,
        };
    },
    methods: {
        openContribution() {
            if (!User.isLogin()) {
                this.$confirm(
                    this.$t("pages.keju.contribution.loginRequired"),
                    this.$t("pages.keju.contribution.loginTitle"),
                    {
                        confirmButtonText: this.$t("pages.keju.contribution.login"),
                        cancelButtonText: this.$t("pages.keju.contribution.cancel"),
                        type: "warning",
                    }
                )
                    .then(() => {
                        location.href = `${__Links.account.login}?redirect=${encodeURIComponent(location.href)}`;
                    })
                    .catch(() => {});
                return;
            }
            this.contributionVisible = true;
        },
        resetContribution() {
            this.contributionContent = CONTRIBUTION_TEMPLATE;
        },
        hasContributionContent() {
            const content = this.contributionContent.trim();
            const question = content.match(/题目：[ \t]*([^\n]+)/)?.[1]?.trim();
            const answer = content.match(/正确答案：[ \t]*([^\n]+)/)?.[1]?.trim();
            const options = content.match(/^[A-Z][.．、]\s*.+$/gm) || [];
            return content !== CONTRIBUTION_TEMPLATE.trim() && !!question && !!answer && options.length >= 2;
        },
        submitContribution() {
            if (!this.hasContributionContent()) {
                this.$message.warning(this.$t("pages.keju.contribution.contentRequired"));
                return;
            }

            this.submitting = true;
            submitFeedback({
                type: "1",
                subtype: "4",
                content: `[科举题目缺失贡献]<br/><br/>${this.contributionContent.trim().replace(/\n/g, "<br/>")}`,
                public: 0,
                images: [],
                client: this.$store.state.client,
                refer: location.href,
            })
                .then(() => {
                    this.$message.success(this.$t("pages.keju.contribution.success"));
                    this.contributionVisible = false;
                })
                .catch((error) => {
                    this.$message.error(
                        error?.response?.data?.msg || this.$t("pages.keju.contribution.failed")
                    );
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/modules/exam-index-theme.less";

.p-pvx-keju-index .u-contribute {
    flex: none;
    cursor: pointer;

    svg {
        width: 16px;
        height: 16px;
    }
}

.m-keju-contribution-dialog {
    max-width: calc(100vw - 32px);
    border-radius: 16px;

    .u-notice {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        margin-bottom: 18px;
        padding: 12px 14px;
        border: 1px solid #fde68a;
        border-radius: 10px;
        color: #92400e;
        background: #fffbeb;
        font-size: 13px;
        line-height: 20px;

        svg {
            width: 17px;
            height: 17px;
            flex: none;
            margin-top: 1px;
        }
    }

    .el-form-item {
        margin-bottom: 8px;
    }

    .el-textarea__inner {
        border-radius: 10px;
        line-height: 22px;
    }

    .u-tip {
        margin: 0;
        color: #94a3b8;
        font-size: 12px;
        line-height: 18px;
    }
}

@media screen and (max-width: 768px) {
    .p-pvx-keju-index .m-pvx-exam__header {
        .c-pvx-section-header__main {
            align-items: flex-start;
        }

        .c-pvx-section-header__action {
            align-self: center;
        }

        .u-contribute {
            padding: 0 10px;
            font-size: 12px;
        }
    }
}
</style>
