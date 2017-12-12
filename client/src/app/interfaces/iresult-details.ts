export interface IResultDetails {
    batchID: string;
    status: number;
    queueNumber: number;
    eta: number;
    averageTime: number;
    b: number;
    k: number;
    totalTime: number;
    timePerImage: number;
    timestamp: string;
    images: number;
}
