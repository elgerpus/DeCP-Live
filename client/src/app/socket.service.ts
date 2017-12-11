import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable } from "rxjs/Observable";

import { UtilitiesService } from "./utilities.service";

import { IImage } from "./interfaces/iimage";
import { IEnvelope } from "./interfaces/ienvelope";
import { IResult } from "./interfaces/iresult";
import { IResultDetails } from "./interfaces/iresult-details";

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
            this.socket.emit("getImages", page);
            this.socket.on("getImages", envelope => {
                console.log("GET IMAGES REPLY:");
                console.log(envelope);
                const env: IEnvelope<IImage> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    sendQueryImages(imageIDs: string[], b: number, k: number): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("imageQuery", imageIDs, b, k);
            this.socket.on("imageQuery", success => {
                observer.next(success);
            });
        });

        return observable;
    }

    getResults(page: number): Observable<IEnvelope<IResult>> {
        const observable = new Observable<IEnvelope<IResult>>(observer => {
            this.socket.emit("getResults", page);
            this.socket.on("getResults", envelope => {
                const env: IEnvelope<IResult> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    getResultInfo(batchID: string): Observable<IResultDetails> {
        const observable = new Observable<IResultDetails>(observer => {
            this.socket.emit("getResultInfo", batchID);
            this.socket.on("getResultInfo", responseInfo => {
                console.log("GET RESULT INFO REPLY:");

                console.log(responseInfo);

                observer.next(responseInfo);
            });
        });

        return observable;
    }

    getResultImages(batchID: string, page: number): Observable<IEnvelope<IImage>> {
        const observable = new Observable<IEnvelope<IImage>>(observer => {
            this.socket.emit("getResultImages", batchID, page);
            this.socket.on("getResultImages", envelope => {
                console.log("GET RESULT IMAGES REPLY:");

                const env: IEnvelope<IImage> = {
                    items: envelope.items,
                    pagination: envelope.pagination
                };

                console.log(env);

                observer.next(env);
            });
        });

        return observable;
    }
}
