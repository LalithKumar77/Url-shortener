import { Link,  BarChart3, User,  ChevronRight, } from 'lucide-react';
import { useState, useEffect } from 'react';
const HowItWorksSection = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const demoSteps = [
    { title: "Paste", description: "Enter your long URL", icon: Link },
    { title: "Customize", description: "Add password, expiry, alias", icon: User },
    { title: "Track", description: "Monitor clicks & analytics", icon: BarChart3 }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Three simple steps to shorten and track your URLs
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {demoSteps.map((step, index) => (
              <div key={index} className="flex-1">
                <div className={`text-center transition-all duration-500 ${currentStep === index ? 'scale-110' : 'scale-100 opacity-70'}`}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                    currentStep === index 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl' 
                      : 'bg-gray-200'
                  }`}>
                    <step.icon className={`w-10 h-10 ${currentStep === index ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < demoSteps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center mt-8">
                    <ChevronRight className="w-8 h-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


export default HowItWorksSection;