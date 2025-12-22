import { FormEvent, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Menu, X, } from "lucide-react"

const Navbar = () => {
  const [menu, setMenu] = useState(false)
  const { user } = useAuth();
  const handleMenuToggle = () => {
    setMenu(!menu)
  }

  const handleChange = () => {
    setMenu(!menu)
    if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/forgot-password") {
      location.href = `/`
    }
    return true
  }
  return (
    <>
      <div className="bg-gray-850 w-full bg-background fixed  border-b-1 border-green-900 z-30  hrefp-0  b flex items-center justify-between min-xl:px-24 px-12 py-4 max-lg:px-2">
        <div className="logo flex gap-2 items-center">
          <h1 className="bg-green-500 text-gray-800 font-bold py-0.5 px-2 rounded">A</h1>
          <h1><a href="/">acadex.ai</a> </h1>
        </div>

        <ul className="flex p-2 px-3.5 rounded-2xl  max-lg:hidden gap-4 border border-green-600  text-gray-200">
          <li className="hover:text-green-500" onClick={handleChange}><a className="" href="/#features">Features</a></li>
          <li className="hover:text-green-500" onClick={handleChange}> <a href="#how-it-work">How It Works</a></li>
          <li className="hover:text-green-500" onClick={handleChange}>  <a href="#testimonial">Testimonial</a></li>
          <li className="hover:text-green-500" onClick={handleChange}><a href="#pricing">Pricing</a></li>
          <li className="hover:text-green-500" onClick={handleChange}><a href="#faqs">FAQs</a></li>
        </ul>
        <div >
          <ul className="flex gap-3 items-center max-lg:hidden  text-gray-200">
            <li>
              {user ? (
                <a href="/dashboard" className="bg-green-500 font-bold text-gray-900 rounded-3xl p-2 px-6 ">Dashboard</a>
              ) : (
                <div className="flex items-center gap-2">
                  <a href="/login" className="text-sm font-bold text-green-50 hover:text-green-500">Log In</a>
                  <li>
                    <a href="/signup" className="bg-green-500 font-bold text-gray-900 rounded-3xl p-2 px-6 ">Register</a>
                  </li>
                </div>


              )}
            </li>

          </ul>

        </div>
        <button className="lg:hidden" onClick={handleMenuToggle}>
          {menu ? <X /> : <Menu />}
        </button>
      </div>

      <nav>
        {menu && (
          <div className="lg:hidden w-full  z-10 fixed bg-zinc-900 py-4 ">
            <ul className=" flex flex-col gap-8  text-left py-4 pl-8 pt-16 font-bold border-b-1 border-green-600">
              <li onClick={handleChange}>
                <a className="hover:text-green-500" href="#features">Features</a>
              </li>
              <li onClick={handleChange}>
                <a className="hover:text-green-500" href="#how-it-works">How It Works</a>
              </li>
              <li onClick={handleChange}>
                <a className="hover:text-green-500" href="#testimonial">Testimonial</a>
              </li>
              <li onClick={handleChange}>
                <a className="hover:text-green-500" href="#pricing">Pricing</a>
              </li>
              <li onClick={handleChange}>
                <a className="hover:text-green-500" href="#faqs">FAQs</a>
              </li>
            </ul>
            <ul className="flex flex-col gap-3 text-left py-4 px-4 font-bold">


              <li>
                {user ? (
                  <a
                    onClick={handleChange}
                    href="/dashboard"
                    className="hover:bg-green-700 border  bg-green-500 border-green-500 rounded-full py-3 text-center block text-black"
                  >
                    Dashboard
                  </a>
                ) : (
                  <div className="">
                    <li>
                      <a
                        onClick={handleChange}
                        href="/signup"
                        className="hover:bg-green-700 border  bg-green-500 border-green-500 rounded-full py-3 text-center block text-black"
                      >
                        Register
                      </a>
                    </li>
                    <a
                      onClick={handleChange}
                      href="/login"
                      className="hover:bg-gray-800 border border-green-500 rounded-full text-green-500 py-3 text-center block mt-3"
                    >
                      Log In
                    </a>
                  </div>

                )}
              </li>
            </ul>

          </div>
        )}
      </nav>

    </>
  )
}

export default Navbar