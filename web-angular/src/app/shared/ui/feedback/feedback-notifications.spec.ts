import { TestBed } from '@angular/core/testing';
import { FeedbackNotifications } from './feedback-notifications';
describe('Shared queued feedback',()=>{
 it('preserves multiple success notices before lazy delivery and consumes only delivered IDs',()=>{
  const notices=TestBed.inject(FeedbackNotifications);notices.success('one');const first=notices.toasts()[0];notices.success('two','reference-countries',{count:2});
  expect(notices.toasts().map(notice=>notice.key)).toEqual(['one','two']);notices.delivered([first.id]);expect(notices.toasts().map(notice=>notice.key)).toEqual(['two']);
 });
 it('routes general failures to one dismissible modal without presenting them as a success toast',()=>{
  const notices=TestBed.inject(FeedbackNotifications);notices.failure('countries.createError','reference-countries');expect(notices.toasts()).toEqual([]);expect(notices.error()?.key).toBe('countries.createError');notices.dismissError();expect(notices.error()).toBeNull();
 });
});
