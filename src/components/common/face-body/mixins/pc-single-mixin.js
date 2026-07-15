/**
 * pcSingleMixin - PC端详情页公共逻辑
 * 
 * @description 用于脸型/体型模块PC端详情页的公共逻辑抽取
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @requires
 * - 组件需提供: type ('face' | 'body')
 * - 组件需实现: getData() 方法 - 获取详情数据
 * - 组件需实现: getRandomList() 方法 - 获取随机推荐
 * - 组件需实现: pay() 方法 - 购买逻辑
 * - 组件需实现: getDownUrl(id, uuid) 方法 - 获取下载地址
 * 
 * @provides
 * - 公共 data: loading, post, has_buy, downFileList, downloadParams, payBtnLoading, randomList, topic_info
 * - 公共 computed: id, isAdmin, isAuthor, previewSrcList, canEdit, topicText
 * - 公共 methods: goBack, getAccessoryList, handleDownloadFile, downloadfile, getBlob, saveAs, downloadAll, getSliders
 */
import User from "@jx3box/jx3box-common/js/user";
import { getStat, postStat } from "@jx3box/jx3box-common/js/stat";
import { downloadZip } from "@/utils/exportFileZip";
import dayjs from "@/utils/day";

const RANDOM_LIST_LIMIT = 12;

export default {
    data() {
        return {
            loading: false,
            post: {},
            has_buy: false,
            downFileList: [],
            downloadParams: {
                pageIndex: 1,
                pageSize: 10,
                total: 0,
            },
            payBtnLoading: false,
            randomList: [],
            topic_info: null,
        };
    },

    computed: {
        id() {
            return ~~this.$route.params.id;
        },

        isAdmin() {
            return User.isAdmin();
        },

        isAuthor() {
            return this.post?.user_id == User.getInfo().uid || false;
        },

        previewSrcList() {
            return this.post?.images || [];
        },

        canEdit() {
            return User.isEditor() || this.post?.user_id == User.getInfo().uid;
        },

        topicText() {
            return this.topic_info
                ? this.$t("pages.faceBody.detail.topicFeatured", {
                    date: dayjs.tz(this.topic_info.created_at).format("YYYY-MM-DD"),
                })
                : "";
        },
    },

    created() {
        this.getData();
    },

    methods: {
        goBack() {
            this.$router.push({ name: "list" });
        },

        getAccessoryList() {
            this.fetchAccessoryList(this.id, this.downloadParams)
                .then((res) => {
                    const data = res.data?.data;
                    if (!data) return;
                    
                    this.has_buy = !!data.has_buy;
                    if (data.has_buy && data.list) {
                        this.downFileList = data.list;
                        this.downloadParams.total = data.page?.total || 0;
                    }
                })
                .catch((err) => {
                    console.error("获取附件列表失败:", err);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        handleDownloadFile(item) {
            if (!item || !item.uuid) {
                this.$message.error(this.$t("pages.faceBody.detail.fileIncomplete"));
                return;
            }
            
            this.getDownUrl(this.id, item.uuid)
                .then((res) => {
                    const url = res.data?.data?.url;
                    if (url) {
                        this.downloadfile(url, item.name);
                    } else {
                        this.$message.error(this.$t("pages.faceBody.detail.downloadUrlFailed"));
                    }
                })
                .catch((err) => {
                    console.error("获取下载地址失败:", err);
                    this.$message.error(this.$t("pages.faceBody.detail.downloadUrlFailed"));
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
                link.style.display = "none";
                body.appendChild(link);
                link.click();
                body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
            }
        },

        downloadAll() {
            if (!this.downFileList || this.downFileList.length === 0) {
                this.$message.warning(this.$t("pages.faceBody.detail.noDownloadableFiles"));
                return;
            }

            if (this.downFileList.length === 1) {
                const item = this.downFileList[0];
                this.handleDownloadFile(item);
                return;
            }

            const urlArr = this.downFileList
                .filter((item) => item?.uuid)
                .map((item) =>
                    this.getDownUrl(this.id, item.uuid).then((res) => ({
                        item,
                        res,
                    }))
                );

            if (urlArr.length === 0) {
                this.$message.warning(this.$t("pages.faceBody.detail.noDownloadableFiles"));
                return;
            }

            Promise.all(urlArr)
                .then((results) => {
                    const downloadFiles = results
                        .filter(({ res }) => res.data?.data?.url)
                        .map(({ item, res }, index) => ({
                            name: item.name || `file_${index}`,
                            url: res.data.data.url,
                        }));
                    
                    if (downloadFiles.length > 0) {
                        downloadZip(downloadFiles, `${this.type}_${this.id}.zip`, "url", "name");
                    } else {
                        this.$message.error(this.$t("pages.faceBody.detail.downloadUrlFailed"));
                    }
                })
                .catch((err) => {
                    console.error("批量下载失败:", err);
                    this.$message.error(this.$t("pages.faceBody.detail.downloadFailed"));
                });
        },

        getSliders() {
            this.fetchSliders("slider", this.post.client, 10, this.post.id).then((res) => {
                if (res.data.data?.list) {
                    const list = res.data.data.list.sort((a, b) =>
                        dayjs.tz(b.created_at).isAfter(dayjs.tz(a.created_at)) ? 1 : -1
                    );
                    this.topic_info = list[0];
                }
            });
        },

        getRandomList() {
            const { user_id } = this.post;
            this.fetchRandomList({ user_id, limit: RANDOM_LIST_LIMIT }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list.slice(0, RANDOM_LIST_LIMIT);
                }
            });
        },

        loadStat() {
            getStat(this.type, this.id).then((res) => {
                this.stat = res.data;
            });
            postStat(this.type, this.id);
        },
    },
};
