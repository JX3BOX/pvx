export default {
    partner: {
        title: "Companions", keywords: "JX3 companions,partner skills,JX3BOX", description: "Companion profiles with recruitment, skills, realms, attributes and biographies.",
        detail: { title: "Companion Details", keywords: "JX3 companion details,JX3BOX", description: "View companion skills, attributes and biography." },
        ui: {
            searchPlaceholder: "Search companions", noMatchingPartners: "No matching companions", feedback: "Report an error", qqRobot: "Add the QQ bot for quick guides", copySuccess: "Copied",
            tabs: { info: "Information", bio: "Biography" }, sections: { introduction: "How to recruit", skills: "Skills", realms: "Skill Realms", attributes: "Attributes" },
            emptyPortrait: "No portrait", voiceText: "Voice lines (text only)", emptyBio: "No biography", emptyAttributes: "No attributes", emptyIntroduction: "No recruitment information", emptySkills: "No skill data",
            attributes: { quality: "Quality", rarity: "Rarity", kungfu: "Martial art type", nickname: "School" },
            quality: { 1: "White", 2: "Green", 3: "Blue", 4: "Purple", 5: "Orange" }, rarity: { 1: "Common", 2: "Rare", 3: "Epic", 4: "Legendary" },
            skillTypes: { passive: "Passive", active: "Active", martialArt: "Skill" }, kungfu: { 0: "General", 1: "Fist", 2: "Sword", 3: "Blade" }, unlockItems: "Unlock items", openSkillDatabase: "Open skill database", skillFallback: "Skill {id}", skillDescFallback: "No skill description",
            realmFallback: "Realm {stage}", realmSkillFallback: "Martial skill for realm {title}", itemLoading: "Loading item {id}...", itemFallback: "Item {id}", unknownItem: "Unknown item", timeLimit: "Time limit: {days} days", maxOwned: "Maximum owned: {count}",
            bindTypes: { tradeable: "Tradeable", untradeable: "Untradeable", bindOnPickup: "Binds on pickup", other: "Bind type {type}" },
            sources: { other: "Other sources", drop: "Drop", quest: "Quest", craft: "Crafting", shop: "Shop" },
        },
    },
    questsection: {
        title: "JX3 Story Archive",
        keywords: "JX3 story archive,JX3BOX story archive,main story,story chapters,quest story",
        description: "The JX3BOX Story Archive organizes JX3 main story and quest content by expansion and chapter for easy reference.",
        detail: {
            title: "Story Chapter Details",
            keywords: "JX3 story chapter,main story,quest story,JX3BOX story archive",
            description: "Read the story content for a selected JX3 expansion and chapter.",
        },
        ui: {
            searchPlaceholder: "Search chapters",
            expand: "Expand",
            collapse: "Collapse",
            feedback: "Report an error",
            sectionTitle: "Chapter {number}: {title}",
            loadMore: "Load more",
            loading: "Loading...",
            loadFailed: "Failed to load. Please try again.",
            retry: "Try again",
            empty: "No content available",
            qqRobot: "Add the QQ bot for quick guides",
            copySuccess: "Copied",
        },
    },
    index: {
        title: "Leisure",
        keywords:
            "JX3BOX leisure,JX3 leisure,adventure list,reputation list,book list,exam,face data,body data,pet list,furniture list,horse list,homeland blueprints,QQBot",
        description:
            "JX3BOX leisure hub for casual gameplay and data lookup, covering adventures, business, reputation, books, exams, face data, body data, pets, furniture, mounts, homeland blueprints and QQBot.",
        ui: {
            categories: { share: "Player Creations", rare: "Guides & Collections", merchants: "Tools & Information" },
            menus: {
                face: "Face Data", body: "Body Data", homeland: "Homeland Blueprints",
                adventure: "Adventures", pet: "Pets", horse: "Mounts", furniture: "Furniture",
                reputation: "Reputations", book: "Books", treasure: "Adventure Scroll", seniority: "Achievement Guide",
                questsection: "Story Archive", partner: "Companions", exam: "Exam Guide", manufacture: "Crafting Assistant",
                price: "Price Trends", gonggao: "Event Bulletin",
            },
        },
    },
    adventure: {
        title: "Adventure List",
        keywords:
            "JX3 adventure list,JX3BOX adventure,adventure guide,trigger conditions,adventure rewards",
        description:
            "JX3BOX Adventure List with triggers, steps and rewards for all adventures.",
        single: {
            title: "Adventure Detail",
            keywords: "JX3 adventure detail,adventure guide,trigger conditions,rewards,JX3BOX",
            description: "Adventure detail page with triggers, steps and rewards.",
        },
        treasure: {
            title: "Adventure Scroll",
            keywords: "JX3 adventure scroll,collection,completion,share,JX3BOX",
            description:
                "Adventure Scroll to view your collected adventures and completion in a scroll-style view for sharing.",
            landscape: {
                title: "Adventure Scroll (Landscape)",
                keywords: "adventure scroll landscape,JX3BOX",
                description: "Landscape view for Adventure Scroll and completion display.",
            },
            portrait: {
                title: "Adventure Scroll (Portrait)",
                keywords: "adventure scroll portrait,JX3BOX",
                description: "Portrait view for Adventure Scroll on mobile.",
            },
        },
    },
    faceBody: {
        roles: { all: "All", male: "Male", female: "Female", boy: "Boy", girl: "Girl" },
        actions: { parse: "Data Parser", publish: "Publish", viewAll: "View All", loadMore: "Load More" },
        filters: { roleCategory: "Character Type", all: "All", conditions: "Filters", featured: "Featured", free: "Free", recreatable: "Recreatable", images: "Images", withImages: "With Images" },
        search: { content: "content", close: "Close", reset: "Reset", select: "Please select", inputField: "Enter {name}", selectField: "Select {name}", searchPlaceholder: "Search {name}" },
        card: { editorChoice: "Editor's Pick", paid: "Paid", recommended: "Pick", anonymous: "Anonymous", realistic: "Real", artistic: "Stylized", recreatable: "Remake" },
        parse: { localOnly: "Parsed locally only", complete: "Parsing complete", compatibility: "Compatibility", privacy: "Privacy", privacyDescription: "Files are read only in this browser and are never uploaded", result: "Parsed Result" },
    },
    body: {
        title: "Body Data",
        keywords: "JX3 body data,body scale,body display,JX3BOX",
        description: "Body data library with body scale and display references.",
        single: {
            title: "Body Detail",
            keywords: "JX3 body detail,body scale,JX3BOX",
            description: "Single body detail with data and display references.",
        },
        bodydata: {
            title: "Body Data Parser",
            keywords: "JX3 body parser,body parameters,JX3BOX",
            description: "Tool to parse and view JX3 body parameter data.",
        },
        bodydatMobile: {
            title: "Body Data Parser (Mobile)",
            keywords: "JX3 body parser mobile,JX3BOX",
            description: "Mobile body data parser for JX3 body parameters.",
        },
        ui: {
            sectionTitle: "{role} Body Types", empty: "No body data found", emptySearch: "No matching body data. Try different filters or keywords.",
            parse: { title: "Body Data Parser", description: "Read a local file to inspect body parameters and adjustments", importTitle: "Import Body Data", importDescription: "Choose a JX3 body data file. Parsed parameters will appear below.", selectFile: "Choose a body data file", formats: "Supports .dat and .jx3dat", guide: "Body Data Import & Export Guide", compatibilityDescription: "Automatically detects the character type and loads its parameter ranges", resultDescription: "Switch categories to inspect body parameters and export the data when needed." },
        },
    },
    book: {
        title: "Book List",
        keywords: "JX3 books,JX3 book list,book locations,JX3BOX",
        description: "Book list with names, locations and background info.",
        single: {
            title: "Book Detail",
            keywords: "JX3 book detail,book location,JX3BOX",
            description: "Single book detail with location and acquisition info.",
        },
    },
    exam: {
        title: "JX3 Exam",
        keywords: "JX3 exam,question bank,practice,JX3BOX",
        description: "Exam hub with question bank, papers and practice.",
        paper: {
            title: "Paper Detail",
            keywords: "JX3 exam paper,practice,JX3BOX",
            description: "Exam paper detail with questions and info.",
        },
        question: {
            title: "Question Detail",
            keywords: "JX3 question detail,JX3BOX",
            description: "Single question detail with answers and explanations.",
        },
        questionPublish: {
            title: "Publish Question",
            keywords: "JX3 publish question,JX3BOX",
            description: "Submit new questions to enrich the question bank.",
        },
        paperPublish: {
            title: "Publish Paper",
            keywords: "JX3 publish paper,JX3BOX",
            description: "Create and publish exam papers.",
        },
        gameQuestionPublish: {
            title: "Publish Game Question",
            keywords: "JX3 publish game question,JX3BOX",
            description: "Submit game-related questions for the community bank.",
        },
    },
    face: {
        title: "Face Data",
        keywords: "JX3 face data,face presets,JX3BOX",
        description: "Face data library with presets and downloads.",
        single: {
            title: "Face Detail",
            keywords: "JX3 face detail,face params,JX3BOX",
            description: "Single face detail with preview and params.",
        },
        facedata: {
            title: "Face Data Parser",
            keywords: "JX3 face parser,JX3BOX",
            description: "Tool to parse and view face parameter data.",
        },
        faceDataMobile: {
            title: "Face Data Parser (Mobile)",
            keywords: "JX3 face parser mobile,JX3BOX",
            description: "Mobile face data parser for face parameters.",
        },
        ui: {
            sectionTitle: "{role} Faces", empty: "No face data found", emptySearch: "No matching face data. Try different filters or keywords.",
            filters: { style: "Face Style", realistic: "Realistic", artistic: "Artistic", faceCode: "Face Code" },
            parse: { title: "Face Data Parser", description: "Read a local file to inspect facial structure, makeup, and parameters", importTitle: "Import Face Data", importDescription: "Choose a JX3 face data file. Parsed parameters will appear below.", selectFile: "Choose a face data file", formats: "Supports .dat, .jx3dat, and .ini", guide: "Face Data Import & Export Guide", compatibilityDescription: "Supports standard, legacy, and editor face data", resultDescription: "Switch categories to inspect face parameters; sliders visualize parameter positions only." },
        },
    },
    furniture: {
        title: "Furniture List",
        keywords: "JX3 furniture list,homeland furniture,JX3BOX",
        description: "Furniture list with item details and references.",
        single: {
            title: "Furniture Detail",
            keywords: "JX3 furniture detail,JX3BOX",
            description: "Single furniture detail page.",
        },
    },
    homeland: {
        title: "Homeland",
        keywords: "JX3 homeland,blueprints,homeland maps,JX3BOX",
        description: "Homeland hub with blueprints, tutorials and maps.",
        tutorial: {
            title: "Homeland Tutorial",
            keywords: "JX3 homeland tutorial,JX3BOX",
            description: "Tutorials for homeland building and usage.",
        },
        maps: {
            title: "Homeland Maps",
            keywords: "JX3 homeland maps,JX3BOX",
            description: "Homeland map references and locations.",
        },
        flower: {
            title: "Homeland Flower",
            keywords: "JX3 homeland flower,JX3BOX",
            description: "Homeland flower reference page.",
        },
    },
    horse: {
        title: "Mount List",
        keywords: "JX3 mount list,JX3 horse list,JX3BOX",
        description: "Mount list with details and references.",
        single: {
            title: "Mount Detail",
            keywords: "JX3 mount detail,JX3BOX",
            description: "Single mount detail page.",
        },
    },
    pet: {
        title: "Pet List",
        keywords: "JX3 pet list,JX3BOX",
        description: "Pet list with details and references.",
        single: {
            title: "Pet Detail",
            keywords: "JX3 pet detail,JX3BOX",
            description: "Single pet detail page.",
        },
        search: {
            title: "Pet Search",
            keywords: "JX3 pet search,JX3BOX",
            description: "Search pets by name or keywords.",
        },
    },
    pvg: {
        manufacture: {
            title: "Crafting Assistant",
            keywords: "JX3 crafting assistant,manufacture,JX3BOX",
            description: "Crafting assistant for recipes and materials.",
        },
        price: {
            title: "Price Trends",
            keywords: "JX3 price trends,market price,JX3BOX",
            description: "Market price trend tracking and analysis.",
        },
        gonggao: {
            title: "Event Bulletin",
            keywords: "JX3 event bulletin,JX3BOX",
            description: "Event bulletin with daily view and calendar.",
            daily: {
                title: "Daily Overview",
                keywords: "JX3 daily overview,JX3BOX",
                description: "Daily event overview.",
            },
            calendar: {
                title: "Calendar",
                keywords: "JX3 event calendar,JX3BOX",
                description: "Event calendar view.",
            },
            server: {
                title: "Server Status",
                keywords: "JX3 server status,JX3BOX",
                description: "Server open status.",
            },
            single: {
                title: "Calendar Detail",
                keywords: "JX3 calendar detail,JX3BOX",
                description: "Single calendar entry detail.",
            },
        },
    },
    qqbot: {
        pvx: {
            title: "QQBot PVX",
            keywords: "JX3 QQBot,PVX,JX3BOX",
            description: "QQBot PVX feature detail page.",
        },
    },
    reputation: {
        title: "Reputation",
        keywords: "JX3 reputation list,JX3BOX",
        description: "Reputation list with details and references.",
        single: {
            title: "Reputation Detail",
            keywords: "JX3 reputation detail,JX3BOX",
            description: "Single reputation detail page.",
        },
        search: {
            title: "Reputation Search",
            keywords: "JX3 reputation search,JX3BOX",
            description: "Search reputations by name or keywords.",
        },
    },

    common: {
        appendTitle: " - JX3BOX",
    }
};
