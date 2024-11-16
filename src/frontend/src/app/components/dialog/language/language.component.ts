import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { I18nService } from '../../../services/i18n.service';
import { Language } from '../../../model/internal/language';

@Component({
    selector: 'app-language',
    templateUrl: './language.component.html',
    styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit {
    constructor(
        readonly i18n: I18nService,
        private readonly ref: MatDialogRef<LanguageComponent>
    ) {}

    ngOnInit(): void {
        this.ref.afterClosed().subscribe((lang: Language) => {
            if (lang) this.i18n.currentLanguage = lang;
        });
    }
}
