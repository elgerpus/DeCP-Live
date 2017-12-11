import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UtilitiesService } from "../../../utilities.service";

import { IPagination } from "./../../../interfaces/ipagination";

@Component({
    selector: "app-result-image",
    templateUrl: "./result-image.component.html",
    styleUrls: ["./result-image.component.scss"]
})
export class ResultImageComponent implements OnInit {

    resultID: number;
    imageID: number;
    grid: boolean;
    pages: string[][] = [];
    pageNumbers: number[];
    pagination: IPagination;

    constructor(
        public utilities: UtilitiesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.resultID = this.route.snapshot.params["batchID"];
        this.imageID = this.route.snapshot.params["imageID"];
        this.grid = true;

        this.pagination = {
            currentPage: 1,
            numberOfPages: 4
        };

        for (let i = 0; i < this.pagination.numberOfPages; i++) {
            this.pages[i] = [];
        }

        this.pages[0].push("/assets/images/parallax2.jpg");
        this.pages[0].push("/assets/images/parallax1.jpg");
        this.pages[0].push("/assets/images/parallax3.jpg");
        this.pages[0].push("/assets/images/long.jpeg");
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
    }
}
