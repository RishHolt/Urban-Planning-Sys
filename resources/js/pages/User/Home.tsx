import { useState } from 'react';
import { router } from '@inertiajs/react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HeroSection from "../../components/HeroSection";
import ServiceCard from "../../components/ServiceCard";
import ServiceModal from "../../modals/ServiceModal";
import { services } from "../../data/services";
import type { Service } from "../../data/services";

export default function Home() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (service: Service) => {
        // Navigate directly to zoning map without modal
        if (service.id === 'zoning-map') {
            router.visit('/zoning-map');
            return;
        }
        
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            
            <HeroSection />
            
            {/* Services Section */}
            <section className="bg-gray-100 dark:bg-dark-surface px-4 py-16 w-full">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-12 font-bold text-gray-800 dark:text-white text-4xl text-center">
                        Our Services
                    </h2>
                    
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                title={service.title}
                                description={service.description}
                                image={service.image}
                                gradientFrom={service.gradientFrom}
                                gradientTo={service.gradientTo}
                                borderColor={service.borderColor}
                                titleColor={service.titleColor}
                                descriptionColor={service.descriptionColor}
                                darkGradientFrom={service.darkGradientFrom}
                                darkGradientTo={service.darkGradientTo}
                                darkBorderColor={service.darkBorderColor}
                                darkTitleColor={service.darkTitleColor}
                                darkDescriptionColor={service.darkDescriptionColor}
                                className={service.className}
                                onClick={() => handleCardClick(service)}
                            />
                        ))}
                    </div>
                </div>
            </section>
            
            <Footer />

            {/* Service Modal */}
            {selectedService && (
                <ServiceModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={selectedService.title}
                    description={selectedService.description}
                    serviceId={selectedService.id}
                    whoCanApply={selectedService.whoCanApply}
                    documents={selectedService.documents}
                    serviceDetails={selectedService.serviceDetails}
                />
            )}
        </div>
    );
}
