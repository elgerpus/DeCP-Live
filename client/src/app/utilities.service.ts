import { Injectable } from "@angular/core";

@Injectable()
export class UtilitiesService {

    constructor() { }

    getImageID(imageString: String): String {
        const split = imageString.split("/");
        return split[split.length - 1];
    }

}
