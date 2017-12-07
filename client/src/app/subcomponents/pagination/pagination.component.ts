import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IPagination } from "./../../interfaces/ipagination";

@Component({
    selector: "app-pagination",
    templateUrl: "./pagination.component.html",
    styleUrls: ["./pagination.component.scss"]
})
export class PaginationComponent implements OnInit {

    @Input() pagination: IPagination;
    @Input() pages: any[][];
    @Output() onPage = new EventEmitter<IPagination>();

    constructor() { }

    ngOnInit() {
    }

    onPageNum(num: number) {
        this.pagination.currentPage = num;

        this.onPage.emit(this.pagination);
    }

    onPageUp() {
        this.pagination.currentPage++;

        if (this.pagination.numberOfPages < this.pagination.currentPage) {
            this.pagination.currentPage = this.pagination.numberOfPages;
        }

        this.onPage.emit(this.pagination);
    }

    onPageDown() {
        this.pagination.currentPage--;

        if (this.pagination.currentPage < 1) {
            this.pagination.currentPage = 1;
        }

        this.onPage.emit(this.pagination);
    }

    onFirstPage() {
        this.pagination.currentPage = 1;

        this.onPage.emit(this.pagination);
    }

    onLastPage() {
        this.pagination.currentPage = this.pagination.numberOfPages;

        this.onPage.emit(this.pagination);
    }

}
