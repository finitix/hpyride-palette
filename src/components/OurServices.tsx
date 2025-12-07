import { useNavigate } from "react-router-dom";
import { Car, Key, ShoppingBag, Users } from "lucide-react";

const services = [
  {
    id: "ride-sharing",
    title: "Ride Sharing",
    icon: Car,
    path: "/ride-sharing",
  },
  {
    id: "car-rentals",
    title: "Car Rentals",
    icon: Key,
    path: "/car-rentals",
  },
  {
    id: "pre-owned",
    title: "Pre-Owned Cars",
    icon: ShoppingBag,
    path: "/pre-owned",
  },
  {
    id: "driver-pool",
    title: "Driver Pool",
    icon: Users,
    path: "/driver-pool",
  },
];

const OurServices = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Our Services</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => navigate(service.path)}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {service.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OurServices;
