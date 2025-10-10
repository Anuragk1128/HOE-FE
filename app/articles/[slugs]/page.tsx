import { getBlogBySlug, getAllBlogSlugs } from "@/lib/blog"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ArticlePageProps {
  params: {
    slugs: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
    const blog = getBlogBySlug(params.slugs)

    if (!blog) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link href="/articles" className="text-amber-600 hover:text-amber-800 hover:underline font-medium">
                    ← Back to Articles
                </Link>
            </div>
            <article className="prose prose-lg mx-auto">
                <div className="mb-8">
                    <Image
                        src={blog.image}
                        alt={blog.title}
                        width={800}
                        height={400}
                        className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
                    />
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
                    <p className="text-gray-600 text-lg mb-4">{blog.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span>By {blog.author}</span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="prose-content">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {blog.content}
                    </p>
                </div>

                {blog.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    )
}

export async function generateStaticParams() {
    const slugs = getAllBlogSlugs()

    return slugs.map((slug) => ({
        slugs: slug,
    }))
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const blog = getBlogBySlug(params.slugs)

    if (!blog) {
        return {
            title: 'Article Not Found',
        }
    }

    return {
        title: `${blog.title} | HOE Articles`,
        description: blog.description,
    }
}