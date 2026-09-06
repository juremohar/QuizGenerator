import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
      <h1 className="fs-2">Stran ne obstaja</h1>
      <p className="text-secondary">Iskana stran ni bila najdena.</p>
      <Link className="btn btn-primary" href="/">
        Domov
      </Link>
    </div>
  );
}
