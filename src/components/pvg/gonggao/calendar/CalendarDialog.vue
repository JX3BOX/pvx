<template>
    <el-dialog :model-value="modelValue" @close="cancel" append-to-body>
        <template #header>
            <header>{{ title }}</header>
        </template>
        <main class="u-form">
            <el-form label-position="left" label-width="80px">
                <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.date')" required :error="dateError">
                    <div class="m-date">
                        <el-input-number
                            :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterYear')"
                            :min="2009"
                            :max="maxYear"
                            class="u-date"
                            v-model.number="form.year"
                        ></el-input-number>
                        <el-input-number
                            :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterMonth')"
                            :min="1"
                            :max="12"
                            class="u-date"
                            v-model.number="form.month"
                        ></el-input-number>
                        <el-input-number
                            :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterDate')"
                            :min="1"
                            :max="31"
                            class="u-date"
                            v-model.number="form.date"
                        ></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.type')" required>
                    <div class="m-type">
                        <el-radio-group size="small" v-model.number="form.type">
                            <el-radio-button :value="1">{{ $t("pages.pvg.gonggao.ui.calendar.events") }}</el-radio-button>
                            <el-radio-button :value="2">{{ $t("pages.pvg.gonggao.ui.calendar.activities") }}</el-radio-button>
                        </el-radio-group>
                        <!-- 仅在活动时显示 START -->
                        <div class="m-type-icon" v-show="form.type === 2">
                            <el-input
                                size="small"
                                v-model.number="form.icon"
                                :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.iconId')"
                                :minlength="1"
                                :maxlength="10"
                                :max="30000"
                                :min="0"
                            >
                                <template v-slot:prepend>
                                    <img class="u-icon" :src="iconLink(form.icon)" />
                                </template>
                            </el-input>
                        </div>
                        <!-- 仅在活动时显示 END -->
                    </div>
                </el-form-item>
                <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.description')" required :error="descError">
                    <el-input type="textarea" v-model="form.desc" :rows="8" :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterDescription')"></el-input>
                </el-form-item>
                <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.client')" required>
                    <el-radio-group size="small" v-model="form.client">
                        <el-radio-button value="std">{{ $t("pages.pvg.gonggao.ui.clients.std") }}</el-radio-button>
                        <el-radio-button value="origin">{{ $t("pages.pvg.gonggao.ui.clients.origin") }}</el-radio-button>
                        <el-radio-button value="all" v-if="form.type == 1">{{ $t("pages.pvg.gonggao.ui.clients.all") }}</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.references')">
                    <template v-for="(item, index) in form.link" :key="item.id || index">
                        <div class="m-links">
                            <el-input class="u-link-item" v-model="item.label" :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterTitle')"></el-input>
                            <el-input class="u-link-item" v-model="item.url" :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterLink')"></el-input>
                            <el-button
                                class="u-del-icon"
                                type="text"
                                icon="el-icon-circle-close"
                                @click="removeLink(index)"
                                :title="$t('pages.pvg.gonggao.ui.calendar.form.removeReference')"
                            ></el-button>
                        </div>
                    </template>
                    <el-button type="primary" size="small" icon="el-icon-plus" @click="addLink" :disabled="addDisabled"
                        >{{ $t("pages.pvg.gonggao.ui.common.add") }}</el-button
                    >
                </el-form-item>

                <template v-if="isEditor && isEditmode">
                    <el-divider><i class="el-icon-coordinate"></i> {{ $t("pages.pvg.gonggao.ui.calendar.form.management") }}</el-divider>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.showInCell')">
                        <el-radio-group size="small" v-model.number="form.is_top">
                            <el-radio-button :value="0">{{ $t("pages.pvg.gonggao.ui.common.no") }}</el-radio-button>
                            <el-radio-button :value="1">{{ $t("pages.pvg.gonggao.ui.common.yes") }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.cellSummary')" v-if="form.is_top">
                        <el-input type="input" v-model="form.title" :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterSummary')"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.importance')">
                        <el-input-number v-model.number="form.level" :min="0" :max="5"></el-input-number>
                    </el-form-item>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.style')">
                        <div class="m-style">
                            <div class="m-color-item">
                                <label class="u-label">{{ $t("pages.pvg.gonggao.ui.calendar.form.backgroundColor") }}</label>
                                <span class="u-color-value" v-show="form.bgcolor">【{{ form.bgcolor }}】</span>
                                <el-color-picker v-model="form.bgcolor" size="small" :predefine="predefineColors">
                                </el-color-picker>
                            </div>
                            <div class="m-color-item">
                                <label class="u-label">{{ $t("pages.pvg.gonggao.ui.calendar.form.color") }}</label>
                                <span class="u-color-value" v-show="form.color">【{{ form.color }}】</span>
                                <el-color-picker v-model="form.color" size="small" :predefine="predefineColors">
                                </el-color-picker>
                            </div>
                        </div>
                    </el-form-item>
                    <!-- <el-form-item label="海报">
                        <img-upload :data="form.banner" filed="banner" @update="setMeta"></img-upload>
                    </el-form-item> -->
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.image')">
                        <img-upload :data="form.img" filed="img" @update="setMeta"></img-upload>
                    </el-form-item>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.remark')">
                        <el-input v-model="form.remark" :placeholder="$t('pages.pvg.gonggao.ui.calendar.form.enterRemark')"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('pages.pvg.gonggao.ui.calendar.form.actions')">
                        <el-button icon="el-icon-refresh-left" size="small" @click="recheck" type="warning"
                            >{{ $t("pages.pvg.gonggao.ui.calendar.form.recheck") }}</el-button
                        >
                        <el-button icon="el-icon-delete" size="small" @click="del" type="danger">{{ $t("pages.pvg.gonggao.ui.common.delete") }}</el-button>
                    </el-form-item>
                </template>
            </el-form>
        </main>
        <template v-slot:footer>
            <el-button @click="cancel">{{ $t("pages.pvg.gonggao.ui.common.cancel") }}</el-button>
            <el-button type="primary" @click="confirm" :loading="loading">{{ $t("pages.pvg.gonggao.ui.common.confirm") }}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { addCalendar, putCalendar, delCalendar, manageCalendar } from "@/service/pvg/calendar.js";
import User from "@jx3box/jx3box-common/js/user.js";
import img_upload from "./img_upload.vue";
import calendar_highlights from "@/assets/data/calendar_highlights.json";
import { iconLink } from "@jx3box/jx3box-common/js/utils";

const default_data = {
    year: 2022,
    month: 3,
    date: 16,
    type: 1,
    desc: "",
    client: location.href.includes("origin") ? "origin" : "std",
    link: [],

    // 编辑字段
    is_top: 0,
    level: 0,
    remark: "",

    // 海报字段
    banner: "",
    bgcolor: "",
    color: "",
    img: "",
    style: "",
    icon: 0,
};
export default {
    name: "calendar_dialog",
    components: {
        "img-upload": img_upload,
    },
    props: ["modelValue", "dateObj", "selected", "mode", "isSuper"],
    data: function () {
        return {
            form: {
                ...Object.assign({}, default_data, this.dateObj),
            },
            dateError: "",
            descError: "",
            loading: false,
            predefineColors: calendar_highlights,
        };
    },
    computed: {
        // 编辑模式
        isEditmode() {
            return this.mode == "update";
        },

        // 标题
        title() {
            return this.isEditmode
                ? this.$t("pages.pvg.gonggao.ui.common.edit")
                : this.$t("pages.pvg.gonggao.ui.common.add");
        },

        // 最大年份
        maxYear() {
            return new Date().getFullYear() + 1;
        },
        // 参考资料最大数
        addDisabled() {
            return this.form?.link?.length >= 10;
        },

        // 编辑权限
        isEditor() {
            return User.isEditor();
        },
    },
    watch: {
        // 更新数据
        selected: {
            deep: true,
            immediate: true,
            handler(val) {
                if (val) {
                    this.form = val;
                    if (!this.form.link) {
                        this.form.link = [];
                        this.form.link.push({
                            label: this.$t("pages.pvg.gonggao.ui.calendar.form.officialNews"),
                            url: val.link_temp,
                        });
                    }
                } else {
                    this.form = Object.assign({}, default_data, this.dateObj);
                }
            },
        },
        // 更新form日期
        dateObj: {
            deep: true,
            handler(val) {
                if (val) {
                    this.form = {
                        ...this.form,
                        ...(val || {}),
                    };
                }
            },
        },
    },
    methods: {
        // 链接模块
        // =======================
        addLink() {
            this.form?.link?.push({
                url: "",
                label: "",
                id: +new Date(),
            });
        },
        removeLink(index) {
            this.form?.link?.splice(index, 1);
        },

        // 表单校验
        // =======================
        validate() {
            if (!this.form) return;

            const { year, month, date, desc } = this.form;
            if (!year) {
                this.dateError = this.$t("pages.pvg.gonggao.ui.calendar.form.enterYear");
            } else {
                this.dateError = "";
                if (!month) {
                    this.dateError = this.$t("pages.pvg.gonggao.ui.calendar.form.enterMonth");
                } else {
                    this.dateError = !date ? this.$t("pages.pvg.gonggao.ui.calendar.form.enterDate") : "";
                }
            }

            this.descError = !desc ? this.$t("pages.pvg.gonggao.ui.calendar.form.enterDescription") : "";
        },

        // 表单操作
        // =======================
        reset() {
            this.$emit("update:modelValue", false);
            this.form = Object.assign({}, default_data, this.dateObj);
            this.dateError = "";
            this.descError = "";
        },
        cancel() {
            this.$emit("update:modelValue", false);
        },
        confirm() {
            this.validate();
            if (this.descError || this.dateError) return;
            this.loading = true;

            const fn = this.isEditmode ? this.put : this.post;

            fn()
                .then(() => {
                    this.reset();
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        // 数据发送
        // =======================
        post() {
            return addCalendar(this.form).then((res) => {
                this.$notify({
                    title: this.$t("pages.pvg.gonggao.ui.calendar.messages.submitted"),
                    message: this.$t("pages.pvg.gonggao.ui.calendar.messages.waitForReview"),
                    type: "success",
                });
                this.$emit("update", res);
                this.reset();
            });
        },
        put() {
            let action = this.isSuper ? manageCalendar : putCalendar;
            return action(this.selected.id, this.form)
                .then((res) => {
                    this.$emit("update");
                    this.reset();
                })
                .then(() => {
                    if (this.isSuper) {
                        this.$notify({
                            title: this.$t("pages.pvg.gonggao.ui.calendar.messages.success"),
                            message: this.$t("pages.pvg.gonggao.ui.calendar.messages.updated"),
                            type: "success",
                        });
                    } else {
                        this.$notify({
                            title: this.$t("pages.pvg.gonggao.ui.calendar.messages.submitted"),
                            message: this.$t("pages.pvg.gonggao.ui.calendar.messages.waitForRecheck"),
                            type: "success",
                        });
                    }
                });
        },
        del() {
            delCalendar(this.selected.id).then(() => {
                this.$emit("del", this.selected.id);

                this.$notify({
                    type: "success",
                    title: this.$t("pages.pvg.gonggao.ui.calendar.messages.deleted"),
                    message: this.$t("pages.pvg.gonggao.ui.calendar.messages.recordDeleted"),
                });
            });
        },
        recheck() {
            manageCalendar(this.selected.id, {
                status: 0,
            }).then(() => {
                this.$notify({
                    type: "success",
                    title: this.$t("pages.pvg.gonggao.ui.calendar.messages.success"),
                    message: this.$t("pages.pvg.gonggao.ui.calendar.messages.markedPending"),
                });

                this.$emit("del", this.selected.id);
            });
        },

        // 其它
        // =======================
        setMeta({ key, val }) {
            this.form[key] = val;
        },
        iconLink,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pvg/calendar/calendar_dialog.less";
</style>
