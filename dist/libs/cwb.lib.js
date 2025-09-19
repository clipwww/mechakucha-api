import { XMLParser } from 'fast-xml-parser';
const xmlParser = new XMLParser();
export const parseCwbXMLtoItems = (xmlStr) => {
    const data = xmlParser.parse(xmlStr);
    return data?.rss?.channel?.item ?? [];
};
