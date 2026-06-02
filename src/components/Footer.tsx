import { Shield, Mail, MessageCircle, Facebook } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/60 bg-card/40">
    <div className="container py-12">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            UB<span className="text-primary">Skins</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Монголын анхны найдвартай CS2 скиний дэлгүүр. Gamble биш, шууд худалдаа.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Линк</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Нүүр</li>
            <li>Дэлгүүр</li>
            <li>FAQ</li>
            <li>Үйлчилгээний нөхцөл</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Холбогдох</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@ubskins.mn</li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=61590372189026"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            </li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Discord</li>
        </div>
      </div>
      <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UBSkins — Бүх эрх хуулиар хамгаалагдсан
      </div>
    </div>
  </footer>
);

export default Footer;
