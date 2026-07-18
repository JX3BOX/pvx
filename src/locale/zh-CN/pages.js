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

    faceBody: {
        roles: { all: "全部", male: "成男", female: "成女", boy: "正太", girl: "萝莉" },
        actions: { parse: "数据解析", publish: "发布作品", viewAll: "查看全部", loadMore: "加载更多" },
        filters: {
            roleCategory: "角色分类", all: "全部", conditions: "筛选条件", featured: "精选",
            free: "免费", recreatable: "可新建", images: "图片筛选", withImages: "有图",
        },
        search: {
            content: "搜索内容", close: "关闭", reset: "重置", select: "请选择",
            inputField: "请输入{name}", selectField: "请选择{name}", searchPlaceholder: "输入{name}搜索",
        },
        card: { editorChoice: "编辑推荐", paid: "付费", recommended: "推荐", anonymous: "匿名", realistic: "写实", artistic: "写意", recreatable: "可新建" },
        parse: {
            localOnly: "仅在本地解析", complete: "解析完成", compatibility: "文件兼容",
            privacy: "隐私保护", privacyDescription: "文件只在当前浏览器中读取，不会上传到服务器", result: "解析结果",
        },
        detail: {
            backToList: "返回列表", publishFace: "发布作品", publishBody: "发布体型", untitled: "无标题", removed: "已下架", edit: "编辑", copyFaceCode: "复制捏脸码", topicFeatured: "{date}荣登头条",
            firstPublished: "首发", original: "原创", clients: { std: "旗舰", origin: "缘起" },
            priceBoxcoin: "售价：{price} 盒币", priceGold: "售价：{price} 金箔", purchase: "购买", downloadData: "下载数据", updatedAt: "更新时间：{time}",
            gamePriceHint: "该数据含游戏内收费项目，总计约", tongbao: "{price}通宝", description: "说明", dataList: "数据列表", noDescription: "暂无说明",
            note: "备注：", none: "无", download: "下载", faceType: "脸型", bodyType: "体型", headline: "该{type}于{time}荣登头条",
            dataAnalysis: "独家数据分析", analysisHint: "购买后可查看完整参数", analysisLocked: "数据分析将在购买后解锁",
            aboutCreator: "关于作者", moreWorks: "更多作品", discussion: "讨论",
            confirmPurchase: "确认购买此捏脸？", confirmPurchaseBody: "确认购买此体型？", prompt: "提示", confirm: "确定", cancel: "取消", balanceInsufficient: "余额不足，是否前往充值？",
            timeout: "超时", paymentTimeout: "支付结果查询超时，请稍后查看", success: "成功", purchaseSuccess: "购买成功", failure: "失败", purchaseFailed: "支付失败", copySuccess: "复制成功",
            fileIncomplete: "文件信息不完整", downloadUrlFailed: "获取下载地址失败", noDownloadableFiles: "暂无可下载的文件", downloadFailed: "下载失败，请重试",
            noImages: "该{type}数据暂无图片", currentExperience: "当前经验 {value}", contractedCreator: "签约作者", proMember: "专业版会员用户", premiumMember: "高级版会员用户",
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
        ui: {
            sectionTitle: "{role}脸型", empty: "没有找到相关的捏脸", emptySearch: "没找到对应的捏脸，请重新选择条件或关键词搜索",
            filters: { style: "脸型风格", realistic: "写实", artistic: "写意", faceCode: "捏脸码" },
            parse: {
                title: "捏脸数据解析器", description: "读取本地文件，快速查看脸型骨骼、妆容与参数明细",
                importTitle: "导入脸型数据文件", importDescription: "选择需要查看的游戏脸型文件，解析完成后将在下方展示详细参数。",
                selectFile: "选择一个脸型数据文件", formats: "支持 .dat、.jx3dat 与 .ini 格式", guide: "游戏脸型导入导出指南",
                compatibilityDescription: "支持正式服、怀旧服及编辑器脸型数据", resultDescription: "切换分类查看各项脸型参数，滑杆仅用于直观展示数据位置。",
            },
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
        ui: {
            sectionTitle: "{role}体型", empty: "没有找到相关的体型", emptySearch: "没找到对应的体型，请重新选择条件或关键词搜索",
            parse: {
                title: "体型数据解析器", description: "读取本地文件，快速查看体型参数与各部位调节数据",
                importTitle: "导入体型数据文件", importDescription: "选择需要查看的游戏体型文件，解析完成后将在下方展示详细参数。",
                selectFile: "选择一个体型数据文件", formats: "支持 .dat 与 .jx3dat 格式", guide: "游戏体型导入导出指南",
                compatibilityDescription: "自动识别角色体型并加载对应参数范围", resultDescription: "切换分类查看各部位体型参数，并可按原有方式导出数据。",
            },
        },
    },
    homeland: {
        title: "家园蓝图",
        keywords: "剑网3家园,剑三家园,JX3BOX家园,家园蓝图,家园地图,家园教程",
        description: "剑网3魔盒（JX3BOX）家园栏目，提供家园蓝图、教程与地图参考。",
        ui: {
            title: "家园蓝图",
            description: "家园信息、地图工具与蓝图资源的一站式入口",
            toolkit: "家园工具箱",
            navigationLabel: "家园功能导航",
            tabs: {
                info: "家园信息",
                map: "家园地图",
                guide: "家园攻略",
                freeBlueprint: "免费蓝图",
                paidBlueprint: "付费蓝图",
                collectionBlueprint: "藏品蓝图",
            },
            mapNames: {
                455: "广陵邑",
                462: "九寨沟·镜海",
                471: "枫叶泊·乐苑",
                486: "枫叶泊·天苑",
            },
            house: { area: "面积", price: "价格" },
            levels: { title: "家园升级需求", level: "等级", collectionScore: "收藏分", currency: "园宅币" },
        },
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
        ui: {
            title: "考试大全",
            description: "查询科举题目、挑战玩家题库，或选择模拟试卷进行练习",
            types: { imperial: "科举题库", question: "创作题库", paper: "模拟考试", gaokao: "剑三高考" },
            filters: { type: "类型", filter: "筛选", keyword: "关键词", tag: "标签", client: "平台" },
            actions: { publishQuestion: "我要出题", publishPaper: "我要出卷" },
            sections: {
                imperial: { title: "科举题库", description: "输入至少两个字符，快速查询游戏内科举题目与答案" },
                question: { title: "创作题库", description: "浏览玩家创作的单题内容并进入答题" },
                paper: { title: "模拟考试", description: "选择社区试卷进行完整模拟练习" },
            },
            resultCount: "共 {count} 条",
            empty: { title: "没有找到相关条目", description: "请尝试更换关键词或调整筛选条件" },
            loadFailed: "考试数据加载失败，请稍后重试",
            search: {
                close: "关闭", reset: "重置", select: "请选择", inputField: "请输入{name}", selectField: "请选择{name}",
                searchPlaceholder: "输入{name}搜索",
            },
            imperial: {
                placeholder: "输入题目关键词搜索", tip: "请输入至少两个字符开始查询", minLength: "搜索词长度不能少于两个字符",
                result: "“{keyword}”共找到 {count} 条结果", answer: "答案", emptyTitle: "开始查询科举题库",
                emptyDescription: "输入游戏内题目关键词，即可查看对应答案",
            },
            question: {
                columns: { id: "编号", title: "标题", tags: "标签", difficulty: "难度", author: "出题人", action: "操作" },
                answer: "去答题",
            },
            paper: {
                author: "出卷人",
                difficulty: "难度",
                detail: {
                    backToList: "返回试卷列表", edit: "编辑试卷", paperLabel: "模拟试卷", untitled: "未命名试卷",
                    noDescription: "作者暂未填写试卷说明", difficulty: "难度", author: "出卷人：",
                    examStart: "考试准备", examEnd: "考试完成", summary: "共 {count} 题，每题 {score} 分，满分 100 分",
                    rule: "请独立完成作答，提交后将展示本次考试结果。", score: "本次得分",
                    externalTitle: "外链试卷", externalDescription: "这份试卷将在外部页面完成作答。", openExternal: "前往答题",
                    questionsTitle: "试卷题目", questionsDescription: "请完成下列题目后统一提交",
                    submit: "提交试卷", submitted: "已提交", comments: "评论", loginRequired: "请先登录",
                    blankTitle: "提交失败", blankMessage: "不能交白卷哦~", loadFailed: "试卷加载失败，请稍后重试",
                },
            },
            common: { anonymous: "匿名", noData: "暂无数据" },
            detail: {
                back: "返回列表", edit: "编辑", submit: "提交答案", submitted: "已提交", comments: "评论",
                loginRequired: "请先登录", selectAnswer: "请先选择答案", submitFailed: "提交失败",
            },
        },

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
            ui: {
                title: "活动告示",
                description: "聚合公告、服务器状态与今日江湖动态",
                today: "今日信息",
                navigation: "活动告示导航",
                tabs: { daily: "每日速览", calendar: "活动日历", server: "开服状态" },
                sections: {
                    notice: "最新公告",
                    server: "服务器状态",
                    homeland: "家园声望与福缘",
                    horse: "抓马播报",
                },
                switch: "切换",
                current: "当前",
                celebrities: { chutian: "楚天社", yuncong: "云从社", pifeng: "披风会", qiongye: "穹野卫", specialEvent: "特殊事件" },
                news: { category: "公告分类", all: "全部", game: "游戏", skillChange: "技改", box: "魔盒" },
                server: {
                    common: "常用服务器",
                    all: "全部服务器",
                    good: "良好",
                    busy: "繁忙",
                    full: "爆满",
                    maintenance: "维护",
                },
                serverOverview: {
                    title: "开服状态",
                    description: "按大区查看服务器连接状态，登录后可收藏常用服务器。",
                    count: "{count} 个服务器",
                    favorites: "我的关注",
                    lastMaintenance: "最近维护时间",
                    saveFailed: "保存关注服务器失败，请稍后重试",
                },
                common: {
                    noData: "暂无数据",
                    noInfo: "暂无信息",
                    add: "新增",
                    edit: "编辑",
                    delete: "删除",
                    cancel: "取消",
                    confirm: "确认",
                    yes: "是",
                    no: "否",
                },
                clients: { std: "正式服", origin: "怀旧服", all: "双端" },
                horse: {
                    switch: "切换",
                    paddock: "马场",
                    specialMount: "特殊坐骑",
                    chitu: "赤兔",
                    notRefreshed: "本CD尚未刷新",
                    report: "播报",
                    coordinates: "坐标",
                },
                calendar: {
                    previousYear: "上一年",
                    nextYear: "下一年",
                    previousMonth: "上一月",
                    nextMonth: "下一月",
                    weekdays: { "0": "周日", "1": "周一", "2": "周二", "3": "周三", "4": "周四", "5": "周五", "6": "周六" },
                    team: "团队",
                    records: "条纪事",
                    special: "特殊",
                    daily: "日常",
                    activities: "活动",
                    events: "事件",
                    noActivities: "暂时没有任何活动记录",
                    noEvents: "暂时没有任何事件记录",
                    pending: "待审核",
                    luckyPets: "福缘宠物",
                    homesteadMatch: "园宅会赛",
                    nextHomesteadMatch: "下期园宅会赛",
                    comments: "评论",
                    references: "参考资料",
                    waitingForReview: "等待审核中...",
                    contributedBy: "由{name}贡献",
                    form: {
                        date: "日期", enterYear: "请输入年份", enterMonth: "请输入月份", enterDate: "请输入日期",
                        type: "类型", iconId: "图标ID", description: "描述", enterDescription: "输入事件描述",
                        client: "客户端", enterTitle: "请输入标题", enterLink: "请输入链接", removeReference: "删除参考资料",
                        management: "管理设置", showInCell: "格子显示", cellSummary: "格子简述", enterSummary: "输入简述（非必填）",
                        importance: "重要级别", style: "样式", backgroundColor: "背景色", color: "颜色", image: "图片",
                        remark: "备注", enterRemark: "请输入备注", actions: "操作", recheck: "复审", officialNews: "官网新闻",
                        removeImage: "移除图片",
                    },
                    messages: {
                        submitted: "提交成功", waitForReview: "请耐心等待审核", success: "操作成功", updated: "日历记录更新成功",
                        waitForRecheck: "请等待重新审核", deleted: "删除成功", recordDeleted: "日历记录已删除",
                        markedPending: "日历记录已设为待审核", networkError: "网络请求异常",
                    },
                },
            },
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
