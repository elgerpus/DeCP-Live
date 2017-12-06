import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UtilitiesService } from "../../utilities.service";

@Component({
    selector: "app-result",
    templateUrl: "./result.component.html",
    styleUrls: ["./result.component.scss"]
})
export class ResultComponent implements OnInit {

    resultID: number;
    status: number; // 0: Waiting/Queued | 1: Running | 2: Done
    queueNumber: number;
    eta: number;
    averageTime: number;
    grid: boolean;
    imageIDs: string[] = [];

    constructor(
        public utilities: UtilitiesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.resultID = this.route.snapshot.params["resultID"];

        this.status = 2;
        this.queueNumber = 2;
        this.averageTime = 30;
        this.eta = this.queueNumber * this.averageTime;

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

    onResultImageClick(resultImageID: number) {
        this.router.navigate(["results", this.resultID, resultImageID]);
    }
}
