import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

const Footer = () => {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Security", href: "#security" },
        { label: "API", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Refund Policy", href: "#" },
        { label: "Acceptable Use", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card py-16 text-muted-foreground transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-6 flex items-center gap-2">
              <BrandLogo textClassName="text-foreground" badgeClassName="h-7 w-7 rounded-lg shadow-lg shadow-primary/10" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground/80">
              Cloud communication for modern teams moving at high speed.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold text-foreground">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} CallFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
