import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => (
  <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
    <Helmet>
      <title>Faqja nuk u gjet | Realo Real Estate</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <Header />
    <main className="flex flex-1 items-center justify-center px-5 pb-16 pt-32">
      <div className="max-w-md text-center">
        <p className="font-title text-7xl text-real-estate-secondary">404</p>
        <h1 className="mt-4 font-title text-3xl text-real-estate-primary">Faqja nuk u gjet</h1>
        <p className="mt-3 text-sm leading-6 text-real-estate-primary/65">
          Kjo faqe mund të jetë zhvendosur, ose prona nuk është më në dispozicion.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/Property" className="rounded-full bg-real-estate-primary px-6 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-secondary">
            Shfleto pronat
          </Link>
          <Link to="/" className="rounded-full border border-real-estate-primary/20 px-6 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-primary">
            Ballina
          </Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
