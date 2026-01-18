import Button from './Button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <div
            className="relative flex justify-center items-center bg-cover bg-no-repeat bg-center mt-16 py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 w-full min-h-[calc(100vh-4rem)]"
            style={{ backgroundImage: 'url(/background.svg)' }}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60"></div>

            {/* Content Container */}
            <div className="z-10 relative mx-auto px-4 w-full max-w-7xl">
                <div className="flex lg:flex-row flex-col justify-between items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20">
                    {/* Left Side - Heading and Content */}
                    <div className="flex flex-col lg:flex-1 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8 w-full lg:w-auto lg:text-left text-center">
                        {/* Main Heading */}
                        <h1 className="drop-shadow-lg font-bold text-background text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-tight tracking-tight">
                            <span className="block">Urban Planning,</span>
                            <span className="block">Zoning & Housing</span>
                        </h1>

                        {/* Description */}
                        <p className="drop-shadow-md mx-auto lg:mx-0 max-w-2xl text-background/95 text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-relaxed">
                            Your gateway to comprehensive urban development services.
                        </p>

                        {/* CTA Button */}
                        <div className="flex justify-center lg:justify-start pt-2 sm:pt-3 md:pt-4">
                            <Button
                                variant="primary"
                                size="md"
                                className="flex justify-center items-center gap-2 shadow-xl px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 font-semibold text-sm sm:text-base md:text-lg hover:scale-105 active:scale-95 transition-transform duration-200"
                            >
                                Go to Services
                                <ArrowRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - Logo */}
                    <div className="flex lg:flex-shrink-0 justify-center items-center pt-4 sm:pt-6 md:pt-8 lg:pt-0 w-full lg:w-auto">
                        <div className="relative">
                            <img 
                                src="/logo.svg" 
                                alt="GoServePH Logo" 
                                className="drop-shadow-2xl w-40 sm:w-48 md:w-56 lg:w-64 2xl:w-80 xl:w-72 h-40 sm:h-48 md:h-56 lg:h-64 2xl:h-80 xl:h-72 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
