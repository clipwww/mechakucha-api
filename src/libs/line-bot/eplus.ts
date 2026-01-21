import type { FlexMessage, FlexBubble } from '@line/bot-sdk';
import axios from 'axios';
import * as cheerio from 'cheerio';

const TARGET_URL = "https://eplus.tickets/en/sf/ibt/detail/0260360001-P0030081P0030082P0030083P0030084P0030085P0030086P0030087P0030088P0030089P0030090?P6=i00";

interface TicketInfo {
  articleTitle: string;
  date: string;
  index: number;
}

async function checkEplusTickets(): Promise<TicketInfo[]> {
  const response = await axios.get(TARGET_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
    timeout: 15000,
  });

  if (response.status !== 200) {
    throw new Error(`網頁請求失敗，狀態碼: ${response.status}`);
  }

  const $ = cheerio.load(response.data);
  const article = $("article");
  const ticketInfoList: TicketInfo[] = [];

  article.each((index, element) => {
    const articleAllSection = $(element);
    const articleContent = articleAllSection.find(".block-ticket-article__content");

    articleContent.each((i, e) => {
      const articleContentDetail = $(e);
      const ticketBlocks = articleContentDetail.find(".block-ticket:not(.hidden)");
      const ticketButtons = ticketBlocks.find("button.button.button--primary");

      if (ticketButtons.length === 0) {
        return;
      }

      const articleTitle = articleAllSection.find(".block-ticket-article__title").text().trim() || "未知賽事";
      const date = articleAllSection.find(".block-ticket-article__date").text().trim() || "未知日期";

      if (articleTitle.includes('Japan') || articleTitle.includes('日本') || articleTitle.includes('Taipei') || articleTitle.includes('台北')) {
        ticketInfoList.push({
          articleTitle,
          date,
          index: i + 1,
        });
      }
      
    });
  });

  return ticketInfoList;
}

export async function getEplusWbcTicketMessage(): Promise<FlexMessage | null> {
  console.log(`[${new Date().toLocaleString()}] 開始檢查 eplus WBC 門票...`);

  try {
    const ticketInfoList = await checkEplusTickets();

    if (ticketInfoList.length === 0) {
      console.log('目前沒有可購票項目');
      return null;
    }

    const bubbles: FlexBubble[] = ticketInfoList.map((ticket) => ({
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `#${ticket.index}`,
            size: 'sm',
            color: '#FFFFFF',
            weight: 'bold',
          },
        ],
        backgroundColor: '#FF6B6B',
        paddingAll: 'md',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚾ 賽事',
            size: 'xs',
            color: '#999999',
          },
          {
            type: 'text',
            text: ticket.articleTitle,
            size: 'sm',
            weight: 'bold',
            wrap: true,
            maxLines: 3,
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'text',
            text: '📅 日期',
            size: 'xs',
            color: '#999999',
            margin: 'md',
          },
          {
            type: 'text',
            text: ticket.date,
            size: 'sm',
            wrap: true,
          },
        ],
        paddingAll: 'lg',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'uri',
              label: '前往購票',
              uri: TARGET_URL,
            },
            color: '#FF6B6B',
          },
        ],
      },
    }));

    // 加入標題 bubble
    const headerBubble: FlexBubble = {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎫 eplus WBC',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'C組各日賽事售票狀態',
            size: 'sm',
            color: '#666666',
            margin: 'sm',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: '⚠️ 即便狀態顯示為 Now Available，仍以實際有釋出可販售區域為準',
            size: 'xs',
            color: '#999999',
            wrap: true,
            margin: 'lg',
          },
          {
            type: 'text',
            text: `共 ${ticketInfoList.length} 場有票`,
            size: 'md',
            weight: 'bold',
            margin: 'lg',
            color: '#FF6B6B',
          },
        ],
        paddingAll: 'xl',
      },
    };

    return {
      type: 'flex',
      altText: `🎫 eplus WBC C組售票通知 - 共 ${ticketInfoList.length} 場有票`,
      contents: {
        type: 'carousel',
        contents: [headerBubble, ...bubbles.slice(0, 11)], // Carousel 最多 12 個 bubble
      },
    };
  } catch (error: any) {
    console.error('eplus 檢查過程中發生錯誤:', error.message);
    return null;
  }
}
