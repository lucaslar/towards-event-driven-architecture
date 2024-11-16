import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../model/internal/language';
import { StorageService } from './storage.service';
import { Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    readonly supportedLanguages: Language[] = [
        new Language('en', 'English', 'gb'),
        new Language('de', 'Deutsch'),
        new Language('es', 'Español'),
        new Language('fr', 'Français'),
        new Language('pt', 'Português', 'br'),
    ];

    constructor(
        private readonly translate: TranslateService,
        private readonly storage: StorageService,
        private readonly title: Title
    ) {
        this.translate.setDefaultLang('en');
    }

    initialize(): void {
        const iso = this.supportedUserLanguageId ?? this.translate.defaultLang;
        this.currentLanguage = this.supportedLanguages.find(
            (l) => l.iso === iso
        ) as Language;
    }

    set currentLanguage(language: Language) {
        this.translate.use(language.iso);
        this.storage.language = language.iso;
        this.translate
            .get('app.title')
            .subscribe((r) => this.title.setTitle(r));
    }

    get currentLanguageIso(): string {
        return this.translate.currentLang;
    }

    private get supportedUserLanguageId(): string | undefined {
        return [
            this.storage.language,
            ...navigator.languages,
            navigator.language,
        ]
            .filter((l) => !!l)
            .map((l) => l!.split('-')[0])
            .find((l) =>
                this.supportedLanguages
                    .map((supported) => supported.iso)
                    .includes(l)
            );
    }
}
