import { Link } from "wouter";
import { ChevronLeft, Zap, TreePine, Mountain, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";

export default function About() {
  useSEO({
    title: "About | Prepper Evolution",
    description: "Meet Mike — a 21-year electrical worker from New Jersey who does mutual aid storm deployments across the country. Camping, overlanding, and building real-world preparedness skills.",
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-muted/30 py-20 md:py-32 border-b border-border">
        <div className="max-w-[800px] mx-auto px-4 md:px-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tight mb-4">
              Meet <span className="text-primary">Mike</span>
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
              Founder &amp; Editor
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-5 text-muted-foreground text-lg leading-relaxed"
        >
          <p>
            Mike here — just your average guy from New Jersey who's been working in the
            electrical trade for 21 years. Part of my job involves mutual aid deployments —
            when major storms knock out power, I get sent wherever the damage is. I've
            worked storm restoration in California, Texas, Florida, and Maine. You see a lot
            when the grid goes down for real: people without water, without food, without a
            plan. That experience is a big part of why this site exists.
          </p>

          <p>
            When I'm not working, I'm outside. I have a cabin in Pennsylvania —
            just a tank of gas away — that I get to as often as I can. Solo, with family,
            or with friends. We hike, fly fish,
            find swimming holes, kayak, ice fish in the winter, and practice the kind of outdoor
            skills that most people only read about. The Pine Barrens, the Poconos, Delaware Water
            Gap, PA state forests — that's my home turf.
          </p>

          <p>
            I also get out West when I can. SxS and off-roading in Utah and Nevada, trail riding
            in West Virginia, Pennsylvania, and Tennessee. There's something about running
            trails with a great group of friends (I consider family) in big open country that
            makes you appreciate being prepared and self-reliant in a way that sitting at home
            never will.
          </p>

          <p>
            I'm a family guy with a family of five. The gear I test has to work for
            solo cabin weekends and family camping trips with kids. That's a different
            standard than what most gear reviewers use, and it keeps my recommendations honest.
          </p>

          <p>
            I built Prepper Evolution because most prepping content online is either
            fear-mongering nonsense or robotic product lists written by people who've
            never left their desk. I wanted a site with real experience, honest opinions, and
            practical advice from someone who actually uses this stuff — not because the world
            is ending, but because being prepared is just smart living.
          </p>

          <p className="text-foreground font-medium italic border-l-4 border-primary pl-5 py-2 bg-primary/5 rounded-r-lg">
            "We're not here for a long time, so might as well have a good time. Do good,
            be good."
          </p>

          <p>
            God, family, the outdoors, hard work, and making the most of every moment — that's
            my story. If you're into the same things, welcome to the crew.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold">21</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Years as a Lineman</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold">5</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Family Members</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <TreePine className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold">NJ</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Home Base</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Mountain className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold">&infin;</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Trails to Explore</p>
            </div>
          </div>

          <div className="mt-12 bg-muted rounded-lg p-6 sm:p-8 border border-border">
            <h3 className="text-xl font-extrabold mb-4">What Drives This Site</h3>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  <strong className="text-foreground">Real experience, not armchair advice.</strong> Every
                  piece of gear I recommend has been used in the field — on camping trips, overlanding runs,
                  or stashed in a go-bag.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  <strong className="text-foreground">Preparedness meets adventure.</strong> Prepping
                  isn't about hiding in a bunker. It's about having the skills and gear to
                  handle whatever comes — and enjoying the outdoors while you build them.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                <p>
                  <strong className="text-foreground">Community over fear.</strong> No doomsday nonsense.
                  Just like-minded people sharing knowledge, building skills, and strengthening each other.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}