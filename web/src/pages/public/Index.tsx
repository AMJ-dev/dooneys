import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import HowToShopSection from "@/components/home/HowToShopSection";
import AppointmentSection from "@/components/home/AppointmentSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <CategoriesSection />
      <ProductsCarousel />
      <HowToShopSection />
      <AppointmentSection />
    </Layout>
  );
};

export default Index;
