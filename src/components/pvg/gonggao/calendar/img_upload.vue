<template>
    <div class="m-publish-banner">
        <el-upload
            class="avatar-uploader"
            :action="url"
            :show-file-list="false"
            :on-success="done"
            :on-error="fail"
            with-credentials
            accept="image/jpg,image/jpeg,image/gif,image/png,image/bmp"
        >
            <img v-if="banner" :src="banner | showBanner" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <el-button class="u-remove" type="info" size="mini" icon="el-icon-circle-close" @click="clearBanner">移除图片</el-button>
    </div>
</template>

<script>
import { __cms } from "@/utils/config";
const API_Root = process.env.NODE_ENV === "production" ? __cms : "/";
const API = API_Root + "api/cms/upload";
import { showBanner } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "post_banner",
    props: ['filed',"data"],
    data() {
        return {
            banner: this.data,
            url: API,
        };
    },
    model: {
        prop: "data",
        event: "update",
    },
    watch: {
        data : function (newval){
            this.banner = newval
        },
        banner: function(newval) {
            this.$emit("update", {
                key : this.filed,
                val : newval
            });
        },
    },
    methods: {
        done(res, file) {
            this.banner = res?.data[0] || '';
        },
        fail(err, file, fileList) {
            try {
                let response = JSON.parse(err.message);
                this.$message.error(`[${response.code}]${response.msg}`);
            } catch {
                this.$message.error("网络请求异常");
            }
        },
        clearBanner : function (){
            this.banner = ''
        }
    },
    filters : {
        showBanner
    }
};
</script>

<style lang="less">
.m-publish-banner {
    .pr;
    .u-tip{
        padding:5px 15px;
    }
    img {
        max-width: 180px;
    }
    .avatar-uploader{
        .mt(10px);
    }
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #409eff;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 180px;
        height: 100px;
        line-height: 100px;
        text-align: center;
    }
    .u-remove{
        .pa;
        left: 200px;
        bottom: 20px;
        background-color: #c2c2c2;
        border-color:#c2c2c2;
        &:hover{
            background-color: #fc3c3c;
            border-color:#fc3c3c;
        }
    }
}
</style>
