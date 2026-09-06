import Link from 'next/link';

import { KATEGORIJE, KVIZI } from '@/lib/quiz/config';

export default function HomePage() {
  return (
    <div className="d-flex flex-column justify-content-center min-vh-100">
      <div className="d-flex justify-content-around align-items-center mb-5 home-layout">
        {KATEGORIJE.map((slug) => {
          const cfg = KVIZI[slug];
          return (
            <div className="card" key={slug} style={{ width: '18rem', border: 0 }}>
              {/* Plain <img>: these badges are small, shown at a fixed size, and have no
                  declared intrinsic dimensions, so next/image would buy nothing. */}
              <img src={cfg.znacka} className="card-img-top" alt={cfg.kartica} />
              <div className="card-body border" style={{ flex: 0 }}>
                <h5 className="card-title">{cfg.kartica}</h5>
                <p>{cfg.opis}</p>
                {/* prefetch={false}: the quiz route is force-dynamic, so hover-prefetch
                    would build a quiz nobody asked for. */}
                <Link className="btn btn-primary" href={`/${slug}/kviz`} prefetch={false}>
                  Kviz
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-center">
        <Link className="btn btn-primary btn-lg" href="/literatura">
          Literatura
        </Link>
      </div>
    </div>
  );
}
