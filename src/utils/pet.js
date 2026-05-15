import { __imgPath } from "@/utils/config";
import petType from "@/assets/data/pet_type.json";
import petSource from "@/assets/data/pet_source.json";

/**
 * 获取宠物图片路径
 * 将.tga后缀的原始路径转换为PNG图片路径
 * @param {String} path - 原始路径
 * @param {String} client - 客户端类型(std/jx3)
 * @returns {String} 转换后的PNG图片路径
 */
export function getPetImgSrc(path, client) {
    if (!path) return "";
    const imgName = path.match(/.*[\/,\\](.*?).tga/);
    return imgName ? `${__imgPath}pet/pets/${client}/${imgName[1]}.png` : "";
}

/**
 * 获取宠物边框图片路径
 * 根据品质等级返回对应的边框图片
 * @param {Number} quality - 品质等级(2-5)
 * @param {String} imgRoot - 图片根路径
 * @returns {String} 边框图片路径
 */
export function getPetFrameSrc(quality, imgRoot) {
    const frameMap = {
        2: "/greenborder.png",
        3: "/blueborder.png",
        4: "/purpleborder.png",
        5: "/purpleborder.png",
    };
    const frameName = frameMap[quality];
    return frameName ? imgRoot + "frame" + frameName : "";
}

/**
 * 获取宠物边框CSS类名
 * @param {Number} quality - 品质等级(2-5)
 * @returns {String} CSS类名
 */
export function getPetFrameClass(quality) {
    const classMap = { 2: "m-pvx-pet-item--level-2", 3: "m-pvx-pet-item--level-3", 4: "m-pvx-pet-item--level-4", 5: "m-pvx-pet-item--level-5" };
    return classMap[quality] || "";
}

/**
 * 判断宠物是否为福缘宠物
 * 仅正式服(std)有效
 * @param {Number} index - 宠物Index
 * @param {Array} luckyList - 福缘宠物列表
 * @param {String} client - 客户端类型
 * @returns {Boolean}
 */
export function isPetLucky(index, luckyList, client) {
    if (client !== "std") return false;
    if (!index || !luckyList) return false;
    return luckyList.indexOf(index.toString()) !== -1;
}

/**
 * 宠物图片加载失败时替换为默认图片
 * @param {Event} e - 错误事件对象
 * @param {String} client - 客户端类型
 */
export function replacePetImgDefault(e, client) {
    e.target.src = `${__imgPath}pet/pets/${client}/3d_bg.png`;
}

/**
 * 获取宠物类型名称
 * @param {Number} typeId - 类型ID
 * @returns {String} 类型名称
 */
export function getPetTypeName(typeId) {
    const item = petType.find((item) => item.class === typeId);
    return item?.name || "";
}

/**
 * 获取宠物来源名称
 * @param {Number} sourceId - 来源ID
 * @returns {String} 来源名称
 */
export function getPetSourceName(sourceId) {
    const item = petSource.find((item) => ~~sourceId === ~~item.source);
    return item?.name || "";
}

/**
 * 解析宠物描述文本
 * 从XML格式的文本中提取内容和字体信息
 * @param {String} str - XML格式的描述文本
 * @returns {Array} 包含font和text属性的对象数组
 */
export function parsePetDesc(str) {
    if (!str) return [];
    const regex = /<text>text=(.*?)font=(\d+).*?<\/text>/gimsy;
    const matches = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
        matches.push({
            font: ~~match[2],
            text: match[1].slice(1, -2).replace(/[\\n]/g, ""),
        });
    }
    return matches;
}

/**
 * 清理资源文本中的前缀
 * @param {String} str - 原始文本
 * @returns {String} 清理后的文本
 */
export function cleanResourceText(str) {
    return str && str.startsWith("获取线索：") ? str.replace("获取线索：", "") : str;
}

/**
 * 根据分数获取对应的等级分类
 * @param {Number} score - 宠物分数
 * @returns {Number} 等级（1-5）
 */
export function getPetScoreClass(score) {
    const scoreNum = Number(score);
    if (scoreNum >= 60) return 5;
    if (scoreNum >= 50) return 4;
    if (scoreNum >= 40) return 3;
    if (scoreNum >= 30) return 2;
    return 1;
}

/**
 * 从技能数据中提取技能ID和等级ID
 * @param {Object} skillData - 技能数据对象
 * @returns {Object} 包含levelIds和skillIds的对象
 */
export function extractPetSkillIds(skillData) {
    const levelIds = [];
    const skillIds = [];
    for (const key in skillData) {
        if (key.startsWith("Level") && skillData[key]) {
            levelIds.push(skillData[key]);
        }
        if (key.startsWith("SkillID") && skillData[key]) {
            skillIds.push(skillData[key]);
        }
    }
    return { levelIds, skillIds };
}

/**
 * 从羁绊数据中提取宠物ID列表
 * @param {Object} medalItem - 羁绊数据对象
 * @returns {Array} 宠物ID数组
 */
export function extractMedalPetIds(medalItem) {
    const petIds = [];
    for (const key in medalItem) {
        if (key.includes("PetIndex") && medalItem[key]) {
            petIds.push(medalItem[key]);
        }
    }
    return petIds;
}
