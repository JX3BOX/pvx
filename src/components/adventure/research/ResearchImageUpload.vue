<script>
import { upload } from "@jx3box/jx3box-ui/service/cms";
export default {
    props: { disabled: Boolean },
    emits: ["change", "busy"],
    data() {
        return { files: [] };
    },
    watch: {
        files: {
            deep: true,
            handler(files) {
                this.$emit(
                    "busy",
                    files.some((file) => file.status === "ready" || file.status === "uploading")
                );
                this.$emit(
                    "change",
                    files
                        .filter((file) => file.status === "success")
                        .map((file) => file.response?.url)
                        .filter(Boolean)
                );
            },
        },
    },
    methods: {
        beforeUpload(file) {
            if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
                this.$message.error("请选择 JPG、PNG、WebP 或 GIF 图片");
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.$message.error("每张截图不能超过 5MB");
                return false;
            }
            return true;
        },
        async send({ file }) {
            const data = new FormData();
            data.append("file", file);
            const response = await upload(data);
            const url = response.data?.data?.[0];
            if (typeof url !== "string" || !/^https?:\/\//.test(url)) throw new Error("上传接口未返回有效图片地址");
            return { url };
        },
        exceeded() {
            this.$message.warning("最多上传 3 张截图，请先移除已有图片再添加");
        },
        failed() {
            this.$message.error("截图上传失败，请重新选择图片上传");
        },
        clear() {
            this.$refs.upload.clearFiles();
        },
    },
};
</script>
<template>
    <el-upload
        aria-label="上传背包和仓库截图"
        ref="upload"
        v-model:file-list="files"
        class="research-batch-upload"
        drag
        multiple
        :limit="3"
        :disabled="disabled"
        accept="image/jpeg,image/png,image/webp,image/gif"
        list-type="picture"
        :http-request="send"
        :before-upload="beforeUpload"
        :on-exceed="exceeded"
        :on-error="failed"
    >
        <div class="research-upload-symbol" aria-hidden="true">＋</div>
        <div class="research-muted">最多 3 张，每张不超过 5MB</div>
    </el-upload>
</template>
