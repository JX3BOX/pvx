// 手动刷新隐藏成就的分类/搜索索引；不会在构建或用户打开页面时执行。
// node scripts/update-hidden-achievement-index.js std|origin [已下载的详情 JSON]
const fs = require("fs");
const path = require("path");
const client = process.argv[2] || "std";
if (!["std", "origin"].includes(client)) throw new Error("client 必须为 std 或 origin");
const base = "https://node.jx3box.com/api/node";
async function read(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}
(async () => {
    const points = (await read(`${base}/v2/achievement/points?client=${client}`)).data.points;
    const ids = Object.entries(points).filter(([, item]) => item[0] > 0 && item[1] === 1 && item[2] === 0).map(([id]) => id);
    const records = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], "utf8")) : [];
    if (!process.argv[3]) {
        for (let offset = 0; offset < ids.length; offset += 4) {
            const batch = await Promise.all(ids.slice(offset, offset + 4).map(async (id) => {
                const response = await read(`${base}/achievement/${id}?client=${client}`);
                return response.data.achievement || response.data;
            }));
            records.push(...batch);
        }
    }
    const byId = new Map(records.map((record) => [String(record.ID), record]));
    const rows = ids.map((id) => {
        const record = byId.get(id);
        if (!record) throw new Error(`缺少成就 ${id}，未更新索引`);
        const relatedIds = [...new Set(String(record.SubAchievements || "").split("|")
            .map(Number).filter((value) => Number.isSafeInteger(value) && value > 0))];
        return [Number(id), record.Sub, record.Detail, record.Name, record.ShortDesc, record.SceneID, record.dwMapID, relatedIds, record.IconID];
    });
    const output = path.resolve(__dirname, `../src/assets/data/achievements/hidden-${client}.json`);
    fs.writeFileSync(output, JSON.stringify({ client, updatedAt: new Date().toISOString().slice(0, 10), rows }) + "\n");
    console.log(`${client}: ${rows.length} 条隐藏成就索引`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
