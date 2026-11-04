import { Component, computed, contentChild, input, output } from '@angular/core';
import { CollectionFrame } from '../../collections/collection-frame/collection-frame';
import { CollectionFeedback } from '../../collections/collection-feedback/collection-feedback';
import { CollectionEmptyTemplate } from '../../collections/collection-templates';
import { createCollectionController } from '../../collections/collection-controller';
import type {
  CollectionId,
  CollectionSearch,
  CollectionSearchChange,
  CollectionSource,
} from '../../collections/collection.types';
import { ScrollViewport } from '../../layout/scroll-viewport/scroll-viewport';
import { MetricCard } from '../../cards/metric-card/metric-card';
import { ChartPanel } from '../chart-panel/chart-panel';
import type { ChartDefinition, ChartMetric } from '../chart.types';

@Component({
  selector: 'erp-collection-chart-view',
  imports: [CollectionFrame, CollectionFeedback, ScrollViewport, MetricCard, ChartPanel],
  templateUrl: './collection-chart-view.html',
  styleUrl: './collection-chart-view.scss',
})
export class CollectionChartView<T> {
  readonly toolbarLayout = input<'responsive' | 'single-row'>('responsive');
  readonly source = input.required<CollectionSource<T>>();
  readonly rowId = input.required<(row: T) => CollectionId>();
  readonly label = input.required<string>();
  readonly plots = input<readonly ChartDefinition[]>([]);
  readonly metrics = input<readonly ChartMetric[]>([]);
  readonly search = input<CollectionSearch>();
  readonly toolbarVisible = input(true);
  readonly retry = output<void>();
  readonly searchChange = output<CollectionSearchChange>();
  readonly empty = contentChild(CollectionEmptyTemplate);
  readonly controller = createCollectionController(
    this.source,
    this.rowId,
    computed(() => () => false),
    { page: () => {}, active: () => {}, selected: () => {} },
  );
}
