import { BASEURL, chunkArray } from "../helpers/index.js";

const mainPage = async (pathName, page = "1") => {
  const URL = `${BASEURL}${pathName}${
    ~~page % 2 == 0 ? Math.ceil(~~page / 2) - 1 : Math.ceil(~~page / 2)
  }`;

  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dataText = await response.text();
    const $ = cheerio.load(dataText);

    const maxPage = $(".pagin .page-numbers:not(.prev,.next,.dots):last")
      .text()
      .replace(/,| /g, "");
    const list = [];

    $(".tab-content .flw-item").each((i, el) => {
      const url = $(el).find("a.film-poster-ahref").attr("href");
      const slug = url.split("/")[url.split("/").length - 2];
      const title = $(el).find("h3.film-name a").text();
      const poster = $(el).find(".film-poster img").attr("data-src");
      const star = $(el).find(".tick.ltr div").text().trim();
      const episodeOrType = $(el).find(".tick.rtl div").text().trim();

      const dataList = {
        url,
        slug,
        title,
        poster,
        star,
      };

      if (pathName.includes("anime") || pathName.includes("ongoing")) {
        dataList.episode = episodeOrType;
      } else {
        dataList.type = episodeOrType;
      }

      list.push(dataList);
    });

    const data = {
      statusCode: 200,
      currentPage: ~~page,
      maxPage: ~~maxPage === 0 ? 1 : ~~maxPage * 2,
      list: ~~page % 2 == 0 ? chunkArray(list, 2)[1] : chunkArray(list, 2)[0],
    };

    if (~~page < 1) {
      throw new Error("Page not found");
    }

    return data;
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
};

export default mainPage;
