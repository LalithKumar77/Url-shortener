import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Want to track your links?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Sign up for a free account to save your URLs, access detailed
          analytics, and unlock premium features
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/register")}
          >
            Sign Up Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
