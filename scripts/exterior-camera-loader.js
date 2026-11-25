// jx3box-exterior 0.4.3 会先绘制默认镜头，再在下一帧按角色边界构图。
// 骨骼更新已经算出了本帧边界，直接在 lookAt 前用 SDK 自己的算法构图。
module.exports = function frameExteriorCamera(source) {
    const method = "updateSceneCamera(){";
    if (source.split(method).length !== 2) {
        throw new Error("外观 SDK 镜头实现已变更，请复核首帧构图适配");
    }
    return source.replace(method, method + `
        if (this.viewportInitialized && this.rig?.bounds.size && !this.focusFace &&
            !this.framingTarget && !this.captureRecords) {
            this.fitToFrame(this.canvas);
        }
    `);
};
