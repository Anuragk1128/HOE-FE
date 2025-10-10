import Image from "next/image"
import Link from "next/link"
import { Blogs } from "@/lib/blog"

export default function Blog() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">NEWS/ARTICLES</h1>
                <Link className="font-bold text-amber-600 hover:underline" href="/articles">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Blogs.slice(0, 4).map((blog) => (
                    <Link key={blog._id} href={`/articles/${blog.slug}`}>
                        <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {blog.title}
                                </h2>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                    {blog.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>By {blog.author}</span>
                                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                </div>
                                {blog.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {blog.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {blog.tags.length > 2 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                +{blog.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    )
}