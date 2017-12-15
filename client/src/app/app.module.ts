import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterializeModule } from "ng2-materialize";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { SocketService } from "./socket.service";
import { UtilitiesService } from "./utilities.service";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { QueryComponent } from "./query/query.component";
import { ResultsComponent } from "./results/results.component";
import { ResultComponent } from "./results/result/result.component";
import { ResultImageComponent } from "./results/result/result-image/result-image.component";
import { PaginationComponent } from "./subcomponents/pagination/pagination.component";
import { AdminComponent } from "./admin/admin.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        QueryComponent,
        ResultsComponent,
        ResultComponent,
        ResultImageComponent,
        PaginationComponent,
        AdminComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterializeModule.forRoot(),
        FormsModule,
        RouterModule.forRoot([
            {
                path: "",
                pathMatch: "full",
                component: HomeComponent
            },
            {
                path: "admin",
                component: AdminComponent
            },
            {
                path: "query",
                component: QueryComponent
            },
            {
                path: "results",
                component: ResultsComponent
            },
            {
                path: "results/:batchID",
                component: ResultComponent
            },
            {
                path: "results/:batchID/:imageID",
                component: ResultImageComponent
            }
        ])
    ],
    providers: [
        UtilitiesService,
        SocketService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
