import { Helmet } from "react-helmet";
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import PropertyPreview from "../components/PropertyPreview";
import PropertiesMap from "../components/PropertiesMap";
import Footer from "../components/Footer";
import AboutSection from "../components/AboutSection";

const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>Realo Real Estate | Shtepi, Banesa dhe Prona ne Prishtine</title>
        <meta
          name="description"
          content="Zbuloni shtepi, banesa, troje dhe lokale per shitje dhe me qera ne Prishtine dhe gjithe Kosoven. Realo Real Estate - agjencia juaj e besuar e patundshmërive."
        />
      </Helmet>
      <Header />
      <MainSection />
      <PropertyPreview />
      <PropertiesMap />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default HomePage;
