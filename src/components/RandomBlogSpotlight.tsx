"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BookOpen } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface BlogPost {
    title: string;
    url: string;
    source: string;
    snippet: string;
}


const BLOG_POSTS: BlogPost[] = [
    {

        title: "Deep Learning for Plant Disease Detection",
        url: "https://ijisae.org/index.php/IJISAE/article/view/5245",
        source: "IJISAE",
        snippet: "Explores the use of CNNs and other deep learning architectures to accurately identify and classify plant diseases from leaf images."
    },
    {
        title: "Climate Change Impact on Forest Ecosystems",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0013935123023411",
        source: "ScienceDirect",
        snippet: "Analyzes how rising temperatures and shifting precipitation patterns are altering forest composition, growth rates, and carbon storage capacity."
    },
    {
        title: "Drought Effects on Forest Productivity",
        url: "https://cid-inc.com/blog/drought-effects-on-forest-productivity/",
        source: "CID Bio-Science",
        snippet: "Discusses the physiological mechanisms trees use to cope with water stress and the long-term impacts of drought on wood production."
    },
    {
        title: "Remote Sensing for Forest Fire Detection",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9076366/",
        source: "NCBI PMC",
        snippet: "Reviews satellite and drone-based technologies for early detection of forest fires, focusing on thermal imaging and smoke detection algorithms."
    },
    {
        title: "Forest Management and Climate Adaptation",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S037811272200069X",
        source: "ScienceDirect",
        snippet: "Evaluates silvicultural strategies to enhance forest resilience against climate change, including assisted migration and mixed-species planting."
    },
    {
        title: "Fire Effects on Trees and Forests",
        url: "https://www.fs.usda.gov/sites/default/files/GTR-WO-93a.pdf",
        source: "USDA Forest Service",
        snippet: "A comprehensive guide on fire ecology, detailing how different tree species resist or adapt to fire and the role of fire in forest succession."
    },
    {
        title: "Modern Forestry Engineering Challenges",
        url: "https://sciendo.com/article/10.2478/ffp-2024-0007",
        source: "Sciendo",
        snippet: "Addresses engineering hurdles in sustainable logging, road construction, and the integration of automation in forestry operations."
    },
    {
        title: "Machine Learning in Precision Forestry",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S2352938524000521",
        source: "ScienceDirect",
        snippet: "Surveys applications of ML in forest inventory, yield prediction, and optimizing harvest logistics for precision forestry."
    },
    {
        title: "Disasters and Forest Fires: Background Paper",
        url: "https://www.un.org/esa/forests/wp-content/uploads/2021/03/UNFF16-Bkgd-paper-disasters-forest-fires.pdf",
        source: "UN Forum on Forests",
        snippet: "Provides global context on the increasing frequency of forest fires and other disasters, emphasizing the need for international cooperation."
    },
    {
        title: "Global Assessment of Forest Fires 2021",
        url: "https://www.un.org/esa/forests/wp-content/uploads/2021/08/UNFF16-Bkgd-paper-disasters-forest-fires_052021.pdf",
        source: "UN Forum on Forests",
        snippet: "A statistical report on recent fire seasons, assessing socio-economic impacts and effectiveness of current fire management policies."
    }
];

export function RandomBlogSpotlight() {
    const [randomBlog, setRandomBlog] = useState<BlogPost | null>(null);

    useEffect(() => {
        // Select a random blog post only on the client side to match hydration
        const randomIndex = Math.floor(Math.random() * BLOG_POSTS.length);
        setRandomBlog(BLOG_POSTS[randomIndex]);
    }, []);

    if (!randomBlog) {
        return null;
    }

    return (
        <Card className="mt-6 border-l-4 border-l-emerald-600 border-t border-r border-b border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Research Spotlight
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-medium text-slate-900 leading-tight">
                            {randomBlog.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-semibold">
                            Source: {randomBlog.source}
                        </p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                            {randomBlog.snippet}
                        </p>
                    </div>

                    <a
                        href={randomBlog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "w-full justify-between bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                        )}
                    >
                        Read Article
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
