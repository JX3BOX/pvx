import { getRoleGameAchievements, getAdventures, getAchievements } from "@/service/adventure/treasure/index.js";
import { getAdventureTreasureLayout, getTreasurePerfectItems } from "@/assets/js/treasure/layout.js";

let formatDateTime = (dateTimeString, locale = "zh-CN") => {
    const dateTime = new Date(dateTimeString);
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(dateTime);
};

function getAchievedAdventureIds(achievements = "", achievementMap = []) {
    const achievementIds = String(achievements || "").split(",");
    return new Set(
        (achievementMap || [])
            .filter((item) => achievementIds.includes(String(item.achievement_id)))
            .map((item) => Number(item.adventure_id))
    );
}

function buildPerfectAchievements(adventureList = [], achievedIds, layout) {
    const adventureMap = (adventureList || []).reduce((map, item) => {
        const id = Number(item.dwID);
        if (id) map[id] = item;
        return map;
    }, {});
    const achievementsList = [];
    let actNum = 0;

    getTreasurePerfectItems(layout).forEach((layoutItem) => {
        const id = Number(layoutItem.id || layoutItem.dwID);
        const adventure = adventureMap[id];
        if (!id || !adventure) return;

        const isAct = achievedIds.has(id);
        if (isAct) actNum++;
        achievementsList.push({
            ...adventure,
            isAct,
            hasClass: layoutItem.key || "",
            layout: layoutItem,
        });
    });

    return {
        achievementsList,
        actNum,
        allNum: achievementsList.length,
    };
}

let getData = async (userJx3Id, options = {}) => {
    const locale = options.locale || "zh-CN";
    const noRecordText = options.noRecordText || "暂无记录";
    const returnData = {
        pet: [],
        normal: [],
        perfect: [],
    };

    const [res, mapRule, layout] = await Promise.all([
        getRoleGameAchievements(userJx3Id),
        getAchievements(),
        getAdventureTreasureLayout(),
    ]);
    const achievements = res.data?.data?.achievements || "";
    const achievedIds = getAchievedAdventureIds(achievements, mapRule?.data);

    returnData.layout = layout;
    if (res.data?.data?.updated_at) {
        returnData.updated_at = formatDateTime(res.data?.data?.updated_at, locale);
    } else {
        returnData.updated_at = noRecordText;
    }

    const adventureTypes = ["pet", "normal", "perfect"];
    const adventurePromises = adventureTypes.map((type) => {
        return getAdventures({
            type,
            _no_page: 1,
        }).then((res) => {
            const adventureList = res?.data?.list || [];
            const achievementsList = [];
            let actNum = 0;

            if (type == "perfect") {
                const perfectData = buildPerfectAchievements(adventureList, achievedIds, layout);
                returnData[`${type}AllNum`] = perfectData.allNum;
                returnData[`${type}NowNum`] = perfectData.actNum;
                returnData[type] = perfectData.achievementsList;
                return;
            }

            adventureList.forEach((item) => {
                if (achievedIds.has(Number(item.dwID))) {
                    achievementsList.push(item);
                    actNum++;
                }
            });
            returnData[`${type}AllNum`] = adventureList.length;
            returnData[`${type}NowNum`] = actNum;
            returnData[type] = achievementsList;
        });
    });

    await Promise.all(adventurePromises);

    const totalNow = returnData.petNowNum + returnData.normalNowNum + returnData.perfectNowNum;
    const totalAll = returnData.petAllNum + returnData.normalAllNum + returnData.perfectAllNum;
    returnData.progress = totalAll ? ((totalNow / totalAll) * 100).toFixed(2) : "0.00";

    return returnData;
};

export default getData;
