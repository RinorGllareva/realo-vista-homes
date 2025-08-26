import Header from "../components/Header";
import MainSection from "../components/MainSection";
import PropertyPreview from "../components/PropertyPreview";
import Footer from "../components/Footer";
import AboutSection from "../components/AboutSection";
import { ErrorBoundary } from "@/components/dev/ErrorBoundry";

const HomePage = () => {
  return (
    <div>
      <ErrorBoundary name="Header">
        <Header />
      </ErrorBoundary>
      <ErrorBoundary name="MainSection">
        <MainSection />
      </ErrorBoundary>
      <ErrorBoundary name="PropertyPreview">
        <PropertyPreview />
      </ErrorBoundary>
      <ErrorBoundary name="Footer">
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;
