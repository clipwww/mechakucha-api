import cheerio from 'cheerio';
import moment from 'moment';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'he';
import { httpClient } from '../utilities';
const xmlParser = new XMLParser();
const BASE_URL = 'http://himado.in/';
export const getHimawariDougaList = async ({ sort = 'today_view_cnt', keyword = '', cat, page }) => {
    const { body: xmlString } = await httpClient.get(BASE_URL, {
        searchParams: {
            sort,
            keyword,
            cat,
            page: (page && page > 1) ? page : null,
            rss: 1,
        }
    });
    const xml = xmlParser.parse(xmlString);
    const { item: items, ...channel } = xml.rss.channel;
    return {
        channel,
        items: items?.map((item) => {
            const $ = cheerio.load(item.description);
            return {
                id: item.link.replace(BASE_URL, ''),
                title: item.title,
                link: item.link,
                image: $('img').attr('src'),
                description: decode($('.riRssContributor').html() || ''),
                date_publish: moment(item.pubDate).toISOString(),
            };
        }) ?? []
    };
};
export const getHimawariDougaDetails = async (id) => {
    const { body: htmlString } = await httpClient.get(BASE_URL, {
        searchParams: {
            id,
            mode: 'movie',
        }
    });
    const $xml = cheerio.load(htmlString, {
        xmlMode: true,
    });
    const xml = xmlParser.parse($xml.xml());
    return xml.movie;
};
export const getHimawariDanmakuList = async (keyword, page = 1, sort = 'comment_cnt', sortby = 'desc') => {
    const { body: htmlString } = await httpClient.get(BASE_URL, {
        searchParams: {
            keyword,
            page: page - 1,
            mode: 'commentgroup',
            cat: 'search',
            sort,
            sortby
        }
    });
    const $ = cheerio.load(htmlString);
    const items = $('#thumb tr').map((i, tr) => {
        const $tds = $(tr).find('td');
        let group_id = '';
        let title = '';
        let count = 0;
        let source = '';
        $tds.each((index, el) => {
            switch (index) {
                case 0:
                    const queryParams = new URLSearchParams($(el).find('a').attr('href'));
                    group_id = queryParams.get('group_id') || '';
                    title = $(el)?.text()?.trim() ?? '';
                    break;
                case 1:
                    count = +($(el)?.text() || '0');
                    break;
                case 2:
                    source = $(el)?.text()?.trim() ?? '';
                    break;
            }
        });
        return {
            group_id,
            title,
            count,
            source,
        };
    }).get();
    const pagenav = $('.pagenavi_res').first().text();
    const pageMatch = pagenav.match(/page (.*) of (.*) result:(.*)/);
    return {
        items,
        pageInfo: {
            index: pageMatch && pageMatch[1] ? +pageMatch[1] : page,
            size: 30,
            pageAmount: pageMatch && pageMatch[2] ? +pageMatch[2] : 0,
            dataAmount: pageMatch && pageMatch[3] ? +pageMatch[3] : 0,
        },
    };
};
export const getHimawariDougaDanmaku = async (id, isGroupId = false) => {
    const url = isGroupId ? `${BASE_URL}?mode=commentgroup&group_id=${id}` : `${BASE_URL}${id}`;
    const { body: htmlString } = await httpClient.get(url);
    const $ = cheerio.load(htmlString);
    const group_id = $('input[name="group_id"]').val();
    const key = $('input[name="key"]').val();
    const { body: xmlString } = await httpClient.get(`${BASE_URL}api/player`, {
        searchParams: {
            mode: 'comment',
            id,
            group_id,
            key,
            start: 0,
            limit: 100000,
            ver: "20100220"
        }
    });
    const $xml = $(xmlString);
    const baseDate = parseInt($xml.find('base').attr("d") || '0', 36);
    const ids = [];
    $xml.find("d").each((i, e) => {
        const index = parseInt($(e).attr("n") || '0', 36);
        const id = $(e).attr("u") || '';
        ids[index] = id;
    });
    return $xml.find("c").map((i, e) => {
        const deleted = $(e).attr("deleted");
        const arr = ($(e).attr("p") || '').split(",");
        const date = baseDate - parseInt(arr[1] || '0', 36);
        const vpos_master = parseInt(arr[0] || '0', 36);
        return {
            id: ids[parseInt(arr[3] || '0', 36)] || '',
            no: parseInt(arr[2] || '0', 36).toString(),
            mail: arr[6],
            vpos: Math.floor(parseInt(arr[0] || '0', 36) / 100 * 30),
            vpos_master,
            time: vpos_master / 100,
            date,
            msg: $(e).text(),
            text: $(e).text(),
            digital_time: moment.utc(vpos_master * 10).format('HH:mm:ss'),
            date_iso_string: new Date(date * 1000).toISOString(),
            deleted: $(e).attr("deleted") || '',
        };
    }).get().filter(item => !['1', '2'].includes(item.deleted || '')).sort((a, b) => a.vpos_master > b.vpos_master ? 1 : -1);
};
