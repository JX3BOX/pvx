export default {
    partner: {
        title: "紅塵俠影", keywords: "劍網3紅塵俠影,劍三俠客,JX3BOX", description: "紅塵俠影資料頁，提供俠客結識方式、武學、境界、屬性與傳記。",
        detail: { title: "紅塵俠影詳情", keywords: "劍網3俠客詳情,紅塵俠影,JX3BOX", description: "查看紅塵俠影俠客的技能、屬性與傳記。" },
        ui: {
            searchPlaceholder: "輸入關鍵詞搜尋", noMatchingPartners: "暫無符合的俠客", feedback: "錯誤回報", qqRobot: "加入QQ機器人，快速取得攻略", copySuccess: "複製成功",
            tabs: { info: "基礎資訊", bio: "傳記" }, sections: { introduction: "結識方式", skills: "武學招式", realms: "武學境界", attributes: "屬性" },
            emptyPortrait: "暫無立繪", voiceText: "語音（僅文字展示）", emptyBio: "暫無傳記", emptyAttributes: "暫無屬性", emptyIntroduction: "暫無結識資訊", emptySkills: "暫無武學資料",
            attributes: { quality: "品質", rarity: "稀有度", kungfu: "武學類型", nickname: "心法" },
            quality: { 1: "白色", 2: "綠色", 3: "藍色", 4: "紫色", 5: "橙色" }, rarity: { 1: "普通", 2: "稀有", 3: "史詩", 4: "傳說" },
            skillTypes: { passive: "被動", active: "主動", martialArt: "武學" }, kungfu: { 0: "通用", 1: "拳掌", 2: "劍式", 3: "刀式" }, unlockItems: "解鎖道具", openSkillDatabase: "前往資料庫", skillFallback: "招式 {id}", skillDescFallback: "暫無招式描述",
            realmFallback: "境界{stage}", realmSkillFallback: "境界 {title} 對應的武學技能", itemLoading: "道具 {id} 載入中...", itemFallback: "道具 {id}", unknownItem: "未知道具", timeLimit: "限時時間：{days}天", maxOwned: "最大擁有數：{count}",
            bindTypes: { tradeable: "可交易", untradeable: "不可交易", bindOnPickup: "拾取綁定", other: "綁定類型{type}" },
            sources: { other: "其他途徑取得", drop: "掉落取得", quest: "任務取得", craft: "製作取得", shop: "商店購買" },
        },
    },
    questsection: {
        title: "劍俠錄",
        keywords: "劍網3劍俠錄,劍三劍俠錄,JX3BOX劍俠錄,主線劇情,劇情章節,任務劇情",
        description: "劍網3魔盒（JX3BOX）劍俠錄，依資料片與章節整理劍網3主線劇情及任務內容，方便玩家查詢與閱讀。",
        detail: {
            title: "劍俠錄章節詳情",
            keywords: "劍網3劍俠錄章節,劍三主線劇情,任務劇情,JX3BOX劍俠錄",
            description: "劍俠錄章節詳情頁，查看劍網3對應資料片與章節的劇情內容。",
        },
        ui: {
            searchPlaceholder: "輸入資料片或章節關鍵字",
            expand: "展開",
            collapse: "收起",
            feedback: "錯誤回報",
            sectionTitle: "章節{number}：{title}",
            loadMore: "載入更多",
            loading: "載入中...",
            loadFailed: "載入失敗，請重試",
            retry: "重新載入",
            empty: "暫無內容",
            qqRobot: "新增QQ機器人，快速取得攻略",
            copySuccess: "複製成功",
        },
    },
    index: {
        title: "休閒欄目",
        keywords:
            "劍網3休閒欄目,JX3BOX休閒欄目,奇遇大全,聲望大全,書籍大全,劍三考試,捏臉數據,體型數據,寵物大全,家具大全,坐騎大全,家園藍圖,QQRobot",
        description:
            "劍網3魔盒（JX3BOX）休閒欄目，提供奇遇、聲望、書籍、考試、捏臉、體型、寵物、家具、坐騎、家園藍圖與 QQRobot 等內容。",
        ui: {
            categories: { share: "玩家創作類欄目", rare: "圖鑑百科類欄目", merchants: "資訊查詢類欄目" },
            menus: {
                face: "捏臉數據", body: "體型數據", homeland: "家園藍圖",
                adventure: "奇遇大全", pet: "寵物大全", horse: "坐騎大全", furniture: "家具大全",
                reputation: "聲望大全", book: "書籍大全", treasure: "奇遇珍卷", seniority: "資歷寶典",
                questsection: "劍俠錄", partner: "紅塵俠影", exam: "考試大全", manufacture: "技藝助手",
                price: "價格走勢", gonggao: "活動告示",
            },
        },
    },
    adventure: {
        title: "奇遇大全",
        keywords: "劍網3奇遇大全,劍三奇遇大全,JX3BOX奇遇大全,奇遇攻略,觸發條件,獎勵",
        description: "收錄各類奇遇內容，提供觸發條件、流程與獎勵說明。",
        single: {
            title: "奇遇詳情",
            keywords: "劍網3奇遇詳情,奇遇攻略,觸發條件,獎勵,JX3BOX",
            description: "奇遇詳情頁，查看單個奇遇的觸發條件、流程與獎勵。",
        },
        treasure: {
            title: "奇遇珍卷",
            keywords: "劍網3奇遇珍卷,奇遇收集,完成度,展示,JX3BOX",
            description: "奇遇珍卷，匯總收集情況與完成度並以畫卷形式展示。",
            landscape: {
                title: "奇遇珍卷（橫屏）",
                keywords: "奇遇珍卷橫屏,完成度查詢,JX3BOX",
                description: "橫屏查看奇遇收集與完成度。",
            },
            portrait: {
                title: "奇遇珍卷（豎屏）",
                keywords: "奇遇珍卷豎屏,完成度查詢,JX3BOX",
                description: "豎屏查看奇遇收集與完成度。",
            },
        },
    },
    faceBody: {
        roles: { all: "全部", male: "成男", female: "成女", boy: "正太", girl: "蘿莉" },
        actions: { parse: "資料解析", publish: "發佈作品", viewAll: "查看全部", loadMore: "載入更多" },
        filters: { roleCategory: "角色分類", all: "全部", conditions: "篩選條件", featured: "精選", free: "免費", recreatable: "可新建", images: "圖片篩選", withImages: "有圖" },
        search: { content: "搜尋內容", close: "關閉", reset: "重設", select: "請選擇", inputField: "請輸入{name}", selectField: "請選擇{name}", searchPlaceholder: "輸入{name}搜尋" },
        card: { editorChoice: "編輯推薦", paid: "付費", recommended: "推薦", anonymous: "匿名", realistic: "寫實", artistic: "寫意", recreatable: "可新建" },
        parse: { localOnly: "僅在本機解析", complete: "解析完成", compatibility: "檔案相容", privacy: "隱私保護", privacyDescription: "檔案只在目前瀏覽器中讀取，不會上傳到伺服器", result: "解析結果" },
        detail: {
            backToList: "返回列表", publishFace: "發佈作品", publishBody: "發佈體型", untitled: "無標題", removed: "已下架", edit: "編輯", copyFaceCode: "複製臉型碼", topicFeatured: "{date}榮登頭條",
            firstPublished: "首發", original: "原創", clients: { std: "旗艦", origin: "緣起" },
            priceBoxcoin: "售價：{price} 盒幣", priceGold: "售價：{price} 金箔", purchase: "購買", downloadData: "下載資料", updatedAt: "更新時間：{time}",
            gamePriceHint: "此資料含遊戲內收費項目，總計約", tongbao: "{price}通寶", description: "說明", dataList: "資料列表", noDescription: "暫無說明",
            note: "備註：", none: "無", download: "下載", faceType: "臉型", bodyType: "體型", headline: "此{type}於{time}榮登頭條",
            dataAnalysis: "獨家資料分析", analysisHint: "購買後可查看完整參數", analysisLocked: "資料分析將在購買後解鎖",
            aboutCreator: "關於作者", moreWorks: "更多作品", discussion: "討論",
            confirmPurchase: "確認購買此臉型？", prompt: "提示", confirm: "確定", cancel: "取消", balanceInsufficient: "餘額不足，是否前往儲值？",
            timeout: "逾時", paymentTimeout: "支付結果查詢逾時，請稍後查看", success: "成功", purchaseSuccess: "購買成功", failure: "失敗", purchaseFailed: "支付失敗", copySuccess: "複製成功",
            fileIncomplete: "檔案資訊不完整", downloadUrlFailed: "取得下載網址失敗", noDownloadableFiles: "暫無可下載的檔案", downloadFailed: "下載失敗，請重試",
        },
    },
    body: {
        title: "體型數據",
        keywords: "劍網3體型數據,體型展示,體型比例,JX3BOX",
        description: "體型數據欄目，提供體型展示與比例參考。",
        single: {
            title: "體型詳情",
            keywords: "劍網3體型詳情,體型比例,JX3BOX",
            description: "體型詳情頁，展示單個體型的數據與效果。",
        },
        bodydata: {
            title: "體型數據解析",
            keywords: "體型數據解析,體型參數,JX3BOX",
            description: "體型數據解析工具，查看體型參數。",
        },
        bodydatMobile: {
            title: "體型數據解析（移動版）",
            keywords: "體型解析移動版,JX3BOX",
            description: "移動端體型數據解析工具。",
        },
        ui: {
            sectionTitle: "{role}體型", empty: "沒有找到相關體型", emptySearch: "找不到對應體型，請重新選擇條件或關鍵字搜尋",
            parse: { title: "體型資料解析器", description: "讀取本機檔案，快速查看體型參數與各部位調整資料", importTitle: "匯入體型資料檔案", importDescription: "選擇要查看的遊戲體型檔案，解析後將在下方顯示詳細參數。", selectFile: "選擇一個體型資料檔案", formats: "支援 .dat 與 .jx3dat 格式", guide: "遊戲體型匯入匯出指南", compatibilityDescription: "自動辨識角色體型並載入對應參數範圍", resultDescription: "切換分類查看各部位體型參數，並可依原有方式匯出資料。" },
        },
    },
    book: {
        title: "書籍大全",
        keywords: "劍網3書籍大全,書籍位置,JX3BOX",
        description: "書籍大全，提供書籍名稱與獲取方式。",
        single: {
            title: "書籍詳情",
            keywords: "書籍詳情,書籍位置,JX3BOX",
            description: "書籍詳情頁，查看單本書籍的獲取方式與位置。",
        },
    },
    exam: {
        title: "劍三考試",
        keywords: "劍網3考試,題庫,答題,JX3BOX",
        description: "考試欄目，提供題庫、試卷與答題練習。",
        paper: {
            title: "試卷詳情",
            keywords: "試卷詳情,題庫試卷,JX3BOX",
            description: "試卷詳情頁，查看試卷內容與題目組成。",
        },
        question: {
            title: "題目詳情",
            keywords: "題目詳情,題庫,JX3BOX",
            description: "題目詳情頁，查看題幹、選項與答案。",
        },
        questionPublish: {
            title: "發布題目",
            keywords: "發布題目,題庫投稿,JX3BOX",
            description: "提交與錄入考試題目。",
        },
        paperPublish: {
            title: "發布試卷",
            keywords: "發布試卷,試卷投稿,JX3BOX",
            description: "建立並發布試卷內容。",
        },
        gameQuestionPublish: {
            title: "發布遊戲題目",
            keywords: "發布遊戲題目,題庫共建,JX3BOX",
            description: "提交遊戲相關題目，完善題庫。",
        },
    },
    face: {
        title: "捏臉數據",
        keywords: "劍網3捏臉數據,捏臉參數,JX3BOX",
        description: "捏臉數據欄目，提供捏臉展示與下載。",
        single: {
            title: "捏臉詳情",
            keywords: "捏臉詳情,捏臉參數,JX3BOX",
            description: "捏臉詳情頁，查看單個捏臉數據。",
        },
        facedata: {
            title: "捏臉數據解析",
            keywords: "捏臉數據解析,捏臉參數,JX3BOX",
            description: "捏臉數據解析工具。",
        },
        faceDataMobile: {
            title: "捏臉數據解析（移動版）",
            keywords: "捏臉解析移動版,JX3BOX",
            description: "移動端捏臉數據解析工具。",
        },
        ui: {
            sectionTitle: "{role}臉型", empty: "沒有找到相關臉型", emptySearch: "找不到對應臉型，請重新選擇條件或關鍵字搜尋",
            filters: { style: "臉型風格", realistic: "寫實", artistic: "寫意", faceCode: "捏臉碼" },
            parse: { title: "捏臉資料解析器", description: "讀取本機檔案，快速查看臉型骨骼、妝容與參數明細", importTitle: "匯入臉型資料檔案", importDescription: "選擇要查看的遊戲臉型檔案，解析後將在下方顯示詳細參數。", selectFile: "選擇一個臉型資料檔案", formats: "支援 .dat、.jx3dat 與 .ini 格式", guide: "遊戲臉型匯入匯出指南", compatibilityDescription: "支援正式服、懷舊服及編輯器臉型資料", resultDescription: "切換分類查看各項臉型參數，滑桿僅用於直觀顯示資料位置。" },
        },
    },
    furniture: {
        title: "家具大全",
        keywords: "劍網3家具大全,家園家具,JX3BOX",
        description: "家具大全，提供家具資訊與細節。",
        single: {
            title: "家具詳情",
            keywords: "家具詳情,JX3BOX",
            description: "家具詳情頁。",
        },
    },
    homeland: {
        title: "家園",
        keywords: "劍網3家園,家園藍圖,家園地圖,JX3BOX",
        description: "家園欄目，包含藍圖、教程與地圖。",
        ui: {
            title: "家園藍圖",
            description: "家園資訊、地圖工具與藍圖資源的一站式入口",
            toolkit: "家園工具箱",
            navigationLabel: "家園功能導覽",
            tabs: {
                info: "家園資訊",
                map: "家園地圖",
                guide: "家園攻略",
                freeBlueprint: "免費藍圖",
                paidBlueprint: "付費藍圖",
                collectionBlueprint: "藏品藍圖",
            },
            mapNames: {
                455: "廣陵邑",
                462: "九寨溝·鏡海",
                471: "楓葉泊·樂苑",
                486: "楓葉泊·天苑",
            },
            house: { area: "面積", price: "價格" },
            levels: { title: "家園升級需求", level: "等級", collectionScore: "收藏分", currency: "園宅幣" },
        },
        tutorial: {
            title: "家園教程",
            keywords: "家園教程,JX3BOX",
            description: "家園搭建與使用教程。",
        },
        maps: {
            title: "家園地圖",
            keywords: "家園地圖,JX3BOX",
            description: "家園地圖參考與位置。",
        },
        flower: {
            title: "家園花卉",
            keywords: "家園花卉,JX3BOX",
            description: "家園花卉參考頁。",
        },
    },
    horse: {
        title: "坐騎大全",
        keywords: "劍網3坐騎大全,坐騎列表,JX3BOX",
        description: "坐騎大全，提供坐騎資訊。",
        single: {
            title: "坐騎詳情",
            keywords: "坐騎詳情,JX3BOX",
            description: "坐騎詳情頁。",
        },
    },
    pet: {
        title: "寵物大全",
        keywords: "劍網3寵物大全,寵物列表,JX3BOX",
        description: "寵物大全，提供寵物資訊。",
        single: {
            title: "寵物詳情",
            keywords: "寵物詳情,JX3BOX",
            description: "寵物詳情頁。",
        },
        search: {
            title: "寵物搜尋",
            keywords: "寵物搜尋,JX3BOX",
            description: "按名稱或關鍵字搜尋寵物。",
        },
    },
    pvg: {
        manufacture: {
            title: "技藝助手",
            keywords: "技藝助手,製作助手,JX3BOX",
            description: "技藝助手，提供配方與材料參考。",
        },
        price: {
            title: "價格走勢",
            keywords: "價格走勢,市場價格,JX3BOX",
            description: "市場價格走勢與分析。",
        },
        gonggao: {
            title: "活動告示",
            keywords: "活動告示,日曆,JX3BOX",
            description: "活動告示，提供速覽與日曆。",
            daily: {
                title: "速覽",
                keywords: "活動速覽,JX3BOX",
                description: "每日活動速覽。",
            },
            calendar: {
                title: "日曆",
                keywords: "活動日曆,JX3BOX",
                description: "活動日曆視圖。",
            },
            server: {
                title: "開服狀態",
                keywords: "開服狀態,JX3BOX",
                description: "伺服器開服狀態。",
            },
            single: {
                title: "日曆詳情",
                keywords: "日曆詳情,JX3BOX",
                description: "單條日曆內容詳情。",
            },
        },
    },
    qqbot: {
        pvx: {
            title: "QQBot PVX",
            keywords: "QQBot,PVX,JX3BOX",
            description: "QQBot PVX 功能詳情頁。",
        },
    },
    reputation: {
        title: "聲望大全",
        keywords: "劍網3聲望大全,聲望列表,JX3BOX",
        description: "聲望大全，提供聲望資訊。",
        single: {
            title: "聲望詳情",
            keywords: "聲望詳情,JX3BOX",
            description: "聲望詳情頁。",
        },
        search: {
            title: "聲望搜尋",
            keywords: "聲望搜尋,JX3BOX",
            description: "按名稱或關鍵字搜尋聲望。",
        },
    },

    common: {
        appendTitle: " - 劍網3魔盒（JX3BOX）",
    }
};
