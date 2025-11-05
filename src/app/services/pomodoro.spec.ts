import { TestBed } from '@angular/core/testing';

import { Pomodoro } from './pomodoro';

describe('Pomodoro', () => {
  let service: Pomodoro;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pomodoro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
