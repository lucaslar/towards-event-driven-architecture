import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/main/pages/home/home.component';
import { PerformanceStatsComponent } from './components/main/pages/performance-stats/performance-stats.component';
import { RunHistoryComponent } from './components/main/pages/run-history/run-history.component';
import { ConfigsComponent } from './components/main/pages/configs/configs.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        data: { animation: 'Home' },
    },
    {
        path: 'services',
        component: ConfigsComponent,
        data: { animation: 'Configurations' },
    },
    {
        path: 'performance-stats',
        component: PerformanceStatsComponent,
        data: { animation: 'Avgs' },
    },
    {
        path: 'recent-runs',
        component: RunHistoryComponent,
        data: { animation: 'Current' },
    },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
