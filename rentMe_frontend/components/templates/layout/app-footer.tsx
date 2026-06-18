"use client";

import { Car } from "lucide-react";

const LINKS = {
  product: [
    { label: "How it works",  href: "#" },
    { label: "Browse Vehicles", href: "#" },
    { label: "Become an Owner", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#terms" },
    { label: "Privacy Policy",   href: "#privacy" },
    { label: "Cookie Policy",    href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#help" },
    { label: "FAQ",         href: "#faq" },
    { label: "Contact Us",  href: "#contact" },
  ],
};

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                rentMe
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Your trusted platform for peer-to-peer vehicle rentals from verified owners.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2">
              {LINKS.product.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2">
              {LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              {LINKS.legal.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} rentMe. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              {
                title: "Facebook",
                d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
              },
              {
                title: "Twitter / X",
                d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
              },
              {
                title: "LinkedIn",
                d: "M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.236-1.666-2.236-1.005 0-1.605.667-1.869 1.31-.096.227-.12.544-.12.862v5.633h-3.554v-9.68h3.514v1.32h.05c.49-.73 1.685-1.5 3.467-1.5 3.255 0 5.744 2.133 5.744 6.711v3.149zM5.337 9.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.119 20.452H3.555v-9.68h3.564v9.68zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
              },
            ].map(({ title, d }) => (
              <a
                key={title}
                href="#"
                title={title}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}