import { Component } from '@angular/core';
import { Placeholder } from './placeholder';

@Component({
  imports: [Placeholder],
  selector: 'app-remote6-entry',
  template: `<app-placeholder></app-placeholder>`,
})
export class RemoteEntry {}
