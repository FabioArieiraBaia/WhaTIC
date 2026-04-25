const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching puppeteer...");
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    
    console.log("Navigating to search URL...");
    await page.goto("https://www.google.com/maps/search/corretores+no+rio", { waitUntil: "networkidle2" });
    
    console.log("Waiting for feed...");
    try {
        await page.waitForSelector('[role="feed"]', { timeout: 10000 });
        console.log("Feed found!");
        const rawData = await page.evaluate(() => {
            const feed = document.querySelector('[role="feed"]');
            return feed ? feed.innerText.substring(0, 200) : "No feed";
        });
        console.log("Extracted text preview:", rawData);
    } catch (e) {
        console.log("Feed not found. Current page HTML snippet:");
        const body = await page.evaluate(() => document.body.innerText.substring(0, 500));
        console.log(body);
        await page.screenshot({path: 'maps_error.png'});
    }
    
    await browser.close();
    console.log("Done");
})();
