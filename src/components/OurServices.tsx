import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Key, ShoppingBag, Users } from "lucide-react";
import ComingSoonModal from "@/components/ComingSoonModal";

interface Service {
  id: string;
  title: string;
  icon: typeof Car;
  path: string;
  comingSoon?: boolean;
}

const services: Service[] = [
  {
    id: "ride-sharing",
    title: "Ride Sharing",
    icon: Car,
    path: "/ride-sharing",
    comingSoon: false,
  },
  {
    id: "car-rentals",
    title: "Car Rentals",
    icon: Key,
    path: "/car-rentals",
    comingSoon: true,
  },
  {
    id: "pre-owned",
    title: "Pre-Owned Cars",
    icon: ShoppingBag,
    path: "/pre-owned",
    comingSoon: true,
  },
  {
    id: "driver-pool",
    title: "Driver Pool",
    icon: Users,
    path: "/driver-pool",
    comingSoon: true,
  },
];

const OurServices = () => {
  const navigate = useNavigate();
  const [comingSoonService, setComingSoonService] = useState<string | null>(null);

  const handleServiceClick = (service: Service) => {
    if (service.comingSoon) {
      setComingSoonService(service.title);
    } else {
      navigate(service.path);
    }
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Our Services</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="relative bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
            >
              {service.comingSoon && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                  SOON
                </span>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                service.comingSoon ? "bg-secondary/50" : "bg-secondary"
              }`}>
                <Icon className={`w-6 h-6 ${
                  service.comingSoon ? "text-muted-foreground" : "text-foreground"
                }`} />
              </div>
              <span className={`text-sm font-medium text-center ${
                service.comingSoon ? "text-muted-foreground" : "text-foreground"
              }`}>
                {service.title}
              </span>
            </button>
          );
        })}
      </div>

      <ComingSoonModal 
        isOpen={!!comingSoonService}
        onClose={() => setComingSoonService(null)}
        serviceName={comingSoonService || ""}
      />
    </div>
  );
};

export default OurServices;
