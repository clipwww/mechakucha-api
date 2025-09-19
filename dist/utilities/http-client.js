import got from 'got';
export const httpClient = got.extend({
    timeout: {
        request: 15000,
    },
    headers: {
        'Content-Type': 'application/json',
    },
    hooks: {
        beforeRequest: [
            (options) => {
                console.log(`[${options.method?.toUpperCase()}] ${options.url?.toString()} | query: ${JSON.stringify(options.searchParams || {})} | data: ${JSON.stringify(options.json || {})}`);
            }
        ],
        beforeError: [
            (error) => {
                console.error(`[Request Error] ${error.message}`);
                return error;
            }
        ],
        afterResponse: [
            (response) => {
                console.log(`[Response] ${response.statusCode} ${response.url}`);
                return response;
            }
        ]
    }
});
