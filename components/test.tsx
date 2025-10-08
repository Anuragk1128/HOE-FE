import Image from "next/image"
import Link from "next/link"
export default function Test() {
    return (
        <div className="bg-white w-full h-full">
            <h1 className="text-2xl font-bold ">Upto 65% off</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 px-2 sm:px-2 lg:px-2">
                <div className=" h-full ">
                    <Link href="https://www.houseofevolve.in/products/68da77fd238887c45430b94f">
                    <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759147768/blue_strike_pro_1_jpeg_jy53gw.jpg" alt="Test" width={400} height={200} />
                    </Link>
                </div>
                <div className=" h-full">
                    <Link href="https://www.houseofevolve.in/products/68bea1a6fa062655d0d391cb">
                    <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759144012/IRA_Web_Banner_Design.zip_-_4_cpi9kn.jpg" alt="Test" width={400} height={200} />
                    </Link>
                    <Link href="https://www.houseofevolve.in/products/68beaa10fa062655d0d39b18">
                    <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759143902/IRA_Web_Banner_Design.zip_-_3_ve51xm.jpg" alt="Test" width={400} height={200} />
                    </Link>
                </div>
                <div className=" h-full">
                    <Link href="https://www.houseofevolve.in/products/68beacc9fa062655d0d39e79">
                    <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759143811/IRA_Web_Banner_Design.zip_-_2_td4bya.jpg" alt="Test" width={400} height={200} />
                    </Link>
                    <Link href="https://www.houseofevolve.in/products/68c0058233211fb5f2b172b0">
                    <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759144273/IRA_Web_Banner_Design.zip_-_5_e7ynb7.jpg" alt="Test" width={400} height={200} />
                    </Link>
                    </div>
                    <div className=" h-full">   
                        <Link href="https://www.houseofevolve.in/products/68da82ff238887c45430be28">
                        <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759150708/Ignite_Sleeveless_Training_Jersey_jpeg_2_jp9f9p.jpg" alt="Test" width={400} height={200} />
                        </Link>
                    </div>
                    <div className=" h-full">
                        <Link href="https://www.houseofevolve.in/products/68da71ab238887c45430b716">
                        <Image src="https://res.cloudinary.com/deamrxfwp/image/upload/v1759145686/jerseymise_royal_roar_jpeg_4_h6w32n.jpg" alt="Test" width={400} height={200} />
                        </Link>
                    </div>

            </div>
        </div>
    )
}