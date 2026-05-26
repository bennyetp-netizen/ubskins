import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LogIn, CreditCard, Send, Sparkles, Lock, BadgeCheck, CheckCircle2, Wallet, Truck, Activity, Star, MessageCircle, Headphones, Zap, Globe2, Quote, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SkinCard from "@/components/SkinCard";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useSkins } from "@/hooks/useSkins";
import { toast } from "sonner";

const faqs = [
  { q: "Storepay-р яаж худалдан авах вэ?", a: "Buy with Storepay товчийг дарж дансаараа нэвтэрснээр үнийн дүнг 4 хувааж, хүүгүй төлнө. Эхний төлбөр шууд төлөгдөнө." },
  { q: "Хэдийд скин минийх болох вэ?", a: "Төлбөр баталгаажсаны дараа Steam trade offer-р хүргэгдэнэ. Та Steam-д trade offer-оо хүлээн авч баталгаажуулаарай." },
  { q: "Энэ gambling уу?", a: "Үгүй. Манай платформ дээр case opening, roulette, jackpot, betting байхгүй. Зөвхөн store inventory-оос шууд скин худалдаалдаг." },
  { q: "Trade hold хэр удаан байх вэ?", a: "Steam Mobile Authenticator идэвхжүүлсэн бол шууд. Үгүй бол Valve-н нөхцөлөөр 7-15 хоног." },
  { q: "Үнэ юунд тулгуурладаг вэ?", a: "Steam Market болон third-party-н дундаж үнэд тулгуурлан, MNT ханшаар тооцон тогтоодог." },
];

const Index = () => {
  const { user, signInWithSteam } = useAuth();
  const { skins } = useSkins({ featuredOnly: true });
  const { skins: allSkins } = useSkins();
  const featured = (skins.length > 0 ? skins : allSkins).slice(0, 4);

  const handleSteam = async () => {
    if (user) {
      window.location.href = "/account";
      return;
    }
    try {
      await signInWithSteam();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа");
    }
  };
  const trustBadges = [
    { icon: BadgeCheck, label: "Float шалгасан" },
    { icon: CheckCircle2, label: "Trade баталгаажсан" },
    { icon: Wallet, label: "Storepay-р авах" },
    { icon: Truck, label: "Найдвартай хүргэлт" },
  ];

  const recentActivity = [
    { user: "bataa_mn", action: "худалдаж авлаа", item: "AK-47 | Redline (FT)" },
    { user: "tsetsegee", action: "хүлээн авлаа", item: "★ Karambit | Doppler" },
    { user: "khangai99", action: "захиаллаа", item: "AWP | Asiimov (FT)" },
    { user: "munkhuu", action: "худалдаж авлаа", item: "M4A4 | Howl (MW)" },
    { user: "anar_cs", action: "хүлээн авлаа", item: "★ Butterfly | Fade" },
    { user: "saruul", action: "худалдаж авлаа", item: "Glock-18 | Fade" },
    { user: "temuujin", action: "захиаллаа", item: "USP-S | Kill Confirmed" },
    { user: "dorj_gg", action: "хүлээн авлаа", item: "★ Bayonet | Tiger Tooth" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Animated gradient + image background */}
        <div className="absolute inset-0 -z-10 animated-gradient-bg" />
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1024} className="h-full w-full object-cover opacity-25 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          {/* Floating glow orbs */}
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
              Шууд маркет · Монголд №1
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Монголын <span className="text-gradient-primary">CS2 Skin</span>
              <br />
              Marketplace
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Steam skin-үүдээ <span className="text-foreground font-medium">аюулгүй, хурдан, local payment</span>-тай аваарай.
              Storepay, QPay, банкны шилжүүлэг — бүгд төгрөгөөр.
            </p>
            <p className="mt-3 max-w-xl text-sm font-semibold text-orange-400 md:text-base">
              💰 30% урьдчилгаа төлөөд скинээ захиалаад өдөрт нь аваарай!
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Скин үзэх <ArrowRight className="ml-1" />
                </Button>
              </Link>
              <Link to="/account">
                <Button variant="steam" size="xl">
                  Скин зарах
                </Button>
              </Link>
            </div>

            {/* Trust indicator chips */}
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {trustBadges.map((b) => (
                <div
                  key={b.label}
                  className="glass-card group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(186_100%_50%/0.25)]"
                >
                  <b.icon className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium text-foreground/90">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: skin showcase + live ticker */}
          <div className="relative">
            {/* Premium knife/glove showcase */}
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-8 rounded-full bg-primary/25 blur-3xl animate-pulse" />
              <div className="absolute inset-16 rounded-full bg-accent/20 blur-3xl" />
              <div className="glass-card absolute inset-0 rounded-3xl p-6 shadow-[0_30px_80px_-20px_hsl(186_100%_50%/0.45)]">
                {featured[0] ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 font-semibold text-accent">
                        <Sparkles className="h-3 w-3" /> Онцлох
                      </span>
                      <span className="text-muted-foreground">Шууд · Баталгаажсан</span>
                    </div>
                    <div className="relative mt-2 flex h-[70%] items-center justify-center">
                      <img
                        src={featured[0].image}
                        alt={featured[0].name}
                        className="max-h-full animate-float-slow drop-shadow-[0_20px_60px_hsl(186_100%_50%/0.6)]"
                      />
                    </div>
                    <div className="mt-2">
                      <div className="truncate font-display text-lg font-semibold">{featured[0].name}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Float шалгасан · Trade баталгаажсан</span>
                        <span className="font-display text-lg font-bold text-gradient-primary">
                          {new Intl.NumberFormat("mn-MN").format(featured[0].price)}₮
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>
                )}
              </div>
            </div>

            {/* Live activity ticker */}
            <div className="glass-card mt-6 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/90">
                  <Activity className="h-3.5 w-3.5 text-accent" />
                  Сүүлд худалдан авалт
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  ШУУД
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

      {/* Why UBskins */}
      <section className="container py-16">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" /> Яагаад UBskins?
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Монголд <span className="text-gradient-primary">итгэгдсэн</span> CS2 marketplace
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Local payment, гар аргаар float шалгалт, шуурхай trade — бүгд нэг дор.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wallet, title: "Local төлбөр", desc: "QPay, Storepay, банкны шилжүүлэг — төгрөгөөр л шууд төл." },
            { icon: Zap, title: "Шуурхай хүргэлт", desc: "Төлбөр баталгаажсан тэр даруйд trade offer илгээнэ." },
            { icon: BadgeCheck, title: "Float шалгасан", desc: "Скин бүрийн float-ыг гар аргаар шалгана." },
            { icon: ShieldCheck, title: "Trade баталгаажсан", desc: "Албан Steam trade — scam, fake account-аас хамгаалагдсан." },
            { icon: Headphones, title: "Монгол support", desc: "Монгол хэлээр 24/7 чат, утсаар тусална." },
            { icon: CreditCard, title: "Storepay-р авах", desc: "Хүүгүй 4 хуваан төлбөр — өнөөдөр л скинээ ав." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_50px_-15px_hsl(186_100%_50%/0.4)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
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

      {/* How it works — visual flow */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Хэрхэн ажилладаг вэ</h2>
          <p className="mt-2 text-muted-foreground">4 хялбар алхам — 5 минутад скинтэй</p>
        </div>
        <div className="relative">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShoppingBag, title: "Скинээ сонгоно", desc: "Зэвсэг, wear, float-оор шүүж тохирох скинээ ол." },
              { icon: CreditCard, title: "Аюулгүй төлбөр", desc: "QPay, Storepay, банкаар төгрөгөөр шууд төл." },
              { icon: Send, title: "Trade link илгээ", desc: "Steam trade URL-аа орууллаа уу. Бид зөвхөн албан Steam trade ашигладаг." },
              { icon: Package, title: "Скинээ хүлээн ав", desc: "Trade offer 5 минутад очно. Steam дээр хүлээн ав." },
            ].map((s, i) => (
              <div key={s.title} className="relative">
                <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                  <div className="absolute -top-4 left-6 inline-flex h-8 items-center rounded-full bg-gradient-to-r from-primary to-accent px-3 text-xs font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(186_100%_50%/0.6)]">
                    Алхам {i + 1}
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

      {/* Trust & Social Proof */}
      <section className="container py-16">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
            <Star className="h-3 w-3 fill-accent" /> Хэрэглэгчдийн сэтгэгдэл
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            <span className="text-gradient-primary">2,400+</span> хэрэглэгч итгэн ашигладаг
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</span>
              <span className="font-semibold text-foreground">4.9/5</span> · 380+ үнэлгээ
            </span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> 5,800+ амжилттай trade</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> 0 scam report</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Tamir.B", handle: "Steam · Lvl 24", text: "AK Redline-аа 7 минутад авлаа. Storepay-р хуваагаад асуудалгүй. Recommend!", item: "AK-47 | Redline (FT)" },
            { name: "Bilguun", handle: "Steam · Lvl 41", text: "Float-аа гар аргаар шалгаад баталгаажуулсан, яг хүссэн скин. Монгол support супер.", item: "★ Karambit | Doppler" },
            { name: "Enkhjin", handle: "Steam · Lvl 18", text: "QPay-р шууд төлөөд 5 минутад trade offer ирлээ. Хамгийн найдвартай газар.", item: "AWP | Asiimov (FT)" },
          ].map((r) => (
            <div key={r.name} className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/50">
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/20" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.handle}</div>
                </div>
              </div>
              <div className="mt-3 flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}
              </div>
              <p className="mt-2 text-sm text-foreground/90">"{r.text}"</p>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Хүргэлт баталгаажсан
                </span>
                <span className="truncate text-xs font-medium text-primary">{r.item}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5">
            <Globe2 className="h-3.5 w-3.5 text-primary" /> Steam OpenID баталгаажсан
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" /> SSL хамгаалалттай
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-primary" /> Discord нийгэмлэг
          </span>
        </div>
      </section>

      {/* Ready (БЭЛЭН) section */}
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">🟢 БЭЛЭН СКИНҮҮД</h2>
            <p className="mt-2 text-sm text-emerald-400/90">Шууд бэлэн — өнөөдөр хүргэнэ</p>
          </div>
          <Link to="/shop" className="hidden text-sm text-primary hover:underline sm:inline">
            Бүгдийг үзэх →
          </Link>
        </div>
        {(() => {
          const ready = allSkins.filter((s) => s.productType === "ready").slice(0, 8);
          if (ready.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Бэлэн скин одоогоор алга. Удахгүй нэмэгдэнэ.
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

      {/* Pre-order (ЗАХИАЛГА) section */}
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">🟡 ЗАХИАЛГААР</h2>
            <p className="mt-2 text-sm text-orange-400/90">Захиалгаар — өдөрт нь хүргэнэ</p>
          </div>
          <Link to="/shop" className="hidden text-sm text-primary hover:underline sm:inline">
            Бүгдийг үзэх →
          </Link>
        </div>
        {(() => {
          const preorder = allSkins.filter((s) => s.productType === "preorder").slice(0, 8);
          if (preorder.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Захиалгын скин одоогоор алга.
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

      {/* FAQ */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Түгээмэл асуултууд</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`f-${i}`}
                className="rounded-2xl border border-border bg-gradient-card px-5"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Анхны скинээ <span className="text-gradient-primary">өнөөдөр</span> аваарай
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Storepay-р 4 хуваагаад л хэрэгтэй скиндээ хүрнэ.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/shop"><Button variant="hero" size="xl">Скин үзэх</Button></Link>
              <Button variant="steam" size="xl" onClick={handleSteam}>
                <LogIn className="mr-1" /> Steam-р нэвтрэх
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
