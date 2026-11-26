import type { ReactNode } from "react";
import Image from "next/image";
import { footerData } from "./footerData";
import "./ContactFooter.css";

type SocialId = (typeof footerData.networks)[number]["id"];

const SOCIAL_ICONS: Record<SocialId, ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  ),
};

export default function ContactFooter() {
  return (
    <footer className="contact-footer">
      {/* LEFT: Main visual */}
      <section className="cf-visual">
        <Image
          src={footerData.mainImage}
          alt="Main visual"
          fill
          priority
          quality={100}
          sizes="(max-width: 700px) 260px, (max-width: 1100px) 340px, 360px"
          className="cf-visual__image"
        />

        <div className="cf-visual__overlay" />
      </section>

      {/* RIGHT: Grid */}
      <div className="cf-right">
        {/* Avant-première event info */}
        <section className="cf-card cf-opening">
          <h3 className="cf-card__title">{footerData.openingTitle}</h3>

          <div className="cf-opening__list">
            {footerData.openingHours.map((item) => (
              <div className="cf-opening__row" key={item.day}>
                <span className="cf-opening__day">{item.day}</span>
                <span className="cf-opening__hours">{item.hours}</span>
              </div>
            ))}
          </div>

          <div className="cf-opening__tickets">
            <p className="cf-opening__ticket-title">{footerData.ticketTitle}</p>
            <table className="cf-opening__table">
              <tbody>
                {footerData.tickets.map((t) => (
                  <tr key={t.category}>
                    <td className="cf-opening__cat">{t.category}</td>
                    <td className="cf-opening__price">{t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cf-opening__reservation">
            <span className="cf-opening__res-label">📞 Infos &amp; réservation</span>
            <a href={`tel:${footerData.reservationPhone}`} className="cf-opening__res-phone">
              {footerData.reservationPhone}
            </a>
          </div>

          <p className="cf-opening__tagline">{footerData.tagline}</p>
        </section>


        {/* Gallery */}
        <section className="cf-gallery" aria-label="Galerie du film">
          {footerData.gallery.map((photo) => (
            <div className="cf-gallery__item" key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 700px) 45vw, (max-width: 1100px) 25vw, 18vw"
                style={{ objectPosition: photo.position }}
              />
            </div>
          ))}
        </section>
        

        {/* Map */}
        <section className="cf-card cf-map">
          <iframe
            title="Hôtel Mavilla Cotonou — carte"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d2.4535205!3d6.3756492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102355adaccfd86b%3A0x75feee21c758f664!2sH%C3%94TEL%20MAVILLA%20COTONOU%20(Salle%20Prestige)!5e0!3m2!1sfr!2sbj!4v1700000000000!5m2!1sfr!2sbj"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        {/* Contact */}
        <section className="cf-card cf-contact">
          <h3 className="cf-card__title">{footerData.contactTitle}</h3>

          <div className="cf-contact__list">
            <div className="cf-contact__row">
              <span className="cf-contact__label">{footerData.addressLabel}</span>
              <div className="cf-contact__value">
                {footerData.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">{footerData.phoneLabel}</span>
              <a href={`tel:${footerData.phone}`}>{footerData.phone}</a>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">{footerData.emailLabel}</span>
              <a href={`mailto:${footerData.email}`}>{footerData.email}</a>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">{footerData.followLabel}</span>
              <div className="cf-contact__socials">
                {footerData.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Barre du bas : 4 petites portions */}
        <div className="cf-legal">
          <a
            className="cf-legal__cell cf-legal__site"
            href={footerData.site.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="cf-legal__name">{footerData.site.label} ↗</span>
            <span className="cf-legal__copy">{footerData.copyright}</span>
          </a>

          {footerData.networks.map((n) => (
            <a
              key={n.id}
              className="cf-legal__cell cf-legal__link"
              href={n.href}
              aria-label={n.label}
              title={n.label}
              target="_blank"
              rel="noreferrer"
            >
              {SOCIAL_ICONS[n.id]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}