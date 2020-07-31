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

export const parseXMLtoData = (xmlStr: string): { entry: EntryVM, self: string } => {
  const data: { feed: { link: any[], entry: EntryVM } } = JSON.parse(toJson(xmlStr));
  const self =  data.feed?.link?.find(link => link.rel === 'self')?.href ?? '';
  return {
    entry: data?.feed?.entry,
    self
  };
} 