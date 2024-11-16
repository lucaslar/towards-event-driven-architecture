import request from 'request';

const url = (api: string) => `https://api.nobelprize.org/2.1/${api}?limit=100`;

const requestData = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log('Loading data from', url, '...');
        request(url, (error: any, response: any) => {
            error ? reject(error) : resolve(response.body);
        });
    });
};

const collectApiData = async (property: string) => {
    const collection: any[] = [];
    const recursiveReq = async (links?: any): Promise<any[]> => {
        const data = JSON.parse(await requestData(links.next));
        collection.push(...data[property]);
        if (data.links.next) return recursiveReq(data.links);
        else return collection;
    };
    return recursiveReq({ next: url(property) });
};

export const collectLaureateApiData = async () => collectApiData('laureates');
export const collectPrizeApiData = async () => collectApiData('nobelPrizes');
