import { Injectable } from "@angular/core";

@Injectable()
export class UtilitiesService {

    SERVER_URL = "http://localhost:32000/";

    constructor() { }

    getImageID(imageString: String): String {
        const split = imageString.split("/");
        return split[split.length - 1];
    }

}
