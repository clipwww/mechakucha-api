import { toJson } from 'xml2json';

interface EntryVM {
  id: string;
  'yt:videoId': string;
  'yt:channelId': string;
  title: string;
  link: {
    rel: string;
    href: string;
  };
  author: {
    name: string;
    uri: string;
  };
  published: string;
  updated: string;
}

export const parseXMLtoData = (xmlStr: string): EntryVM => {
  const data: { feed: { entry: EntryVM } } = JSON.parse(toJson(xmlStr));
  return data?.feed?.entry;
} 