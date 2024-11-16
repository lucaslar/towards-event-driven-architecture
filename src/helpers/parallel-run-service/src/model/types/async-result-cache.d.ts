export type AsyncResultCache = {
    start: number;
    callback: (latency: number, data: any) => void;
    data: any;
};
