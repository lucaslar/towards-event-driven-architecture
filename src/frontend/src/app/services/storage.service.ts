import { Injectable } from '@angular/core';
import { QueryResult } from '../model/query-result';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private readonly languageKey = 'language';
    private readonly resultsKey = 'queryResults';

    private results?: QueryResult[];

    get language() {
        return localStorage.getItem(this.languageKey) ?? undefined;
    }

    set language(value: string | undefined) {
        if (!value) localStorage.removeItem(this.languageKey);
        else localStorage.setItem(this.languageKey, value);
    }

    get queryResults() {
        if (!this.results) {
            const stored = localStorage.getItem(this.resultsKey);
            if (stored) {
                try {
                    this.results = JSON.parse(stored);
                } catch (e) {
                    localStorage.removeItem(this.resultsKey);
                }
            }
        }

        return this.results;
    }

    storeQueryResult(result: QueryResult): void {
        this.results = [...(this.results ?? []), result];
        localStorage.setItem(this.resultsKey, JSON.stringify(this.results));
    }

    removeQueryResult(uuid: string): void {
        this.results = (this.results ?? []).filter((r) => r.uuid !== uuid);
        localStorage.setItem(this.resultsKey, JSON.stringify(this.results));
    }

    deleteAllResults(): void {
        this.results = [];
        localStorage.removeItem(this.resultsKey);
    }
}
