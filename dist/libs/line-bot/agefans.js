import { getAnimeUpdate, getAnimeDetails, getAnimeVideo } from '../agefans.lib';
import { client } from './index';
export async function handleAgefansList(event, page = 1) {
    const items = await getAnimeUpdate();
    return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Agefans',
        contents: {
            type: 'carousel',
            contents: items.slice((page - 1) * 12, page * 12).map(item => {
                return {
                    type: 'bubble',
                    size: 'micro',
                    header: {
                        type: 'box',
                        layout: 'vertical',
                        paddingTop: 'sm',
                        paddingBottom: 'sm',
                        contents: [
                            {
                                type: 'text',
                                size: 'sm',
                                text: item.description,
                            },
                        ]
                    },
                    hero: {
                        type: "image",
                        url: item.imgUrl.includes('http') ? item.imgUrl.replace('http', 'https') : `https:${item.imgUrl}`,
                        size: "full",
                        aspectRatio: '150:100',
                        aspectMode: 'cover',
                        backgroundColor: '#000000'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                weight: 'bold',
                                size: 'sm',
                                text: item.name,
                                wrap: true,
                                maxLines: 3,
                                margin: 'sm'
                            },
                        ]
                    },
                    footer: {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "button",
                                style: "link",
                                action: {
                                    // type: "message",
                                    // label: "查看",
                                    // text: `@Agefans?id=${item.id}`
                                    type: 'uri',
                                    label: '前往',
                                    uri: item.link
                                },
                            }
                        ]
                    }
                };
            })
        }
    });
}
export async function handleAgefansEpisode(event, id) {
    const { title, episodeList } = await getAnimeDetails(id);
    return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Anime1',
        contents: {
            "type": "bubble",
            "size": "giga",
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        weight: 'bold',
                        text: title,
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "paddingAll": "none",
                alignItems: "flex-start",
                "contents": episodeList.map(item => {
                    return {
                        "type": "button",
                        height: "sm",
                        "action": {
                            "type": "message",
                            "label": item.title,
                            "text": `@Agefans?videoId=${item.id},${item.pId},${item.eId}`
                        }
                    };
                })
            },
        }
    });
}
export async function handleAgefansVideo(event, videoId) {
    const [id, pId, eId] = videoId.split(',');
    if (!id || !pId || !eId) {
        throw new Error('Invalid video ID format');
    }
    const url = await getAnimeVideo(id, pId, eId);
    console.log(url);
    return client.replyMessage(event.replyToken, [
        {
            type: "video",
            originalContentUrl: url,
            previewImageUrl: 'https://sta.anicdn.com/playerImg/9.jpg',
            trackingId: id
        }
    ]);
}
