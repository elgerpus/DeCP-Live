import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable } from "rxjs/Observable";

import { UtilitiesService } from "./utilities.service";

import { IImage } from "./interfaces/iimage";
import { IEnvelope } from "./interfaces/ienvelope";
import { IResult } from "./interfaces/iresult";

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
                console.log("GET RESULTS REPLY:");

                const env: IEnvelope<IResult> = {
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
