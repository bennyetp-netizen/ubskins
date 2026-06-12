import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LogIn, CreditCard, Send, Sparkles, BadgeCheck, CheckCircle2, Wallet, Truck, Activity, Headphones, Zap, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SkinCard from "@/components/SkinCard";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useSkins } from "@/hooks/useSkins";
import { formatMNT } from "@/data/skins";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const { user, signInWithSteam } = useAuth();
  const { skins } = useSkins({ featuredOnly: true });
  const { skins: allSkins } = useSkins();
  const featured = (skins.length > 0 ? skins : allSkins).slice(0, 4);

  const faqs = (t("home.faqs", { returnObjects: true }) as { q: string; a: string }[]) || [];

  const handleSteam = async () => {
    if (user) {
      window.location.href = "/account";
      return;
    }
    try {
      await signInWithSteam();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    }
  };

  const trustBadges = [
    { icon: BadgeCheck, label: t("home.trust1") },
    { icon: CheckCircle2, label: t("home.trust2") },
    { icon: Wallet, label: t("home.trust3") },
    { icon: Truck, label: t("home.trust4") },
  ];

  const recentActivity = [
    { user: "bataa_mn", action: t("home.actBuy"), item: "AK-47 | Redline (FT)" },
    { user: "tsetsegee", action: t("home.actReceive"), item: "★ Karambit | Doppler" },
    { user: "khangai99", action: t("home.actOrder"), item: "AWP | Asiimov (FT)" },
    { user: "munkhuu", action: t("home.actBuy"), item: "M4A4 | Howl (MW)" },
    { user: "anar_cs", action: t("home.actReceive"), item: "★ Butterfly | Fade" },
    { user: "saruul", action: t("home.actBuy"), item: "Glock-18 | Fade" },
    { user: "temuujin", action: t("home.actOrder"), item: "USP-S | Kill Confirmed" },
    { user: "dorj_gg", action: t("home.actReceive"), item: "★ Bayonet | Tiger Tooth" },
  ];

  const features = [
    { icon: Wallet, title: t("home.feat1Title"), desc: t("home.feat1Desc") },
    { icon: Zap, title: t("home.feat2Title"), desc: t("home.feat2Desc") },
    { icon: BadgeCheck, title: t("home.feat3Title"), desc: t("home.feat3Desc") },
    { icon: ShieldCheck, title: t("home.feat4Title"), desc: t("home.feat4Desc") },
    { icon: Headphones, title: t("home.feat5Title"), desc: t("home.feat5Desc") },
    { icon: CreditCard, title: t("home.feat6Title"), desc: t("home.feat6Desc") },
  ];

  const steps = [
    { icon: ShoppingBag, title: t("home.step1Title"), desc: t("home.step1Desc") },
    { icon: CreditCard, title: t("home.step2Title"), desc: t("home.step2Desc") },
    { icon: Send, title: t("home.step3Title"), desc: t("home.step3Desc") },
    { icon: Package, title: t("home.step4Title"), desc: t("home.step4Desc") },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 -z-10 animated-gradient-bg" />
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1024} className="h-full w-full object-cover opacity-25 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-orb" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-orb" style={{ animationDelay: "-5s" }} />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-orb" style={{ animationDelay: "-9s" }} />
        </div>

        <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t("home.heroBadge")}
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {t("home.heroTitle1")} <span className="text-gradient-primary">{t("home.heroTitle2")}</span>
              <br />
              {t("home.heroTitle3")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              {t("home.heroDesc1")} <span className="text-foreground font-medium">{t("home.heroDescStrong")}</span>{t("home.heroDesc2")}
            </p>
            <p className="mt-3 max-w-xl text-sm font-semibold text-orange-400 md:text-base">
              {t("home.heroPreorder")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  {t("home.ctaShop")} <ArrowRight className="ml-1" />
                </Button>
              </Link>
              <Link to="/account">
                <Button variant="steam" size="xl">
                  {t("home.ctaSell")}
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {trustBadges.map((b) => (
                <div key={b.label} className="glass-card group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(186_100%_50%/0.25)]">
                  <b.icon className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium text-foreground/90">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-8 rounded-full bg-primary/25 blur-3xl animate-pulse" />
              <div className="absolute inset-16 rounded-full bg-accent/20 blur-3xl" />
              <div className="glass-card absolute inset-0 rounded-3xl p-6 shadow-[0_30px_80px_-20px_hsl(186_100%_50%/0.45)]">
                {featured[0] ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 font-semibold text-accent">
                        <Sparkles className="h-3 w-3" /> {t("home.featured")}
                      </span>
                      <span className="text-muted-foreground">{t("home.instantVerified")}</span>
                    </div>
                    <div className="relative mt-2 flex h-[70%] items-center justify-center">
                      <img src={featured[0].image} alt={featured[0].name} className="max-h-full animate-float-slow drop-shadow-[0_20px_60px_hsl(186_100%_50%/0.6)]" />
                    </div>
                    <div className="mt-2">
                      <div className="truncate font-display text-lg font-semibold">{featured[0].name}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("home.floatVerified")}</span>
                        <span className="font-display text-lg font-bold text-gradient-primary">
                          {new Intl.NumberFormat("mn-MN").format(featured[0].price)}₮
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">{t("common.loading")}</div>
                )}
              </div>
            </div>

            <div className="glass-card mt-6 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/90">
                  <Activity className="h-3.5 w-3.5 text-accent" />
                  {t("home.recent")}
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  {t("common.live")}
                </span>
              </div>
              <div className="relative h-32 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
                <div className="animate-ticker">
                  {[...recentActivity, ...recentActivity].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 text-xs">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {a.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-foreground">{a.user}</span>
                        <span className="text-muted-foreground"> {a.action} </span>
                        <span className="font-medium text-primary">{a.item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" /> {t("home.whyBadge")}
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            {t("home.whyTitle1")} <span className="text-gradient-primary">{t("home.whyTitleAccent")}</span> {t("home.whyTitle2")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("home.whyDesc")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_50px_-15px_hsl(186_100%_50%/0.4)]" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-60 opacity-30" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 text-primary ring-1 ring-primary/30">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t("home.howTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("home.howSub")}</p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                  <div className="absolute -top-4 left-6 inline-flex h-8 items-center rounded-full bg-gradient-to-r from-primary to-accent px-3 text-xs font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(186_100%_50%/0.6)]">
                    {t("home.step")} {i + 1}
                  </div>
                  <div className="mb-3 mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 transition-transform group-hover:scale-110">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("home.readyTitle")}</h2>
            <p className="mt-2 text-sm text-emerald-400/90">{t("home.readySub")}</p>
          </div>
          <Link to="/shop" className="hidden text-sm text-primary hover:underline sm:inline">
            {t("home.viewAll")}
          </Link>
        </div>
        {(() => {
          const ready = allSkins.filter((s) => s.productType === "ready").slice(0, 8);
          if (ready.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                {t("home.readyEmpty")}
              </div>
            );
          }
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ready.map((s) => <SkinCard key={s.id} skin={s} />)}
            </div>
          );
        })()}
      </section>

      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("home.preorderTitle")}</h2>
            <p className="mt-2 text-sm text-orange-400/90">{t("home.preorderSub")}</p>
          </div>
          <Link to="/shop" className="hidden text-sm text-primary hover:underline sm:inline">
            {t("home.viewAll")}
          </Link>
        </div>
        {(() => {
          const preorder = allSkins.filter((s) => s.productType === "preorder").slice(0, 8);
          if (preorder.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                {t("home.preorderEmpty")}
              </div>
            );
          }
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {preorder.map((s) => <SkinCard key={s.id} skin={s} />)}
            </div>
          );
        })()}
      </section>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("home.faqTitle")}</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="rounded-2xl border border-border bg-gradient-card px-5">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              {t("home.ctaTitle1")} <span className="text-gradient-primary">{t("home.ctaTitleAccent")}</span> {t("home.ctaTitle2")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("home.ctaDesc")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/shop"><Button variant="hero" size="xl">{t("home.ctaShop")}</Button></Link>
              <Button variant="steam" size="xl" onClick={handleSteam}>
                <LogIn className="mr-1" /> {t("nav.loginSteam")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
