import { progressPercentage } from './progress-meter';
describe('Shared progress meter bounds',()=>{
  it('represents a finite bounded percentage including zero/invalid limits and over-capacity usage',()=>{
    expect(progressPercentage(0,0)).toBe(0);expect(progressPercentage(5,0)).toBe(0);expect(progressPercentage(8,10)).toBe(80);expect(progressPercentage(15,10)).toBe(100);expect(progressPercentage(-1,10)).toBe(0);expect(progressPercentage(NaN,10)).toBe(0);
  });
});
