import Feature from "@/components/feature";
import { Link } from "react-router-dom";
import TestimonialsSection from "@/components/testimonialsection";
import { faqs } from "@/data";
import { FaqSection } from "@/components/Faqs";
import HowItWorks from "@/components/HowItWorks";
import { ArrowBigUp, ArrowUp, Facebook, Github, Linkedin, Twitter } from "lucide-react";
import { features } from "@/data";
import { useAuth } from "@/context/AuthContext";

export default function Home() {

  const { user } = useAuth()

  return (
    <>
      <div id="root" className="flex justify-center max-sm:px-4 items-center min-h-screen px-8  xl:px-30 scroll-smooth ">
        <div className="">
          <div className="firstpage pb-10">
            <div className="text-center mt-25  pb-6">
              <button className="border-2 border-green-500 text-green-400  text-sm py-1 my-4 px-9 rounded-3xl bg-green-950 font-bold">Trusted By 1,000+ Users</button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto leading-tight">
                Ask, Learn and Inquire from <span className="animate-pulse text-green-500">acadex.ai</span>
              </h1>
            </div>

            <div className="mt-12 px-4 lg:px-60">
              <p className="text-center text-xl max-w-3xl mx-auto">
                Acadex is your intelligent academic companion, built to help you learn smarter and achieve more. From instant answers and in-depth explanations to personalized study guides and assignment support, Acadex uses AI to make studying faster, easier, and truly effective — anytime, anywhere.
              </p>
            </div>

            <div className="text-center rounded text-gray-50 md:mt-40 mb-32 mt-20 max:">
              <Link to={user ? "/dashboard" : "/signup"} className="bg-gradient-to-r from-green-500 to-green-900 rounded-full text-2xl py-4 px-12">{user ? "Learn A Topic" : "Get Started"}</Link>
            </div>
          </div>

          <div className="max-lg:flex-col max-lg:border-0 max-lg:gap-8 flex justify-center text-center items-center  text-3xl gap-4 border-green-500 border-2 lg:my-30 rounded-full px-4 max: py-2.5">
            <div className="max-lg:text-xl">Personalised AI Writing</div>
            <div className="border rounded-2xl w-3 h-3 bg-green-500"></div>
            <div className="max-lg:text-xl">Professional Tone</div>
            <div className="border rounded-2xl w-3 h-3 bg-green-500"></div>
            <div className="max-lg:text-xl">Simplify All Questions</div>
          </div>
          <div className="pt-10" id="features">

            <div className=" " id="features">
              <p className="bg-green-950  mt-20 bg-gradient-to-r from-green-500 to-green-900 rounded-sm w-fit px-12 py-3 text-xl ">Feature</p>
              <h1 className="py-8 text-3xl font-bold lg:text-6xl lg:pr-70">Your go-to tool for Research, <span className="text-green-500">Learning</span> and Personalised content.</h1>
              <p className="text-xl max-lg:text-left lg:pr-12">Designed to give you the best. Every output is structured boost performance, logical reasoning, and conversation—boosting your academic performance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {features.map((feature, index) => (
                <Feature
                  key={index}
                  img={feature.img}
                  title={feature.title}
                  sub={feature.sub}
                />
              ))}
            </div>

          </div>

          <div className="pt-10 pb-10" id="how-it-work">
            <HowItWorks />
          </div>

          <div id="testimonial" className="mt-10">

            <div className="text-center pb-12" id="testimonial">
              <div className="text-center mb-14">
                <button className="border-2 border-green-500 text-green-400  text-sm py-2 px-8 rounded-3xl bg-green-950 font-bold">Testimonials</button>
              </div>
              <h1 className="lg:text-7xl text-4xl lg:px-70">Our users stories and the Impact</h1>
              <div className="mt-12 px-4 lg:px-60">
                <p className="text-center text-xl max-w-lg mx-auto">
                  Hear from top achievers, students, and educators who have transformed their learning experience with acadex.ai.
                </p>
              </div>

            </div>
            <TestimonialsSection />
          </div>



          <div id="pricing">
            <div className="py-8 pb-16">
              <div className="py-16 max-lg:px-4 lg:px-32 bg-transparent rounded-3xl">
                <p className="text-center pb-4 text-green-300">Pricing</p>
                <h1 className="text-center text-5xl py-4 max-sm:text-3xl pb-12">
                  Elevate Your <span className="text-green-600">Academic</span> Career
                </h1>

                <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
                  {/* Starter Plan */}
                  <div className="flex flex-col border-2 border-gray-500 px-4 py-8 rounded-2xl shadow-lg text-center w-full max-w-xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                    <p className="text-5xl font-bold mb-4">
                      $9<span className="text-sm text-gray-400">/month</span>
                    </p>
                    <p className="text-sm text-gray-400 pb-4">Billed Monthly</p>
                    <button className="border-green-500 border-2 text-white px-12 py-4 rounded-xl mb-8 w-full">
                      Get Started
                    </button>
                    <ul className="text-left text-xs mb-6 space-y-2">
                      <p className="pb-4 text-sm">What's Included</p>
                      <li>✔️ Ask up to 20 questions/day</li>
                      <li>✔️ 200 questions per month</li>
                      <li>✔️ Access to the community</li>
                      <li>✔️ Research Mode</li>
                      <li>✔️ Convert PDF resources to quiz</li>
                      <li>✔️ 10 quiz Generator for a week</li>
                      <li>✔️ 2 AI models</li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className="flex flex-col border-2 border-green-500 px-4 py-8 rounded-2xl shadow-lg text-center w-full max-w-xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                    <p className="text-5xl font-bold mb-4">
                      $19<span className="text-sm text-gray-400">/month</span>
                    </p>
                    <p className="text-sm text-gray-400 pb-4">Billed Monthly</p>
                    <button className="bg-gradient-to-r from-green-500 to-gray-800 text-white px-12 py-4 rounded-xl mb-8 w-full">
                      Get Started
                    </button>
                    <ul className="text-left text-xs mb-6 space-y-2">
                      <p className="pb-4 text-sm">What's Included</p>
                      <li>✔️ All features in Starter</li>
                      <li>✔️ Ask up to 50 questions/day</li>
                      <li>✔️ 200 questions per month</li>
                      <li>✔️ Research Mode</li>
                      <li>✔️ 4 AI models</li>
                      <li>✔️ Unlimited questions</li>
                      <li>✔️ Detailed assignments help</li>
                      <li>✔️ Personalized learning paths</li>
                    </ul>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="flex flex-col border-2 border-gray-500 px-4 py-8 rounded-2xl shadow-lg text-center w-full max-w-xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                    <p className="text-5xl font-bold mb-4">
                      $39<span className="text-sm text-gray-400">/month</span>
                    </p>
                    <p className="text-sm text-gray-400 pb-4">Billed Monthly</p>
                    <ul className="text-left text-xs mb-6 space-y-2">
                      <p className="pb-4 text-sm">Whats Included</p>
                      <li>✔️ All features in Pro</li>
                      <li>✔️ AI tutor for live support</li>
                      <li>✔️ Priority email support</li>
                      <li>✔️ Personal reading tips</li>
                      <li>✔️ Beta features access</li>
                      <li>✔️ Feature suggestions</li>
                      <li>✔️ Audio to question</li>
                      <li>✔️ Image to question</li>
                    </ul>
                    <button className="border-green-500 border-2 text-white py-4 rounded-xl mb-8 w-full">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div id="faqs">
            <div className="text-center pt-20 mt-20 ">
              <button className="border-2 border-green-500 text-green-400  text-sm py-2 px-8 rounded-3xl bg-green-950 font-bold">Frequently Asked Question</button>
            </div>
            <div className="text-center">
              <h1 className="lg:text-7xl text-4xl pt-8 pb-14 lg:px-70 text-white">Got questions? We've got <span className="text-green-500">answers</span> </h1>
              <p className="lg:px-70 text-xl pt-3.5 text-gray-200">Curious about how acadex works or what makes it different? these quick answers cover the essentials.
              </p>
            </div>

            <FaqSection />
          </div>


        </div>

      </div>

      <div className="py-10 pb-20 px-2 bg-[url(/favicon.ico)] "  >
        <div className="bg-[url('/apply-bg.jpg')] bg-cover bg-center bg-no-repeat rounded-2xl px-4 text-center">
          <h1 className="text-center py-8 text-4xl">Your voice. AI speed</h1>
          <p className="text-center text-xl max-w-3xl mx-auto">
            Tackle that academic problem that's troubling you with ease, and get ready to score perfectly every time, be it an assignment, research, or any academic task.
          </p>

          <Link to={user ? "/ask" : "/login"}><button className="border-2 border-green-500 text-neutral-100  text-sm py-4 my-12 px-10 rounded-3xl bg-green-900 font-bold cursor-pointer">Ask a Question</button></Link>
        </div>
      </div>
      <div className="flex animate-bounce  items-center justify-end text-center  ">
        <a href="">
          <div className="">
            <ArrowUp className="w-12 h-12 rounded-3xl text-green-700" />
          </div>
        </a>
      </div>
      <hr />
      <footer className="px-8">
        <div className="flex gap-4 py-3 justify-between max-lg:items-start lg:gap-50 items-center border-b-1 lg:pb-5">
          <div className="logo flex gap-2 items-center">
            <h1 className="bg-green-500 text-gray-800 font-bold py-0.5 px-2 rounded">A</h1>
            <h1><a href="/">acadex.ai</a> </h1>
          </div>
          <div className=" social flex gap-4 items-center">
            <Link to=""><Github className="hover:text-gray-300 text-xl" /></Link>
            <Link to=""><Linkedin className="hover:text-blue-800" /></Link>
            <Link to=""><Facebook className="hover:text-blue-800" /></Link>
            <Link to=""><Twitter className="hover:text-blue-800" /></Link>
          </div>
        </div>
        <div className="flex justify-between pt-3 sm:py-4 text-gray-400 max-lg:flex-col-reverse">
          <p> &copy; copyright 2025, All Rights Reserved by acadex AI inc</p>
          <p>newscholar@acadex.ai</p>
        </div>
      </footer>
    </>
  );
}
