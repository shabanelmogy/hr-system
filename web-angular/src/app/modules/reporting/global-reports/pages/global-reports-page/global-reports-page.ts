import { Component } from '@angular/core';
import { GlobalReportView } from '../../components/global-report-view/global-report-view';

@Component({
  imports: [GlobalReportView],
  selector: 'erp-global-reports-page',
  templateUrl: './global-reports-page.html',
  styleUrl: './global-reports-page.scss',
})
export class GlobalReportsPage {}
