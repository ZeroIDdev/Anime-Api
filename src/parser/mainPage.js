import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BASEURL, chunkArray } from "../helpers/index.js";

puppeteer.use(StealthPlugin());

const mainPage = async (pathName, page = "1") => {
 const URL = `${BASEURL}${pathName}${
    ~~page % 2 == 0 ? Math.ceil(~~page / 2) - 1 : Math.ceil(~~page / 2)
 }`;

 const browser = await puppeteer.launch({ headless: true });
 const page = await browser.newPage();
 await page.goto(URL);

 const maxPage = await page.$eval(".pagin .page-numbers:not(.prev,.next,.dots):last", el => el.innerText.replace(/,| /g, ""));
 const list = [];

 const elements = await page.$$(".tab-content .flw-item");
 for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const url = await element.$eval("a.film-poster-ahref", el => el.getAttribute('href'));
    const slug = url.split("/")[url.split("/").length - 2];
    const title = await element.$eval("h3.film-name a", el => el.innerText);
    const poster = await element.$eval(".film-poster img", el => el.getAttribute('data-src'));
    const star = await element.$eval(".tick.ltr div", el => el.innerText.trim());
    const episodeOrType = await element.$eval(".tick.rtl div", el => el.innerText.trim());
    const dataList = {
      url,
      slug,
      title,
      poster,
      star,
    };

    pathName.includes("anime") || pathName.includes("ongoing")
      ? (dataList.episode = episodeOrType)
      : (dataList.type = episodeOrType);

    list.push(dataList);
 }

 let data = {
    statusCode: 200,
    currentPage: ~~page,
    maxPage: ~~maxPage === 0 ? 1 : ~~maxPage * 2,
    list: ~~page % 2 == 0 ? chunkArray(list, 2)[1] : chunkArray(list, 2)[0],
 };
 data.list = data.list.filter(e => e.slug !== "zoronime.com")
 if (~~page < 1) throw new Error("Page not found");

 await browser.close();
 return data;
};

export default mainPage;
