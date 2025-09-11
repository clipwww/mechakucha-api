import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser();

interface CwbWarningItemVM {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  description: string;
}


export const parseCwbXMLtoItems = (xmlStr: string): CwbWarningItemVM[] => {
  const data = xmlParser.parse(xmlStr);
  return data?.rss?.channel?.item ?? [] as CwbWarningItemVM[];
} 