/**
 * My attempt at a custom proxy
 * 
 * I never tested it if it works statically, so it was easier just not to implement
*/

import axios from "axios";
import * as cheerio from "cheerio";

interface WebsiteAsset {
    type: "html" | "css" | "js" | "iframe" | "other";
    url: string;
    content: string | null;
}

export interface FetchedWebsite {
    html: string;
    assets: WebsiteAsset[];
}

const absoluteUrl = (base: string, relative: string): string => {
    try {
        return new URL(relative, base).toString();
    } catch {
        return relative;
    }
};

export async function fetchWebsite(url: string): Promise<FetchedWebsite> {
    const assets: WebsiteAsset[] = [];

    let response;
    try {
        response = await axios.get(url);
    } catch (err) {
        throw new Error(`Failed to fetch main HTML: ${err}`);
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Fetch linked CSS
    const cssLinks = $("link[rel='stylesheet']")
        .map((_, el) => $(el).attr("href"))
        .get()
        .filter(Boolean);

    for (const href of cssLinks) {
        const fullUrl = absoluteUrl(url, href);
        try {
            const res = await axios.get(fullUrl);
            assets.push({
                type: "css",
                url: fullUrl,
                content: res.data,
            });
        } catch {
            assets.push({
                type: "css",
                url: fullUrl,
                content: null,
            });
        }
    }

    // Fetch external JS
    const jsLinks = $("script[src]")
        .map((_, el) => $(el).attr("src"))
        .get()
        .filter(Boolean);

    for (const src of jsLinks) {
        const fullUrl = absoluteUrl(url, src);
        try {
            const res = await axios.get(fullUrl);
            assets.push({
                type: "js",
                url: fullUrl,
                content: res.data,
            });
        } catch {
            assets.push({
                type: "js",
                url: fullUrl,
                content: null,
            });
        }
    }

    // Inline JS
    $("script:not([src])").each((_, el) => {
        assets.push({
            type: "js",
            url: url + "#inline-script",
            content: $(el).html() || "",
        });
    });

    // Iframes
    const iframeLinks = $("iframe[src]")
        .map((_, el) => $(el).attr("src"))
        .get()
        .filter(Boolean);

    for (const src of iframeLinks) {
        const fullUrl = absoluteUrl(url, src);
        try {
            const nested = await fetchWebsite(fullUrl);
            assets.push({
                type: "iframe",
                url: fullUrl,
                content: nested.html,
            });
            assets.push(...nested.assets); // include iframe's assets too
        } catch {
            assets.push({
                type: "iframe",
                url: fullUrl,
                content: null,
            });
        }
    }

    return {
        html,
        assets,
    };
}