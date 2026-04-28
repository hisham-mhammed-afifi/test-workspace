import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `
    <section class="placeholder">
      <h1>Welcome remote3 👋</h1>
      <p>Placeholder for remote3.</p>
    </section>
  `,
  styles: [
    `.placeholder { padding: 1.5rem; font-family: system-ui, sans-serif; }`,
  ],
})
export class Placeholder {}
