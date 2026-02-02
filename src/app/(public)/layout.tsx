import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Simple Header for Public Pages */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">NakshatraTalks</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/browse-chat" className="hidden sm:block">
              <Button variant="primary" size="sm">
                Talk to Astrologer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold mb-4">NakshatraTalks</h3>
              <p className="text-gray-400 text-sm">
                Connect with expert Vedic astrologers for personalized consultations and guidance.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/browse-chat" className="hover:text-white">
                    Chat with Astrologer
                  </Link>
                </li>
                <li>
                  <Link href="/browse-call" className="hover:text-white">
                    Call with Astrologer
                  </Link>
                </li>
                <li>
                  <Link href="/horoscope" className="hover:text-white">
                    Daily Horoscope
                  </Link>
                </li>
                <li>
                  <Link href="/kundli" className="hover:text-white">
                    Free Kundli
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/kundli" className="hover:text-white">
                    Kundli Generation
                  </Link>
                </li>
                <li>
                  <Link href="/kundli-matching" className="hover:text-white">
                    Kundli Matching
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} NakshatraTalks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
