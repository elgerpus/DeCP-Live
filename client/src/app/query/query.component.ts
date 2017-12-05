import { Component, OnInit } from "@angular/core";
import { MzToastService } from "ng2-materialize";

import { UtilitiesService } from "../utilities.service";

@Component({
    selector: "app-query",
    templateUrl: "./query.component.html",
    styleUrls: ["./query.component.scss"]
})
export class QueryComponent implements OnInit {

    selected: String[] = [];
    imageIDs: String[] = [];

    constructor(
        public utilities: UtilitiesService,
        private toastService: MzToastService
    ) { }

    ngOnInit() {
        this.imageIDs.push("/assets/images/long.jpeg");
        this.imageIDs.push("/assets/images/parallax1.jpg");
        this.imageIDs.push("/assets/images/parallax2.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
    }

    onImage(image: String) {
        const imageID = this.utilities.getImageID(image);
        const index = this.selected.indexOf(imageID);

        if (-1 < index) {
            this.selected.splice(index, 1);
        }
        else {
            this.selected.push(imageID);
        }
    }

    onSubmit() {
        this.toastService.show("Submitted!", 4000);
    }

    isSelected(image: String): Boolean {
        return this.selected.includes(this.utilities.getImageID(image));
    }
}
