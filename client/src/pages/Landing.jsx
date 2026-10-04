import { Link } from 'react-router-dom'
import '../styles/landing.css'

// Copy and image placement follow the original TCSA website reference.
// Images are visible-preview screenshot captures, not original asset exports.
// The pond crop excludes the original overlaid heading, which remains HTML.
const gallery = [
  ['tortoise-care', 'A tortoise held gently in two hands'],
  ['chameleon', 'A green chameleon resting on a branch'],
  ['snake-care', 'A reptile handler holding a snake outdoors'],
  ['tortoise-habitat', 'A tortoise exploring its natural habitat'],
]
const sponsors = [
  ['f10', 'F10 Products'],
  ['lodge-builders', 'Lodge Builders Botswana'],
  ['chelonian-group', 'Chelonian Conservation Group'],
  ['kacf', 'Katie Adamson Conservation Fund'],
  ['mcf', 'MCF'],
  ['turtle-tortoise', 'Turtle and Tortoise Preservation Group'],
  ['born-wild', 'Born Wild Gifts'],
  ['ardent-quest', 'Ardent Quest'],
  ['wijgula', 'Wijgula'],
]
const email = 'mailto:info.tortoiseconservation@gmail.com'

export default function Landing() {
  return (
    <div className="tcsa-landing">
      <section className="conservation-hero" aria-labelledby="conservation-title">
        <img className="hero-photo" src="/images/pond-hero.jpg" alt="A pond surrounded by rocks and indigenous garden plants" fetchPriority="high" width="1280" height="465" />
        <div className="conservation-intro">
          <p className="eyebrow">Tortoise Conservation South Africa</p>
          <h1 id="conservation-title" tabIndex="-1">Protect today,<br />Preserve tomorrow</h1>
          <p>We are passionate about the conservation of reptiles in South Africa, with a specific focus on Chelonians!</p>
          <div className="actions">
            <a className="button primary" href="#about-us">About our work →</a>
            <a className="button outline" href="#support-us">Support us</a>
          </div>
        </div>
      </section>

      <section id="about-us" className="landing-section" aria-labelledby="about-title">
        <div className="landing-heading"><p className="eyebrow">Our purpose</p><h2 id="about-title">About us</h2><span className="shell-accent" aria-hidden="true" /></div>
        <div className="grid two about-grid">
          <article className="card"><h3>History</h3><p>TCSA was established in 2024 by Dirk Barnard. Dirk has studied and worked with a multitude of South African Chelonian species since 1999.</p></article>
          <article className="card"><h3>Vision</h3><p>To protect and conserve native reptile species by securing and rezoning land under conservation status: fostering biodiversity and strengthening the connection between communities and the natural world for future generations.</p></article>
          <article className="card"><h3>Conservation & rehabilitation</h3><p>By securing land under conservation status, we aim to create thriving and protected landscapes where native reptiles can flourish. We want to build sanctuaries where injured chelonians can recover and be released back into the wild once rehabilitated.</p></article>
          <article className="card"><h3>SA reptile species</h3><p>South Africa has the most diverse range of tortoise species of any country. Of these species, three are currently endangered and one is critically endangered.</p></article>
        </div>
        <div className="conservation-mission"><span aria-hidden="true">↗</span><p>Tortoises are our main focus, but we work with many South African reptile species. We also assist with safe snake removals from communities and educational talks to the public.</p></div>
      </section>

      <section className="reptile-gallery" aria-label="South African reptiles and conservation work">
        {gallery.map(([image, description]) => <img key={image} src={`/images/${image}.jpg`} alt={description} loading="lazy" width="320" height="244" />)}
      </section>

      <section id="support-us" className="landing-section" aria-labelledby="support-title">
        <div className="landing-heading"><p className="eyebrow">Make a difference</p><h2 id="support-title">Support us</h2><span className="shell-accent" aria-hidden="true" /></div>
        <div className="grid two donation-grid">
          <article className="card"><h3>Local donations</h3><dl className="donation-details"><div><dt>Bank</dt><dd>FNB</dd></div><div><dt>Account name</dt><dd>TCSA</dd></div><div><dt>Cheque account</dt><dd>63145775384</dd></div><div><dt>Branch code</dt><dd>250655</dd></div></dl></article>
          <article className="card"><h3>International donations</h3><p>If you wish to make donations from outside South Africa, please reach out to us first so we can try to get the best exchange rate with the bank, as the rand is unfortunately volatile.</p><a className="text-link" href={email}>Contact Dirk about donating →</a></article>
        </div>
        <article className="card rescue-roast">
          <div><p className="eyebrow">Every sip helps a tortoise</p><h3>Rescue Roast</h3><p>Support us by drinking <strong>Rescue Roast coffee</strong>. With every purchase, you can enjoy great coffee while helping support the rescue, rehabilitation and conservation of tortoises.</p><p>You can order directly and remember to pick a variety with a tortoise.</p><a className="button accent" href="https://www.rescueroast.co.za/">Explore Rescue Roast →</a></div>
          <img src="/images/rescue-roast.jpg" alt="Two bags of Rescue Roast coffee featuring tortoise artwork" width="365" height="404" loading="lazy" />
        </article>
        <article className="card tortoise-food"><div><h3>Tortoise food</h3><p><strong>In need of tortoise food?</strong></p><p>We supply dry food formulated for tortoises, supporting their nutritional needs as part of responsible care.</p></div><a className="button secondary" href={email}>Contact Dirk about tortoise food →</a></article>
      </section>

      <section className="landing-section partner-section" aria-label="Endorsement and sponsors">
        <div className="partner-column"><h2>Proudly endorsed by</h2><div className="endorsement-frame"><img src="/images/wcha.jpg" alt="Western Cape Herpetological Association endorsement" width="482" height="427" loading="lazy" /></div></div>
        <div className="partner-column"><h2>Sponsored by</h2><div className="sponsor-grid">{sponsors.map(([image, name]) => <img key={image} src={`/images/sponsor-${image}.jpg`} alt={name} width="96" height="96" loading="lazy" />)}</div><p>Should you wish to join our sponsors, please contact Dirk Barnard.</p><a className="text-link" href={email}>Become a sponsor →</a></div>
      </section>

      <section id="contact-dirk" className="landing-contact" aria-labelledby="contact-title">
        <div><p className="eyebrow">Get in touch</p><h2 id="contact-title">Contact Dirk Barnard</h2><div className="contact-links"><a href="https://wa.me/27713091665"><span>WhatsApp</span>071 309 1665</a><a href={email}><span>Email</span>info.tortoiseconservation@gmail.com</a></div></div>
        {/* The reference shows Facebook, but its destination was not supplied.
            Add it once the actual page URL is available; do not invent a link. */}
        <div className="turtle-staff-entry">
          <img src="/images/tcsa-logo.jpg" alt="TCSA — Tortoise Conservation South Africa" width="184" height="170" loading="lazy" />
          {/* Percentage coordinates follow the tail in this image crop.
              Only the tail links to staff entry; the rest of the logo is inert.
              This navigation shortcut is not an authentication mechanism. */}
          <Link className="turtle-tail-entry" to="/login" aria-label="Staff sign in" />
        </div>
      </section>
    </div>
  )
}
