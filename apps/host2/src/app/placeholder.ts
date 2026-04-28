import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `
    <section class="placeholder">
      <h1>Welcome host2 👋</h1>
      <p>Placeholder for host2.</p>
    </section>
  `,
  styles: [
    `.placeholder { padding: 1.5rem; font-family: system-ui, sans-serif; }`,
  ],
})
export class Placeholder {}
