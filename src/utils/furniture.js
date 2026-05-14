import { getFurnitureMatch } from "@/service/homeland.js";
import dayjs from "@/plugins/day";

export function formatFurnitureImg(link, imgRoot, client = "std") {
    if (!link) return;
    const img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
    const name = img?.[1].replace(/\\/g, "/");
    if (img?.[1] == "default") return imgRoot + `homeland/${client}/default/default.png`;
    return imgRoot + `homeland/${client}` + name + ".png";
}

export function getFurnitureType(data, category) {
    const Category1 = data.nCatag1Index;
    const Category2 = data.nCatag2Index;
    const name1 = category[Category1]?.name || "";
    let name2 = "";
    if (name1) {
        const list = category[Category1]?.children || [];
        name2 = list.find((item) => ~~item.nCatag2Index === Category2)?.szName || "";
    }
    return name1 + "-" + name2;
}

export function loadFurnitureMatch() {
    return new Promise((resolve) => {
        try {
            const cached = sessionStorage.getItem("furniture");
            if (cached) {
                const parsed = JSON.parse(cached);
                resolve(parsed.data?.data?.filter((item) => item) || []);
                return;
            }
            const params = {
                subtypes: "category,property,next_match",
                start: dayjs.tz().startOf("isoWeek").format("YYYY-MM-DD"),
                end: dayjs.tz().endOf("isoWeek").format("YYYY-MM-DD"),
            };
            getFurnitureMatch(params).then((res) => {
                const data = res.data?.data?.filter((item) => item) || [];
                res.data?.data?.length && sessionStorage.setItem("furniture", JSON.stringify(res));
                resolve(data);
            });
        } catch (e) {
            console.error(e);
            resolve([]);
        }
    });
}
