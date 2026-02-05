import Header from "../components/Header";
import MainSection from "../components/MainSection";
import PropertyPreview from "../components/PropertyPreview";
import PropertiesMap from "../components/PropertiesMap";
import Footer from "../components/Footer";
import AboutSection from "../components/AboutSection";

const HomePage = () => {
  return (
    <div>
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
