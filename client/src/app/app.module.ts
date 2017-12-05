import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterializeModule } from "ng2-materialize";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { UtilitiesService } from "./utilities.service";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { QueryComponent } from "./query/query.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        QueryComponent
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
                path: "query",
                component: QueryComponent
            }
        ])
    ],
    providers: [
        UtilitiesService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
