const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse } = require("@vue/compiler-sfc");
const root = path.resolve(__dirname, "..");
function load(file, dependencies) {
    const source = parse(fs.readFileSync(path.join(root, file), "utf8")).descriptor.script.content;
    const { code } = babel.transformSync(source, { babelrc: false, configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (key) => {
        assert(key in dependencies, `Unexpected dependency: ${key}`);
        return dependencies[key];
    });
    return module.exports.default;
}
async function run() {
    let isExpert = true;
    const service = { getConsultationAccess: async () => ({ is_expert: isExpert }) };
    const nav = load("src/components/wiki/AchievementWorkbenchNav.vue", {
        "@element-plus/icons-vue": {},
        "@jx3box/jx3box-common/js/user": { isLogin: () => true },
        "@/service/achievementConsultation": service,
    });
    const expert = nav.data();
    await nav.created.call(expert);
    assert(expert.navItems.some((item) => item.routeName === "consultation"));
    isExpert = false;
    const player = nav.data();
    await nav.created.call(player);
    assert(!player.navItems.some((item) => item.routeName === "consultation"));
    assert(player.navItems.some((item) => item.routeName === "leap"));

    const workspace = load("src/components/wiki/consultation/ConsultationWorkspace.vue", {
        "@/service/achievementConsultation": service,
        "./ConsultationDetail.vue": {},
        "@element-plus/icons-vue": {},
        "@jx3box/jx3box-common/js/utils": {},
    });
    let loads = 0;
    const view = { ...workspace.data(), load: async () => { loads++; } };
    await workspace.methods.initialize.call(view);
    assert.strictEqual(view.authorized, false);
    assert.strictEqual(loads, 0);
    isExpert = true;
    await workspace.methods.initialize.call(view);
    assert.strictEqual(view.authorized, true);
    assert.strictEqual(loads, 1);
    console.log("PVX expert access uses server qualification only; ordinary players retain plan access.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
