import { Link } from "wouter";
import { ChevronRight, ChevronLeft, Map, Package, Shield, Battery, Navigation, BookOpen, Zap, TreePine, Mountain, Users, Target, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";

export default function StartHere() {
  useSEO({
    title: "Start Here | Prepper Evolution",
    description: "Meet Mike — a 21-year electrical worker from New Jersey who does mutual aid storm deployments across the country. Camping, overlanding, and building real-world preparedness skills.",
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="bg-muted/30 py-20 md:py-32 border-b border-border">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tight mb-6">
              New to Prepping? <span className="text-primary block md:inline">Start Here.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Whether you're a complete beginner or an experienced overlander looking to level up, we've got you covered. No fear-mongering, no tinfoil hats — just practical, field-tested knowledge.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 space-y-24">
        
        {/* Section 1 - Read This First */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary font-display">1</span>
            </div>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Read This First</h2>
          </div>
          <Link href="/articles/beginners-guide-to-prepping" className="group block">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600" alt="Campfire survival" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl md:text-3xl font-display font-bold group-hover:text-primary transition-colors">The Complete Beginner's Guide to Prepping</h3>
                  <p className="text-lg text-muted-foreground">
                    Our complete beginner's guide covers everything you need to know to start preparing — without overwhelming you or breaking the bank.
                  </p>
                  <span className="inline-flex items-center text-primary font-bold text-lg pt-4">
                    Read the Guide <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* Section 2 - Build Your Foundation */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary font-display">2</span>
            </div>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Build Your Foundation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/articles/building-your-first-bug-out-bag" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" alt="Tactical backpack" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">Build Your Bug Out Bag</h3>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/articles/water-purification-methods" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600" alt="Flowing water" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">Learn Water Purification</h3>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/articles/long-term-food-storage-guide" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600" alt="Food storage shelves" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">Stock Your Food Supply</h3>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Section 3 - Go Deeper */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary font-display">3</span>
            </div>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Go Deeper</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/articles/emergency-communication-grid-down" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=600" alt="Radio equipment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">Emergency Comms</h3>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/articles/first-aid-essentials-survival" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600" alt="First aid kit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">First Aid Essentials</h3>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/articles/home-security-budget" className="group">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1558002038-1055907df827?w=600" alt="Home security" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md">Home Security on a Budget</h3>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section 4 - Explore by Interest */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Explore by Interest</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: "Preparedness", link: "/category/preparedness", icon: Shield },
                { name: "Overlanding", link: "/category/overlanding", icon: Navigation },
                { name: "Camping", link: "/category/camping", icon: Map },
                { name: "Gear Reviews", link: "/category/gear-reviews", icon: Package },
                { name: "Skills & Strategy", link: "/category/skills-&-strategy", icon: BookOpen },
              ].map((category) => (
                <Link key={category.name} href={category.link} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      <category.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-bold font-display text-lg group-hover:text-primary transition-colors">{category.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Section 5 - Browse Our Top Gear */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Browse Our Top Gear</h2>
            </div>
            <Link href="/products" className="group block h-[calc(100%-80px)]">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" alt="Gear layout" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                    Every product we recommend has been researched, compared, and vetted. No sponsored picks — just gear that works.
                  </p>
                  <div className="mt-auto flex items-center text-primary font-bold text-lg">
                    View Gear Reviews <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        </div>

        {/* Meet Mike */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-t border-border pt-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight mb-2">
              Meet <span className="text-primary">Mike</span>
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-8">
              Founder &amp; Editor
            </p>

            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
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
            </div>

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
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary/5 border border-primary/20 rounded-3xl p-10 md:p-16 text-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight mb-6">
              Ready to dig in?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
              Start with The Complete Beginner's Guide to Prepping.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all" asChild>
              <Link href="/articles/beginners-guide-to-prepping">
                Read the Guide <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.section>
        
      </div>
    </div>
  );
}