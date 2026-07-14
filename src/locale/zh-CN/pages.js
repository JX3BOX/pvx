export default {
    partner: {
        title: "红尘侠影",
        keywords: "剑网3红尘侠影,剑三侠客,JX3BOX红尘侠影,侠客技能,侠客传记",
        description: "剑网3魔盒红尘侠影资料页，提供侠客获取方式、武学招式、境界、属性与传记信息。",
        detail: { title: "红尘侠影详情", keywords: "剑网3侠客详情,红尘侠影,JX3BOX", description: "查看红尘侠影侠客的技能、属性与传记详情。" },
        ui: {
            searchPlaceholder: "输入关键词搜索", noMatchingPartners: "暂无匹配侠客", feedback: "错误反馈", qqRobot: "添加QQ机器人，快速获取攻略", copySuccess: "复制成功",
            tabs: { info: "基础信息", bio: "传记" }, sections: { introduction: "结识方式", skills: "武学招式", realms: "武学境界", attributes: "属性" },
            emptyPortrait: "暂无立绘", voiceText: "语音（仅文字展示）", emptyBio: "暂无传记", emptyAttributes: "暂无属性", emptyIntroduction: "暂无结识信息", emptySkills: "暂无武学数据",
            attributes: { quality: "品质", rarity: "稀有度", kungfu: "武学类型", nickname: "心法" },
            quality: { 1: "白色", 2: "绿色", 3: "蓝色", 4: "紫色", 5: "橙色" }, rarity: { 1: "普通", 2: "稀有", 3: "史诗", 4: "传说" },
            skillTypes: { passive: "被动", active: "主动", martialArt: "武学" }, kungfu: { 0: "通用", 1: "拳掌", 2: "剑式", 3: "刀式" }, unlockItems: "解锁道具", openSkillDatabase: "跳转数据库", skillFallback: "招式 {id}", skillDescFallback: "暂无招式描述",
            realmFallback: "境界{stage}", realmSkillFallback: "境界 {title} 对应的武学技能", itemLoading: "道具 {id} 加载中...", itemFallback: "道具 {id}", unknownItem: "未知道具", timeLimit: "限时时间：{days}天", maxOwned: "最大拥有数：{count}",
            bindTypes: { tradeable: "可交易", untradeable: "不可交易", bindOnPickup: "拾取绑定", other: "绑定类型{type}" },
            sources: { other: "其他途径获取", drop: "掉落获取", quest: "任务获取", craft: "制作获取", shop: "商店购买" },
        },
    },
    questsection: {
        title: "剑侠录",
        keywords: "剑网3剑侠录,剑三剑侠录,JX3BOX剑侠录,主线剧情,剧情章节,任务剧情",
        description: "剑网3魔盒（JX3BOX）剑侠录，按资料片和章节整理剑网3主线剧情与任务内容，方便玩家查询和阅读。",
        detail: {
            title: "剑侠录章节详情",
            keywords: "剑网3剑侠录章节,剑三主线剧情,任务剧情,JX3BOX剑侠录",
            description: "剑侠录章节详情页，查看剑网3对应资料片与章节的剧情内容。",
        },
        ui: {
            searchPlaceholder: "输入资料片或章节关键词",
            expand: "展开",
            collapse: "收起",
            feedback: "错误反馈",
            sectionTitle: "章节{number}：{title}",
            loadMore: "加载更多",
            loading: "加载中...",
            loadFailed: "加载失败，请重试",
            retry: "重新加载",
            empty: "暂无内容",
            qqRobot: "添加QQ机器人，快速获取攻略",
            copySuccess: "复制成功",
        },
    },
    index: {
        title: "休闲栏目",
        keywords:
            "剑网3休闲栏目,JX3BOX休闲栏目,剑三休闲栏目,奇遇大全,商贾奇才,声望大全,书籍大全,剑三考试,捏脸数据,体型数据,宠物大全,家具大全,坐骑大全,家园蓝图,QQRobot",
        description:
            "剑网3魔盒（JX3BOX）休闲栏目，围绕剑网3玩家日常休闲玩法与资料查询需求，提供奇遇大全、商贾奇才、声望大全、书籍大全、剑三考试、捏脸数据、体型数据、宠物大全、家具大全、坐骑大全、家园蓝图与 QQRobot 等丰富内容。",
        ui: {
            categories: {
                share: "玩家创作类栏目",
                rare: "图鉴百科类栏目",
                merchants: "信息查询类栏目",
            },
            menus: {
                face: "捏脸数据", body: "体型数据", homeland: "家园蓝图",
                adventure: "奇遇大全", pet: "宠物大全", horse: "坐骑大全", furniture: "家具大全",
                reputation: "声望大全", book: "书籍大全", treasure: "奇遇珍卷", seniority: "资历宝典",
                questsection: "剑侠录", partner: "红尘侠影", exam: "考试大全", manufacture: "技艺助手",
                price: "价格走势", gonggao: "活动告示",
            },
        },
    },

    face: {
        title: "捏脸数据",
        keywords: "剑网3捏脸数据,剑三捏脸数据,JX3BOX捏脸,剑网3捏脸,剑三捏脸,捏脸数据分享,捏脸参数",
        description:
            "剑网3魔盒（JX3BOX）捏脸数据栏目，收录剑网3玩家分享的捏脸数据与角色外观效果，支持快速浏览、下载与分享捏脸方案。",

        single: {
            title: "捏脸详情",
            keywords: "剑网3捏脸详情,剑三捏脸详情,JX3BOX捏脸数据,剑网3捏脸参数,剑三捏脸展示",
            description:
                "剑网3魔盒（JX3BOX）捏脸详情页，展示单个捏脸数据的角色效果、参数信息及下载方式，方便玩家查看与使用。",
        },

        facedata: {
            title: "捏脸数据解析",
            keywords: "剑网3捏脸数据解析,剑三捏脸解析,JX3BOX捏脸工具,剑网3捏脸参数解析",
            description:
                "剑网3魔盒（JX3BOX）捏脸数据解析工具，用于解析剑网3角色捏脸参数数据，帮助玩家查看与分析捏脸配置。",
        },

        faceDataMobile: {
            title: "捏脸数据解析（移动版）",
            keywords: "剑网3捏脸数据解析,剑三捏脸解析,捏脸解析移动版,JX3BOX捏脸工具",
            description: "剑网3魔盒（JX3BOX）捏脸数据解析移动版，支持在移动设备上解析与查看剑网3捏脸参数数据。",
        },
    },
    body: {
        title: "体型数据",
        keywords: "剑网3体型数据,剑三体型数据,JX3BOX体型数据,剑网3体型,剑三体型,体型展示,体型查询",
        description:
            "剑网3魔盒（JX3BOX）体型数据栏目，提供剑网3各门派与角色体型展示、体型比例数据及相关资料查询，方便玩家查看与参考不同体型效果。",

        single: {
            title: "体型详情",
            keywords: "剑网3体型详情,剑三体型详情,JX3BOX体型数据,剑网3体型展示,体型比例",
            description:
                "剑网3魔盒（JX3BOX）体型详情页，展示单个体型的数据与效果，包括体型比例、展示截图及相关参考信息。",
        },

        bodydata: {
            title: "体型数据解析",
            keywords: "剑网3体型数据解析,剑三体型解析,JX3BOX体型数据,剑网3体型参数",
            description:
                "剑网3魔盒（JX3BOX）体型数据解析工具，用于解析与查看剑网3角色体型参数数据，帮助玩家了解不同体型的具体参数信息。",
        },

        bodydatMobile: {
            title: "体型数据解析（移动版）",
            keywords: "剑网3体型数据解析,剑三体型解析,体型数据移动版,JX3BOX体型工具",
            description: "剑网3魔盒（JX3BOX）体型数据解析移动版，支持在移动设备上查看与解析剑网3角色体型参数数据。",
        },
    },
    homeland: {
        title: "家园蓝图",
        keywords: "剑网3家园,剑三家园,JX3BOX家园,家园蓝图,家园地图,家园教程",
        description: "剑网3魔盒（JX3BOX）家园栏目，提供家园蓝图、教程与地图参考。",
        tutorial: {
            title: "家园教程",
            keywords: "剑网3家园教程,剑三家园教程,JX3BOX家园",
            description: "剑网3魔盒（JX3BOX）家园教程，介绍家园搭建与使用方法。",
        },
        maps: {
            title: "家园地图",
            keywords: "剑网3家园地图,剑三家园地图,JX3BOX家园",
            description: "剑网3魔盒（JX3BOX）家园地图参考与位置说明。",
        },
        flower: {
            title: "家园花卉",
            keywords: "剑网3家园花卉,剑三家园花卉,JX3BOX家园",
            description: "剑网3魔盒（JX3BOX）家园花卉参考页。",
        },
    },

    adventure: {
        title: "奇遇大全",
        keywords: "剑网3奇遇大全,剑三奇遇大全,JX3BOX奇遇大全,剑网3奇遇,剑三奇遇,奇遇攻略,奇遇触发条件,奇遇奖励",
        description:
            "剑网3魔盒（JX3BOX）奇遇大全，收录剑网3各类奇遇内容，提供触发条件、任务流程、奖励说明及相关资料查询。",
        single: {
            title: "奇遇详情",
            keywords: "剑网3奇遇详情,剑三奇遇详情,奇遇攻略,奇遇任务流程,奇遇触发条件,奇遇奖励,JX3BOX奇遇",
            description: "剑网3魔盒（JX3BOX）奇遇详情页，查看单个奇遇的触发条件、完成流程、奖励内容及相关参考信息。",
        },
        treasure: {
            title: "奇遇珍卷",
            keywords:
                "剑网3奇遇珍卷,剑三奇遇珍卷,JX3BOX奇遇珍卷,奇遇收集,奇遇完成度,奇遇展示,奇遇画卷,奇遇分享,剑网3奇遇查询,剑三奇遇统计",
            description:
                "剑网3魔盒（JX3BOX）奇遇珍卷，帮助玩家快速查询自己已拥有的奇遇内容，汇总奇遇收集情况与完成度，并以画卷形式展示，方便分享至社交平台，记录与展示你的奇遇成就。",
            landscape: {
                title: "奇遇珍卷",
                keywords: "剑网3奇遇珍卷,剑三奇遇展示,奇遇画卷横屏,奇遇完成度查询,JX3BOX奇遇珍卷",
                description:
                    "剑网3魔盒（JX3BOX）奇遇珍卷，适合在宽屏场景下查看个人奇遇收集情况、完成进度与画卷展示效果，便于浏览和分享。",
            },
            portrait: {
                title: "奇遇珍卷",
                keywords: "剑网3奇遇珍卷,剑三奇遇展示,奇遇画卷竖屏,奇遇完成度查询,JX3BOX奇遇珍卷",
                description:
                    "剑网3魔盒（JX3BOX）奇遇珍卷，适合移动端快速查看个人奇遇收集内容、完成度与画卷展示效果，方便随时分享。",
            },
        },
    },
    pet: {
        title: "宠物大全",
        keywords: "剑网3宠物大全,剑三宠物大全,JX3BOX宠物大全,宠物列表,宠物获取",
        description: "剑网3魔盒（JX3BOX）宠物大全，提供宠物信息与获取参考。",
        single: {
            title: "宠物详情",
            keywords: "剑网3宠物详情,剑三宠物详情,JX3BOX宠物",
            description: "剑网3魔盒（JX3BOX）宠物详情页，查看单个宠物的相关信息。",
        },
        search: {
            title: "宠物搜索",
            keywords: "剑网3宠物搜索,剑三宠物搜索,JX3BOX宠物",
            description: "剑网3魔盒（JX3BOX）宠物搜索页，支持按名称或关键字查找宠物。",
        },
    },
    horse: {
        title: "坐骑大全",
        keywords: "剑网3坐骑大全,剑三坐骑大全,JX3BOX坐骑大全,坐骑列表,坐骑获取",
        description: "剑网3魔盒（JX3BOX）坐骑大全，提供坐骑信息与获取参考。",
        single: {
            title: "坐骑详情",
            keywords: "剑网3坐骑详情,剑三坐骑详情,JX3BOX坐骑",
            description: "剑网3魔盒（JX3BOX）坐骑详情页，查看单个坐骑的相关信息。",
        },
    },

    furniture: {
        title: "家具大全",
        keywords: "剑网3家具大全,剑三家具大全,JX3BOX家具大全,剑网3家具,剑三家具,家园家具",
        description: "剑网3魔盒（JX3BOX）家具大全，提供家具信息、获取方式与细节参考。",
        single: {
            title: "家具详情",
            keywords: "剑网3家具详情,剑三家具详情,JX3BOX家具,家园家具",
            description: "剑网3魔盒（JX3BOX）家具详情页，查看单个家具的相关信息与参考。",
        },
    },
    reputation: {
        title: "声望大全",
        keywords: "剑网3声望大全,剑三声望大全,JX3BOX声望大全,声望列表,声望获取",
        description: "剑网3魔盒（JX3BOX）声望大全，提供声望信息与获取参考。",
        single: {
            title: "声望详情",
            keywords: "剑网3声望详情,剑三声望详情,JX3BOX声望",
            description: "剑网3魔盒（JX3BOX）声望详情页，查看单个声望的相关信息。",
        },
        search: {
            title: "声望搜索",
            keywords: "剑网3声望搜索,剑三声望搜索,JX3BOX声望",
            description: "剑网3魔盒（JX3BOX）声望搜索页，支持按名称或关键字查找声望。",
        },
    },

    book: {
        title: "书籍大全",
        keywords: "剑网3书籍大全,剑三书籍大全,JX3BOX书籍大全,剑网3书籍,剑三书籍,书籍收集,书籍位置,书籍资料",
        description:
            "剑网3魔盒（JX3BOX）书籍大全，收录剑网3游戏中的各类书籍资料，包括书籍名称、获取方式、位置与相关背景内容，帮助玩家快速查询与收集书籍。",

        single: {
            title: "书籍详情",
            keywords: "剑网3书籍详情,剑三书籍详情,剑网3书籍位置,剑三书籍获取,JX3BOX书籍",
            description:
                "剑网3魔盒（JX3BOX）书籍详情页，提供单本书籍的获取方式、位置说明及相关资料，方便玩家查询与完成书籍收集。",
        },
    },
    exam: {
        title: "剑三考试",
        keywords: "剑网3考试,剑三考试,JX3BOX考试,剑网3题库,剑三题库,剑网3答题,剑三答题,游戏题库,门派考试",
        description:
            "剑网3魔盒（JX3BOX）考试栏目，提供剑网3相关题库、试卷、答题练习与题目发布功能，方便玩家进行知识测试、题目整理与内容投稿。",

        paper: {
            title: "试卷详情",
            keywords: "剑网3试卷,剑三试卷,JX3BOX考试试卷,剑网3题库试卷,剑三答题练习",
            description:
                "剑网3魔盒（JX3BOX）试卷详情页，支持查看考试试卷内容、题目组成与答题信息，方便玩家进行练习与测试。",
        },

        question: {
            title: "题目详情",
            keywords: "剑网3题目详情,剑三题目详情,JX3BOX考试题目,剑网3题库,剑三答题",
            description:
                "剑网3魔盒（JX3BOX）题目详情页，提供单道题目的题干、选项、答案与相关说明，方便玩家查询和学习。",
        },

        questionPublish: {
            title: "发布题目",
            keywords: "剑网3发布题目,剑三发布题目,JX3BOX考试投稿,剑网3题库投稿,剑三题目录入",
            description:
                "剑网3魔盒（JX3BOX）发布题目页面，支持用户提交与录入考试题目，完善剑网3题库内容，方便社区共建与整理。",
        },

        paperPublish: {
            title: "发布试卷",
            keywords: "剑网3发布试卷,剑三发布试卷,JX3BOX考试试卷投稿,剑网3题库试卷,剑三考试组卷",
            description:
                "剑网3魔盒（JX3BOX）发布试卷页面，支持将多道题目整理为试卷并提交发布，方便玩家创建练习与测试内容。",
        },

        gameQuestionPublish: {
            title: "发布游戏题目",
            keywords: "剑网3游戏题目发布,剑三游戏题目发布,JX3BOX考试投稿,剑网3题目投稿,剑三题库共建",
            description:
                "剑网3魔盒（JX3BOX）发布游戏题目页面，支持围绕剑网3玩法与内容提交相关题目，帮助补充与完善游戏知识题库。",
        },
    },


    pvg: {
        manufacture: {
            title: "技艺助手",
            keywords: "剑网3技艺助手,剑三技艺助手,JX3BOX技艺助手,配方材料",
            description: "剑网3魔盒（JX3BOX）技艺助手，提供配方与材料参考。",
        },
        price: {
            title: "价格走势",
            keywords: "剑网3价格走势,剑三价格走势,JX3BOX价格走势,市场价格",
            description: "剑网3魔盒（JX3BOX）价格走势，查看市场价格变化与趋势。",
        },
        gonggao: {
            title: "活动告示",
            keywords: "剑网3活动告示,剑三活动告示,JX3BOX活动告示,活动日历",
            description: "剑网3魔盒（JX3BOX）活动告示，提供速览与日历查看。",
            daily: {
                title: "速览",
                keywords: "剑网3活动速览,剑三活动速览,JX3BOX活动",
                description: "剑网3魔盒（JX3BOX）活动速览，查看当天活动信息。",
            },
            calendar: {
                title: "日历",
                keywords: "剑网3活动日历,剑三活动日历,JX3BOX活动",
                description: "剑网3魔盒（JX3BOX）活动日历视图。",
            },
            server: {
                title: "开服状态",
                keywords: "剑网3开服状态,剑三开服状态,JX3BOX开服",
                description: "剑网3魔盒（JX3BOX）服务器开服状态查询。",
            },
            single: {
                title: "日历详情",
                keywords: "剑网3日历详情,剑三日历详情,JX3BOX活动",
                description: "剑网3魔盒（JX3BOX）日历详情页，查看单条日历内容。",
            },
        },
    },

    qqbot: {
        pvx: {
            title: "QQBot PVX",
            keywords: "QQBot,PVX,JX3BOX",
            description: "QQBot PVX 功能详情页。",
        },
    },

    common: {
        appendTitle: " - 剑网3魔盒（JX3BOX）",
    }
};
