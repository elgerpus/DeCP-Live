import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable } from "rxjs/Observable";

import { UtilitiesService } from "./utilities.service";

import { IImage } from "./interfaces/iimage";
import { IEnvelope } from "./interfaces/ienvelope";
import { IResult } from "./interfaces/iresult";
import { IResultDetails } from "./interfaces/iresult-details";
import { IImageResult } from "./interfaces/iimage-result";
import { IBatchImage } from "./interfaces/ibatch-image";

@Injectable()
export class SocketService {

    private socket: any;

    constructor(private utilities: UtilitiesService) {
        this.socket = io(utilities.SERVER_URL);
    }

    removeListener(event: string) {
        this.socket.removeListener(event);
    }

    getQueryImages(page: number): Observable<IEnvelope<IImage>> {
        const observable = new Observable<IEnvelope<IImage>>(observer => {
            this.socket.emit("getQueryImages", page);
            this.socket.on("getQueryImages", envelope => {
                const env: IEnvelope<IImage> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    sendQueryImages(imageIDs: string[], b: number, k: number, top: number): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("imageQuery", imageIDs, b, k, top);
            this.socket.on("imageQuery", success => {
                observer.next(success);
            });
        });

        return observable;
    }

    getBatchResults(page: number): Observable<IEnvelope<IResult>> {
        const observable = new Observable<IEnvelope<IResult>>(observer => {
            this.socket.emit("getBatchResults", page);
            this.socket.on("getBatchResults", envelope => {
                const env: IEnvelope<IResult> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    getBatchInfo(batchID: string): Observable<IResultDetails> {
        const observable = new Observable<IResultDetails>(observer => {
            this.socket.emit("getBatchInfo", batchID);
            this.socket.on("getBatchInfo", responseInfo => {
                observer.next(responseInfo);
            });
        });

        return observable;
    }

    getBatchImages(batchID: string, page: number): Observable<IEnvelope<IImage>> {
        const observable = new Observable<IEnvelope<IImage>>(observer => {
            this.socket.emit("getBatchImages", batchID, page);
            this.socket.on("getBatchImages", envelope => {
                const env: IEnvelope<IImage> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    getBatchImage(batchID: string, imageID: string): Observable<IBatchImage> {
        const observable = new Observable<IBatchImage>(observer => {
            this.socket.emit("getBatchImage", batchID, imageID);
            this.socket.on("getBatchImage", image => {
                observer.next(image);
            });
        });

        return observable;
    }

    getResultImages(batchID: string, imageID: string, page: number): Observable<IEnvelope<IImageResult>> {
        const observable = new Observable<IEnvelope<IImageResult>>(observer => {
            this.socket.emit("getResultImages", batchID, imageID, page);
            this.socket.on("getResultImages", envelope => {
                const env: IEnvelope<IImageResult> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    getBatchImagesTopResults(batchID: string, page: number, top: number): Observable<IImage[][]> {
        const observable = new Observable<IImage[][]>(observer => {
            this.socket.emit("getBatchImagesTopResults", batchID, page, top);
            this.socket.on("getBatchImagesTopResults", images => {
                observer.next(images);
            });
        });

        return observable;
    }

    adminAuthenticate(password: string): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("adminAuthenticate", password);
            this.socket.on("adminAuthenticate", success => {
                observer.next(success);
            });
        });

        return observable;
    }

    adminSave(password: string): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("adminSave", password);
            this.socket.on("adminSave", success => {
                observer.next(success);
            });
        });

        return observable;
    }

    adminHalt(password: string): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("adminHalt", password);
            this.socket.on("adminHalt", success => {
                observer.next(success);
            });
        });

        return observable;
    }
}
