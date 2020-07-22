import { toJson } from 'xml2json';

interface CwbWarningItemVM {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  description: string;
}


export const parseCwbXMLtoItems = (xmlStr: string): CwbWarningItemVM[] => {
  const data = JSON.parse(toJson(xmlStr));
  return data?.rss?.channel?.item ?? [] as CwbWarningItemVM[];
} 