import Link from "next/link";

export function HeroSection(){
    return <div className="my-10 flex justify-center items-center h-64 sm:h-[60vh] w-full">
        <div className="flex flex-col gap-1 sm:gap-3 justify-center items-center text-center">
            <div className="text-4xl sm:text-6xl md:text-7xl">
                <span className="font-semibold mr-4 md:mr-6">Create</span>
                <span className="font-medium">Freely</span>
            </div>
            <div className="text-4xl sm:text-6xl md:text-7xl">
                <span className="font-semibold mr-4 md:mr-6">Collaborate</span>
                <span className="font-medium">Instantly</span>
            </div>
            <span className="font-medium text-gray-600 text-center mt-5 text-sm sm:text-xl md:text-2xl">
                Brainstorm, sketch, and collaborate seamlessly—all in real time
            </span>
            <div className="flex justify-center items-center mt-4 sm:mt-2 gap-6 font-semibold text-md sm:text-lg">
                <Link href={'/signup'} className="bg-black cursor-pointer hover:bg-gray-800 text-white px-3 sm:px-6 py-3 rounded-2xl">Start Drawing</Link>
                <Link href={'#demo'} className="border cursor-pointer hover:bg-gray-200 border-black px-3 sm:px-6 py-3 rounded-2xl">Watch demo</Link>
            </div>

        </div>
    </div>
}
