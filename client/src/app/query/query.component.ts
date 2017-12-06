import { Component, OnInit } from "@angular/core";
import { MzToastService } from "ng2-materialize";

import { UtilitiesService } from "../utilities.service";

import { IPagination } from "./../interfaces/ipagination";

@Component({
    selector: "app-query",
    templateUrl: "./query.component.html",
    styleUrls: ["./query.component.scss"]
})
export class QueryComponent implements OnInit {

    selected: string[] = [];
    pages: string[][] = [];
    pagination: IPagination;

    constructor(
        public utilities: UtilitiesService,
        private toastService: MzToastService
    ) { }

    ngOnInit() {
        this.pagination = {
            currentPage: 1,
            numberOfPages: 4
        };

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

    onImage(image: string) {
        const imageID = this.utilities.getImageID(image).valueOf();
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

    onPage(pagination: IPagination) {
        this.pagination = pagination;
    }

    isSelected(image: string): boolean {
        return this.selected.includes(this.utilities.getImageID(image).valueOf());
    }
}