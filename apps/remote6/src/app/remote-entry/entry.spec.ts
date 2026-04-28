import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RemoteEntry } from './entry';

describe('RemoteEntry (remote6)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RemoteEntry] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RemoteEntry);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the embedded Placeholder', () => {
    const fixture = TestBed.createComponent(RemoteEntry);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-placeholder')).not.toBeNull();
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome remote6');
  });
});
