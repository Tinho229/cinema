
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
            sizes="(max-width: 768px) 100vw, 50vw"
            className="cf-visual__image"
        />

        <div className="cf-visual__overlay" />

      </section>

      {/* RIGHT: Grid */}
      <div className="cf-right">

        {/* Opening hours */}
        <section className="cf-card cf-opening">
          <h3 className="cf-card__title">
            {footerData.openingTitle}
          </h3>

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
        <section className="cf-card cf-opening">
          <h3 className="cf-card__title">
            {footerData.openingTitle}
          </h3>

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

        {/* Map */}
        <section className="cf-card cf-map">
          <iframe
            title="Location map"
            src="https://www.google.com/maps/place/H%C3%94TEL+MAVILLA+COTONOU+(Salle+Prestige)/@6.3756492,2.4535205,17z/data=!3m1!4b1!4m9!3m8!1s0x102355adaccfd86b:0x75feee21c758f664!5m2!4m1!1i2!8m2!3d6.3756492!4d2.4535205!16s%2Fg%2F11t2b34fnb?entry=ttu&g_ep=EgoyMDI2MTExOC4xIKXMDSoASAFQAw%3D%3D"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        {/* Contact */}
        <section className="cf-card cf-contact">
          <h3 className="cf-card__title">
            {footerData.contactTitle}
          </h3>

          <div className="cf-contact__list">

            <div className="cf-contact__row">
              <span className="cf-contact__label">
                {footerData.addressLabel}
              </span>
              <div className="cf-contact__value">
                {footerData.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">
                {footerData.phoneLabel}
              </span>
              <a href={`tel:${footerData.phone}`}>
                {footerData.phone}
              </a>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">
                {footerData.emailLabel}
              </span>
              <a href={`mailto:${footerData.email}`}>
                {footerData.email}
              </a>
            </div>

            <div className="cf-contact__row">
              <span className="cf-contact__label">
                {footerData.followLabel}
              </span>
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
