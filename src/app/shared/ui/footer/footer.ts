import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <span class="footer__brand-name">Nic P</span>
          <span class="footer__brand-sub">The Barber</span>
          <p class="footer__tagline">Fresh cuts. Clean fades. Real craft.</p>
        </div>

        <nav class="footer__nav" aria-label="Footer navigation">
          <a routerLink="/">Home</a>
          <a routerLink="/gallery">Gallery</a>
          <a routerLink="/reservations">Book Now</a>
        </nav>

        <div class="footer__copy">
          <p>&copy; {{ year }} Nic P The Barber. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      padding: 3rem 0 1.5rem;
    }

    .footer__inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 2rem;
    }

    .footer__brand {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .footer__brand-name {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      color: var(--color-accent);
      font-weight: 700;
    }

    .footer__brand-sub {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-text-muted);
    }

    .footer__tagline {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      margin-top: 0.5rem;
      font-style: italic;
    }

    .footer__nav {
      display: flex;
      gap: 2rem;

      a {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        transition: color var(--transition);

        &:hover { color: var(--color-accent); }
      }
    }

    .footer__copy {
      text-align: right;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    @media (max-width: 768px) {
      .footer__inner {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .footer__brand { align-items: center; }
      .footer__nav { justify-content: center; }
      .footer__copy { text-align: center; }
    }
  `,
})
export class Footer {
  readonly year = new Date().getFullYear();
}
