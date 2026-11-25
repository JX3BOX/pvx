<!-- 玩家晒图返图区：通过 CMS post_type=show + meta_1 读写返图，内置轻量页内发布抽屉与详情/评论抽屉，无需跳转重量级发布页。 -->
<template>
    <PvxSurface v-loading="loading" tag="section" padding="medium" class="m-ext-showcase">
        <PvxSectionHeader
            :title="$t('exterior.showcase')"
            :description="$t('exterior.showcaseDesc') + (total ? $t('exteriorPreview.postCount', { count: total }) : '')"
        >
            <template #icon><Camera /></template>
            <template #action>
                <el-button type="primary" plain round size="small" @click="openPublishDrawer">
                    <el-icon class="el-icon--left"><Camera /></el-icon>
                    {{ $t("exterior.publishShowcase") }}
                </el-button>
            </template>
        </PvxSectionHeader>

        <PvxEmptyState v-if="error" :title="$t('exterior.loadError')" :description="requestErrorMessage(error)">
            <template #action>
                <el-button @click="load(page)">{{ $t("exterior.retry") }}</el-button>
            </template>
        </PvxEmptyState>

        <template v-else-if="posts.length">
            <div class="m-ext-showcase__grid">
                <article
                    v-for="post in posts"
                    :key="post.ID"
                    class="m-show-card"
                    :class="{ 'is-pending': isPendingReview(post) }"
                    role="button"
                    tabindex="0"
                    @click="openDetailDrawer(post)"
                    @keydown.enter.prevent="openDetailDrawer(post)"
                >
                    <div class="m-show-card__media">
                        <img
                            v-if="cardCover(post)"
                            :src="cardCover(post)"
                            :alt="post.post_title || $t('exteriorPreview.post')"
                            loading="lazy"
                            class="u-show-img"
                        />
                        <div v-else class="u-show-fallback">{{ $t("exterior.imageUnavailable") }}</div>
                        <div class="m-show-card__badges">
                            <span v-if="isPendingReview(post)" class="u-show-pending-badge">{{ $t('exteriorPreview.pendingPrivate') }}</span>
                            <span v-if="post.post_subtype" class="u-show-body-badge">{{ localizedExteriorLabel($t, post.post_subtype) }}</span>
                        </div>
                        <span v-if="postPicCount(post) > 1" class="u-show-pic-badge">
                            <el-icon><Picture /></el-icon>
                            {{ postPicCount(post) }}
                        </span>
                    </div>

                    <div class="m-show-card__body">
                        <h3 class="u-show-title" :title="post.post_title">
                            {{ post.post_title || $t('exteriorPreview.post') }}
                        </h3>
                        <p v-if="post.post_excerpt" class="u-show-excerpt">
                            {{ post.post_excerpt }}
                        </p>
                        <div class="u-show-meta">
                            <div class="u-show-author">
                                <img
                                    v-if="post.author_info?.user_avatar"
                                    :src="showAvatar(post.author_info.user_avatar)"
                                    alt=""
                                    loading="lazy"
                                    class="u-author-avatar"
                                />
                                <span class="u-author-name">{{ post.author_info?.display_name || $t('exteriorPreview.anonymous') }}</span>
                            </div>
                            <span v-if="formatDate(post.post_date)" class="u-show-date">
                                {{ formatDate(post.post_date) }}
                            </span>
                        </div>
                        <div v-if="isOwnPost(post)" class="m-show-card__owner-bar" @click.stop>
                            <button type="button" class="u-owner-btn" @click="openEditDrawer(post)">
                                <el-icon><Edit /></el-icon>
                                <span>{{ $t('exteriorPreview.edit') }}</span>
                            </button>
                            <button
                                type="button"
                                class="u-owner-btn is-danger"
                                :disabled="deletingId === post.ID"
                                @click="confirmDeletePost(post)"
                            >
                                <el-icon><Delete /></el-icon>
                                <span>{{ deletingId === post.ID ? $t('exteriorPreview.deleting') : $t('exteriorPreview.delete') }}</span>
                            </button>
                        </div>
                    </div>
                </article>
            </div>

            <div v-if="total > per" class="m-ext-showcase__pager">
                <el-pagination
                    :current-page="page"
                    :page-size="per"
                    :total="total"
                    :pager-count="responsivePagerCount"
                    layout="prev, pager, next"
                    background
                    small
                    @update:current-page="load"
                />
            </div>
        </template>

        <div v-else-if="!loading" class="m-ext-showcase__empty">
            <p>{{ $t("exterior.emptyShowcase") }}</p>
            <el-button type="primary" round size="small" @click="openPublishDrawer">
                <el-icon class="el-icon--left"><Camera /></el-icon>
                {{ $t("exterior.publishShowcase") }}
            </el-button>
        </div>

        <!-- 轻量页内发布返图抽屉 -->
        <el-drawer
            v-model="publishVisible"
            header-class="m-exterior-drawer-header"
            body-class="m-ext-publish-content"
            size="min(100%, 540px)"
            append-to-body
            destroy-on-close
            class="m-ext-show-drawer"
        >
            <template #header>
                <div class="m-drawer-head">
                    <h3>{{ editingPostId ? $t('exteriorPreview.editPost') : $t('exteriorPreview.publishPost') }}</h3>
                    <span class="u-drawer-target">{{ targetName }}</span>
                </div>
            </template>

            <div class="m-publish-body">
                <p v-if="isCanonicalRedirect" class="u-canonical-note">
                    {{ $t('exteriorPreview.sharedWall', { name: targetName }) }}
                </p>
                <p class="u-review-note">
                    {{ $t('exteriorPreview.reviewNote') }}
                </p>

                <div class="m-form-section">
                    <div class="u-section-head">
                        <span class="u-label">{{ $t('exteriorPreview.uploadScreens') }} <em>*</em></span>
                        <span class="u-hint">{{ $t('exteriorPreview.imageLimit', { count: form.pics.length, max: maxPics }) }}</span>
                    </div>

                    <div
                        class="m-upload-grid"
                        :class="{ 'is-dragging': isDragging }"
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="onDropFiles"
                    >
                        <div v-for="(pic, idx) in form.pics" :key="pic" class="m-upload-tile">
                            <img :src="pic" alt="" class="u-tile-img" />
                            <span v-if="idx === 0" class="u-cover-tag">{{ $t('exteriorPreview.cover') }}</span>
                            <div class="m-tile-actions">
                                <button
                                    v-if="idx > 0"
                                    type="button"
                                    class="u-tile-btn"
                                    :title="$t('exteriorPreview.setCover')"
                                    @click="setAsCover(idx)"
                                >
                                    {{ $t('exteriorPreview.cover') }}
                                </button>
                                <button
                                    type="button"
                                    class="u-tile-btn is-danger"
                                    :title="$t('exteriorPreview.delete')"
                                    @click="removePic(idx)"
                                >
                                    <el-icon><Delete /></el-icon>
                                </button>
                            </div>
                        </div>

                        <label
                            v-if="form.pics.length < maxPics"
                            class="m-upload-trigger"
                            :class="{ 'is-uploading': uploadingCount > 0 }"
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                class="u-hidden-input"
                                :disabled="uploadingCount > 0"
                                @change="onFileSelect"
                            />
                            <el-icon class="u-plus-icon"><Plus /></el-icon>
                            <span>{{ uploadingCount > 0 ? $t('exteriorPreview.uploading', { count: uploadingCount }) : $t('exteriorPreview.chooseImages') }}</span>
                        </label>
                    </div>
                </div>

                <div class="m-form-section">
                    <div class="u-section-head">
                        <span class="u-label">{{ $t('exteriorPreview.shownBody') }}</span>
                        <span class="u-hint">{{ $t('exteriorPreview.bodyHint') }}</span>
                    </div>
                    <div class="m-role-pills">
                        <button
                            v-for="body in bodyTypes"
                            :key="body.id"
                            type="button"
                            class="u-role-pill"
                            :class="{ 'is-active': form.roleType === body.id }"
                            @click="toggleFormRole(body.id)"
                        >
                            {{ localizedExteriorLabel($t, body.label) }}
                        </button>
                    </div>
                </div>

                <div class="m-form-section">
                    <div class="u-section-head">
                        <span class="u-label">{{ $t('exteriorPreview.postTitle') }}</span>
                        <span class="u-hint">{{ $t('exteriorPreview.titleHint') }}</span>
                    </div>
                    <el-input
                        v-model="form.title"
                        maxlength="60"
                        clearable
                        :placeholder="$t('exterior.service.defaultTitle', { name: targetName })"
                    />
                </div>

                <div class="m-form-section">
                    <div class="u-section-head">
                        <span class="u-label">{{ $t('exteriorPreview.notes') }}</span>
                        <span class="u-hint">{{ $t('exteriorPreview.optional') }}</span>
                    </div>
                    <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="4"
                        maxlength="500"
                        show-word-limit
                        :placeholder="$t('exteriorPreview.notesHint')"
                    />
                </div>
            </div>

            <template #footer>
                <div class="m-drawer-footer">
                    <el-button round @click="publishVisible = false">{{ $t('exteriorPreview.cancel') }}</el-button>
                    <el-button
                        type="primary"
                        round
                        :loading="submitting"
                        :disabled="uploadingCount > 0 || !form.pics.length"
                        @click="submitShowcase"
                    >
                        {{ editingPostId ? $t('exteriorPreview.saveReview') : $t('exteriorPreview.submitReview') }}
                    </el-button>
                </div>
            </template>
        </el-drawer>

        <!-- 页内玩家返图详情与评论抽屉 -->
        <el-drawer
            v-model="detailVisible"
            size="min(100%, 680px)"
            append-to-body
            destroy-on-close
            class="m-ext-show-drawer"
        >
            <template #header>
                <div class="m-drawer-head">
                    <h3>{{ activePost?.post_title || $t('exteriorPreview.post') }}</h3>
                    <span v-if="activePost && isPendingReview(activePost)" class="u-drawer-pending">{{ $t('exteriorPreview.pending') }}</span>
                    <span v-if="activePost?.post_subtype" class="u-drawer-target">{{ localizedExteriorLabel($t, activePost.post_subtype) }}</span>
                </div>
            </template>

            <div v-if="activePost" v-loading="detailLoading" class="m-detail-body">
                <div v-if="isPendingReview(activePost)" class="u-review-note">
                    {{ $t('exteriorPreview.pendingNote') }}
                </div>

                <div class="m-detail-author">
                    <img
                        v-if="activePost.author_info?.user_avatar"
                        :src="showAvatar(activePost.author_info.user_avatar)"
                        alt=""
                        class="u-detail-avatar"
                    />
                    <div class="m-detail-author-info">
                        <span class="u-detail-name">{{ activePost.author_info?.display_name || $t('exteriorPreview.anonymous') }}</span>
                        <span v-if="formatDate(activePost.post_date, true)" class="u-detail-time">
                            {{ formatDate(activePost.post_date, true) }}
                        </span>
                    </div>
                    <div v-if="isOwnPost(activePost)" class="m-detail-owner-actions">
                        <el-button size="small" plain round @click="openEditDrawer(activePost)">
                            <el-icon class="el-icon--left"><Edit /></el-icon>
                            {{ $t('exteriorPreview.edit') }}
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            plain
                            round
                            :loading="deletingId === activePost.ID"
                            @click="confirmDeletePost(activePost)"
                        >
                            <el-icon class="el-icon--left"><Delete /></el-icon>
                            {{ $t('exteriorPreview.delete') }}
                        </el-button>
                    </div>
                </div>

                <div v-if="activeDetailPics.length" class="m-detail-gallery">
                    <div class="m-detail-main-photo">
                        <el-image
                            :key="activeDetailPics[activeDetailIndex]"
                            :src="activeDetailPics[activeDetailIndex]"
                            :alt="activePost.post_title || $t('exteriorPreview.post')"
                            :preview-src-list="activeDetailPics"
                            :initial-index="activeDetailIndex"
                            fit="contain"
                            preview-teleported
                            class="u-detail-img"
                        />
                    </div>
                    <div v-if="activeDetailPics.length > 1" class="m-detail-thumbs">
                        <button
                            v-for="(pic, idx) in activeDetailPics"
                            :key="pic"
                            type="button"
                            class="u-detail-thumb"
                            :class="{ 'is-active': idx === activeDetailIndex }"
                            :aria-label="$t('exteriorPreview.viewPhoto', { number: idx + 1 })"
                            @click="activeDetailIndex = idx"
                        >
                            <img :src="pic" alt="" />
                        </button>
                    </div>
                </div>

                <p v-if="activeDetailText" class="m-detail-caption">{{ activeDetailText }}</p>

                <div class="m-detail-comments">
                    <h4 class="u-comments-title">{{ $t('exteriorPreview.comments') }}</h4>
                    <Comment :key="activePost.ID" :id="String(activePost.ID)" category="post" order="desc" />
                </div>
            </div>
        </el-drawer>
    </PvxSurface>
</template>

<script>
import { Camera, Delete, Edit, Picture, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import {
    UC_AUTH_URL,
    createExteriorShowcase,
    deleteExteriorShowcase,
    getExteriorShowcase,
    getExteriorShowcasePost,
    getMyExteriorShowcase,
    getUserVerifyStatus,
    updateExteriorShowcase,
    uploadShowcaseImage,
} from "@/service/exterior";
import { localizedExteriorLabel, BODY_LABEL_MAP, BODY_TYPES, normalizeBodyType } from "./meta";

const MAX_PICS = 9;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function extractImagesFromHtml(html) {
    if (!html || typeof html !== "string") return [];
    const urls = [];
    const re = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
        if (match[1]) urls.push(match[1]);
    }
    return urls;
}

function extractTextFromHtml(html) {
    if (!html || typeof html !== "string") return "";
    return html
        .replace(/<img[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export default {
    mixins: [responsivePagination],
    name: "ExteriorShowcase",
    components: { PvxSectionHeader, Camera, Comment, Delete, Edit, Picture, Plus, PvxSurface, PvxEmptyState },
    props: {
        exteriorId: { type: String, required: true },
        item: { type: Object, default: null },
        queryKeys: { type: Array, default: () => [] },
        canonicalName: { type: String, default: "" },
        isCanonicalRedirect: { type: Boolean, default: false },
    },
    data() {
        return {
            bodyTypes: BODY_TYPES,
            maxPics: MAX_PICS,
            posts: [],
            total: 0,
            page: 1,
            per: 12,
            loading: true,
            error: "",
            listAbort: null,
            publishVisible: false,
            editingPostId: null,
            deletingId: null,
            isDragging: false,
            uploadingCount: 0,
            submitting: false,
            form: {
                pics: [],
                roleType: null,
                title: "",
                content: "",
            },
            detailVisible: false,
            detailLoading: false,
            activePost: null,
            activeFullPost: null,
            activeDetailIndex: 0,
            detailAbort: null,
        };
    },
    computed: {
        currentUid() {
            if (!User.isLogin()) return 0;
            return Number(User.getInfo()?.uid) || 0;
        },
        effectiveQueryKeys() {
            const list = this.queryKeys?.length ? this.queryKeys : [this.exteriorId];
            return [...new Set(list.map((k) => String(k || "").trim()).filter(Boolean))];
        },
        queryKeySignature() {
            return this.effectiveQueryKeys.join(",");
        },
        targetName() {
            return this.canonicalName || this.item?.name || this.item?.game_name || this.exteriorId;
        },
        activeDetailPics() {
            if (!this.activePost) return [];
            const fromMeta = Array.isArray(this.activePost.post_meta?.pics) ? this.activePost.post_meta.pics : [];
            const fromHtml = extractImagesFromHtml(this.activeFullPost?.post_content);
            const merged = [...fromMeta, ...fromHtml, this.activePost.post_banner].filter(Boolean);
            return [...new Set(merged)];
        },
        activeDetailText() {
            if (!this.activePost) return "";
            return this.activePost.post_excerpt || extractTextFromHtml(this.activeFullPost?.post_content);
        },
    },
    watch: {
        queryKeySignature: {
            immediate: true,
            handler(sig) {
                if (sig) this.load(1);
            },
        },
    },
    beforeUnmount() {
        this.listAbort?.abort();
        this.detailAbort?.abort();
    },
    methods: {
        localizedExteriorLabel,
        requestErrorMessage(error, fallbackKey = "exterior.requestError") {
            return error?.data?.msg || error?.response?.data?.msg || error?.message ||
                (typeof error === "string" ? error : this.$t(fallbackKey));
        },
        showAvatar,
        isPendingReview(post) {
            return String(post?.visible ?? "0") === "1";
        },
        isOwnPost(post) {
            return this.currentUid > 0 && Number(post?.post_author) === this.currentUid;
        },
        cardCover(post) {
            return post?.post_banner || post?.post_meta?.pics?.[0] || "";
        },
        postPicCount(post) {
            const pics = Array.isArray(post?.post_meta?.pics) ? post.post_meta.pics.filter(Boolean) : [];
            return pics.length || (post?.post_banner ? 1 : 0);
        },
        formatDate(raw, withTime = false) {
            if (!raw) return "";
            const date = new Date(raw);
            if (Number.isNaN(date.getTime())) return "";
            return date.toLocaleString(this.$i18n.locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
            });
        },
        async load(targetPage = 1) {
            this.listAbort?.abort();
            const controller = (this.listAbort = new AbortController());
            this.loading = true;
            this.error = "";
            try {
                const publicPromise = getExteriorShowcase(
                    this.effectiveQueryKeys,
                    { page: targetPage, per: this.per },
                    controller.signal
                );
                // 首页并发拉取当前登录用户本人提交的返图，将处于审核中（visible="1"）的记录置顶呈现给本人查看/修改。
                const myPromise =
                    targetPage === 1 && User.isLogin()
                        ? getMyExteriorShowcase(this.effectiveQueryKeys, { per: 20 }, controller.signal)
                        : Promise.resolve([]);
                const [res, myList] = await Promise.all([publicPromise, myPromise]);
                if (controller.signal.aborted) return;

                const publicIds = new Set(res.list.map((item) => Number(item.ID)));
                const myPending = (myList || []).filter(
                    (item) =>
                        item &&
                        item.post_status === "publish" &&
                        String(item.visible) === "1" &&
                        !publicIds.has(Number(item.ID))
                );
                this.posts = [...myPending, ...res.list];
                this.total = res.total + myPending.length;
                this.page = res.page;
            } catch (error) {
                if (controller.signal.aborted || error?.name === "CanceledError" || error?.name === "AbortError") {
                    return;
                }
                this.error = error;
            } finally {
                if (!controller.signal.aborted) this.loading = false;
            }
        },
        async ensureVerifiedForShowcase() {
            if (!User.isLogin()) {
                User.toLogin();
                return false;
            }
            const status = await getUserVerifyStatus().catch(() => ({ verified: true }));
            if (status?.verified) return true;
            this.promptVerifyAuth();
            return false;
        },
        promptVerifyAuth() {
            ElMessageBox.confirm(
                this.$t('exteriorPreview.verifyPost'),
                this.$t('exteriorPreview.verifyRequired'),
                {
                    type: "warning",
                    confirmButtonText: this.$t('exteriorPreview.verify'),
                    cancelButtonText: this.$t('exteriorPreview.cancel'),
                }
            )
                .then(() => {
                    window.open(UC_AUTH_URL, "_blank", "noopener");
                })
                .catch(() => {});
        },
        async openPublishDrawer() {
            if (!(await this.ensureVerifiedForShowcase())) return;
            this.editingPostId = null;
            this.form = {
                pics: [],
                roleType: this.$store.state.preferredRole || null,
                title: "",
                content: "",
            };
            this.publishVisible = true;
        },
        async openEditDrawer(post) {
            if (!(await this.ensureVerifiedForShowcase())) return;
            let full = this.activeFullPost && Number(this.activeFullPost.ID) === Number(post.ID) ? this.activeFullPost : null;
            if (!full && (!post.post_meta?.pics?.length || !post.post_excerpt)) {
                try {
                    full = await getExteriorShowcasePost(post.ID);
                } catch {
                    full = null;
                }
            }
            const metaPics = Array.isArray(post.post_meta?.pics) ? post.post_meta.pics : [];
            const htmlPics = extractImagesFromHtml(full?.post_content);
            const pics = [...new Set([...metaPics, ...htmlPics, post.post_banner].filter(Boolean))].slice(0, MAX_PICS);
            const roleType =
                normalizeBodyType(post.post_meta?.role_type) || normalizeBodyType(post.post_subtype) || null;
            this.editingPostId = post.ID;
            this.form = {
                pics,
                roleType,
                title: post.post_title || "",
                content: post.post_excerpt || extractTextFromHtml(full?.post_content) || "",
            };
            this.detailVisible = false;
            this.publishVisible = true;
        },
        async confirmDeletePost(post) {
            if (!post?.ID || this.deletingId === post.ID) return;
            try {
                await ElMessageBox.confirm(this.$t('exteriorPreview.deletePrompt'), this.$t('exteriorPreview.deletePost'), {
                    type: "warning",
                    confirmButtonText: this.$t('exteriorPreview.confirmDelete'),
                    cancelButtonText: this.$t('exteriorPreview.cancel'),
                });
            } catch {
                return;
            }
            this.deletingId = post.ID;
            try {
                await deleteExteriorShowcase(post.ID);
                ElMessage.success(this.$t('exteriorPreview.deleted'));
                if (this.activePost && Number(this.activePost.ID) === Number(post.ID)) {
                    this.detailVisible = false;
                    this.activePost = null;
                    this.activeFullPost = null;
                }
                await this.load(1);
            } catch (error) {
                const code = error?.code || error?.response?.data?.code;
                const msg = this.requestErrorMessage(error);
                if (code === 40301 || msg.includes("账号认证")) {
                    this.promptVerifyAuth();
                    return;
                }
                ElMessage.error(msg);
            } finally {
                this.deletingId = null;
            }
        },
        toggleFormRole(roleId) {
            this.form.roleType = this.form.roleType === roleId ? null : roleId;
        },
        onFileSelect(event) {
            const files = Array.from(event.target?.files || []);
            if (event.target) event.target.value = "";
            if (files.length) this.uploadFiles(files);
        },
        onDropFiles(event) {
            this.isDragging = false;
            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length) this.uploadFiles(files);
        },
        async uploadFiles(files) {
            const remaining = this.maxPics - this.form.pics.length;
            if (remaining <= 0) {
                ElMessage.warning(this.$t('exteriorPreview.maxImages', { max: this.maxPics }));
                return;
            }
            const valid = [];
            for (const file of files) {
                if (!file.type.startsWith("image/")) {
                    ElMessage.warning(this.$t('exteriorPreview.notImage', { name: file.name }));
                    continue;
                }
                if (file.size > MAX_FILE_BYTES) {
                    ElMessage.warning(this.$t('exteriorPreview.tooLarge', { name: file.name }));
                    continue;
                }
                valid.push(file);
                if (valid.length >= remaining) break;
            }
            if (!valid.length) return;

            this.uploadingCount += valid.length;
            for (const file of valid) {
                try {
                    const url = await uploadShowcaseImage(file);
                    if (this.form.pics.length < this.maxPics && !this.form.pics.includes(url)) {
                        this.form.pics.push(url);
                    }
                } catch (error) {
                    const msg = this.requestErrorMessage(error, "exteriorPreview.uploadFail");
                    ElMessage.error(this.$t('exteriorPreview.uploadError', { name: file.name, message: msg }));
                } finally {
                    this.uploadingCount = Math.max(0, this.uploadingCount - 1);
                }
            }
        },
        setAsCover(idx) {
            const [picked] = this.form.pics.splice(idx, 1);
            if (picked) this.form.pics.unshift(picked);
        },
        removePic(idx) {
            this.form.pics.splice(idx, 1);
        },
        async submitShowcase() {
            if (this.submitting || this.uploadingCount > 0) return;
            if (!this.form.pics.length) {
                ElMessage.warning(this.$t('exteriorPreview.needImage'));
                return;
            }
            this.submitting = true;
            try {
                const payload = {
                    exteriorKey: this.exteriorId,
                    exteriorName: this.targetName,
                    title: this.form.title,
                    content: this.form.content,
                    pics: this.form.pics,
                    bodyType: this.form.roleType ? BODY_LABEL_MAP[this.form.roleType] || "" : "",
                    roleType: this.form.roleType,
                    client: this.$store.state.client || "std",
                };
                if (this.editingPostId) {
                    await updateExteriorShowcase(this.editingPostId, payload);
                    ElMessage.success(this.$t('exteriorPreview.updated'));
                } else {
                    await createExteriorShowcase(payload);
                    ElMessage.success(this.$t('exteriorPreview.submitted'));
                }
                this.publishVisible = false;
                this.editingPostId = null;
                this.form = {
                    pics: [],
                    roleType: this.$store.state.preferredRole || null,
                    title: "",
                    content: "",
                };
                await this.load(1);
            } catch (error) {
                const code = error?.code || error?.response?.data?.code;
                const msg = this.requestErrorMessage(error);
                if (code === 40301 || msg.includes("账号认证")) {
                    this.promptVerifyAuth();
                    return;
                }
                ElMessage.error(msg);
            } finally {
                this.submitting = false;
            }
        },
        async openDetailDrawer(post) {
            this.detailAbort?.abort();
            this.activePost = post;
            this.activeFullPost = null;
            this.activeDetailIndex = 0;
            this.detailVisible = true;

            // 若列表记录尚未包含 post_meta.pics（例如历史发布内容），按需拉取正文补全多图与文字。
            if (!post.post_meta?.pics?.length || !post.post_excerpt) {
                const controller = (this.detailAbort = new AbortController());
                this.detailLoading = true;
                try {
                    const full = await getExteriorShowcasePost(post.ID, controller.signal);
                    if (!controller.signal.aborted) this.activeFullPost = full;
                } catch {
                    // 保留列表已有字段，不阻断用户查看封面与评论
                } finally {
                    if (!controller.signal.aborted) this.detailLoading = false;
                }
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-showcase__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(230px, 100%), 1fr));
    gap: 16px;
}

.m-show-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid @pvx-border;
    background: @pvx-surface;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;

    &.is-pending {
        border-color: rgba(217, 119, 6, 0.35);
    }

    &:hover {
        border-color: @pvx-border-focus;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
        transform: translateY(-2px);
    }
}

.m-show-card__media {
    position: relative;
    aspect-ratio: 16 / 10;
    width: 100%;
    overflow: hidden;
    background: @pvx-surface-muted;

    .u-show-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .u-show-fallback {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        font-size: 12px;
        color: @pvx-text-muted;
    }

    .m-show-card__badges {
        position: absolute;
        top: 8px;
        left: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        max-width: calc(100% - 64px);
    }

    .u-show-pending-badge {
        padding: 2px 8px;
        border-radius: @pvx-radius-pill;
        background: rgba(217, 119, 6, 0.92);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        backdrop-filter: blur(4px);
    }

    .u-show-body-badge {
        padding: 2px 8px;
        border-radius: @pvx-radius-pill;
        background: rgba(15, 23, 42, 0.62);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        backdrop-filter: blur(4px);
    }

    .u-show-pic-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: @pvx-radius-pill;
        background: rgba(15, 23, 42, 0.62);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        backdrop-filter: blur(4px);
    }
}

.m-show-card__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
}

.u-show-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: @pvx-text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.u-show-excerpt {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: @pvx-text-secondary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.u-show-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 2px;
}

.u-show-author {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 12px;
    color: @pvx-text-secondary;

    .u-author-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }

    .u-author-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.u-show-date {
    font-size: 11px;
    color: @pvx-text-muted;
    flex-shrink: 0;
}

.m-show-card__owner-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid @pvx-border-light;

    .u-owner-btn {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 3px 9px;
        border: 1px solid @pvx-border;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
        color: @pvx-text-secondary;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.16s;

        &:hover {
            border-color: @pvx-primary;
            color: @pvx-primary-hover;
            background: @pvx-primary-soft;
        }

        &.is-danger:hover {
            border-color: #fda4af;
            color: #e11d48;
            background: #fff1f2;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
}

.m-ext-showcase__pager {
    display: flex;
    justify-content: center;
    padding-top: 6px;
}

.m-ext-showcase__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 28px 16px;
    border-radius: 14px;
    border: 1px dashed @pvx-border;
    background: @pvx-surface-muted;
    text-align: center;

    p {
        margin: 0;
        font-size: 13px;
        color: @pvx-text-secondary;
    }
}

.m-drawer-head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: @pvx-text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .u-drawer-pending {
        padding: 2px 9px;
        border-radius: @pvx-radius-pill;
        background: #fef3c7;
        color: #b45309;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .u-drawer-target {
        padding: 2px 9px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
    }
}

:global(.el-drawer__body.m-ext-publish-content) {
    padding: @pvx-space-2 clamp(@pvx-space-2, 4vw, @pvx-space-4);
}

.m-publish-body {
    display: flex;
    flex-direction: column;
    gap: @pvx-space-2;
}

.u-canonical-note {
    margin: 0;
    padding: 9px 12px;
    border-radius: 10px;
    background: @pvx-primary-soft;
    color: @pvx-primary-hover;
    font-size: 12px;
    line-height: 1.5;
}

.u-review-note {
    margin: 0;
    padding: 9px 12px;
    border-radius: 10px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    font-size: 12px;
    line-height: 1.55;
}

.m-form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .u-section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
    }

    .u-label {
        font-size: 13px;
        font-weight: 600;
        color: @pvx-text-primary;

        em {
            color: #e11d48;
            font-style: normal;
        }
    }

    .u-hint {
        font-size: 12px;
        color: @pvx-text-muted;
    }
}

.m-upload-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding: 10px;
    border-radius: 14px;
    border: 1px dashed @pvx-border;
    background: @pvx-surface-muted;
    transition: border-color 0.16s, background 0.16s;

    &.is-dragging {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
    }
}

.m-upload-tile {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid @pvx-border;
    background: @pvx-surface;

    .u-tile-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .u-cover-tag {
        position: absolute;
        top: 6px;
        left: 6px;
        padding: 1px 6px;
        border-radius: 6px;
        background: @pvx-primary;
        color: #fff;
        font-size: 10px;
        font-weight: 600;
    }

    .m-tile-actions {
        position: absolute;
        inset: auto 0 0 0;
        display: flex;
        justify-content: flex-end;
        gap: 4px;
        padding: 5px;
        background: linear-gradient(transparent, rgba(15, 23, 42, 0.72));
    }

    .u-tile-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 6px;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.9);
        color: #1e293b;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;

        &.is-danger {
            color: #e11d48;
        }
    }
}

.m-upload-trigger {
    position: relative;
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 10px;
    border: 1px dashed @pvx-border;
    background: @pvx-surface;
    color: @pvx-text-secondary;
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.16s, color 0.16s;

    &:hover {
        border-color: @pvx-primary;
        color: @pvx-primary;
    }

    &.is-uploading {
        opacity: 0.7;
        cursor: wait;
    }

    .u-hidden-input {
        display: none;
    }

    .u-plus-icon {
        font-size: 20px;
    }
}

.m-role-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .u-role-pill {
        padding: 5px 14px;
        border-radius: @pvx-radius-pill;
        border: 1px solid @pvx-border;
        background: @pvx-surface;
        color: @pvx-text-regular;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.16s;

        &.is-active {
            border-color: @pvx-primary;
            background: @pvx-primary;
            color: #fff;
            font-weight: 600;
        }
    }
}

.m-drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: @pvx-space-1;

    .el-button { margin: 0; }
}

.m-detail-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.m-detail-author {
    display: flex;
    align-items: center;
    gap: 10px;

    .u-detail-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
    }

    .m-detail-author-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .u-detail-name {
        font-size: 14px;
        font-weight: 600;
        color: @pvx-text-primary;
    }

    .u-detail-time {
        font-size: 12px;
        color: @pvx-text-muted;
    }

    .m-detail-owner-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }
}

.m-detail-gallery {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.m-detail-main-photo {
    width: 100%;
    height: min(56vh, 440px);
    border-radius: 14px;
    overflow: hidden;
    background: #0f172a;

    .u-detail-img {
        width: 100%;
        height: 100%;
        display: block;

        :deep(img) {
            cursor: zoom-in;
        }
    }
}

.m-detail-thumbs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;

    .u-detail-thumb {
        width: 64px;
        height: 64px;
        padding: 0;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        background: @pvx-surface-muted;
        cursor: pointer;
        flex-shrink: 0;

        &.is-active {
            border-color: @pvx-primary;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }
}

.m-detail-caption {
    margin: 0;
    padding: 12px 14px;
    border-radius: 12px;
    background: @pvx-surface-muted;
    font-size: 14px;
    line-height: 1.7;
    color: @pvx-text-primary;
    white-space: pre-line;
}

.m-detail-comments {
    padding-top: 8px;
    border-top: 1px solid @pvx-border-light;

    .u-comments-title {
        margin: 0 0 10px;
        font-size: 15px;
        font-weight: 700;
        color: @pvx-text-primary;
    }
}
</style>
