import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-container dark:bg-surface-container-lowest w-full relative border-t border-outline-variant/50 mt-stack-xl pb-24 md:pb-0">
      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-xl flex flex-col gap-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary mb-4">AURA CRAFT</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Crafting excellence with handcrafted pieces that bring warmth and elegance to your space.</p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="/about">About Us</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="#">Newsletter</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="#">Shipping</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="#">Returns</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="/about">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="#">Pinterest</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all hover:opacity-70" href="#">Instagram</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant/30 pt-8 flex justify-center">
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">© {new Date().getFullYear()} AURA CRAFT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
