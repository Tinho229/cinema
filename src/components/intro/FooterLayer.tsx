import ContactFooter from "@/components/ContactFooter/ContactFooter";

/* Le footer vit DANS la section épinglée du hero, au-dessus de tout (z-70).
   Il est invisible au départ ; ShowcaseLayer le fait apparaître colonne par
   colonne à la fin du scroll, ce qui remplace la section des images.

   - .footer-layer : cadre plein écran, masqué par colonnes (mask CSS)
   - .footer-slide : le footer lui-même. Si l'écran est plus court que le
     footer (tablette, mobile), il défile ensuite à l'intérieur du cadre.

   Les iframes (carte) ne captent pas la souris : sinon la molette reste
   « bloquée » sur la carte et on ne peut plus remonter. Retire
   [&_iframe]:pointer-events-none si tu veux une carte interactive. */
export function FooterLayer() {
  return (
    <div className="footer-layer invisible pointer-events-none absolute inset-0 z-[70] overflow-hidden bg-[#111110] [&_iframe]:pointer-events-none">
      <div className="footer-slide absolute inset-x-0 top-0">
        <ContactFooter />
      </div>
    </div>
  );
}