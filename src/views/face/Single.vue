<template>
    <div class="p-face-single" v-loading="loading" ref="singleRef">
        <div class="m-navigation">
            <div class="u-goback" @click="goBack">返回列表</div>

            <div class="m-face-btn-box">
                <a :href="publish_link" target="_blank">
                    <div class="u-face-publish">
                        <img svg-inline src="@/assets/img/face/face-publish.svg" class="u-img" />
                        <span>发布作品</span>
                    </div>
                </a>
                <a href="/os/#/omp/pvx/facedata" target="_blank">
                    <!--                <a v-if="isSinglePage && isEditor" href="/os/#/omp/pvx/facedata" target="_blank">-->
                    <div size="medium" class="u-manage"></div>
                </a>
                <!--                <a v-else href="/os/#/omp/pvx/facedata" target="_blank">-->
                <!--                    <el-button size="medium" class="u-tips-off"></el-button>-->
                <!--                </a>-->
            </div>
        </div>
        <public-notice bckey="face_ac"></public-notice>
        <!-- 基本信息 -->
        <div class="m-header">
            <div class="m-header-info">
                <h2>
                    {{ post.title || "无标题" }}
                    <el-tag class="u-status" v-if="post.status != 1" effect="dark" type="danger">已下架</el-tag>
                </h2>
                <div class="u-author">
                    <img class="u-avatar" :src="showAvatar(post.user_avatar)" :alt="post.user_avatar_frame" />
                    <a class="u-name" :href="authorLink(post.user_id)" target="_blank" v-if="!!post.original">{{
                        post.display_name
                    }}</a>
                    <a class="u-name" :href="post.author_link" target="_blank" v-else-if="post.author_link">{{
                        post.author_name
                    }}</a>
                    <span class="u-name" v-else>{{ post.author_name }}</span>
                    <time class="u-time">{{ post.updated_at }}</time>
                    <a class="u-edit" v-if="canEdit" :href="editLink('face', post.id)" target="_blank">
                        <i class="el-icon-edit-outline u-edit-icon"></i>
                        编辑
                    </a>
                </div>
                <div class="u-meta">
                    <i class="u-mark" v-if="!!post.star">★ 编辑推荐</i>
                    <i class="u-fr" v-if="!!post.is_fr">首发</i>
                    <i class="u-original" v-if="!!post.original">原创</i>
                    <i class="u-client" :class="post.client || 'std'">{{ showClientLabel(post.client) }}</i>
                    <i class="u-is-new-face" v-if="post.client === 'std'"
                        :class="post.is_new_face === 1 ? 'u-new' : 'u-old'">{{ newFaceMap[post.is_new_face] }}</i>
                    <i class="u-bodytype" :class="'u-bodytype-' + post.body_type" v-if="post.body_type">{{
                        showBodyTypeLabel(post.body_type)
                    }}</i>
                </div>
            </div>
            <a :href="tvLink" target="_blank" class="m-topic" v-if="topicText">{{ topicText }}</a>
        </div>

        <div class="m-face-content">
            <div class="m-single-pics m-single-content-box" v-if="previewSrcList">
                <!-- 动态改为当前图片 -->
                <div v-if="previewSrcList.length === 0" class="u-no-pic">
                    <i class="el-icon-picture-outline"></i>
                    <span>该脸型数据暂无图片</span>
                </div>
                <template v-else>
                    <div class="u-bg-wrap">
                        <div class="u-bg" :style="{ backgroundImage: `url(${showPic(activePic)})` }"></div>
                    </div>
                    <el-carousel class="m-carousel" :interval="4000" type="card" arrow="always"
                        @change="carouselChange">
                        <el-carousel-item v-for="(item, i) in previewSrcList" :key="i">
                            <div class="m-face-pic">
                                <el-image ref="previewImage" fit="contain" :src="showPic(item)" class="u-pic"
                                    :preview-src-list="resolveImageArr(previewSrcList)"
                                    @click.capture="handlePreviewImage(i)"></el-image>
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </template>
            </div>

            <!-- 右侧 -->
            <div class="m-face-pay">
                <div class="m-face-buy" :class="{ 'm-dowload': (post.price_type && post.price_type === 0) || has_buy }">
                    <div class="m-face-buy-btn" @click="facePay()"
                        v-if="post.price_type && post.price_type != 0 && !has_buy">
                        <div class="u-price" v-if="post.price_type == 1">售价：{{ post.price_count }} 盒币</div>
                        <div class="u-price" v-if="post.price_type == 2">售价：{{ post.price_count }} 金箔</div>
                        <div class="u-buy"><img :src="require('@/assets/img/face/shopcart.svg')" alt="" />购买</div>
                    </div>
                    <template v-else>
                        <div class="m-face-buy-btn" v-if="post.code_mode"
                            :class="{ 'm-face-buy-btn_copy': post.code_mode }" @click="copy(post.code)">
                            <div class="u-buy">
                                <img :src="require('@/assets/img/face/bxs_copy.svg')" alt="" />复制捏脸码
                            </div>
                        </div>
                        <div class="m-face-buy-btn" v-else @click="downloadAll">
                            <div class="u-buy">
                                <img :src="require('@/assets/img/face/download.svg')" alt="" />下载数据
                            </div>
                        </div>
                    </template>

                    <div class="u-face__code" v-if="post.code_mode">
                        {{ post.code }}
                    </div>
                    <div class="u-update-time">更新时间： {{ post.updated_at }}</div>
                    <img class="u-box-img" :src="require('@/assets/img/face/face_stroke.svg')" />
                </div>
                <div class="m-face-tips" v-if="post.game_price">
                    <img :src="require('@/assets/img/face/info.svg')" alt="" />
                    <div class="u-tips-left">该数据含游戏内收费项目，总计约</div>
                    <div class="u-tips-right">{{ post.game_price }}通宝</div>
                </div>
                <div class="u-face-desc-tab">
                    <span @click="rightShow = 'desc'"
                        :style="rightShow === 'data' ? 'color: #c2c5c7;cursor: pointer;' : ''">说明</span>
                    <span @click="rightShow = 'data'" v-if="downFileList && downFileList.length"
                        :style="rightShow === 'desc' ? 'color: #c2c5c7;cursor: pointer;' : ''">数据列表</span>
                </div>
                <div class="m-face-desc"
                    :class="{ 'no-desc': !post.remark && rightShow === 'desc', 'is-desc': rightShow === 'desc' }">
                    <div v-if="rightShow === 'desc'" class="u-desc">
                        {{ post.remark }}
                    </div>
                    <div class="m-face-files-list" v-if="rightShow === 'data' && downFileList && downFileList.length">
                        <div class="u-file" v-for="item in downFileList" :key="item.id">
                            <div class="u-info">
                                <span class="u-label"> {{ item.name }} </span>
                                <span class="u-label">
                                    备注 ： <em>{{ item.describe || "无" }}</em>
                                </span>
                            </div>
                            <a class="u-action" href="" @click.prevent="getDownUrl(item.uuid, item.name)">下载</a>
                        </div>
                    </div>
                </div>

                <div class="m-face-head" v-if="topic_info">
                    <img :src="require('@/assets/img/face/cup.svg')" alt="" />
                    该脸型于{{ topic_info.created_at }}荣登头条
                </div>
            </div>
        </div>
        <!-- 数据区 -->
        <div class="m-single-data" v-if="!post.code_mode">
            <span class="m-single-data-title">独家数据分析</span>
            <facedata v-if="has_buy && facedata" :data="faceAllData" :lock="true" type="face" />
            <div class="m-single-buy-box" v-else>
                <div class="m-face-buy-btn" @click="facePay()"
                    v-if="post.price_type && post.price_type != 0 && !has_buy">
                    <div class="u-price" v-if="post.price_type == 1">售价：{{ post.price_count }} 盒币</div>
                    <div class="u-price" v-if="post.price_type == 2">售价：{{ post.price_count }} 金箔</div>
                    <div class="u-buy"><img :src="require('@/assets/img/face/shopcart.svg')" alt="" />购买</div>
                </div>
                <div class="u-face-buy-tip">数据分析将在购买后解锁</div>
            </div>
        </div>
        <div class="m-face-download" v-if="has_buy && facedata">
            <div class="m-face-buy-btn" @click="downloadAll">
                <div class="u-buy"><img :src="require('@/assets/img/face/download.svg')" alt="" />下载数据</div>
            </div>
        </div>
        <div class="u-about-author">关于作者</div>
        <authorItem :uid="post.user_id" />
        <div class="m-random-list">
            <div class="u-list m-single-content-box m-author-faces" v-if="randomList.length">
                <faceItem class="u-item" :item="item" :noName="true" v-for="item in randomList" :key="item.id" />
            </div>
        </div>
        <!-- 点赞 -->
        <Thx class="m-thx m-single-content-box" :postId="id" postType="face" :postTitle="post.title || '无标题'"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />
        <!-- 评论 -->
        <div class="m-comments m-single-content-box">
            <el-divider content-position="left">讨论</el-divider>
            <Comment :id="id" category="face" />
        </div>
    </div>
</template>

<script>
    import PublicNotice from "@/components/PublicNotice";
    const single_pages = ["single"];
    import {
        downloadZip
    } from "@/utils/exportFileZip";
    import {
        getOneFaceInfo,
        payFace,
        loopPayStatus,
        getAccessoryList,
        getDownUrl,
        getRandomFace,
        getRandomFaceAndBody,
        setStar,
        cancelStar,
        onlineFace,
        offlineFace,
        getSliders,
    } from "@/service/face";
    import {
        publishLink
    } from "@jx3box/jx3box-common/js/utils";
    import {
        getStat,
        postStat
    } from "@jx3box/jx3box-common/js/stat";
    import facedata from "@jx3box/jx3box-facedat/src/Facedat.vue";
    import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
    import {
        editLink,
        showAvatar,
        authorLink,
        resolveImagePath
    } from "@jx3box/jx3box-common/js/utils";
    import User from "@jx3box/jx3box-common/js/user";
    import {
        bodyMap
    } from "@jx3box/jx3box-data/data/role/body.json";
    import {
        __clients,
        __imgPath,
        __Root
    } from "@/utils/config";

    import dayjs from "@/utils/day";
    import faceItem from "@/components/face/item";
    import authorItem from "@/components/face/author";
    export default {
        name: "single",
        components: {
            PublicNotice,
            facedata,
            Comment,
            faceItem,
            // bodyItem ,
            authorItem,
        },
        data: function() {
            return {
                loading: false,
                search: "", //搜索值
                post: {},
                stat: {},
                has_buy: false, //是否购买
                client_map: __clients,
                downFileList: [],
                downloadParams: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                payBtnLoading: false,
                randomList: [],
                carouselActive: 0,
                isEditor: User.isEditor(),
                rightShow: "desc",
                topic_info: null,
                face: {},
                pvxbodyList: [],
                newFaceMap: ["写意", "写实"],
            };
        },
        computed: {
            ready: function() {
                return !!(this.facedata && this.decalDb.ready());
            },
            publish_link() {
                return publishLink("face");
            },
            id: function() {
                return ~~this.$route.params.id;
            },
            isAdmin: function() {
                return User.isAdmin();
            },
            isAuthor: function() {
                return this.post?.user_id == User.getInfo().uid || false;
            },
            facedata: function() {
                const data = this.post?.data || "";
                return data.indexOf("\\") > -1 ? JSON.parse(data) : data;
            },
            previewSrcList: function() {
                return this.post?.images || [];
            },
            canEdit: function() {
                return User.isEditor() || this.post?.user_id == User.getInfo().uid;
            },
            activePic: function() {
                return this.previewSrcList[this.carouselActive];
            },
            isSinglePage: function() {
                return single_pages.includes(this.$route.name);
            },
            //上下架状态
            status: function() {
                return this.$store.state.faceSingle?.status || 1;
            },
            statusText: function() {
                return this.status !== 1 ? "上架" : "下架";
            },
            isStar: function() {
                return this.$store.state.faceSingle?.star || 0;
            },
            starText: function() {
                return this.isStar ? "取消精选" : "精选";
            },
            topicText() {
                return this.topic_info ? `${dayjs.tz(this.topic_info.created_at).format("YYYY年MM月DD日")}荣登头条` : "";
            },
            tvLink() {
                return __Root + "index/tv";
            },
            faceAllData() {
                return {
                    json: this.facedata,
                    object: JSON.parse(this.facedata),
                    type: "face",
                };
            },
        },
        created: function() {
            this.getData();
        },
        methods: {
            imgLink: function(images) {
                return images?.[0] || __imgPath + "image/face/null2.png";
            },
            showAvatar(url) {
                return showAvatar(url, "l");
            },
            showThumbnail(url) {
                return resolveImagePath(url);
            },
            authorLink,
            editLink,
            getFaceList() {
                this.$router.push({
                    name: "list",
                    query: {
                        title: this.search
                    }
                });
            },
            goBack() {
                document.title = "捏脸分享 - JX3BOX";
                this.$router.push({
                    name: "list"
                });
            },
            showClientLabel: function(val) {
                return this.client_map[val];
            },
            showBodyTypeLabel(val) {
                return bodyMap[val];
            },
            carouselChange(val) {
                this.carouselActive = val;
            },
            handlePreviewImage(index) {
                setTimeout(() => {
                    const imageViewerChild = this.$refs.previewImage[index].$children[0];
                    imageViewerChild && imageViewerChild.reset();
                    imageViewerChild && (imageViewerChild.index = index);
                }, 0);
            },
            getData() {
                if (this.id) {
                    this.loading = true;
                    getOneFaceInfo(this.id)
                        .then((res) => {
                            this.post = this.$store.state.faceSingle = res.data.data;
                            document.title = this.post.title;

                            this.getAccessoryList();
                            //获取作者作品 和 系统推荐作品
                            this.getRandomFaceList();
                            // this.getRandomList();
                            this.getSliders();
                        })
                        .catch((err) => {
                            this.loading = false;
                        });

                    getStat("face", this.id).then((res) => {
                        this.stat = res.data;
                    });
                    postStat("face", this.id);
                }
            },
            downloadPageQuery(pageIndex) {
                this.downloadParams.pageIndex = pageIndex;
                this.getAccessoryList();
            },
            getAccessoryList() {
                getAccessoryList(this.id, this.downloadParams)
                    .then((res) => {
                        let data = res.data.data;
                        this.has_buy = data.has_buy;
                        if (data.has_buy) {
                            this.downFileList = data.list;
                            this.downloadParams.total = data.page.total;
                        }
                        if (!this.post.remark && this.downFileList && this.downFileList.length) {
                            this.rightShow = "data";
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getDownUrl(uuid, filename) {
                getDownUrl(this.id, uuid).then((res) => {
                    // window.location.href = resolveImagePath(res.data.data?.url);
                    this.downloadfile(res.data.data?.url, filename);
                });
            },
            downloadfile(url, filename) {
                this.getBlob(url).then((blob) => {
                    this.saveAs(blob, filename);
                });
            },
            getBlob(url) {
                return new Promise((resolve) => {
                    const xhr = new XMLHttpRequest();

                    xhr.open("GET", url, true);
                    xhr.responseType = "blob";
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            resolve(xhr.response);
                        }
                    };

                    xhr.send();
                });
            },
            saveAs(blob, filename) {
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, filename);
                } else {
                    const link = document.createElement("a");
                    const body = document.querySelector("body");

                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename;
                    // fix Firefox
                    link.style.display = "none";
                    body.appendChild(link);

                    link.click();
                    body.removeChild(link);

                    window.URL.revokeObjectURL(link.href);
                }
            },
            downloadAll() {
                if (this.post.code_mode) {
                    navigator.clipboard.writeText(this.post.code).then(() => {
                        this.$notify({
                            title: "复制成功",
                            message: "内容：" + this.post.code,
                            type: "success",
                        });
                    });
                } else {
                    if (this.downFileList.length === 1) {
                        const item = this.downFileList[0];
                        this.getDownUrl(item.uuid, item.name);
                        return;
                    }
                    const urlArr = [];
                    this.downFileList.forEach((item) => {
                        urlArr.push(getDownUrl(this.id, item.uuid));
                    });
                    let p = Promise.all(urlArr);
                    let downloadFiles = [];
                    p.then((arr) => {
                        downloadFiles = arr.map((item, index) => {
                            return {
                                name: this.downFileList[index].name,
                                url: item.data.data?.url,
                            };
                        });
                        downloadZip(downloadFiles, `face_${this.id}.zip`, "url", "name");
                    });
                }
            },
            facePay() {
                if (!User.isLogin()) {
                    User.toLogin();
                    return;
                }
                this.$confirm("确认购买此捏脸？", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                    })
                    .then(() => {
                        let res = this.post;
                        let params = {
                            postType: "face",
                            PostId: res.id,
                            priceType: res.price_type,
                            priceCount: res.price_count,
                            accessUserId: res.user_id,
                            payUserId: User.getInfo().uid,
                        };
                        //支付
                        this.payBtnLoading = true;
                        payFace(params)
                            .then((res) => {
                                let payid = res.data.data.id;
                                // 轮询接口
                                let setIntervalId = setInterval(
                                    loopPayStatus(payid).then((d) => {
                                        this.getPayFaceStatus(d.data.data.pay_status, setIntervalId);
                                    }, 1000)
                                );
                            })
                            .catch((err) => {
                                // 余额不足
                                if (err.response?.data?.code == 40019) {
                                    this.$confirm("余额不足，是否前往充值？", "提示", {
                                            confirmButtonText: "确定",
                                            cancelButtonText: "取消",
                                            type: "warning",
                                        })
                                        .then(() => {
                                            window.open("/vip/cny", "_blank");
                                        })
                                        .catch(() => {});
                                }
                            })
                            .finally(() => {
                                this.payBtnLoading = false;
                            });
                    })
                    .catch(() => {});
            },
            getPayFaceStatus(pay_status, setIntervalId) {
                if (pay_status == 1) {
                    this.payBtnLoading = false;
                    clearInterval(setIntervalId);
                    //购买成功后需要重载数据，拉取下载列表
                    this.getData();
                    this.$notify.success({
                        title: "成功",
                        message: "购买成功",
                    });
                } else if (pay_status == 2) {
                    this.payBtnLoading = false;
                    clearInterval(setIntervalId);
                    this.$notify.error({
                        title: "失败",
                        message: "支付失败",
                    });
                }
            },
            getRandomFaceList() {
                const {
                    user_id
                } = this.post;
                const listWidth = this.$refs.singleRef?.clientWidth - 120;
                const limit = Math.floor(listWidth / 190);
                getRandomFace({
                    user_id,
                    limit
                }).then((res) => {
                    if (res.data.data.list && res.data.data.list.length > 0) {
                        this.randomList = res.data.data.list;
                    }
                });
            },
            getRandomList() {
                const {
                    body_type,
                    client,
                    user_id
                } = this.post;
                getRandomFaceAndBody({
                    body_type,
                    client,
                    user_id,
                    limit: 8
                }).then((res) => {
                    const {
                        face,
                        pvxbodyList
                    } = res.data.data;
                    this.face = face;
                    this.pvxbodyList = pvxbodyList || [];
                });
            },
            showPic(url) {
                return resolveImagePath(url);
            },
            starSet() {
                this.$confirm("确认" + (this.isStar ? "取消精选" : "精选") + "该捏脸？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === "confirm") {
                            instance.confirmButtonLoading = true;
                            if (this.isStar) {
                                //取精
                                cancelStar(this.id)
                                    .then(() => {
                                        this.$store.state.faceSingle.star = 0;
                                        done();
                                        this.$notify({
                                            title: "成功",
                                            message: "取消精选成功",
                                            type: "success",
                                        });
                                    })
                                    .finally(() => {
                                        instance.confirmButtonLoading = false;
                                    });
                            } else {
                                //精
                                setStar(this.id)
                                    .then(() => {
                                        this.$store.state.faceSingle.star = 1;
                                        done();
                                        this.$notify({
                                            title: "成功",
                                            message: "精选成功",
                                            type: "success",
                                        });
                                    })
                                    .finally(() => {
                                        instance.confirmButtonLoading = false;
                                    });
                            }
                        } else {
                            instance.confirmButtonLoading = false;
                            done();
                        }
                    },
                });
            },
            statusSet() {
                //上下架操作，根据是否isEditor，在接口内调用管理和作者分别的接口
                this.$confirm("确认" + (this.status == 1 ? "下架" : "上架") + "该捏脸？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === "confirm") {
                            instance.confirmButtonLoading = true;
                            if (this.status == 1) {
                                //下架
                                offlineFace(this.id, this.isEditor)
                                    .then(() => {
                                        this.$store.state.faceSingle.status = 2;
                                        done();
                                        this.$notify({
                                            title: "成功",
                                            message: "下架成功",
                                            type: "success",
                                        });
                                    })
                                    .finally(() => {
                                        instance.confirmButtonLoading = false;
                                    });
                            } else {
                                //上架
                                onlineFace(this.id, this.isEditor)
                                    .then(() => {
                                        this.$store.state.faceSingle.status = 1;
                                        done();
                                        this.$notify({
                                            title: "成功",
                                            message: "上架成功",
                                            type: "success",
                                        });
                                    })
                                    .finally(() => {
                                        instance.confirmButtonLoading = false;
                                    });
                            }
                        } else {
                            instance.confirmButtonLoading = false;
                            done();
                        }
                    },
                });
            },

            // 判断是否上过头条
            getSliders() {
                getSliders("slider", this.post.client, 10, this.post.id).then((res) => {
                    if (res.data.data?.list) {
                        // 取创建时间最新的一条
                        const list = res.data.data.list.sort((a, b) =>
                            dayjs.tz(b.created_at).isAfter(dayjs.tz(a.created_at)) ? 1 : -1
                        );
                        this.topic_info = list[0];
                    }
                });
            },

            // 将图片地址替换为cdn
            resolveImageArr(arr) {
                return arr.map((item) => resolveImagePath(item));
            },
            copy(txt) {
                navigator.clipboard.writeText(txt).then(() => {
                    this.$notify({
                        title: "复制成功",
                        message: txt + "",
                        type: "success",
                    });
                });
            },
        },
    };
</script>

<style lang="less">
    @import "~@/assets/css/face/single.less";
</style>
