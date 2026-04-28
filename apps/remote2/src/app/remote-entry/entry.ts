import { Component } from '@angular/core';
import { Placeholder } from './placeholder';

@Component({
  imports: [Placeholder],
  selector: 'app-remote2-entry',
  template: `<app-placeholder></app-placeholder>`,
})
export class RemoteEntry {}
