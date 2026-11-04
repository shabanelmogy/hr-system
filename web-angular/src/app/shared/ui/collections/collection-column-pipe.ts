import { Pipe, type PipeTransform } from '@angular/core';
import type { CollectionColumn } from './collection.types';

/** Resolve projected templates by stable column identity rather than an array position. */
@Pipe({ name: 'collectionColumn' })
export class CollectionColumnPipe implements PipeTransform {
  transform<T>(columns: readonly CollectionColumn<T>[], key: string): CollectionColumn<T> {
    const column = columns.find((item) => item.key === key);
    if (!column) throw new Error('Missing collection column: ' + key);
    return column;
  }
}
