import Link from "next/link"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"
export default function Collections(){
    return(
        <div className="flex w-full">
            <div className="bg-slate-700 p-4">
              <AnimateOnScroll y={16}>
                <Link href="/collections/bangles" className="text-white underline">Bangles</Link>
              </AnimateOnScroll>
            </div>
        </div>
    )
}