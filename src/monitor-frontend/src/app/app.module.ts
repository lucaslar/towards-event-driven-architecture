import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MaterialModule } from './modules/material.module';
import { HeaderComponent } from './components/header/header.component';
import { ConfigsComponent } from './components/main/pages/configs/configs.component';
import { NgChartsModule } from 'ng2-charts';
import { SocketStatusComponent } from './components/dialogs/socket-status/socket-status.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/main/pages/home/home.component';
import { RunHistoryComponent } from './components/main/pages/run-history/run-history.component';
import { PerformanceStatsComponent } from './components/main/pages/performance-stats/performance-stats.component';
import { PageTitleComponent } from './components/main/shared/page-title/page-title.component';
import { PathMethodBadgeComponent } from './components/main/shared/path-method-badge/path-method-badge.component';
import { StatisticsMappingPipe } from './pipes/statistics-mapping.pipe';
import { NoDataComponent } from './components/main/shared/no-data/no-data.component';
import { ChartComponent } from './components/main/shared/chart/chart.component';
import { FormsModule } from '@angular/forms';
import { TagFilterPipe } from './pipes/tag-filter.pipe';
import { ConfigCardComponent } from './components/main/shared/config-card/config-card.component';
import { ResponseDataComponent } from './components/main/shared/response-data/response-data.component';
import { RunResultsPipe } from './pipes/run-results.pipe';
import { InfoComponent } from './components/dialogs/info/info.component';

const HttpLoaderFactory = (http: HttpClient) => {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        ConfigsComponent,
        SocketStatusComponent,
        HomeComponent,
        RunHistoryComponent,
        PerformanceStatsComponent,
        PageTitleComponent,
        PathMethodBadgeComponent,
        StatisticsMappingPipe,
        NoDataComponent,
        ChartComponent,
        TagFilterPipe,
        ConfigCardComponent,
        ResponseDataComponent,
        RunResultsPipe,
        InfoComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgChartsModule,
        HttpClientModule,
        MaterialModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
