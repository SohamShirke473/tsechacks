import { mutation } from "./_generated/server";
import { v } from "convex/values";

const BLOG_DATA = [
    {
        "title": "Soil pH and Its Role in Agriculture",
        "url": "https://woodvinegaragri.com/blog/soil-ph/",
        "tags": ["soil pH", "nutrient availability", "crop yields", "soil management"],
        "category": "Shifting pH Levels",
        "summary": "Explains how different crops require specific soil pH ranges, how pH controls access to N, P, K, and practical ways to measure and adjust pH, including wood vinegar as a sustainable amendment.",
        "suggested_headings": [
            "Why Soil pH Matters for Crops",
            "Optimal pH Ranges for Major Crops",
            "Methods to Measure Soil pH",
            "Amendments for Correcting Soil pH"
        ]
    },
    {
        "title": "Success Stories: Growing Solutions to Soil pH Challenges",
        "url": "https://understandingag.com/understanding-ph-success-stories-growing-sollutions-to-soil-ph-challenges/",
        "tags": ["soil pH", "regenerative agriculture", "adaptive grazing", "case studies"],
        "category": "Shifting pH Levels",
        "summary": "Shares farmer case studies where adaptive multi‑paddock grazing raised acidic soil pH without lime, improving organic matter and overall soil health.",
        "suggested_headings": [
            "Farmers’ Experiences with Low pH Soils",
            "Adaptive Grazing and pH Balancing",
            "Soil Organic Matter and pH Stability",
            "Lessons for Regenerative Management"
        ]
    },
    {
        "title": "The Effect of Soil pH on Plants",
        "url": "https://www.southlandorganics.com/blogs/news/the-effect-of-soil-ph-on-plants",
        "tags": ["soil pH", "plant health", "lime application", "soil acidity"],
        "category": "Shifting pH Levels",
        "summary": "Describes how pH affects nutrient solubility, plant performance, and microbial activity, and outlines strategies to raise or lower soil pH with lime and other inputs.",
        "suggested_headings": [
            "How pH Influences Plant Nutrition",
            "Causes of Changing Soil pH",
            "Raising Acidic Soil pH with Lime",
            "Managing Alkaline Soils"
        ]
    },
    {
        "title": "Soil pH and Plant Growth",
        "url": "https://extension.unh.edu/blog/2025/08/soil-ph-plant-growth",
        "tags": ["soil pH", "extension", "nutrient availability", "plant growth"],
        "category": "Shifting pH Levels",
        "summary": "Extension‑style overview of how soil pH alters nutrient form and microbial processes, affecting plant growth and fertilizer efficiency.",
        "suggested_headings": [
            "Understanding the pH Scale in Soils",
            "pH Effects on Nutrient Availability",
            "Diagnosing pH‑Related Deficiencies",
            "Adjusting pH for Garden and Field Crops"
        ]
    },
    {
        "title": "The Role of Soil pH in Agriculture",
        "url": "https://krishibazaar.in/blog/the-role-of-soil-ph-in-agriculture",
        "tags": ["soil pH", "Indian agriculture", "sulfur", "organic matter"],
        "category": "Shifting pH Levels",
        "summary": "Focuses on pH management in agricultural fields, covering sulfur application for alkaline soils and organic matter incorporation to buffer pH and improve structure.",
        "suggested_headings": [
            "Soil pH and Crop Productivity",
            "Lowering pH with Sulfur in Alkaline Soils",
            "Using Organic Matter as a pH Buffer",
            "Best Practices for Indian Farmers"
        ]
    },
    {
        "title": "Importance of Soil pH in Agriculture",
        "url": "https://agriplanting.com/importance-of-soil-ph-in-agriculture/",
        "tags": ["soil pH", "acidic soils", "lime", "compost"],
        "category": "Shifting pH Levels",
        "summary": "Explains why maintaining optimal pH is critical and provides management options such as liming acidic soils, adding compost, and selecting pH‑tolerant crops.",
        "suggested_headings": [
            "Impacts of pH on Farm Profitability",
            "Management of Acidic Soils",
            "Role of Compost and Manure in pH Stability",
            "Crop Choices for Different pH Ranges"
        ]
    },
    {
        "title": "Soil pH – The Biggest Influence on Productivity",
        "url": "https://omya-agriculture.com/us/technical/soil-ph-the-biggest-influence-on-productivity/",
        "tags": ["soil pH", "productivity", "liming", "soil health"],
        "category": "Shifting pH Levels",
        "summary": "Argues that pH is a key driver of yield and quality, discussing how careful pH management underpins soil vitality and profitable farming.",
        "suggested_headings": [
            "Why pH Underpins Farm Profitability",
            "pH Effects on Soil Biology and Chemistry",
            "Planning a Liming Program",
            "Long‑Term pH Monitoring Strategies"
        ]
    },
    {
        "title": "Soil pH | Nutrient Management",
        "url": "https://www.cropnutrition.com/nutrient-management/soil-ph/",
        "tags": ["soil pH", "nutrient management", "fertilizer efficiency"],
        "category": "Shifting pH Levels",
        "summary": "Provides a concise explanation of the pH scale, optimal ranges for most crops, and implications for nutrient management and fertilizer performance.",
        "suggested_headings": [
            "Defining Soil pH in the Field",
            "Optimal pH Ranges for Common Crops",
            "Fertilizer Efficiency and pH",
            "Sampling and Testing Protocols"
        ]
    },
    {
        "title": "Aridity and Reduced Soil Micronutrient Availability in Global Drylands",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6522359/",
        "tags": ["micronutrients", "aridity", "soil pH", "drylands"],
        "category": "Mineral Depletion & Drought",
        "summary": "Shows that increasing aridity indirectly raises soil pH and reduces availability of micronutrients like Fe and Zn in drylands, threatening food production.",
        "suggested_headings": [
            "Aridity Trends in Global Drylands",
            "Mechanisms Linking Aridity, pH, and Micronutrients",
            "Implications for Crop Nutrition",
            "Management Options in Dry Environments"
        ]
    },
    {
        "title": "Soil Health Challenges in 2025: Climate Change, Policy, and Sustainable Farming",
        "url": "https://agrierp.com/blog/soil-health-climate-policy-sustainable-farming/",
        "tags": ["soil health", "climate change", "nutrient loss", "policy"],
        "category": "Mineral Depletion & Drought",
        "summary": "Discusses how climate extremes accelerate soil structure breakdown and nutrient loss, with macro‑ and micronutrient depletion highlighted as emerging crises.",
        "suggested_headings": [
            "Climate Change Pressures on Soil",
            "Vanishing Nutrients Beneath the Surface",
            "Soil Health Practices for Resilience",
            "Policy Efforts to Support Soil Stewardship"
        ]
    },
    {
        "title": "Mineral Depletion in the Soil Directly Impacts Your Health!",
        "url": "https://www.johnandbobs.com/blogs/news/16705388-mineral-depletion-in-the-soil-directly-impacts-your-health",
        "tags": ["mineral depletion", "human health", "soil nutrients"],
        "category": "Mineral Depletion",
        "summary": "Links declining soil mineral levels to a wide spectrum of human health conditions, emphasizing the importance of nutrient‑rich soils for food quality.",
        "suggested_headings": [
            "From Soil Minerals to Human Health",
            "Health Conditions Associated with Mineral Deficiency",
            "Restoring Mineral‑Rich Soils",
            "Soil Amendments and Biological Inputs"
        ]
    },
    {
        "title": "Roots of Resilience: Soil Health and Climate Change",
        "url": "https://www.coalitionforsoilhealth.org/news/op-ed-roots-of-resilience-soil-health-and-climate-change",
        "tags": ["soil health", "climate resilience", "drought", "policy"],
        "category": "Drought Risks",
        "summary": "Explores how improving soil health enhances resilience to climate‑driven extremes such as drought and flooding, and outlines supporting legislation.",
        "suggested_headings": [
            "Soil Health as Climate Adaptation",
            "Water Retention and Drought Buffering",
            "Carbon Sequestration and Biodiversity",
            "Legislative Support for Soil Practices"
        ]
    },
    {
        "title": "Mineral-Associated Soil Carbon Is Resistant to Drought but ...",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5840236/",
        "tags": ["soil carbon", "drought", "microbial activity", "organo‑mineral complexes"],
        "category": "Drought Risks",
        "summary": "Examines how drought reduces plant inputs and microbial activity, affecting different soil carbon pools and their stability under drying–rewetting cycles.",
        "suggested_headings": [
            "How Drought Alters Soil Carbon Cycling",
            "Microbial Biomass and Moisture Relationships",
            "Particulate vs Mineral‑Associated Carbon",
            "Implications for Long‑Term Soil Fertility"
        ]
    },
    {
        "title": "Drought May Exacerbate Dryland Soil Inorganic Carbon Loss",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10799000/",
        "tags": ["drought", "soil inorganic carbon", "pH", "drylands"],
        "category": "Drought Risks",
        "summary": "Finds that moisture changes alter temperature sensitivity of soil inorganic and organic carbon, with drought enhancing alkalinity and potential inorganic carbon loss.",
        "suggested_headings": [
            "Soil Inorganic vs Organic Carbon in Drylands",
            "Moisture and Temperature Sensitivity of Carbon Pools",
            "Role of pH and Base Cations",
            "Future Drought Scenarios for Dryland Soils"
        ]
    },
    {
        "title": "Chronic Drought Alters Extractable Concentrations of Soil Elements",
        "url": "https://www.sciencedirect.com/science/article/abs/pii/S0048969723056899",
        "tags": ["chronic drought", "soil elements", "nutrient dynamics"],
        "category": "Mineral Depletion & Drought",
        "summary": "Reports that chronic drought significantly changes extractable soil element concentrations, with strong seasonal patterns in nutrient availability.",
        "suggested_headings": [
            "Experimental Evidence on Chronic Drought",
            "Seasonal Shifts in Soil Element Availability",
            "Consequences for Plant Nutrition",
            "Management Strategies Under Prolonged Drying"
        ]
    },
    {
        "title": "How Climate Change Is Pressuring Soil",
        "url": "https://agrierp.com/blog/soil-health-climate-policy-sustainable-farming/",
        "tags": ["climate change", "soil structure", "water retention"],
        "category": "Drought Risks",
        "summary": "Highlights how warmer temperatures and erratic rainfall patterns degrade soil structure, affecting water storage and increasing vulnerability to drought.",
        "suggested_headings": [
            "Temperature Extremes and Soil Structure",
            "Rainfall Variability and Erosion",
            "Impact on Soil Water Holding Capacity",
            "Building Climate‑Smart Soils"
        ]
    },
    {
        "title": "Crisis Beneath the Surface: Vanishing Nutrients",
        "url": "https://agrierp.com/blog/soil-health-climate-policy-sustainable-farming/",
        "tags": ["nutrient depletion", "fertilizer imbalance", "micronutrients"],
        "category": "Mineral Depletion",
        "summary": "Describes how chronic overuse of fertilizers leads to imbalances in N, P, K and the decline of micronutrients like zinc and boron in agricultural soils.",
        "suggested_headings": [
            "Historical Fertilizer Use and Imbalances",
            "Macronutrient Surplus vs Micronutrient Deficit",
            "Recognizing Hidden Hunger in Crops",
            "Restoring Balanced Nutrient Profiles"
        ]
    },
    {
        "title": "Changes in Soil pH Under Increasing Aridity",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6522359/",
        "tags": ["aridity", "pH shift", "micronutrient stoichiometry"],
        "category": "Shifting pH Levels",
        "summary": "Shows that drylands tend to accumulate soluble salts and carbonates, leading to higher pH and altered micronutrient ratios such as Fe:Zn under rising aridity.",
        "suggested_headings": [
            "Soil Chemical Changes in Drylands",
            "pH Rise and Salt Accumulation",
            "Fe:Zn and Other Micronutrient Ratios",
            "Managing Micronutrients in Alkaline Dry Soils"
        ]
    },
    {
        "title": "Soil Health as a Buffer Against Drought",
        "url": "https://www.coalitionforsoilhealth.org/news/op-ed-roots-of-resilience-soil-health-and-climate-change",
        "tags": ["drought resilience", "cover crops", "organic matter"],
        "category": "Drought Risks",
        "summary": "Emphasizes that practices improving organic matter and aggregation increase water retention and help farms better withstand drought periods.",
        "suggested_headings": [
            "Organic Matter and Water Holding Capacity",
            "Cover Crops and Root Systems",
            "Reducing Drought Risk with Soil Biology",
            "Policy Incentives for Resilient Practices"
        ]
    },
    {
        "title": "Soil pH, Water Stress, and Microbial Activity",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5840236/",
        "tags": ["soil pH", "drought", "microbes"],
        "category": "Shifting pH Levels & Drought",
        "summary": "Discusses how water stress constrains substrate diffusion and microbial processes, interacting with pH to influence decomposition and carbon stabilization.",
        "suggested_headings": [
            "Microbial Responses to Drying–Rewetting",
            "Interactions Between pH and Moisture",
            "Consequences for Nutrient Cycling",
            "Research Gaps in Soil Microbial Ecology"
        ]
    },
    {
        "title": "Forecasted Increases in Aridity and Soil Metal Bioavailability",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6522359/",
        "tags": ["climate projections", "micronutrient bioavailability", "dryland agriculture"],
        "category": "Mineral Depletion & Drought",
        "summary": "Argues that climate‑driven aridity will further limit micronutrient availability, compounding other stresses like reduced water and threatening dryland food production.",
        "suggested_headings": [
            "Projected Aridity under Climate Change",
            "Micronutrient Constraints in Future Drylands",
            "Impacts on Food Production Systems",
            "Adaptation Pathways for Farmers"
        ]
    },
    {
        "title": "Soil pH Management in Rice Agroecosystems",
        "url": "https://www.coalitionforsoilhealth.org/news/op-ed-roots-of-resilience-soil-health-and-climate-change",
        "tags": ["pH fluctuations", "flooding", "methane emissions", "rice systems"],
        "category": "Shifting pH Levels",
        "summary": "Notes how flooding induces anaerobic processes in soils, impacting organic matter decomposition, greenhouse gas emissions, and indirectly pH dynamics in rice systems.",
        "suggested_headings": [
            "Flooded Soils and Redox Changes",
            "Implications for pH and Nutrient Forms",
            "Methane Production in Paddy Fields",
            "Balancing Productivity and Emissions"
        ]
    },
    {
        "title": "Soil Nutrient Management in the Face of Climate Extremes",
        "url": "https://agrierp.com/blog/soil-health-climate-policy-sustainable-farming/",
        "tags": ["nutrient management", "extreme weather", "soil conservation"],
        "category": "Mineral Depletion & Drought",
        "summary": "Outlines strategies such as diversified rotations and reduced tillage to maintain nutrient levels and soil structure under increasingly erratic climate conditions.",
        "suggested_headings": [
            "Extreme Weather and Nutrient Loss Pathways",
            "Conservation Tillage and Residue Retention",
            "Rotations for Nutrient Cycling",
            "Integrating Policies and On‑Farm Practices"
        ]
    },
    {
        "title": "Soil pH, Base Cations, and Carbon Dynamics Under Drought",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10799000/",
        "tags": ["base cations", "pH", "carbon loss", "drought"],
        "category": "Shifting pH Levels & Drought",
        "summary": "Shows that pH and base cations regulate the temperature sensitivity of soil inorganic carbon, with drought‑induced alkalinity amplifying warming‑related losses.",
        "suggested_headings": [
            "Regulation of Soil Inorganic Carbon by pH",
            "Base Cations and Temperature Sensitivity",
            "Drought‑Enhanced Carbon Loss Pathways",
            "Implications for Carbon Budgets in Drylands"
        ]
    },
    {
        "title": "Drylands, Soil Organic Matter, and pH",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6522359/",
        "tags": ["soil organic matter", "drylands", "pH", "salts"],
        "category": "Shifting pH Levels & Mineral Depletion",
        "summary": "Notes that drylands often have low organic matter and higher pH due to salt and carbonate accumulation, altering nutrient retention and cycling.",
        "suggested_headings": [
            "Soil Organic Matter Stocks in Drylands",
            "Salt and Carbonate Accumulation Processes",
            "Effects on Nutrient Retention and Availability",
            "Management of SOM and pH in Arid Regions"
        ]
    },
    {
        "title": "Drought, Root Exudates, and Microbial Biomass Carbon",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5840236/",
        "tags": ["root exudates", "microbial biomass", "drought stress"],
        "category": "Drought Risks",
        "summary": "Shows that drought reduces root exudate flux and microbial biomass, with soil moisture strongly controlling microbial biomass carbon.",
        "suggested_headings": [
            "Root‑Derived Carbon Inputs Under Drought",
            "Microbial Biomass Responses to Moisture",
            "Rewetting Pulses and Decomposition",
            "Consequences for Long‑Term Soil Fertility"
        ]
    }
];

export const seed = mutation({
    args: {
        reset: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Create a default board if none exists
        const existingBoard = await ctx.db.query("kanbanBoards").first();
        let boardId = existingBoard?._id;

        if (!boardId) {
            boardId = await ctx.db.insert("kanbanBoards", {
                name: "Soil Research",
                description: "Research tasks and blog posts",
                createdAt: Date.now(),
            });
        } else if (args.reset) {
            // Delete existing tasks if reset is requested
            const existingTasks = await ctx.db.query("kanbanTasks").collect();
            for (const task of existingTasks) {
                await ctx.db.delete(task._id);
            }
            // Delete existing columns if reset is requested
            const existingColumns = await ctx.db.query("kanbanColumns").collect();
            for (const column of existingColumns) {
                await ctx.db.delete(column._id);
            }
        }

        // Group blogs by category
        const columnsData: Record<string, typeof BLOG_DATA> = {};
        for (const blog of BLOG_DATA) {
            if (!columnsData[blog.category]) {
                columnsData[blog.category] = [];
            }
            columnsData[blog.category].push(blog);
        }

        let columnOrder = 0;
        for (const [category, blogs] of Object.entries(columnsData)) {
            // Check if column exists
            const existingColumn = await ctx.db
                .query("kanbanColumns")
                .withIndex("by_board", (q) => q.eq("boardId", boardId!))
                .filter((q) => q.eq(q.field("title"), category))
                .first();

            let columnId = existingColumn?._id;

            if (!columnId) {
                columnId = await ctx.db.insert("kanbanColumns", {
                    boardId: boardId!,
                    title: category,
                    order: columnOrder++,
                });
            }

            // Insert tasks
            let taskOrder = 0;
            for (const blog of blogs) {
                // Check if task exists (optional, mostly for non-reset seeding)
                // For simplicity, we just insert if we're not checking duplicates strictly or if we reset.
                // But let's check title just in case to avoid duplicates on re-runs without reset.
                const existingTask = await ctx.db
                    .query("kanbanTasks")
                    .withIndex("by_column", (q) => q.eq("columnId", columnId!))
                    .filter((q) => q.eq(q.field("title"), blog.title))
                    .first();

                if (!existingTask) {
                    await ctx.db.insert("kanbanTasks", {
                        columnId: columnId!,
                        title: blog.title,
                        description: blog.summary,
                        priority: "medium", // Default
                        order: taskOrder++,
                        url: blog.url,
                        tags: blog.tags,
                        suggestedHeadings: blog.suggested_headings,
                        aiGenerated: false
                    });
                }
            }
        }
    },
});
