import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Placeholder } from './placeholder';

describe('Placeholder (remote2)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Placeholder] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Placeholder);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the remote2 welcome heading', () => {
    const fixture = TestBed.createComponent(Placeholder);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome remote2');
  });
});
