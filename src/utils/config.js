import jx3boxConfig from "@jx3box/jx3box-common/data/jx3box.json";

// 根据环境变量覆盖特定路径
const config = {
    ...jx3boxConfig,
    __dataPath: process.env.VUE_APP_DATA_PATH || jx3boxConfig.__dataPath,
    __imgPath: process.env.VUE_APP_IMG_PATH || jx3boxConfig.__imgPath,
    __iconPath: process.env.VUE_APP_ICON_PATH || jx3boxConfig.__iconPath,
};

export const {
    __imgPath,
    __dataPath,
    __iconPath,
    __cms,
    __down,
    __node,
    __ossMirror,
    __ossRoot,
    __visibleMap,
    default_avatar,
    __Root,
    __OriginRoot,
    __Github,
    __Preview,
    __server,
    __sso,
    __spider,
    __spider2,
    __next,
    __pay,
    __team,
    __lua,
    __dbm,
    __helperUrl,
    __os,
    __jx3,
    __cdn,
    __staticPath,
    __clients,
    __postType,
    __wikiType,
    __appType,
    __gameType,
    __sourceType,
    __userGroup,
    __userLevel,
    __userLevelColor,
    __Links,
    feedback
} = config;

export default config;
