import { Component, OnInit } from "@angular/core";
import { MzToastService } from "ng2-materialize";

import { UtilitiesService } from "../utilities.service";

@Component({
    selector: "app-query",
    templateUrl: "./query.component.html",
    styleUrls: ["./query.component.scss"]
})
export class QueryComponent implements OnInit {

    selected: string[] = [];
    pages: string[][] = [];
    numberOfPages: number;
    currentPage: number;

    constructor(
        public utilities: UtilitiesService,
        private toastService: MzToastService
    ) { }

    ngOnInit() {
        this.currentPage = 1;

        this.numberOfPages = 4;
        console.log(this.pages);

        for (let i = 0; i < this.numberOfPages; i++) {
            this.pages[i] = [];
        }

        console.log(this.pages);

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

    onPageUp() {
        this.currentPage++;

        if (this.numberOfPages < this.currentPage) {
            this.currentPage = this.numberOfPages;
        }
    }

    onPageDown() {
        this.currentPage--;

        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
    }

    onFirstPage() {
        this.currentPage = 1;
    }

    onLastPage() {
        this.currentPage = this.numberOfPages;
    }

    isSelected(image: string): boolean {
        return this.selected.includes(this.utilities.getImageID(image).valueOf());
    }
}
