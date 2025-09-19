import m3u8stream from 'm3u8stream';
export const m3u8toStream = (m3u8Url) => {
    const stream = m3u8stream(m3u8Url);
    stream.on('progress', (segment, totalSegments, downloaded) => {
        console.log(`${segment.num} of ${totalSegments} segments ` +
            `(${(segment.num / totalSegments * 100).toFixed(2)}%) ` +
            `${(downloaded / 1024 / 1024).toFixed(2)}MB downloaded`);
    });
    return stream;
};
