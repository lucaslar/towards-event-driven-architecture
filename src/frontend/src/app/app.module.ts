import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { SearchButtonComponent } from './components/search-button/search-button.component';
import { SearchFormComponent } from './components/dialog/search-form/search-form.component';
import { HeaderComponent } from './components/header/header.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LanguageComponent } from './components/dialog/language/language.component';
import { InfoComponent } from './components/dialog/info/info.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { ErrorService } from './services/error.service';
import { ErrorDialogComponent } from './components/dialog/error-dialog/error-dialog.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { GeoSearchComponent } from './components/dialog/search-form/geo-search/geo-search.component';
import { ResultsContentComponent } from './components/results-content/results-content.component';
import { NoResultsComponent } from './components/no-results/no-results.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateFieldsComponent } from './components/dialog/search-form/date-fields/date-fields.component';
import { ResultGroupComponent } from './components/results-content/result-group/result-group.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { ServiceResultCardComponent } from './components/results-content/result-group/service-result-card/service-result-card.component';
import { SearchDataCardComponent } from './components/results-content/result-group/search-data-card/search-data-card.component';
import { SearchSuccessComponent } from './components/dialog/search-success/search-success.component';
import { SearchErrorComponent } from './components/dialog/search-error/search-error.component';
import { LaureateDataComponent } from './components/dialog/search-success/laureate-data/laureate-data.component';
import { DeleteAllResultsComponent } from './components/dialog/delete-all-results/delete-all-results.component';
import { DeleteOneResultComponent } from './components/dialog/delete-one-result/delete-one-result.component';
import { DescDatePipe } from './pipes/desc-date.pipe';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

const HttpLoaderFactory = (http: HttpClient) => {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};

@NgModule({
    declarations: [
        AppComponent,
        SearchButtonComponent,
        SearchFormComponent,
        HeaderComponent,
        LanguageComponent,
        InfoComponent,
        DialogComponent,
        ErrorDialogComponent,
        GeoSearchComponent,
        ResultsContentComponent,
        NoResultsComponent,
        DateFieldsComponent,
        ResultGroupComponent,
        ServiceResultCardComponent,
        SearchDataCardComponent,
        SearchSuccessComponent,
        SearchErrorComponent,
        LaureateDataComponent,
        DeleteAllResultsComponent,
        DeleteOneResultComponent,
        DescDatePipe,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MaterialModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        LeafletModule,
        FontAwesomeModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [
        { provide: ErrorHandler, useClass: ErrorService },
        { provide: LOCALE_ID, useValue: 'de-DE' },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
