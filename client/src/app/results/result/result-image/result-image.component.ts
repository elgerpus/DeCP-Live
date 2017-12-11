import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MzToastService } from "ng2-materialize";
import { DomSanitizer } from "@angular/platform-browser";

import { SocketService } from "../../../socket.service";
import { UtilitiesService } from "../../../utilities.service";

import { IPagination } from "./../../../interfaces/ipagination";
import { IImage } from "../../../interfaces/iimage";

@Component({
    selector: "app-result-image",
    templateUrl: "./result-image.component.html",
    styleUrls: ["./result-image.component.scss"]
})
export class ResultImageComponent implements OnInit {

    batchID: string;
    imageID: string;
    batchImage: IImage;
    imagesGrid: IImage[][];
    imagesTable: IImage[];
    pageNumbers: number[];
    pagination: IPagination;
    loaded = false;
    batchImageLoaded = false;
    grid = true;

    constructor(
        public utilities: UtilitiesService,
        public domSanitizer: DomSanitizer,
        private socketService: SocketService,
        private toastService: MzToastService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.batchID = this.route.snapshot.params["batchID"];
        this.imageID = this.route.snapshot.params["imageID"];

        this.getBatchImage();
        this.getResultImages(1);
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
        this.socketService.removeListener("getResultImages");
        this.getResultImages(this.pagination.currentPage);
    }

    getBatchImage() {
        this.batchImageLoaded = false;
        this.socketService.getBatchImage(this.imageID).first().subscribe(
            image => {
                this.batchImage = image;
                this.batchImageLoaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }

    getResultImages(page: number) {
        this.loaded = false;
        this.socketService.getResultImages(this.batchID, this.imageID, page).first().subscribe(
            envelope => {
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

                this.loaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }
}
