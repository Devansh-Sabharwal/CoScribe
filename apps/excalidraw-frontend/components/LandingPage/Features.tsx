import { Cloud, Pencil, Share2, Stars, Users, Zap } from "lucide-react";
import { ReactElement } from "react";

const featureItems = [
    {
      id: 1,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, seeing changes as they happen.",
      icon: <Share2 className="w-8 h-8" />, // Increased icon size
    },
    {
      id: 2,
      title: "Team Workspaces",
      description: "Create and manage multiple workspaces for different teams and projects.",
      icon: <Users className="w-8 h-8" />, // Increased icon size
    },
    {
      id: 3,
      title: "Cloud Storage",
      description: "Automatically save and sync your drawings across all devices.",
      icon: <Cloud className="w-8 h-8" />, // Increased icon size
    },
    {
      id: 4,
      title: "Smart Drawing Tools",
      description: "Powerful yet intuitive tools that adapt to your creative workflow.",
      icon: <Stars className="w-8 h-8" />, // Increased icon size
    },
    {
      id: 5,
      title: "Lightning Fast",
      description: "Optimized performance for smooth drawing and collaboration experience.",
      icon: <Zap className="w-8 h-8" />, // Increased icon size
    },
    {
      id: 6,
      title: "Custom Styles",
      description: "Personalize your drawings with custom colors, fonts, and styles.",
      icon: <Pencil className="w-8 h-8" />, // Increased icon size
    },
  ];

export function Features() {
  return (
    <div id="features" className="mt-10 py-10 ">
      <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6">Robust Features</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-4 sm:px-8 lg:px-16">
        {featureItems.map((item) => (
          <Card
            key={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  description: string;
  icon: ReactElement;
}

function Card(props: CardProps) {
  return (
    <div className="flex flex-col bg-[#FAFAFA] p-6 sm:p-10 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
      <span className="rounded-xl p-2 bg-[#EBEBEB] w-fit">
        {props.icon}
      </span>
      <div className="mt-4 sm:mt-6 font-bold text-lg sm:text-2xl">{props.title}</div>
      <div className="py-4 font-medium text-md sm:text-lg text-gray-600">{props.description}</div>
    </div>
  );
}