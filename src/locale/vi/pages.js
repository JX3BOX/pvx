export default {
    partner: {
        title: "Đồng hành", keywords: "JX3 companion,JX3BOX", description: "Thông tin đồng hành, kỹ năng, thuộc tính và tiểu sử.",
        detail: { title: "Chi tiết đồng hành", keywords: "JX3 companion details,JX3BOX", description: "Xem kỹ năng, thuộc tính và tiểu sử đồng hành." },
        ui: {
            searchPlaceholder: "Tìm đồng hành", noMatchingPartners: "Không có kết quả", feedback: "Báo lỗi", qqRobot: "Thêm QQ bot để xem hướng dẫn", copySuccess: "Đã sao chép",
            tabs: { info: "Thông tin", bio: "Tiểu sử" }, sections: { introduction: "Cách kết giao", skills: "Kỹ năng", realms: "Cảnh giới", attributes: "Thuộc tính" },
            emptyPortrait: "Không có hình", voiceText: "Lời thoại (chỉ văn bản)", emptyBio: "Không có tiểu sử", emptyAttributes: "Không có thuộc tính", emptyIntroduction: "Không có thông tin kết giao", emptySkills: "Không có dữ liệu kỹ năng",
            attributes: { quality: "Phẩm chất", rarity: "Độ hiếm", kungfu: "Loại võ học", nickname: "Tâm pháp" },
            quality: { 1: "Trắng", 2: "Xanh lá", 3: "Xanh dương", 4: "Tím", 5: "Cam" }, rarity: { 1: "Thường", 2: "Hiếm", 3: "Sử thi", 4: "Huyền thoại" },
            skillTypes: { passive: "Bị động", active: "Chủ động", martialArt: "Võ học" }, kungfu: { 0: "Chung", 1: "Quyền", 2: "Kiếm", 3: "Đao" }, unlockItems: "Vật phẩm mở khóa", openSkillDatabase: "Mở cơ sở dữ liệu kỹ năng", skillFallback: "Kỹ năng {id}", skillDescFallback: "Không có mô tả kỹ năng",
            realmFallback: "Cảnh giới {stage}", realmSkillFallback: "Kỹ năng của cảnh giới {title}", itemLoading: "Đang tải vật phẩm {id}...", itemFallback: "Vật phẩm {id}", unknownItem: "Vật phẩm không rõ", timeLimit: "Thời hạn: {days} ngày", maxOwned: "Số lượng tối đa: {count}",
            bindTypes: { tradeable: "Có thể giao dịch", untradeable: "Không thể giao dịch", bindOnPickup: "Khóa khi nhặt", other: "Loại khóa {type}" },
            sources: { other: "Nguồn khác", drop: "Rơi", quest: "Nhiệm vụ", craft: "Chế tạo", shop: "Cửa hàng" },
        },
    },
    questsection: {
        title: "Biên niên sử JX3",
        keywords: "biên niên sử JX3,JX3BOX,cốt truyện chính,chương truyện,nhiệm vụ",
        description: "Biên niên sử JX3BOX sắp xếp cốt truyện chính và nội dung nhiệm vụ JX3 theo phiên bản và chương để tiện tra cứu.",
        detail: {
            title: "Chi tiết chương truyện",
            keywords: "chương truyện JX3,cốt truyện chính,nhiệm vụ,JX3BOX",
            description: "Xem nội dung cốt truyện của phiên bản và chương JX3 đã chọn.",
        },
        ui: {
            searchPlaceholder: "Tìm phiên bản hoặc chương",
            expand: "Mở rộng",
            collapse: "Thu gọn",
            feedback: "Báo lỗi",
            sectionTitle: "Chương {number}: {title}",
            loadMore: "Tải thêm",
            loading: "Đang tải...",
            loadFailed: "Tải thất bại. Vui lòng thử lại.",
            retry: "Thử lại",
            empty: "Chưa có nội dung",
            qqRobot: "Thêm bot QQ để xem hướng dẫn nhanh",
            copySuccess: "Đã sao chép",
        },
    },
    index: {
        title: "Chuyên mục giải trí",
        keywords:
            "JX3BOX leisure,JX3 adventure,reputation,books,exam,face data,body data,pet list,furniture list,horse list,homeland blueprints,QQBot",
        description:
            "JX3BOX cung cấp các nội dung giải trí và tra cứu: kỳ ngộ, danh vọng, sách, đề thi, mặt, vóc dáng, thú cưng, nội thất, tọa kỵ, bản thiết kế gia viên và QQBot.",
        ui: {
            categories: { share: "Sáng tạo của người chơi", rare: "Cẩm nang và bộ sưu tập", merchants: "Công cụ và thông tin" },
            menus: {
                face: "Dữ liệu khuôn mặt", body: "Dữ liệu vóc dáng", homeland: "Bản thiết kế gia viên",
                adventure: "Danh sách kỳ ngộ", pet: "Thú cưng", horse: "Tọa kỵ", furniture: "Nội thất",
                reputation: "Danh vọng", book: "Sách", treasure: "Cuộn kỳ ngộ", seniority: "Cẩm nang thành tựu",
                questsection: "Biên niên sử", partner: "Đồng hành", exam: "Cẩm nang thi", manufacture: "Trợ lý chế tạo",
                price: "Xu hướng giá", gonggao: "Thông báo sự kiện",
            },
        },
    },
    adventure: {
        title: "Danh sách kỳ ngộ",
        keywords: "JX3 adventure list,adventure guide,trigger,rewards,JX3BOX",
        description: "Danh sách kỳ ngộ với điều kiện kích hoạt, quy trình và phần thưởng.",
        single: {
            title: "Chi tiết kỳ ngộ",
            keywords: "JX3 adventure detail,trigger,rewards,JX3BOX",
            description: "Trang chi tiết kỳ ngộ với điều kiện và phần thưởng.",
        },
        treasure: {
            title: "Cuộn kỳ ngộ",
            keywords: "adventure scroll,collection,completion,JX3BOX",
            description: "Xem bộ sưu tập kỳ ngộ và tiến độ hoàn thành dạng cuộn.",
            landscape: {
                title: "Cuộn kỳ ngộ (Ngang)",
                keywords: "adventure scroll landscape,JX3BOX",
                description: "Phiên bản ngang cho cuộn kỳ ngộ.",
            },
            portrait: {
                title: "Cuộn kỳ ngộ (Dọc)",
                keywords: "adventure scroll portrait,JX3BOX",
                description: "Phiên bản dọc cho cuộn kỳ ngộ trên di động.",
            },
        },
    },
    faceBody: {
        roles: { all: "Tất cả", male: "Nam trưởng thành", female: "Nữ trưởng thành", boy: "Thiếu niên", girl: "Thiếu nữ" },
        actions: { parse: "Phân tích dữ liệu", publish: "Đăng tác phẩm", viewAll: "Xem tất cả", loadMore: "Tải thêm" },
        filters: { roleCategory: "Loại nhân vật", all: "Tất cả", conditions: "Bộ lọc", featured: "Nổi bật", free: "Miễn phí", recreatable: "Có thể tạo mới", images: "Hình ảnh", withImages: "Có hình" },
        search: { content: "nội dung", close: "Đóng", reset: "Đặt lại", select: "Vui lòng chọn", inputField: "Nhập {name}", selectField: "Chọn {name}", searchPlaceholder: "Tìm kiếm {name}" },
        card: { editorChoice: "Biên tập chọn", paid: "Trả phí", recommended: "Đề cử", anonymous: "Ẩn danh", realistic: "Thực", artistic: "Nghệ thuật", recreatable: "Tạo mới" },
        parse: { localOnly: "Chỉ phân tích cục bộ", complete: "Phân tích hoàn tất", compatibility: "Tương thích tệp", privacy: "Bảo mật", privacyDescription: "Tệp chỉ được đọc trong trình duyệt này và không được tải lên máy chủ", result: "Kết quả phân tích" },
    },
    body: {
        title: "Dữ liệu vóc dáng",
        keywords: "JX3 body data,body scale,JX3BOX",
        description: "Thư viện dữ liệu vóc dáng và tỉ lệ hiển thị.",
        single: {
            title: "Chi tiết vóc dáng",
            keywords: "JX3 body detail,body scale,JX3BOX",
            description: "Chi tiết một vóc dáng với dữ liệu và hiển thị.",
        },
        bodydata: {
            title: "Phân tích dữ liệu vóc dáng",
            keywords: "body data parser,JX3BOX",
            description: "Công cụ phân tích tham số vóc dáng.",
        },
        bodydatMobile: {
            title: "Phân tích vóc dáng (Di động)",
            keywords: "body parser mobile,JX3BOX",
            description: "Công cụ phân tích vóc dáng trên di động.",
        },
        ui: {
            sectionTitle: "Vóc dáng {role}", empty: "Không tìm thấy dữ liệu vóc dáng", emptySearch: "Không có dữ liệu vóc dáng phù hợp. Hãy thử bộ lọc hoặc từ khóa khác.",
            parse: { title: "Trình phân tích dữ liệu vóc dáng", description: "Đọc tệp cục bộ để xem nhanh thông số vóc dáng và các điều chỉnh", importTitle: "Nhập dữ liệu vóc dáng", importDescription: "Chọn tệp dữ liệu vóc dáng JX3; các thông số sẽ hiển thị bên dưới sau khi phân tích.", selectFile: "Chọn tệp dữ liệu vóc dáng", formats: "Hỗ trợ .dat và .jx3dat", guide: "Hướng dẫn nhập và xuất dữ liệu vóc dáng", compatibilityDescription: "Tự động nhận dạng loại nhân vật và tải phạm vi thông số tương ứng", resultDescription: "Chuyển danh mục để xem thông số vóc dáng và xuất dữ liệu khi cần." },
        },
    },
    book: {
        title: "Danh sách sách",
        keywords: "JX3 books,book list,JX3BOX",
        description: "Danh sách sách với vị trí và cách nhận.",
        single: {
            title: "Chi tiết sách",
            keywords: "book detail,book location,JX3BOX",
            description: "Trang chi tiết sách với vị trí và cách nhận.",
        },
    },
    exam: {
        title: "Bài kiểm tra JX3",
        keywords: "JX3 exam,question bank,practice,JX3BOX",
        description: "Kho câu hỏi, đề thi và luyện tập.",
        paper: {
            title: "Chi tiết đề thi",
            keywords: "exam paper,JX3BOX",
            description: "Chi tiết đề thi và danh sách câu hỏi.",
        },
        question: {
            title: "Chi tiết câu hỏi",
            keywords: "question detail,JX3BOX",
            description: "Chi tiết câu hỏi với đáp án và giải thích.",
        },
        questionPublish: {
            title: "Đăng câu hỏi",
            keywords: "publish question,JX3BOX",
            description: "Gửi câu hỏi mới vào ngân hàng.",
        },
        paperPublish: {
            title: "Đăng đề thi",
            keywords: "publish paper,JX3BOX",
            description: "Tạo và đăng đề thi.",
        },
        gameQuestionPublish: {
            title: "Đăng câu hỏi trò chơi",
            keywords: "publish game question,JX3BOX",
            description: "Gửi câu hỏi liên quan đến trò chơi.",
        },
    },
    face: {
        title: "Dữ liệu khuôn mặt",
        keywords: "JX3 face data,face presets,JX3BOX",
        description: "Thư viện dữ liệu khuôn mặt với preset và tải xuống.",
        single: {
            title: "Chi tiết khuôn mặt",
            keywords: "face detail,face params,JX3BOX",
            description: "Chi tiết dữ liệu khuôn mặt và thông số.",
        },
        facedata: {
            title: "Phân tích dữ liệu khuôn mặt",
            keywords: "face parser,JX3BOX",
            description: "Công cụ phân tích tham số khuôn mặt.",
        },
        faceDataMobile: {
            title: "Phân tích khuôn mặt (Di động)",
            keywords: "face parser mobile,JX3BOX",
            description: "Công cụ phân tích khuôn mặt trên di động.",
        },
        ui: {
            sectionTitle: "Khuôn mặt {role}", empty: "Không tìm thấy dữ liệu khuôn mặt", emptySearch: "Không có dữ liệu khuôn mặt phù hợp. Hãy thử bộ lọc hoặc từ khóa khác.",
            filters: { style: "Phong cách khuôn mặt", realistic: "Chân thực", artistic: "Nghệ thuật", faceCode: "Mã khuôn mặt" },
            parse: { title: "Trình phân tích dữ liệu khuôn mặt", description: "Đọc tệp cục bộ để xem cấu trúc khuôn mặt, trang điểm và thông số", importTitle: "Nhập dữ liệu khuôn mặt", importDescription: "Chọn tệp dữ liệu khuôn mặt JX3; các thông số sẽ hiển thị bên dưới sau khi phân tích.", selectFile: "Chọn tệp dữ liệu khuôn mặt", formats: "Hỗ trợ .dat, .jx3dat và .ini", guide: "Hướng dẫn nhập và xuất dữ liệu khuôn mặt", compatibilityDescription: "Hỗ trợ dữ liệu bản chính thức, bản hoài niệm và trình chỉnh sửa", resultDescription: "Chuyển danh mục để xem thông số khuôn mặt; thanh trượt chỉ minh họa vị trí thông số." },
        },
    },
    furniture: {
        title: "Danh sách nội thất",
        keywords: "JX3 furniture list,JX3BOX",
        description: "Danh sách nội thất và thông tin chi tiết.",
        single: {
            title: "Chi tiết nội thất",
            keywords: "furniture detail,JX3BOX",
            description: "Trang chi tiết nội thất.",
        },
    },
    homeland: {
        title: "Gia viên",
        keywords: "JX3 homeland,blueprints,maps,JX3BOX",
        description: "Gia viên: bản thiết kế, hướng dẫn và bản đồ.",
        tutorial: {
            title: "Hướng dẫn gia viên",
            keywords: "homeland tutorial,JX3BOX",
            description: "Hướng dẫn xây dựng và sử dụng gia viên.",
        },
        maps: {
            title: "Bản đồ gia viên",
            keywords: "homeland maps,JX3BOX",
            description: "Tham khảo bản đồ gia viên.",
        },
        flower: {
            title: "Hoa gia viên",
            keywords: "homeland flower,JX3BOX",
            description: "Trang tham khảo hoa gia viên.",
        },
    },
    horse: {
        title: "Danh sách tọa kỵ",
        keywords: "JX3 mount list,JX3BOX",
        description: "Danh sách tọa kỵ và thông tin chi tiết.",
        single: {
            title: "Chi tiết tọa kỵ",
            keywords: "mount detail,JX3BOX",
            description: "Trang chi tiết tọa kỵ.",
        },
    },
    pet: {
        title: "Danh sách thú cưng",
        keywords: "JX3 pet list,JX3BOX",
        description: "Danh sách thú cưng và thông tin chi tiết.",
        single: {
            title: "Chi tiết thú cưng",
            keywords: "pet detail,JX3BOX",
            description: "Trang chi tiết thú cưng.",
        },
        search: {
            title: "Tìm thú cưng",
            keywords: "pet search,JX3BOX",
            description: "Tìm thú cưng theo tên hoặc từ khóa.",
        },
    },
    pvg: {
        manufacture: {
            title: "Trợ lý chế tạo",
            keywords: "crafting assistant,JX3BOX",
            description: "Trợ lý chế tạo với công thức và nguyên liệu.",
        },
        price: {
            title: "Xu hướng giá",
            keywords: "price trends,market price,JX3BOX",
            description: "Theo dõi xu hướng giá thị trường.",
        },
        gonggao: {
            title: "Thông báo sự kiện",
            keywords: "event bulletin,calendar,JX3BOX",
            description: "Thông báo sự kiện với xem nhanh và lịch.",
            daily: {
                title: "Xem nhanh",
                keywords: "daily overview,JX3BOX",
                description: "Tổng quan sự kiện theo ngày.",
            },
            calendar: {
                title: "Lịch",
                keywords: "event calendar,JX3BOX",
                description: "Xem lịch sự kiện.",
            },
            server: {
                title: "Trạng thái máy chủ",
                keywords: "server status,JX3BOX",
                description: "Trạng thái mở máy chủ.",
            },
            single: {
                title: "Chi tiết lịch",
                keywords: "calendar detail,JX3BOX",
                description: "Chi tiết một mục trong lịch.",
            },
        },
    },
    qqbot: {
        pvx: {
            title: "QQBot PVX",
            keywords: "QQBot,PVX,JX3BOX",
            description: "Trang chi tiết tính năng QQBot PVX.",
        },
    },
    reputation: {
        title: "Danh vọng",
        keywords: "JX3 reputation list,JX3BOX",
        description: "Danh sách danh vọng và thông tin chi tiết.",
        single: {
            title: "Chi tiết danh vọng",
            keywords: "reputation detail,JX3BOX",
            description: "Trang chi tiết danh vọng.",
        },
        search: {
            title: "Tìm danh vọng",
            keywords: "reputation search,JX3BOX",
            description: "Tìm danh vọng theo tên hoặc từ khóa.",
        },
    },

    common: {
        appendTitle: " - JX3BOX",
    }
};
