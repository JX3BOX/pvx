import { $cms } from "@jx3box/jx3box-common/js/https";

// 创建qqbot图片任务 刷图
export function refreshQQBotImage(data) {
    return $cms().post(`/api/cms/qqbot/picture_task`, data);
}
