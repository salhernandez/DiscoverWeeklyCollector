const puppeteer = require('puppeteer');
require('dotenv').config();

const appLoginPage = "http://localhost:8888/api/login";
const USERNAME = process.env.SPOTIFY_USERNAME;
const PASSWORD = process.env.SPOTIFY_PASSWORD;


async function run () {
    console.log("=== START PUPPETEER ===");
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [`--window-size=1920,1080`, '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        defaultViewport: {
          width:1920,
          height:1080
        },
      });
    const page = await browser.newPage();

    await page.goto(appLoginPage);
   
    await page.focus('input[data-testid=login-username]')
    await page.keyboard.type(USERNAME);

    await page.focus('input[data-testid=login-password]')
    await page.keyboard.type(PASSWORD);

    // await page.screenshot({path: 'screenshot1.png', fullPage: true});

    await page.waitForSelector('button[data-testid=login-button]');
    await page.click('button[data-testid=login-button]');

    // Wait for navigation to http://localhost:3000/
    await page.waitForNavigation();

    // get URL parameters
    const url = await page.evaluate(() => document.location.search);
    
    // await page.screenshot({path: 'screenshot2.png', fullPage: true});

    await page.close();
    await browser.close();
    console.log("=== END PUPPETEER ===");
}
run();