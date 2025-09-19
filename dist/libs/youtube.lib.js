import { XMLParser } from 'fast-xml-parser';
const xmlParser = new XMLParser();
export const parseXMLtoData = (xmlStr) => {
    const data = xmlParser.parse(xmlStr);
    const self = data.feed?.link?.find(link => link.rel === 'self')?.href ?? '';
    return {
        entry: data?.feed?.entry,
        self
    };
};
