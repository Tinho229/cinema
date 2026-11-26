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
        {/* Opening hours */}
        <section className="cf-card cf-opening">
          <h3 className="cf-card__title">{footerData.openingTitle}</h3>

          <div className="cf-opening__list">
            {footerData.openingHours.map((item) => (
              <div className="cf-opening__row" key={item.day}>
                <span>{item.day}</span>
                <span className="cf-opening__dots" />
                <span>{item.hours}</span>
              </div>
            ))}
          </div>
        </section>


                {/* Gallery */}
                {/* Gallery */}
        

        {/* Map */}
        <section className="cf-card cf-map">
          <iframe
            title="Location map"
            src="https://www.google.com/maps/"
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