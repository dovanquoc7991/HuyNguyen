import React, { useEffect, useState } from "react";
import { Card } from "@/assets/ui/card";
import { FaBook, FaHeadphones, FaHeart, FaStar, FaRocket } from "react-icons/fa";
import { useAuth } from "@/assets/hooks/use-auth";
import { navigate } from "wouter/use-browser-location";
import { FloatingFeedbackButton } from "../components/FloatingFeedbackButton";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [progressAnimated, setProgressAnimated] = useState(false);
  const [ipadAnimated, setIpadAnimated] = useState(false);
  const [textAnimated, setTextAnimated] = useState(false);
  const [ipadShaking, setIpadShaking] = useState(false); // State mới cho hiệu ứng rung lắc

  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setProgressAnimated(true);
    }, 300);

    const ipadTimer = setTimeout(() => {
      setIpadAnimated(true);

      // Kích hoạt hiệu ứng rung lắc sau khi iPad xuất hiện
      const shakeTimer = setTimeout(() => {
        setIpadShaking(true);

        // Tắt hiệu ứng rung lắc sau 2 giây
        const stopShakeTimer = setTimeout(() => {
          setIpadShaking(false);
        }, 2000);

        return () => clearTimeout(stopShakeTimer);
      }, 500);

      return () => clearTimeout(shakeTimer);
    }, 500);

    const textTimer = setTimeout(() => {
      setTextAnimated(true);
    }, 800);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(ipadTimer);
      clearTimeout(textTimer);
    };
  }, []);

  const handleStartPractice = (section: string) => {
    navigate(`/practice/${section}`);
  };

  return (
    <div className="h-1/4 bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Hiệu ứng nền động */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Biểu tượng */}
          <div className="absolute top-4 left-10 opacity-70 animate-float-rotate">
            <FaHeart className="text-pink-400 text-2xl" />
          </div>
          <div className="absolute top-8 right-16 opacity-70 animate-float-reverse">
            <FaStar className="text-yellow-300 text-2xl" />
          </div>
          <div className="absolute bottom-10 left-20 opacity-70 animate-float-slow">
            <FaRocket className="text-blue-300 text-2xl" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 relative leading-relaxed tracking-wide">
            {/* Thêm khoảng cách rõ ràng hơn */}
            <span className={`inline-block transition-all duration-700 ease-out transform ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>Thank</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-100 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>you</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-200 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>for</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-300 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>choosing</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-400 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>to</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-500 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>study</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-600 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>with</span>{' '}
            <span className={`inline-block transition-all duration-700 ease-out transform delay-700 ${textAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>us</span>

            {/* Hiệu ứng gạch chân */}
            <div className={`h-1 bg-gradient-to-r from-pink-500 to-yellow-500 mt-2 mx-auto rounded-full transition-all duration-1000 ease-out ${textAnimated ? 'w-full scale-x-100' : 'w-0 scale-x-0'}`}></div>
          </h1>
        </div>
      </section>

      {/* Phần còn lại của component giữ nguyên */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-blue-100">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8 text-blue-900 text-center animate-fade-in-up">
              IELTS 6.5 - Let's get it!
            </h2>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
              {/* Hình minh họa */}
              <div className="w-full lg:w-2/5 flex justify-center">
                <img
                  src="../imgs/book.png"
                  alt="IELTS Book"
                  className={`w-56 sm:w-64 md:w-72 lg:w-full lg:max-w-sm h-auto object-contain transform transition-all duration-1000 ease-out
              ${ipadAnimated ? "opacity-100 animate-book-bounce" : "opacity-0 scale-90"}
              ${ipadShaking ? "animate-ipad-shake" : ""}
              transition-all duration-300`}
                />
              </div>

              {/* Content */}
              <div className="w-full lg:w-3/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">

                  {/* Listening */}
                  <Card className="flex flex-col justify-between p-5 md:p-6 rounded-2xl shadow-lg border-0 bg-white hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 flex items-center justify-center">
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                          <FaHeadphones className="text-red-600 text-xl md:text-2xl" />
                        </div>
                        Listening
                      </h3>
                      <ul className="space-y-3 md:space-y-4">
                        {[
                          { part: "Part 1", score: 8, max: 10, color: "green" },
                          { part: "Part 2", score: 7, max: 10, color: "green" },
                          { part: "Part 3", score: 6, max: 10, color: "amber" },
                          { part: "Part 4", score: 6, max: 10, color: "amber" },
                        ].map((item, index) => (
                          <li key={index} className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`mr-2 text-${item.color}-500`}>◆</span>
                                <span className="text-gray-700">{item.part}</span>
                              </div>
                              <span className="font-semibold">{item.score} right</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 ease-out`}
                                style={{
                                  width: progressAnimated
                                    ? `${(item.score / item.max) * 110}%`
                                    : "0%",
                                }}
                              ></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>

                  {/* Reading */}
                  <Card className="flex flex-col justify-between p-5 md:p-6 rounded-2xl shadow-lg border-0 bg-white hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 flex items-center justify-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <FaBook className="text-blue-600 text-xl md:text-2xl" />
                        </div>
                        Reading
                      </h3>
                      <ul className="space-y-3 md:space-y-4">
                        {[
                          { part: "Part 1", score: 11, max: 13, color: "green" },
                          { part: "Part 2", score: 10, max: 13, color: "green" },
                          { part: "Part 3", score: 2.5, max: 13, color: "red" },
                        ].map((item, index) => (
                          <li key={index} className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`mr-2 text-${item.color}-500`}>◆</span>
                                <span className="text-gray-700">{item.part}</span>
                              </div>
                              <span className="font-semibold">
                                {item.part === "Part 3"
                                  ? "just 2-3 right"
                                  : `${item.score} right`}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 ease-out`}
                                style={{
                                  width: progressAnimated
                                    ? `${(item.score / item.max) * 100}%`
                                    : "0%",
                                }}
                              ></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Score */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-center">
                        <span className="text-gray-700 mr-2">Overall Score:</span>
                        <span className="text-xl font-bold text-blue-700">6.5!</span>
                      </div>
                    </div>
                  </Card>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Custom animation keyframes */}
      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(200%); }
          }
          .before\\:animate-shine::before {
            content: "";
            animation: shine 2.5s infinite;
          }
          @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-down {
            animation: fade-in-down 1s ease-out forwards;
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out forwards;
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }
          @keyframes glow-fill {
            0% { opacity: 0.8; border-color: #3b82f6; transform: scale(0.9); }
            50% { opacity: 0.5; border-color: #60a5fa; transform: scale(1.1); }
            100% { opacity: 0; border-color: transparent; }
          }
          .animate-glow-fill {
            animation: glow-fill 1.2s ease-out forwards;
          }
          @keyframes ripple {
            0% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(96, 165, 250, 0); }
            100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0); }
          }
          .animate-ripple {
            animation: ripple 1.5s ease-out forwards;
          }
          @keyframes book-bounce {
            0% { transform: scale(0.9); opacity: 0; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-book-bounce {
            animation: book-bounce 1.2s ease-out forwards;
          }
          @keyframes ipad-shake {
            0% { transform: translateX(0) rotate(0deg); }
            10% { transform: translateX(-2px) rotate(-1deg); }
            20% { transform: translateX(2px) rotate(1deg); }
            30% { transform: translateX(-3px) rotate(-2deg); }
            40% { transform: translateX(3px) rotate(2deg); }
            50% { transform: translateX(-4px) rotate(-3deg); }
            60% { transform: translateX(4px) rotate(3deg); }
            70% { transform: translateX(-3px) rotate(-2deg); }
            80% { transform: translateX(3px) rotate(2deg); }
            90% { transform: translateX(-2px) rotate(-1deg); }
            100% { transform: translateX(0) rotate(0deg); }
          }
          .animate-ipad-shake {
            animation: ipad-shake 0.5s ease-in-out;
          }
          @keyframes pulse-slow {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(3deg); }
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
          @keyframes float-rotate {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(10deg); }
          }
          .animate-float-rotate {
            animation: float-rotate 5s ease-in-out infinite;
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(15px) rotate(-5deg); }
          }
          .animate-float-reverse {
            animation: float-reverse 7s ease-in-out infinite;
          }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 1; }
            75%, 100% { transform: scale(2); opacity: 0; }
          }
          .animate-ping-slow {
            animation: ping-slow 15s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}
      </style>

      {/* Nút Góp ý nổi */}
      <FloatingFeedbackButton />
    </div>
  );
};

export default Home;