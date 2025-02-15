<template>
    <div class="m-recommend-item">
        <a
            class="u-face"
            :href="getFaceLink(item)"
            target="_blank"
            v-reporter="{
                data: {
                    href: getFaceLink(item),
                    ...reporter,
                },
                caller: 'face_index',
            }"
        >
            <i class="u-img">
                <img class="u-pic" :src="resolveImagePath(item.img)" loading="lazy" />
            </i>
        </a>
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import User from "@jx3box/jx3box-common/js/user";
import { setPost } from "@/service/face";
import { showAvatar, authorLink, getThumbnail, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "item",
    props: ["item", "reporter"],
    data: function () {
        return {
            search: "",
            markmap: {
                newbie: "热门",
                advanced: "推荐",
                recommended: "精选",
            },
            isEditor: User.isEditor(),
        };
    },
    computed: {
        author: function () {
            return this.item.display_name || "匿名";
        },
        imgLink: function () {
            return this.item.images?.[0] || __imgPath + "image/face/null2.png";
        },
    },
    methods: {
        hasMark: function (item, key) {
            return item.mark?.includes(key);
        },
        setMark: function (item, key) {
            let hasKey = item.mark?.includes(key);
            item.mark = hasKey ? [] : [key];
            let msg = hasKey ? "取消" : "设置";
            msg += this.markmap[key];
            msg += "成功";

            setPost(item.ID, {
                mark: item.mark,
            }).then((res) => {
                this.$notify({
                    title: "成功",
                    message: msg,
                    type: "success",
                });
            });
        },
        showThumb: function (url) {
            return getThumbnail(url, 360);
        },
        showAvatar,
        authorLink,
        onAuthorClick() {
            if (!this.item.original) {
                window.open(this.item.author_link, "_blank");
            }
        },
        getFaceLink(item) {
            return item.source_id ? `/face/${item.source_id}` : item.link;
        },
        resolveImagePath,
    },
};
</script>

<style lang="less">
.m-recommend-item {
    .dbi;
    .mr(20px);
    text-align: center;
    .u-img {
        .db;
        .pr;
        .size(420px,200px);
        background-color: #f5f8fa;
        .r(4px);
    }
    .u-pic {
        // .full;
        .r(4px);
        .size(100%);
        object-fit: cover;
    }
}
@media screen and (max-width: @phone) {
    .m-recommend-item {
        .mr(10px);
        .u-img {
            .size(70vw,22vw);
        }
    }
}
</style>
