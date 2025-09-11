import  cheerio from 'cheerio';import  cheerio from 'cheerio';

import  moment from 'moment';import  moment from 'moment';



import { httpClient } from '../utilities';import { httpClient } from '../export const crawlerInstagramHashTag = async (tag: string, end_cursor?: string): Promise<{ posts: any[], page_info: any }> => {

  const params: any = {

export const crawlerFacebookFanPage = async (fbId: string) => {    __a: 1,

  const url = `https://www.facebook.com/pg/${fbId}/posts`;  }

  if (end_cursor) {

  const { body: htmlString } = await httpClient.get(url, {    params['max_id'] = end_cursor;

    headers: {  }

      'Content-Language': 'zh-TW'  const { body: data } = await httpClient.get(`https://www.instagram.com/explore/tags/${tag}/`, {

    }    searchParams: params,

  });  });



  const $ = cheerio.load(htmlString);  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

  const id = $('[data-referrerid]').attr('data-referrerid');

  console.log(id)  return {

    posts: parsedData.graphql.hashtag.edge_hashtag_to_media.edges.map((edge: any) => edge.node),

  return {    page_info: parsedData.graphql.hashtag.edge_hashtag_to_media.page_info

    id,  };

    name: $('.fwb').first().text(),}rt const crawlerFacebookFanPage = async (fbId: string) => {

    logo: $('.uiScaledImageContainer img').attr('src'),  const url = `https://www.facebook.com/pg/${fbId}/posts`;

    posts: $('.userContentWrapper').map((_i, el) => {  // const page = await puppeteerUtil.newPage();

      const $el = $(el);

      const utime = +($el.find('[data-utime]').attr('data-utime') || 0) * 1000;  // await page.goto(url, {

      return {  //   waitUntil: 'networkidle0',

        id: $el.find('.text_exposed_root').attr('id'),  // });

        link: `https://www.facebook.com/${$el.find('a._5pcq').attr('href')}`,  // const htmlString = await page.evaluate(() => {

        logo: $el.find('img').attr('src'),  //   return document.body.innerHTML

        img: $el.find('.scaledImageFitHeight').attr('src') || $el.find('.scaledImageFitWidth').attr('src') || $el.find('._3chq').attr('src'),  // });

        content: $el.find('[data-testid="post_message"]').html(),

        utime,  const { body: htmlString } = await httpClient.get(url, {

        formatTime: moment(utime).utcOffset(480).format('YYYY/MM/DD HH:mm'),    headers: {

        timestampContent: $el.find('.timestampContent').text(),      'Content-Language': 'zh-TW'

      };    }

    }).get(),  });

  }

}  const $ = cheerio.load(htmlString);

  const id = $('[data-referrerid]').attr('data-referrerid');

export const crawlerInstagramFanPage = async (igAccount: string): Promise<{ href: string; src: string }[]> => {  console.log(id)

  let igId = igAccount;

  return {

  if (isNaN(+igAccount)) {    id,

    const { body: data } = await httpClient.get(`https://www.instagram.com/${igAccount}/?__a=1`, {    name: $('.fwb').first().text(),

      headers: {    logo: $('.uiScaledImageContainer img').attr('src'),

        Cookie: "ds_user_id=1268817115; Domain=.instagram.com; expires=Tue, 09-Nov-2021 04:12:52 GMT; Max-Age=7776000; Path=/;Secure"    posts: $('.userContentWrapper').map((_i, el) => {

    }      const $el = $(el);

    });      const utime = +($el.find('[data-utime]').attr('data-utime') || 0) * 1000;

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;      return {

    const id = parsedData?.graphql?.user?.id ?? '';        id: $el.find('.text_exposed_root').attr('id'),

    if (id) igId = id;        link: `https://www.facebook.com/${$el.find('a._5pcq').attr('href')}`,

  }        logo: $el.find('img').attr('src'),

        img: $el.find('.scaledImageFitHeight').attr('src') || $el.find('.scaledImageFitWidth').attr('src') || $el.find('._3chq').attr('src'),

  console.log('igId', igId)        content: $el.find('[data-testid="post_message"]').html(),

  const { body: ret } = await httpClient.get('https://www.instagram.com/graphql/query', {        utime,

    searchParams: {        formatTime: moment(utime).utcOffset(480).format('YYYY/MM/DD HH:mm'),

      query_hash: 'e769aa130647d2354c40ea6a439bfc08',        timestampContent: $el.find('.timestampContent').text(),

      variables: JSON.stringify({      };

        id: igId,    }).get(),

        first: 12,  }

      })}

    }

  });export const crawlerInstagramFanPage = async (igAccount: string): Promise<{ href: string; src: string }[]> => {

  let igId = igAccount;

  const parsedRet = typeof ret === 'string' ? JSON.parse(ret) : ret;

  if (!parsedRet.status || parsedRet.status.toLowerCase() !== 'ok') {  if (isNaN(+igAccount)) {

    throw Error(parsedRet.message);    const { body: data } = await httpClient.get(`https://www.instagram.com/${igAccount}/?__a=1`, {

  }      headers: {

        Cookie: "ds_user_id=1268817115; Domain=.instagram.com; expires=Tue, 09-Nov-2021 04:12:52 GMT; Max-Age=7776000; Path=/;Secure"

  const edges = parsedRet.data.user.edge_owner_to_timeline_media.edges;    }

  if (!edges.length) {    });

    throw Error('Empty');    // console.log(data)

  }    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    const id = parsedData?.graphql?.user?.id ?? '';

  return parsedRet?.data?.user?.edge_owner_to_timeline_media?.edges.map((item: any) => {    if (id) igId = id;

    return {  }

      href: `https://www.instagram.com/p/${item.node?.shortcode}`,

      src: item.node?.display_url,  console.log('igId', igId)

      ...item.node  const { body: ret } = await httpClient.get('https://www.instagram.com/graphql/query', {

    }    searchParams: {

  });      query_hash: 'e769aa130647d2354c40ea6a439bfc08',

}      variables: JSON.stringify({

        id: igId,

export const crawlerInstagramHashTag = async (tag: string, end_cursor?: string): Promise<{ posts: any[], page_info: any }> => {        first: 12,

  const params: any = {      })

    __a: 1,    }

  }  });

  if (end_cursor) {  console.log(ret)

    params['max_id'] = end_cursor;  const parsedRet = typeof ret === 'string' ? JSON.parse(ret) : ret;

  }  if (!parsedRet.status || parsedRet.status.toLowerCase() !== 'ok') {

  const { body: data } = await httpClient.get(`https://www.instagram.com/explore/tags/${tag}/`, {    throw Error(parsedRet.message);

    searchParams: params,  }

  });

  const edges = parsedRet.data.user.edge_owner_to_timeline_media.edges;

  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;  if (!edges.length) {

    throw Error('Empty');

  return {  }

    posts: parsedData.graphql.hashtag.edge_hashtag_to_media.edges.map((edge: any) => edge.node),

    page_info: parsedData.graphql.hashtag.edge_hashtag_to_media.page_info

  };  return parsedRet?.data?.user?.edge_owner_to_timeline_media?.edges.map((item: any) => {

}    return {
      href: `https://www.instagram.com/p/${item.node?.shortcode}`,
      src: item.node?.display_url,
      ...item.node
    }
  });
}


export const crawlerInstagramHashTag = async (tag: string, end_cursor?: string): Promise<{ posts: any[], page_info: any }> => {
  const params = {
    __a: 1,
  }
  if (end_cursor) {
    params['max_id'] = end_cursor;
  }
  const { body: data } = await axiosInstance.get(`https://www.instagram.com/explore/tags/${tag}/`, {
    searchParams: params,
  });


  return {
    posts: data.graphql.hashtag.edge_hashtag_to_media.edges.map(edge => edge.node),
    page_info: data.graphql.hashtag.edge_hashtag_to_media.page_info
  };
}
