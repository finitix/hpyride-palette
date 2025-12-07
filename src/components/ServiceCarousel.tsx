import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Search } from "lucide-react";

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
  },
  {
    id: "car-rental",
    title: "Car Rentals",
    fields: [
      { icon: MapPin, placeholder: "Location", type: "text" },
      { icon: Calendar, placeholder: "Start date", type: "date" },
      { icon: Calendar, placeholder: "End date", type: "date" },
    ],
    buttonText: "Search Cars",
    path: "/car-rentals",
  },
  {
    id: "driver-pool",
    title: "Driver Pool",
    fields: [
      { icon: MapPin, placeholder: "From", type: "text" },
      { icon: MapPin, placeholder: "To", type: "text" },
      { icon: Calendar, placeholder: "Date", type: "date" },
    ],
    buttonText: "Search Drivers",
    path: "/driver-pool",
  },
];

const ServiceCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  return (
    <div className="relative">
      {/* Black background section */}
      <div className="bg-splash-bg text-splash-fg pt-6 pb-40 px-6">
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">{currentCard.title}</h2>
          <p className="text-splash-fg/70 text-sm">
            Find the best {currentCard.title.toLowerCase()} options
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
                  />
                </div>
              );
            })}
          </div>

          <Button
            variant="hero"
            className="w-full mt-6"
            onClick={() => navigate(currentCard.path)}
          >
            <Search className="w-4 h-4 mr-2" />
            {currentCard.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCarousel;
