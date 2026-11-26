import Image from "next/image";
import { footerData } from "./footerData";
import "./ContactFooter.css";

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

        {/* Legal bar */}
        <div className="cf-legal">
          <span>{footerData.copyright}</span>

          <div className="cf-legal__links">
            {footerData.legal.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}