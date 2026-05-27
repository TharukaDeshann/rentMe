"use client"

import { Link as LinkIcon } from "lucide-react"

export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-foreground mb-2">rentMe</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for vehicle rentals. Making travel easier, one booking at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#help"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#support"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-8">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                &copy; {currentYear} rentMe. All rights reserved.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  title="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.836.856 5 5 0 00-8.593 4.57A14.118 14.118 0 011.064 6.29a5 5 0 001.55 6.684 5 5 0 01-2.267-.616v.061a5 5 0 004.008 4.907 5 5 0 01-2.261.086 5 5 0 004.697 3.468A10.005 10.005 0 010 19.54a14.017 14.017 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.236-1.666-2.236-1.005 0-1.605.667-1.869 1.31-.096.227-.12.544-.12.862v5.633h-3.554v-9.68h3.514v1.32h.05c.49-.73 1.685-1.5 3.467-1.5 3.255 0 5.744 2.133 5.744 6.711v3.149zM5.337 9.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 10.019H3.555v-9.68h3.564v9.68zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
