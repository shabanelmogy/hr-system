import { Component, computed, inject, input } from '@angular/core';
import { LocalizationRuntime, UiTextPipe } from '../../../../platform/localization/public-api';
import { SurfaceCard } from '../../layout/surface-card/surface-card';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';
import { ChartRenderer } from '../chart-renderer/chart-renderer';
import { chartHasData, validChartDefinition, type ChartDefinition } from '../chart.types';
import { chartNumber } from '../chart-presentation';

@Component({
  selector: 'erp-chart-panel',
  imports: [SurfaceCard, FeedbackState, ChartRenderer, UiTextPipe],
  templateUrl: './chart-panel.html',
  styleUrl: './chart-panel.scss',
})
export class ChartPanel {
  readonly definition = input.required<ChartDefinition>();
  private readonly locale = inject(LocalizationRuntime);
  readonly valid = computed(() => validChartDefinition(this.definition()));
  readonly hasData = computed(() => chartHasData(this.definition()));
  number(value: number | undefined) {
    if (value === undefined) return '—';
    return chartNumber(value, this.definition().numberLocale ?? this.locale.language());
  }
}
