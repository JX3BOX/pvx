<template>
    <div class="m-pvx-fb-author">
        <div class="u-pvx-fb-author-title">关于作者</div>
        <img class="u-pvx-fb-author-bg" :src="showAvatar(author.user_avatar, 335)" />
        <div class="u-pvx-fb-author-info-box">
            <div class="u-pvx-fb-author-info">
                <div class="u-pvx-fb-author-name">{{ author.author_name }}</div>
                <div class="u-pvx-fb-author-fans">{{ fans }}个粉丝</div>
            </div>
            <div class="u-pvx-fb-author-follow" @click="handleToggleFollow">
                {{ subscribed ? "取消关注" : "关注TA" }}
            </div>
        </div>
        <div class="u-pvx-fb-author-introduce" v-if="userInfo.user_bio">{{ userInfo.user_bio }}</div>
    </div>
</template>

<script>
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getUserInfo } from "@/service/common/user";
import { getFans } from "@/service/face/author";
import { subscribeAuthor, unsubscribeAuthor } from "@/service/common/suspend";

export default {
    name: "MiniappAuthorCard",
    props: {
        author: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            userInfo: {},
            fans: 0,
            subscribed: false,
        };
    },
    watch: {
        "author.user_id": {
            handler(val) {
                if (val) this.loadAuthorInfo(val);
            },
            immediate: true,
        },
    },
    methods: {
        showAvatar,
        loadAuthorInfo(uid) {
            getUserInfo(uid).then((res) => {
                this.userInfo = res.data.data;
                this.fetchFans(uid);
            });
        },
        fetchFans(uid) {
            getFans(uid).then((res) => {
                this.fans = res.data.data.total || 0;
                this.subscribed = res.data.data.subscribed || false;
            });
        },
        handleToggleFollow() {
            const uid = this.author.user_id;
            if (this.subscribed) {
                unsubscribeAuthor(uid).then(() => {
                    this.subscribed = false;
                });
            } else {
                subscribeAuthor(uid).then(() => {
                    this.subscribed = true;
                });
            }
        },
    },
};
</script>
