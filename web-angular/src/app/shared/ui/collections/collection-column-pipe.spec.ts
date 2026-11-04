import { CollectionColumnPipe } from './collection-column-pipe';
import type { CollectionColumn } from './collection.types';

describe('projected collection column identity', () => {
  it('retains the chosen column across reorder and rejects a missing definition', () => {
    const id: CollectionColumn<{ id: number; name: string }> = {
      key: 'id',
      header: 'ID',
      value: (row) => row.id,
    };
    const name: CollectionColumn<{ id: number; name: string }> = {
      key: 'name',
      header: 'Name',
      value: (row) => row.name,
    };
    const pipe = new CollectionColumnPipe();
    expect(pipe.transform([id, name], 'name')).toBe(name);
    expect(pipe.transform([name, id], 'name')).toBe(name);
    expect(() => pipe.transform([id], 'name')).toThrow('Missing collection column');
  });
});
