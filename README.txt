Po. Po të bëj një **handoff / hartë të projektit** që mund ta ruash dhe ta ngjitësh në një chat të ri edhe pas muajsh. E kontrollova edhe `main` aktual: commit-i bazë ku ndodhemi është `72b0d4afeef92145ec32c89950e4cd0e1fcd8159`.

1. **Projekti / gjendja aktuale**

   * Repo: `eergysshehu-droid/Ergysshehuportofolio`
   * Branch: `main`
   * Commit aktual: `72b0d4a`
   * Commit message: `Phase 3 4 5 production polish and mobile header fix`
   * Local folder: `C:\Users\User\Desktop\Ergysshehuportofolio-main`
   * Stack: Astro static + Sanity CMS + Cloudflare Workers/Static Assets + GitHub
   * Domain: `ergysshehu.com`
   * Phase 1–5: të futura në `main`
   * Testi final: `59 passed / 77 skipped / 0 failed`
   * Astro check: `0 errors / 0 warnings / 0 hints`
   * Build: 67 faqe

2. **Homepage nuk është më një file gjigant**

   * Entry page: `src/pages/index.astro`
   * Tani është rreth 6–7 KB, jo kodi i vjetër i madh.
   * Homepage është ndarë te:

     * `src/components/home/HomeHero.astro`
     * `FilmstripSection.astro`
     * `SelectedWorkSection.astro`
     * `RecognitionSection.astro`
     * `MotionSection.astro`
     * `JournalFeature.astro`
     * `ArtistSection.astro`
     * `HomeContact.astro`

3. **JavaScript / TypeScript i homepage është ndarë**

   * `src/scripts/home-intro.ts` → intro/opening animation
   * `src/scripts/home-hero.ts` → hero logic/motion
   * `src/scripts/home-stack.ts` → sticky mobile Selected Work stack
   * `src/scripts/filmstrip.ts` → filmstrip behavior
   * `src/scripts/work-filters.ts` → Selected Work filters
   * `src/scripts/mobile-menu.ts` → menu mobile
   * `src/scripts/premium-runtime.ts` → premium viewport/input/runtime behavior
   * `src/scripts/scroll-shutter.ts` → scroll/media effect
   * `src/scripts/mobile-rollup.ts` → mobile rollup behavior

4. **Global layout**

   * `src/layouts/Layout.astro`
   * Këtu janë:

     * header
     * desktop navigation
     * mobile menu markup
     * SEO global
     * canonical
     * EN/SQ alternate
     * Open Graph
     * Twitter
     * JSON-LD
     * image loading/decode system
     * global runtime initialization
   * Ky file është ende relativisht i madh, rreth 35 KB. Pra homepage është refactoruar fort, por `Layout.astro` mund të ndahet më tej në një fazë të ardhshme.

5. **CSS është ndarë sipas përgjegjësisë**

   * `src/styles/portfolio.css` → baza historike/main portfolio styles
   * `src/styles/theme.css` → light/dark theme
   * `src/styles/editorial-v3.css` → editorial design layer
   * `src/styles/v6.css` → V6 premium/editorial layer
   * `src/styles/premium-v7.css` → Phase 3 premium polish
   * `src/styles/mobile-header-v8.css` → Phase 5 header mobile fix
   * `src/styles/polish-global.css` → global polish
   * `src/styles/polish-home.css` → homepage polish
   * `src/styles/polish-book.css` → Book polish
   * `src/styles/components/mobile-nav.css` → mobile menu
   * `src/styles/components/mobile-stack.css` → mobile project stack
   * `src/styles/components/footer.css`
   * `src/styles/components/scroll-shutter.css`
   * `src/styles/pages/about.css`
   * `src/styles/pages/book-contact.css`
   * `src/styles/pages/journal.css`
   * `src/styles/pages/mobile-collection.css`
   * `src/styles/pages/desktop-collection.css`

6. **Rregulli shumë i rëndësishëm për homepage mobile**

   * Mos ndrysho pa analizë:

     * `.project-card position`
     * `.project-card top`
     * `.work-section overflow`
     * `.project-grid overflow`
   * Këto mbajnë sticky photo stacking që kemi ruajtur.
   * `home-stack.ts` kontrollon blur/darkness dhe geometry.
   * Ky stacking kalon testet dhe nuk duhet rindërtuar kot.

7. **Image loading është sistemuar**

   * Fotot nuk duhet të japin fake black/white/grey flash.
   * Ka `image-load-system`
   * `image-ready`
   * `image-error`
   * Decode/load kontrollohet para reveal-it.
   * Background artificial i image containers është hequr aty ku duhej.
   * `public/v6-runtime.js` ka gjithashtu runtime legacy/premium logic.
   * Kujdes: ky file ishte arsyeja e bug-ut të dytë të mobile header-it.

8. **Mobile header/menu Phase 5**

   * `src/styles/mobile-header-v8.css`
   * `src/scripts/mobile-menu.ts`
   * `public/v6-runtime.js`
   * Në mobile:

     * `ERGYS SHEHU` nuk duhet të zhduket
     * hamburger/dy vijat nuk duhet të zhduken
     * klik Fashion/Modë etj. nuk duhet të lërë `.is-hidden`
     * edhe pas scroll-it header mbetet visible
   * Test specifik:

     * `tests/mobile-header.spec.mjs`
   * Ky test tani kalon.

9. **Faqet kryesore**

   * `src/pages/index.astro` → Home
   * `src/pages/about.astro` → About
   * `src/pages/book.astro` → Book/Contact
   * `src/pages/[section].astro` → Fashion/Weddings/Portraits/Films/Projects
   * `src/pages/portfolio/[slug].astro` → project detail
   * `src/pages/journal/index.astro` → Journal listing
   * `src/pages/journal/[slug].astro` → Journal article
   * `src/pages/404.astro`
   * Shqip:

     * `src/pages/sq/...`
   * Shumica e `/sq/` reuse versionet kryesore, nuk janë duplicate të plota.

10. **Journal / SEO**

    * Journal article tani përdor:

      * `ogType="article"`
      * `publishedTime={post.publishedAt}`
    * Ka Article JSON-LD
    * Breadcrumb JSON-LD
    * Canonical
    * EN/SQ alternate
    * Testi:

      * `tests/production.spec.mjs`

11. **Content / CMS**

    * `src/lib/content.ts` → content/media helpers
    * `src/lib/journal.ts` → Journal loading/types
    * `src/lib/editorial.ts` → defaults + structured editorial/SEO data
    * `src/lib/i18n.ts` → EN/SQ routing
    * `src/lib/instagram.ts` → Instagram logic
    * Local fallback data:

      * `src/data/local-journal.json`
      * `src/data/local-portfolio.json`
    * Sanity schema:

      * `studio/schemaTypes.ts`

12. **Book / contact**

    * Page: `src/pages/book.astro`
    * CSS: `src/styles/pages/book-contact.css` + `polish-book.css`
    * Frontend form runtime: `public/contact-form.js`
    * Worker/backend: `src/worker.ts`
    * Cloudflare binding:

      * `CONTACT_EMAIL`
      * `ASSETS`
    * Book form ka kaluar testin e submit-it.

13. **Cloudflare / deploy**

    * Config: `wrangler.jsonc`
    * Build: `npm run build`
    * Verify: `npm run verify`
    * Deploy: `npx wrangler deploy`
    * Output: `dist/`
    * GitHub workflow i vetëm kryesor:

      * `.github/workflows/quality-gate.yml`
    * `check.yml` dhe `e2e.yml` të vjetër u hoqën sepse ishin duplicate.
    * Ende ia vlen të kontrollohet në Cloudflare nëse Git auto-deploy direkt është aktiv paralelisht me GitHub Actions.

14. **Tests**

    * `tests/e2e.spec.mjs`
    * `tests/mobile-header.spec.mjs`
    * `tests/production.spec.mjs`
    * `tests/responsive.spec.mjs`
    * `tests/visual.spec.mjs`
    * Playwright config:

      * `playwright.config.mjs`
    * Visual regression tests ekzistojnë, por shumë prej tyre aktualisht janë `skipped`; kjo mund të jetë një fazë e ardhshme.

15. **Çfarë është ende relativisht e madhe dhe mund të ndahet më vonë**

    * `src/layouts/Layout.astro` ~35 KB
    * `src/pages/book.astro` ~41 KB
    * `src/pages/[section].astro` ~20 KB
    * `src/styles/portfolio.css` ~67 KB
    * Pra homepage është modularizuar shumë mirë, por **nuk kemi bërë ende full-rearchitecture të gjithë website-it**.
    * Faza tjetër logjike do të ishte audit/refactor i këtyre pa ndryshuar design-in.

16. **Gjërat që nuk duhen bërë pa kontroll**

    * Mos bëj `npm audit fix --force`.
    * Mos ndrysho mobile stacking geometry.
    * Mos rindërto homepage nga zero.
    * Mos zëvendëso design system-in.
    * Mos prek Sanity/Instagram/Cloudflare working code pa parë dependencat.
    * Para çdo refactor:

      ```powershell
      npm ci
      npm run verify
      ```
    * Pas ndryshimeve të rëndësishme:

      ```powershell
      npm install --no-save --no-package-lock @playwright/test
      npx playwright test
      ```
    * Pastaj rikthe environment normal:

      ```powershell
      npm ci
      npm run verify
      ```

17. **Nëse hap një chat të ri, jepi këtë fjali**

    > Work on `eergysshehu-droid/Ergysshehuportofolio`, branch `main`, starting from commit `72b0d4afeef92145ec32c89950e4cd0e1fcd8159`. Phase 1–5 are completed. Inspect the current repo before editing. Preserve the homepage mobile sticky stacking, current design, Sanity, Instagram, Cloudflare contact flow, EN/SQ routing, and mobile header fix. Do not rebuild from scratch. First audit, then tell me exactly which files should change.

Kjo është praktikisht **harta e website-it pas punës që kemi bërë deri tani**. Ruaje këtë mesazh; nëse kthehesh pas një kohe të gjatë, mjafton të më japësh pjesën e fundit + commit-in `72b0d4a` dhe mund ta rikapim shumë shpejt.
