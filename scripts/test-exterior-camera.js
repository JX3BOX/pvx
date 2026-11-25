const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("acorn");
const frameExteriorCamera = require("./exterior-camera-loader");

const sdk = path.resolve(__dirname, "../node_modules/@jx3box/jx3box-exterior/dist/browser");

function loadViewer(filename) {
    const source = frameExteriorCamera(fs.readFileSync(path.join(sdk, filename), "utf8"));
    const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
    const viewer = ast.body.flatMap((node) => node.declarations || [])
        .map((declaration) => declaration.init)
        .find((node) => node?.type === "ClassExpression" &&
            node.body.body.some((method) => method.key.name === "updateSceneCamera"));
    assert.ok(viewer, `找不到 ${filename} 的渲染器`);
    // 使用安装版本的真实镜头方法，跳过需要 WebGL 的构造函数。
    return new Function("return " + source.slice(viewer.start, viewer.end))();
}

for (const filename of ["index.js", "preview-worker.js"]) {
    const Viewer = loadViewer(filename);
    const poses = [];
    const center = [0, 1.5, 0];
    const face = [0, 3, 0];
    const viewer = Object.assign(Object.create(Viewer.prototype), {
        canvas: { width: 960, height: 540 },
        viewportInitialized: true,
        rig: {
            data: { parts: [{ name: "body" }] },
            actor: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            visibility: new Map(),
            bounds: new Map([["body", { center, halfExtent: [0.5, 1.25, 0.25] }]]),
            getFaceCenter: () => face,
            updateGaze() {},
        },
        camera: { lookAt: (eye, target) => poses.push({ eye, target }) },
        updateCameraLighting() {},
        requestRender() {},
    });

    viewer.setView("front");
    viewer.updateSceneCamera();
    const first = poses[0];
    const expectedDistance = 1.25 / (Math.tan(35 * Math.PI / 360) * 0.84) + 0.25;
    assert.deepEqual(first.target, center, filename + " 首帧应对准角色中心");
    assert.ok(Math.abs(first.eye[2] + expectedDistance) < 1e-8, filename + " 首帧应使用全身构图");

    viewer.moveCamera(0, 0, -300);
    const zoomedDistance = viewer.distance;
    assert.ok(zoomedDistance < expectedDistance);
    viewer.updateSceneCamera();
    assert.equal(viewer.distance, zoomedDistance, filename + " 手动缩放后不应重新构图");

    viewer.setView("face");
    const faceDistance = viewer.distance;
    viewer.updateSceneCamera();
    assert.equal(viewer.distance, faceDistance, filename + " 近景应保留镜头距离");
    assert.deepEqual(poses.at(-1).target, face);
}

console.log("主线程与 Worker 的首帧全身构图、手动缩放和近景检查通过");
