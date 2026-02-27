import { Link } from "wouter";
import { Mail, MessageSquare, Instagram, Send } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/prepperevolution",
    description: "Follow us and DM anytime",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@prepperevolution",
    description: "Watch and comment on our videos",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@prepperevolution",
    description: "Subscribe and join the conversation",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/MSasarak21074",
    description: "Follow for quick updates",
  },
];

export default function Contact() {
  useSEO({
    title: "Contact | Prepper Evolution",
    description: "Get in touch with the Prepper Evolution team. Questions about gear, articles, partnerships, or just want to connect — we want to hear from you.",
  });

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Have a question, suggestion, or just want to connect? We love hearing
            from the community.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <Send className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-extrabold mb-2">Email Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                For general inquiries, partnership opportunities, or press requests, drop us a line:
              </p>
              <a
                href="mailto:contact@prepperevolution.com"
                className="text-primary hover:underline font-semibold text-lg"
                data-testid="link-email"
              >
                contact@prepperevolution.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-extrabold mb-2">Product & Gear Requests</h2>
              <p className="text-muted-foreground leading-relaxed">
                Want us to review a specific product or cover a topic? Use the request
                forms built into our{" "}
                <Link href="/tools" className="text-primary hover:underline font-medium">
                  calculators and tools
                </Link>
                , or reach out on social media. We prioritize requests from the
                community.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Instagram className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-extrabold">Connect on Social</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors group shadow-sm"
                data-testid={`link-social-${social.name.toLowerCase().replace(/[^a-z]/g, '')}`}
              >
                <h3 className="font-bold group-hover:text-primary transition-colors mb-1">
                  {social.name}
                </h3>
                <p className="text-sm text-muted-foreground">{social.description}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 border-l-4 border-primary pl-5 py-2 bg-primary/5 rounded-r-lg">
          <p className="text-foreground font-medium italic">
            &ldquo;This site was built for the community. Your feedback, ideas, and
            suggestions make it better for everyone. Don&apos;t be a stranger.&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-1">&mdash; Mike, Founder</p>
        </div>
      </div>
    </div>
  );
}
