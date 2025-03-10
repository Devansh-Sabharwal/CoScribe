import Link from "next/link";

export function Footer1(){
    return <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className=" text-3xl sm:text-4xl font-bold mb-6">Ready to start creating?</h2>
          <p className="text-md sm:text-xl text-gray-600 mb-8">Join thousands of teams who trust DrawFlow for their visual collaboration needs.</p>
          <Link href={'/signup'} className="bg-black text-white px-4 sm:px-8 py-4 rounded-full hover:bg-gray-800 transition text-md sm:text-lg">
            Get Started for Free
          </Link >
        </div>
      </div>
    
}