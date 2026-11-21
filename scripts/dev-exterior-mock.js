// 外观大全本地预览数据。图片沿用已发布的静态素材，接口响应由开发服务生成。
const types = [
    { id: 1, name: "外观礼盒" },
    {
        id: 2,
        name: "外装",
        children: [
            { id: 0, name: "其它" },
            { id: 4, name: "成衣" },
        ],
    },
    {
        id: 3,
        name: "发型",
        children: [
            { id: 0, name: "其它" },
            { id: 3, name: "金发" },
        ],
    },
    { id: 4, name: "披风" },
    { id: 5, name: "挂件", children: [{ id: 1, name: "背挂" }] },
];

const domains = { 1: "bundle", 2: "outfit", 3: "hair", 4: "pendant", 5: "pendant" };
const categories = types.flatMap(({ id, name, children }) => {
    const domain = domains[id];
    return children
        ? children.map((child) => ({ key: `${id}_${child.id}`, name: child.name, domain }))
        : [{ key: String(id), name, domain }];
});

const outfitRelations = ["2_990001", "5_990001"].map((key) => ({
    from_key: "1_48425",
    to_key: key,
    kind: "contains",
}));

function exterior({ id, type, subtype = null, name, icon, images = [], alias, tags = [], acquisition, price }) {
    const cover = {};
    const detail = [];
    const roles = { "封面-m2": 1, "封面-f2": 2, "封面-m1": 5, 封面: 6 };
    for (const image of images) {
        const url = `https://cdn.jx3box.com/design/exterior/${encodeURIComponent(id + "-" + image + ".png")}`;
        if (image in roles) cover[roles[image]] = url;
        else detail.push(url);
    }
    return {
        id,
        key: id,
        type,
        subtype,
        name,
        icon_id: icon,
        aliases: alias ? [alias] : [],
        tags,
        roles: Object.keys(cover).map(Number),
        description: acquisition?.join("、") || null,
        images: { cover, detail: { all: detail }, portrait: {} },
        prices: price == null ? [] : [{ amount: price, currency: "coin" }],
        relations: outfitRelations.filter(({ from_key, to_key }) => from_key === id || to_key === id),
    };
}

const outfits = [
    exterior({
        id: "1_48425",
        type: 1,
        name: "风刀逐浪礼盒",
        icon: 604,
        alias: "刀宗盒子、刀盒子",
        images: ["封面-m2", "封面-f2", "封面-m1", "封面", "详情-1", "详情-2"],
        tags: ["礼盒", "四体型"],
        acquisition: ["商城限时发售"],
        price: 88800,
    }),
    exterior({
        id: "3_521",
        type: 3,
        subtype: 3,
        name: "金发·璨月蝶心",
        icon: 8182,
        alias: "狐金",
        images: ["封面-m2", "封面-f2", "封面-m1", "封面", "详情-1"],
        tags: ["发型", "金发"],
        acquisition: ["商城限时发售"],
    }),
    exterior({
        id: "4_3088",
        type: 4,
        name: "绮梦·映玉",
        icon: 21886,
        images: ["封面", "详情-1"],
        tags: ["单张体型图"],
    }),
    exterior({
        id: "1_68257",
        type: 1,
        subtype: 0,
        name: "弦月华璨礼盒",
        icon: 604,
        images: ["封面", "详情-1"],
        tags: ["礼盒"],
    }),
    exterior({
        id: "2_990001",
        type: 2,
        subtype: 4,
        name: "外装·青岚（缺图样例）",
        icon: 604,
        tags: ["成衣"],
        acquisition: ["本地预览样例"],
    }),
    exterior({
        id: "2_990002",
        type: 2,
        subtype: 0,
        name: "外装·疏影（其它子类）",
        icon: 8182,
        tags: ["其它"],
    }),
    exterior({
        id: "5_990001",
        type: 5,
        subtype: 1,
        name: "背挂·落梅（缺图样例）",
        icon: 21886,
        tags: ["背挂"],
    }),
];

// 晒图样例用现有素材代替玩家截图，按文章的 meta_1 关联外观。
const showcasePosts = [
    [1, "1_48425", "风刀逐浪 · 成男试穿", "青山", "详情-1"],
    [2, "1_48425", "风刀逐浪 · 服饰细节", "云岫", "详情-2"],
    [3, "3_521", "璨月蝶心 · 发型细节", "云岫", "详情-1"],
].map(([ID, exteriorId, title, author, image]) => ({
    ID,
    post_type: "show",
    meta_1: exteriorId,
    post_title: title,
    author_info: { display_name: author },
    post_banner: `https://cdn.jx3box.com/design/exterior/${encodeURIComponent(exteriorId + "-" + image + ".png")}`,
}));

function send(response, data, status = 200, msg = "success") {
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify({ code: status === 200 ? 0 : status, msg, data }));
}

module.exports = function exteriorPreviewMiddleware(proxyPrefix) {
    const catalog = `${proxyPrefix}/node/api/node/v2/exterior/`;
    const loopback = new Set(["::1", "127.0.0.1", "::ffff:127.0.0.1"]);

    return (request, response, next) => {
        if (!loopback.has(request.socket.remoteAddress)) return next();
        const { pathname, searchParams } = new URL(request.url, "http://localhost");

        if (
            request.method === "GET" &&
            pathname === `${proxyPrefix}/cms/api/cms/posts` &&
            searchParams.get("type") === "show" &&
            searchParams.has("meta_1")
        ) {
            const list = showcasePosts.filter((post) => post.meta_1 === searchParams.get("meta_1"));
            return send(response, { list, total: list.length, pages: list.length ? 1 : 0 });
        }
        if (pathname.startsWith(`${proxyPrefix}/cms/api/cms/pvx/exterior/user/`)) {
            return request.method === "GET" ? send(response, []) : send(response, null, 405, "本地预览不写入仓库");
        }
        if (request.method !== "GET" || !pathname.startsWith(catalog)) return next();
        const action = pathname.slice(catalog.length);
        if (action === "categories") return send(response, categories);
        if (action === "list") {
            const domain = searchParams.get("domain");
            const [type, subtype] = (searchParams.get("category") || "").split("_");
            const keyword = (searchParams.get("keyword") || "").trim().toLowerCase();
            const cursor = Number(searchParams.get("cursor")) || 0;
            const limit = Number(searchParams.get("limit")) || 30;
            const matches = outfits.filter(
                (item) =>
                    (!domain || domains[item.type] === domain) &&
                    (!type || String(item.type) === type) &&
                    (subtype === undefined || String(item.subtype) === subtype) &&
                    `${item.name} ${item.aliases.join(" ")}`.toLowerCase().includes(keyword)
            );
            const end = cursor + limit;
            return send(response, { list: matches.slice(cursor, end), nextCursor: end < matches.length ? end : null });
        }
        const item = outfits.find((outfit) => outfit.id === action);
        if (!item) return send(response, null);
        return send(response, { ...item, local_preview: true });
    };
};
