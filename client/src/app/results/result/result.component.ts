import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UtilitiesService } from "../../utilities.service";

import { IPagination } from "./../../interfaces/ipagination";

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
    pages: string[][] = [];
    pagination: IPagination;

    constructor(
        public utilities: UtilitiesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.resultID = this.route.snapshot.params["resultID"];
        this.grid = true;

        this.pagination = {
            currentPage: 1,
            numberOfPages: 4
        };

        this.status = 2;
        this.queueNumber = 2;
        this.averageTime = 30;
        this.eta = this.queueNumber * this.averageTime;

        for (let i = 0; i < this.pagination.numberOfPages; i++) {
            this.pages[i] = [];
        }

        this.pages[0].push("/assets/images/long.jpeg");
        this.pages[0].push("/assets/images/parallax1.jpg");
        this.pages[0].push("/assets/images/parallax2.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");

        this.pages[1].push("/assets/images/parallax1.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
        this.pages[1].push("/assets/images/parallax2.jpg");
    }

    onResultImageClick(resultImageID: number) {
        this.router.navigate(["results", this.resultID, resultImageID]);
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
    }
}
