export default function ShippingPolicy() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-slate-600 mb-4">
                We offer fast and reliable shipping to all our customers. Our shipping policy is as follows:
            </p>
            <ul className="list-disc list-inside">
                <li>Orders are processed within 24 hours of placement</li>
                <li>Shipping is free for all orders</li>
                <li>Orders are shipped via USPS Priority Mail</li>
                <li>Shipping time is 3-5 business days</li>
            </ul>
        </div>
    )
}