import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UtilitiesService } from "../../../utilities.service";

@Component({
    selector: "app-result-image",
    templateUrl: "./result-image.component.html",
    styleUrls: ["./result-image.component.scss"]
})
export class ResultImageComponent implements OnInit {

    resultID: number;
    imageID: number;
    imageIDs: string[] = [];
    grid: boolean;

    constructor(
        public utilities: UtilitiesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.resultID = this.route.snapshot.params["resultID"];
        this.imageID = this.route.snapshot.params["imageID"];

        this.imageIDs.push("/assets/images/parallax2.jpg");
        this.imageIDs.push("/assets/images/parallax1.jpg");
        this.imageIDs.push("/assets/images/parallax3.jpg");
        this.imageIDs.push("/assets/images/long.jpeg");
    }

}
