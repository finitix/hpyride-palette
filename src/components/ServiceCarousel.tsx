import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Search, Clock } from "lucide-react";
import ComingSoonModal from "@/components/ComingSoonModal";

interface ServiceCard {
  id: string;
  title: string;
  fields: {
    icon: typeof MapPin;
    placeholder: string;
    type: string;
  }[];
  buttonText: string;
  path: string;
  comingSoon?: boolean;
}

const serviceCards: ServiceCard[] = [
  {
    id: "ride-share",
    title: "Ride Sharing",
    fields: [
      { icon: MapPin, placeholder: "Leaving from", type: "text" },
      { icon: MapPin, placeholder: "Going to", type: "text" },
      { icon: Calendar, placeholder: "Date", type: "date" },
    ],
    buttonText: "Search Ride",
    path: "/ride-sharing",
    comingSoon: false,
  },
  {
    id: "car-rental",
    title: "Car Rentals",
    fields: [
      { icon: MapPin, placeholder: "Location", type: "text" },
      { icon: Calendar, placeholder: "Start date", type: "date" },
      { icon: Calendar, placeholder: "End date", type: "date" },
    ],
    buttonText: "Coming Soon",
    path: "/car-rentals",
    comingSoon: true,
  },
  {
    id: "driver-pool",
    title: "Driver Pool",
    fields: [
      { icon: MapPin, placeholder: "From", type: "text" },
      { icon: MapPin, placeholder: "To", type: "text" },
      { icon: Calendar, placeholder: "Date", type: "date" },
    ],
    buttonText: "Coming Soon",
    path: "/driver-pool",
    comingSoon: true,
  },
];

const ServiceCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % serviceCards.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentCard = serviceCards[currentIndex];

  const handleButtonClick = () => {
    if (currentCard.comingSoon) {
      setComingSoonOpen(true);
    } else {
      navigate(currentCard.path);
    }
  };

  return (
    <div className="relative">
      {/* Black background section */}
      <div className="bg-splash-bg text-splash-fg pt-6 pb-40 px-6">
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold mb-2">{currentCard.title}</h2>
            {currentCard.comingSoon && (
              <span className="px-2 py-0.5 bg-splash-fg/20 text-splash-fg text-[10px] font-bold rounded-full mb-2">
                COMING SOON
              </span>
            )}
          </div>
          <p className="text-splash-fg/70 text-sm">
            {currentCard.comingSoon 
              ? `${currentCard.title} is launching soon!`
              : `Find the best ${currentCard.title.toLowerCase()} options`
            }
          </p>
        </div>
      </div>

      {/* Floating white card */}
      <div className="absolute left-4 right-4 top-28 z-10">
        <div
          className={`bg-card rounded-2xl shadow-xl p-6 transition-all duration-300 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="space-y-4">
            {currentCard.fields.map((field, index) => {
              const Icon = field.icon;
              return (
                <div key={index} className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="pl-12"
                    disabled={currentCard.comingSoon}
                  />
                </div>
              );
            })}
          </div>

          <Button
            variant={currentCard.comingSoon ? "secondary" : "hero"}
            className="w-full mt-6"
            onClick={handleButtonClick}
          >
            {currentCard.comingSoon ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                {currentCard.buttonText}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {currentCard.buttonText}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute top-4 right-6 flex gap-1.5">
        {serviceCards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-splash-fg w-6" 
                : "bg-splash-fg/40"
            }`}
          />
        ))}
      </div>

      <ComingSoonModal
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        serviceName={currentCard.title}
      />
    </div>
  );
};

export default ServiceCarousel;
