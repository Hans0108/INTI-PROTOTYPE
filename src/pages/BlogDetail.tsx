import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import Markdown from 'react-markdown';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  author_name: string;
  created_at: string;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-[#BC002D] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News Room
        </Link>
        
        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {post.image_url && (
            <div className="h-64 sm:h-96 relative">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
          
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-red-50 text-[#BC002D] text-xs font-bold uppercase tracking-wider rounded-full">
                {post.category}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-12 pb-8 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Written by</p>
                <p>{post.author_name}</p>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <div className="markdown-body">
                <Markdown>{post.content}</Markdown>
              </div>
            </div>
          </div>
        </article>
      </div>
    </motion.div>
  );
}
