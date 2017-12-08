import { IImage } from "./interfaces/iimage";
import { IEnvelope } from "./interfaces/ienvelope";
import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable } from "rxjs/Observable";

import { UtilitiesService } from "./utilities.service";

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
                    items: envelope.images,
                    pagination: envelope.pagination
                };

                observer.next(env);
            });
        });

        return observable;
    }

    sendQueryImages(imageIDs: string[]): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            this.socket.emit("imageQuery", imageIDs);
            this.socket.on("imageQuery", success => {
                observer.next(success);
            });
        });

        return observable;
    }
}
