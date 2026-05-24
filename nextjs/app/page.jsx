'use client';

import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const stepsRef = useRef([]);
  const showcaseRef = useRef(null);
  const floatRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (header) {
        header.style.transform = y > lastScroll && y > 100 ? 'translateY(-120%)' : 'translateY(0)';
      }
      lastScroll = y;

      const scrolly = document.querySelector('.scrolly');
      if (!scrolly) return;
      const rect = scrolly.getBoundingClientRect();
      const h = scrolly.offsetHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.max(0, Math.min(1, -rect.top / h));
      const idx = Math.min(2, Math.floor(pct * 3));
      document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });
      const card = document.querySelector('.showcase-card');
      if (card) {
        const s = 1 + pct * 0.04;
        card.style.transform = `scale(${s})`;
        card.style.opacity = 0.5 + pct * 0.5;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    const float = floatRef.current;
    if (!float) return;
    let raf;
    const onMouseMove = (e) => {
      const rect = float.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / 20;
      const dy = (e.clientY - cy) / 20;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        float.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.anim').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="page-bg" aria-hidden="true" />
      <a className="skip" href="#contenido">Saltar al contenido</a>

      <header className="landing-header" ref={headerRef} data-header>
        <nav className="landing-nav" aria-label="Navegación principal">
          <a className="landing-brand" href="#inicio" aria-label="Inicio BoomLab">
            <span className="brand-logo" aria-hidden="true">
              <svg viewBox="0 0 64 64"><path d="M14 34c9 0 9-14 19-14 5 0 9 3 9 7 0 8-14 7-14 15 0 4 4 7 9 7" /><path d="M13 46c3-10 18-6 25-1" /></svg>
            </span>
            <span>BoomLab</span>
          </a>
          <button
            className="menu-btn"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span />
          </button>
          <div className={`landing-menu${menuOpen ? ' open' : ''}`} data-menu>
            <a href="#propuesta" onClick={() => setMenuOpen(false)}>Propuesta</a>
            <a href="#mis-vision" onClick={() => setMenuOpen(false)}>Misión</a>
            <a href="#valores" onClick={() => setMenuOpen(false)}>Valores</a>
            <a href="#personalidad" onClick={() => setMenuOpen(false)}>Personalidad</a>
            <a href="#publico" onClick={() => setMenuOpen(false)}>Público</a>
          </div>
          <a className="landing-login-link" href="/login">Entrar</a>
        </nav>
      </header>

      <main id="contenido">
        <section className="landing-hero" id="inicio">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow anim">Innovación y estilo que marca tendencia</p>
              <h1 className="hero-title anim">Ideas explosivas para marcas que quieren crecer.</h1>
              <p className="hero-lead anim">Campañas publicitarias creativas e innovadoras que generan impacto real para marcas y emprendedores de Sogamoso y Boyacá.</p>
              <div className="actions anim">
                <a className="btn primary" href="/register">Crear cuenta</a>
                <a className="btn secondary" href="#propuesta">Ver propuesta</a>
              </div>
            </div>
            <div className="hero-card-wrap anim">
              <article className="hero-card" ref={floatRef} data-float>
                <div className="mark" aria-hidden="true">
                  <svg viewBox="0 0 64 64"><path d="M14 34c9 0 9-14 19-14 5 0 9 3 9 7 0 8-14 7-14 15 0 4 4 7 9 7" /><path d="M13 46c3-10 18-6 25-1" /></svg>
                </div>
                <h2>BoomLab</h2>
                <p>Laboratorio creativo de campañas</p>
                <div className="mini-ui" aria-hidden="true">
                  <i /><i /><b>Hacer BOOM</b>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section" id="propuesta">
          <div className="container narrow center">
            <p className="eyebrow anim">Propuesta de valor</p>
            <h2 className="title anim">Creatividad, estrategia y tecnología para campañas que llaman la atención y generan resultados.</h2>
            <p className="text anim">BoomLab ofrece un servicio cercano, entendiendo las necesidades del mercado local, con una visión amplia para que cada marca pueda brillar dentro y fuera de la región.</p>
          </div>
        </section>

        <section className="scrolly" id="mis-vision">
          <div className="scrolly-sticky">
            <div className="container scrolly-grid">
              <div className="steps">
                <article className="step active" data-index="0" ref={(el) => (stepsRef.current[0] = el)}>
                  <span>01</span><h3>Misión</h3><p>Transformar ideas en experiencias visuales y estratégicas que conecten con las personas y potencien el crecimiento de los clientes.</p>
                </article>
                <article className="step" data-index="1" ref={(el) => (stepsRef.current[1] = el)}>
                  <span>02</span><h3>Visión 2030</h3><p>Ser la agencia creativa más reconocida de Boyacá por generar ideas explosivas, efectivas y competitivas.</p>
                </article>
                <article className="step" data-index="2" ref={(el) => (stepsRef.current[2] = el)}>
                  <span>03</span><h3>Nombre</h3><p>“Boom” transmite emoción, sorpresa, alegría, euforia y optimismo. “Lab” representa laboratorio, experimento y creación.</p>
                </article>
              </div>
              <aside className="showcase" aria-hidden="true">
                <div className="showcase-card" ref={showcaseRef} data-showcase>
                  <small data-tag>Misión</small>
                  <h3 data-title>Impacto real</h3>
                  <p data-copy>Campañas creativas e innovadoras para destacar marcas y emprendedores.</p>
                  <div className="bars"><i /><i /><i /><i /></div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="landing-section" id="valores">
          <div className="container">
            <p className="eyebrow anim">Valores</p>
            <h2 className="title anim">La energía creativa de BoomLab tiene una base clara.</h2>
            <div className="cards">
              <article className="card anim"><span>01</span><h3>Creatividad sin límites</h3><p>Ideas frescas y originales.</p></article>
              <article className="card anim"><span>02</span><h3>Impacto</h3><p>Todo lo que hacemos debe dejar huella.</p></article>
              <article className="card anim"><span>03</span><h3>Compromiso local</h3><p>Potenciamos el talento y las marcas de la región.</p></article>
              <article className="card anim"><span>04</span><h3>Innovación constante</h3><p>Probamos nuevas herramientas y tendencias.</p></article>
              <article className="card anim"><span>05</span><h3>Honestidad y transparencia</h3><p>Relaciones claras y de confianza.</p></article>
            </div>
          </div>
        </section>

        <section className="landing-section soft" id="personalidad">
          <div className="container two-col">
            <div>
              <p className="eyebrow anim">Personalidad</p>
              <h2 className="title anim">Juvenil, fresca, motivadora y atrevida.</h2>
              <p className="text anim">BoomLab es creativa, explosiva, cercana, apasionada e innovadora. Su voz es positiva, clara, directa y con energía.</p>
            </div>
            <div className="chips anim">
              <span>Creativa</span><span>Explosiva</span><span>Cercana</span><span>Apasionada</span><span>Innovadora</span><span>Épica</span>
            </div>
          </div>
        </section>

        <section className="landing-section" id="publico">
          <div className="container two-col">
            <div>
              <p className="eyebrow anim">Público objetivo</p>
              <h2 className="title anim">Para marcas que quieren diferenciarse.</h2>
            </div>
            <div className="list">
              <article className="list-item anim"><b>Emprendedores</b><p>Pequeñas empresas de Sogamoso y Boyacá que necesitan publicidad creativa.</p></article>
              <article className="list-item anim"><b>Negocios locales</b><p>Restaurantes, tiendas, gimnasios, clubes deportivos y más.</p></article>
              <article className="list-item anim"><b>Marcas jóvenes</b><p>Marcas modernas que buscan viralidad en redes sociales.</p></article>
              <article className="list-item anim"><b>Empresas tradicionales</b><p>Negocios que quieren actualizar su imagen con estrategias digitales.</p></article>
            </div>
          </div>
        </section>

        <section className="landing-section cta-section">
          <div className="container cta anim">
            <p className="eyebrow">Haz que tu marca haga BOOM</p>
            <h2>Primero enamora. Después convierte.</h2>
            <p>Una landing profesional presenta la marca antes del login y guía al usuario hacia la acción.</p>
            <div className="actions centered"><a className="btn primary" href="/register">Empezar ahora</a><a className="btn secondary" href="/login">Iniciar sesión</a></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container footer-inner">
          <p><strong>BoomLab</strong> — Innovación y estilo que marca tendencia.</p>
          <a href="#inicio">Arriba ↑</a>
        </div>
      </footer>
    </>
  );
}
