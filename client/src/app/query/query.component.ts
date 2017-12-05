import { Component, OnInit } from "@angular/core";

import { UtilitiesService } from "../utilities.service";

@Component({
    selector: "app-query",
    templateUrl: "./query.component.html",
    styleUrls: ["./query.component.scss"]
})
export class QueryComponent implements OnInit {

    selected: String[] = [];
    imageIDs: String[] = [];

    constructor(public utilities: UtilitiesService) { }

    ngOnInit() {
        this.imageIDs.push("/assets/images/parallax1.jpg");
        this.imageIDs.push("/assets/images/parallax2.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
    }

    onImage(imageID: string) {
        const index = this.selected.indexOf(imageID);

        if (-1 < index) {
            this.selected.splice(index, 1);
        }
        else {
            this.selected.push(imageID);
        }
    }
}
