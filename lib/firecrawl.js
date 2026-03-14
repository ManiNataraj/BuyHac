import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrapeproduct(url) {
    try {
        const result = await firecrawl.scrape(url,{
            formats: [{type : "json",
                schema: {
                type: "object",
                required: ["productName", "currentPrice"],
                properties: {
                    productName: {
                        "type": "string"
                    },
                    currentPrice: {
                        "type": "number"
                    },
                    currencyCode: {
                        "type": "string"
                    },
                    productimageUrl: {
                        "type": "string"
                    }
                }
            },
            prompt: "extract product as 'productName' current price as 'currentPrice' currency code(USD,INR) as 'currencyCode' and productimageurl  as 'productimageUrl' if available"},
],
        });

        const extractedData = result.json;
        if (!extractedData.productName || !extractedData.currentPrice) {
            throw new Error("Missing required productName or currentPrice in scraped data");
        }
        return extractedData;
    } catch (error) {
        console.error("Error crawling product:", error);
        throw new Error(`Failed to crawl product: ${error.message}`);
    }
}