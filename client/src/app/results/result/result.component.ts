import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MzToastService } from "ng2-materialize";
import { DomSanitizer } from "@angular/platform-browser";

import { SocketService } from "../../socket.service";
import { UtilitiesService } from "../../utilities.service";

import { IPagination } from "./../../interfaces/ipagination";
import { IResultDetails } from "../../interfaces/iresult-details";
import { IImage } from "../../interfaces/iimage";


@Component({
    selector: "app-result",
    templateUrl: "./result.component.html",
    styleUrls: ["./result.component.scss"]
})
export class ResultComponent implements OnInit {

    batchID: string;
    result: IResultDetails;
    imagesGrid: IImage[][];
    imagesTable: IImage[];
    imagesTop: IImage[][];
    pageNumbers: number[];
    pagination: IPagination;
    gridLoaded = false;
    tableLoaded = false;
    topLoaded = false;
    infoLoaded = false;
    grid = false;

    constructor(
        public utilities: UtilitiesService,
        public domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: MzToastService,
        private socketService: SocketService
    ) { }

    ngOnInit() {

        this.batchID = this.route.snapshot.params["batchID"];

        this.getBatchInfo();
        this.getBatchImages(1);
        this.getTopImages(1);
    }

    onResultImageClick(resultImageID: number) {
        this.router.navigate(["results", this.batchID, resultImageID]);
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
        this.socketService.removeListener("getBatchImages");
        this.getTopImages(this.pagination.currentPage);
        this.getBatchImages(this.pagination.currentPage);
    }

    getBatchInfo() {
        this.infoLoaded = false;
        this.socketService.getBatchInfo(this.batchID).first().subscribe(
            info => {
                this.result = info;
                this.infoLoaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }

    getBatchImages(page: number) {
        this.gridLoaded = false;
        this.tableLoaded = false;
        this.socketService.getBatchImages(this.batchID, page).first().subscribe(
            envelope => {
                if (envelope.pagination === undefined) {
                    return;
                }

                this.pagination = envelope.pagination;
                this.pageNumbers = [];
                this.imagesGrid = [];

                const startEnd = this.utilities.getPaginationStartEnd(this.pagination);

                for (let i = startEnd.start, j = 0; i <= startEnd.end; i++ , j++) {
                    this.pageNumbers[j] = startEnd.start + j;
                }

                this.imagesTable = envelope.items;

                for (let i = 0; i < 4; i++) {
                    this.imagesGrid[i] = [];

                    for (let j = 0; j < 4; j++) {
                        const item = envelope.items[(i * 4) + j];

                        if (item === undefined) {
                            break;
                        }

                        this.imagesGrid[i][j] = item;
                    }
                }

                this.gridLoaded = true;
                this.tableLoaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }

    getTopImages(page: number) {
        this.topLoaded = false;
        this.socketService.getBatchImagesTopResults(this.batchID, page, this.utilities.TOP_IMAGES).first().subscribe(
            images => {
                this.imagesTop = images;
                this.topLoaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }
}
