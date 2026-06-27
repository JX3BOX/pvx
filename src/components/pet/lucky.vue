<template>
    <div class="m-pvx-pet-lucky-item">
        <a class="u-pet" :href="getPetLink(item)" :target="isPhone ? '_self' : '_blank'">
            <i class="u-img">
                <img class="u-pic" :src="renderedSrc" loading="lazy" @error="onError" />
            </i>
        </a>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getPetImgSrc } from "@/utils/pet";
import { isPhone } from "@/utils";
import { getPet } from "@/service/pet";

const FONT_FAMILY = "zcoolxiaowei";
const FONT_URL = `${__cdn}design/pet/zcoolxiaowei.otf`;
// 字体加载缓存（多个实例共享，避免重复加载）
let fontPromise = null;
function loadFont() {
    if (!fontPromise) {
        const fontFace = new FontFace(FONT_FAMILY, `url(${FONT_URL})`);
        fontPromise = fontFace.load().then(() => {
            document.fonts.add(fontFace);
            return FONT_FAMILY;
        });
    }
    return fontPromise;
}

export default {
    name: "luckyItem",
    props: ["item"],
    data() {
        return {
            renderedSrc: "",
        };
    },
    computed: {
        isPhone() {
            return isPhone();
        },
        imgPath() {
            return `${__cdn}design/pet/std/${this.item.source_id}.png`;
        },
        // 当前客户端类型（正式服/怀旧服）
        client() {
            return this.$store.state.client;
        },
        // API请求参数
        params() {
            return {
                client: this.client,
            };
        },
    },
    created() {},
    mounted() {
        this.renderImage();
    },
    methods: {
        getImgSrc(path) {
            return getPetImgSrc(path, this.client);
        },
        getPetLink(item) {
            return item.source_id ? `/pet/${item.source_id}` : item.link;
        },
        resolveImagePath,
        onError(e) {
            // e.target.src = this.resolveImagePath(this.item.img);
        },
        loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },
        async renderImage() {
            try {
                await loadFont();

                const petData = await getPet(this.item.source_id, this.params);
                console.log(petData);
                const { Name, BgPath, OutputDes, AdventureName } = petData.data;

                // 加载图片资源
                const [img, petImg] = await Promise.all([
                    this.loadImage(`${__cdn}design/pet/pet-bg.png`),
                    this.loadImage(this.getImgSrc(BgPath)),
                ]);

                // 创建画布
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");

                // 绘制宠物图
                ctx.drawImage(petImg, 230, -60, 315, 526);

                // 绘制底图
                ctx.drawImage(img, 0, 0);

                // 绘制文字
                if (AdventureName) {
                    // 先设置字体用于测量
                    ctx.font = `64px ${FONT_FAMILY}`;
                    const textWidth = ctx.measureText(AdventureName).width;

                    // 绘制主标题
                    this.drawTextWithShadow(ctx, {
                        text: AdventureName,
                        x: 573,
                        y: 180,
                        fontSize: 64,
                        color: "#F1CD8B",
                    });

                    // 绘制第二个文字
                    this.drawTextWithShadow(ctx, {
                        text: Name,
                        x: 573 + textWidth,
                        y: 180,
                        fontSize: 24,
                        color: "#F1CD8B",
                    });

                    // 绘制第三个文字（描述）
                    const match = OutputDes.match(/text="([^"]*)"/);
                    const fullText = match ? match[1] : "";
                    const thirdText = fullText.replace("获取线索：", "");

                    this.drawTextWithShadow(ctx, {
                        text: thirdText,
                        x: 573,
                        y: 210,
                        fontSize: 24,
                        color: "#F1CD8B",
                    });
                }

                this.renderedSrc = canvas.toDataURL("image/png");
            } catch (e) {
                // console.error(e);
                this.renderedSrc = this.imgPath;
            }
        },

        // 抽离绘制文字的方法
        drawTextWithShadow(ctx, { text, x, y, fontSize, color = "#F1CD8B" }) {
            if (!text) return;

            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.50)";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            ctx.shadowBlur = 4;
            ctx.font = `${fontSize}px ${FONT_FAMILY}`;
            ctx.fillStyle = color;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            ctx.fillText(text, x, y);
            ctx.restore();
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pet/pc/item.less";
</style>
