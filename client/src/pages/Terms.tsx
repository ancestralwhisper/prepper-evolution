import { FileText } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function Terms() {
  useSEO({
    title: "Terms of Service | Prepper Evolution",
    description: "Prepper Evolution terms of service. Information about site usage, affiliate links, calculator disclaimers, and user-submitted content.",
  });

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Welcome to Prepper Evolution (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
              or &ldquo;our&rdquo;), accessible at{" "}
              <a
                href="https://prepperevolution.com"
                className="text-primary hover:underline"
              >
                prepperevolution.com
              </a>
              . By accessing or using our website, you agree to be bound by these
              Terms of Service. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Educational & Informational Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on Prepper Evolution &mdash; including articles, guides,
              gear reviews, calculators, and tools &mdash; is provided for
              educational and informational purposes only. The information on this
              site is not a substitute for professional advice. Always use your
              own judgment and consult qualified professionals when making
              decisions about safety, health, finances, or emergency
              preparedness.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Affiliate Link Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              Prepper Evolution is a participant in affiliate programs, including
              the Amazon Services LLC Associates Program, designed to provide a
              means for us to earn fees by linking to Amazon.com and affiliated
              sites. When you click on an affiliate link and make a purchase, we
              may earn a commission at no additional cost to you. Our product
              recommendations are based on genuine evaluation and are not
              influenced by commission rates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Calculator & Tool Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our interactive tools &mdash; including the food storage calculator,
              water storage calculator, solar power calculator, bug-out bag
              builder, 72-hour kit builder, and SHTF simulator &mdash; are
              designed to provide general estimates and suggestions. Results are
              based on commonly accepted guidelines and the inputs you provide.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong className="text-foreground">
                We make no warranty or guarantee regarding the accuracy,
                completeness, or suitability of calculator results for any
                specific situation.
              </strong>{" "}
              Actual needs may vary based on your location, climate, health
              conditions, family size, and specific circumstances. Always verify
              calculations independently and prepare beyond the minimums
              suggested.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">User-Submitted Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you submit content through our site &mdash; including gear
              requests, community builds, quiz responses, or other contributions
              &mdash; you grant Prepper Evolution a non-exclusive, royalty-free,
              worldwide license to use, display, modify, and distribute that
              content on our site and social media channels. You retain ownership
              of your original content.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You agree not to submit content that is unlawful, defamatory,
              harassing, or that infringes on the intellectual property rights of
              others. We reserve the right to remove any user-submitted content at
              our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All original content on Prepper Evolution &mdash; including text,
              graphics, logos, icons, images, and software &mdash; is the
              property of Prepper Evolution or its content suppliers and is
              protected by United States and international copyright laws. You
              may not reproduce, distribute, or create derivative works from our
              content without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site contains links to third-party websites, including affiliate
              product pages, social media platforms, and external resources. We are
              not responsible for the content, privacy practices, or availability
              of these external sites. Visiting third-party sites is at your own
              risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, Prepper Evolution and its
              owner, operators, and contributors shall not be liable for any
              direct, indirect, incidental, special, consequential, or punitive
              damages arising from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 mt-3">
              <li>Your use of or inability to use the site</li>
              <li>Any errors or omissions in site content</li>
              <li>Actions taken based on information provided on the site</li>
              <li>Calculator or tool results</li>
              <li>Products purchased through affiliate links</li>
              <li>Unauthorized access to or alteration of your data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              The site and all content are provided &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo; without warranties of any kind, either
              express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Prepper Evolution, its
              owner, and contributors from any claims, damages, losses, or
              expenses (including reasonable attorney fees) arising from your use
              of the site or violation of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to update or modify these Terms of Service at
              any time. Changes will be posted on this page with an updated
              &ldquo;Last updated&rdquo; date. Your continued use of the site
              after changes are posted constitutes acceptance of the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the State of New Jersey, United States,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, contact us at{" "}
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
