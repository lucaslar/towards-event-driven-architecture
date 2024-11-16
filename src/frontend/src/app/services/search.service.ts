import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { QueryResult } from '../model/query-result';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    private searchSubj = new BehaviorSubject<boolean>(false);

    constructor(
        private readonly storage: StorageService,
        private readonly http: HttpClient
    ) {}

    search(data: any): void {
        this.searchSubj.next(true);
        const subscription = this.http
            .post<QueryResult>(`${environment.queryServiceUrl}/query`, data)
            .pipe(
                finalize(() => {
                    this.searchSubj.next(false);
                    subscription.unsubscribe();
                })
            )
            .subscribe((result) => this.storage.storeQueryResult(result));
    }

    get currentSearch$(): Observable<boolean> {
        return this.searchSubj.asObservable();
    }

    get results() {
        return this.storage.queryResults ?? [];
    }
}
