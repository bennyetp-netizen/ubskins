import { Facebook } from "lucide-react";

const FB_URL = "https://www.facebook.com/profile.php?id=61590372189026";

const FacebookFab = () => (
  <a
    href={FB_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook-ээр холбогдох"
    className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1877F2]/40 transition-transform hover:scale-105 active:scale-95"
  >
    <Facebook className="h-5 w-5" />
    <span className="hidden sm:inline">Facebook-ээр холбогдох</span>
  </a>
);

export default FacebookFab;
