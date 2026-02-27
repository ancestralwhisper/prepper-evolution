import { ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy | Prepper Evolution",
    description: "Prepper Evolution privacy policy. Learn how we handle your data, cookies, analytics, and affiliate links.",
  });

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <p className="text-muted-foreground text-lg leading-relaxed">
              At Prepper Evolution (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;), accessible at{" "}
              <a
                href="https://prepperevolution.com"
                className="text-primary hover:underline"
              >
                prepperevolution.com
              </a>
              , your privacy matters to us. This Privacy Policy explains what
              information we collect, how we use it, and your choices regarding
              that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Information We Collect</h2>

            <h3 className="text-lg font-bold mb-2 mt-6">Analytics Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use Google Analytics 4 (GA4) to understand how visitors use our
              site. GA4 collects anonymized data such as pages visited, time on
              site, referring URLs, general geographic region, device type, and
              browser. This data is aggregated and does not personally identify
              you. Google&apos;s privacy policy governs how they process this
              data.
            </p>

            <h3 className="text-lg font-bold mb-2 mt-6">Newsletter Signup</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you voluntarily subscribe to our email newsletter (powered by
              Kit, formerly ConvertKit), we collect your email address and, optionally,
              your first name. We use this information solely to send you
              preparedness content, gear recommendations, and site updates. You
              can unsubscribe at any time via the link in every email.
            </p>

            <h3 className="text-lg font-bold mb-2 mt-6">Calculator & Tool Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our interactive tools (food storage calculator, water storage
              calculator, bug-out bag builder, etc.) store your inputs and
              results using your browser&apos;s localStorage. This data stays on
              your device only &mdash; it is never transmitted to our servers or
              any third party.
            </p>

            <h3 className="text-lg font-bold mb-2 mt-6">Community Submissions</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you submit gear requests, community builds, or other
              user-generated content through our tools, that content may be
              stored on our servers to display on the site. We do not require
              personal information to make submissions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use minimal cookies. Google Analytics sets cookies to
              distinguish unique users and throttle request rates. We may also
              use essential cookies for site functionality (such as theme
              preference). We do not use advertising cookies or sell your data to
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Affiliate Links & Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              Prepper Evolution is a participant in affiliate programs, including
              the Amazon Services LLC Associates Program and other affiliate
              networks. When you click an affiliate link on our site and make a
              purchase, we may earn a commission at no additional cost to you.
              Affiliate partners may use cookies to track referrals. These cookies
              are governed by the respective affiliate program&apos;s privacy
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the following third-party services, each with their own
              privacy policies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>
                <strong className="text-foreground">Google Analytics 4</strong> &mdash;
                website analytics
              </li>
              <li>
                <strong className="text-foreground">Kit (ConvertKit)</strong> &mdash;
                email newsletter
              </li>
              <li>
                <strong className="text-foreground">Cloudflare</strong> &mdash;
                CDN, security, and DNS
              </li>
              <li>
                <strong className="text-foreground">Amazon Associates</strong> &mdash;
                affiliate product links
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain newsletter subscriber data until you unsubscribe.
              Analytics data is retained according to Google&apos;s default
              retention settings (14 months). localStorage data on your device
              persists until you clear your browser data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Your Rights (CCPA / GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction or deletion of your personal data</li>
              <li>Opt out of data collection (e.g., by disabling cookies or using browser privacy settings)</li>
              <li>Unsubscribe from our email list at any time</li>
              <li>Request that we do not sell your personal information (we do not sell personal data)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:contact@prepperevolution.com"
                className="text-primary hover:underline"
              >
                contact@prepperevolution.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site is not directed at children under 13. We do not knowingly
              collect personal information from children. If you believe we have
              inadvertently collected such data, please contact us and we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be
              posted on this page with an updated &ldquo;Last updated&rdquo; date.
              Your continued use of the site after any changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:contact@prepperevolution.com"
                className="text-primary hover:underline"
              >
                contact@prepperevolution.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
