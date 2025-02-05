import { getRoleGameAchievements, getAdventures, getAchievements } from "@/service/treasure.js";

const perfectAchievement = {
    111: { hasClass: "zhg", zIndex: 9 },
    3: { hasClass: "yylj", zIndex: 10 },
    88: { hasClass: "xxjt", zIndex: 15 },
    83: { hasClass: "zzwg", zIndex: 18 },
    104: { hasClass: "wldg", zIndex: 22 },
    78: { hasClass: "tjh", zIndex: 19 },
    1: { hasClass: "sssh", zIndex: 7 },
    2: { hasClass: "scqf", zIndex: 20 },
    126: { hasClass: "swxf", zIndex: 12 },
    21: { hasClass: "swbj", zIndex: 11 },
    121: { hasClass: "rjg", zIndex: 21 },
    106: { hasClass: "qqj", zIndex: 13 },
    90: { hasClass: "lnrh", zIndex: 8 },
    66: { hasClass: "jcs", zIndex: 17 },
    136: { hasClass: "kwyh", zIndex: 17 },
    135: { hasClass: "fgzm", zIndex: 13 },
    142: { hasClass: "gsyj", zIndex: 16 },
};

let formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const date = String(dateTime.getDate()).padStart(2, "0");
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");
    const seconds = String(dateTime.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}年${month}月${date}日 ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
};

let getData = (userJx3Id) => {
    return new Promise((resolve, reject) => {
        var returnData = {
            pet: [],
            normal: [],
            perfect: [],
        };

        Promise.all([getRoleGameAchievements(userJx3Id), getAchievements()]).then(([res, mapRule]) => {
            const achievements = res.data?.data?.achievements || "";
            let list = achievements.split(",");
            let newList = [];
            mapRule.data.map((item) => {
                if (list.includes(String(item.achievement_id))) {
                    newList.push(item.adventure_id);
                }
            });
            list = newList;
            if (res.data?.data?.updated_at) {
                returnData.updated_at = formatDateTime(res.data?.data?.updated_at);
            } else {
                returnData.updated_at = "暂无记录";
            }
            // 定义奇遇类型数组
            const adventureTypes = ["pet", "normal", "perfect"];
            // 创建 Promise 数组来存储所有奇遇数据的 Promise
            const adventurePromises = adventureTypes.map((type) => {
                return getAdventures({
                    type,
                    _no_page: 1,
                }).then((res) => {
                    const achievementsList = [];
                    let actNum = 0;
                    let unNum = 0;
                    res?.data?.list?.forEach((item) => {
                        if (type == "perfect") {
                            try {
                                item.isAct = false;
                                if (list.includes(item.dwID)) {
                                    item.isAct = true;
                                    actNum++;
                                }
                                achievementsList.push({
                                    ...item,
                                    ...perfectAchievement[item.dwID],
                                });
                            } catch (error) {
                                unNum++;
                            }
                        } else {
                            if (list.includes(item.dwID)) {
                                achievementsList.push(item);
                                actNum++;
                            }
                        }
                    });
                    returnData[`${type}AllNum`] = (res?.data?.list?.length || 0) - unNum;
                    returnData[`${type}NowNum`] = actNum;
                    returnData[type] = achievementsList;
                });
            });

            // 所有奇遇数据的 Promise 执行完成后，调用 inspectionResult
            Promise.all(adventurePromises)
                .then(() => {
                    returnData.progress =
                        (returnData.petNowNum + returnData.normalNowNum + returnData.perfectNowNum) /
                        (returnData.petAllNum + returnData.normalAllNum + returnData.perfectAllNum);
                    returnData.progress = (returnData.progress * 100).toFixed(2);
                    resolve(returnData);
                })
                .catch((error) => {
                    reject(error); // 处理错误
                });
        });
    });
};

export default getData;
