'use client';

import { ArrowRight, Code2, BarChart3, Users, CheckCircle, Play, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: <Code2 className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Code Analysis",
      description: "Real-time code evaluation with complexity analysis and performance metrics",
      highlight: "Smart feedback on algorithms, time complexity, and optimization opportunities"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Performance Analytics",
      description: "Detailed insights into your coding patterns and interview readiness",
      highlight: "Track progress with industry-standard evaluation metrics"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Interactive Coaching",
      description: "Progressive hints and personalized guidance throughout your practice",
      highlight: "Learn from mistakes with contextual feedback and suggestions"
    }
  ];

  const testimonials = [
    {
      name: "Arjun K.",
      role: "Software Engineer at Google",
      content: "CodeSage helped me nail my technical interviews. The AI coaching is incredibly realistic!",
      rating: 5
    },
    {
      name: "Priya S.", 
      role: "Backend Developer at Microsoft",
      content: "The real-time analytics and feedback made all the difference in my preparation.",
      rating: 5
    },
    {
      name: "Rahul M.",
      role: "Full Stack Developer at Amazon",
      content: "Best technical interview practice platform I've used. The AI coach feels like a real interviewer.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CodeSage</h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/features" className="text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
              Reviews
            </Link>
            <Link href="/practice" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg">
              Start Practice
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Ready to Ace Your Next
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Technical Interview?</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  AI-powered coding interview practice with personalized analytics and real-time feedback. 
                  Master algorithms, get instant coaching, and build confidence for your dream job.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/practice"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Coding Interview
                </Link>
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Interviewer Dashboard
                </Link>
                <Link 
                  href="#features"
                  className="border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Real-time AI coaching</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Performance analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Industry problems</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2">
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                  <div className="text-gray-500"># AI analyzing your code...</div>
                  <div className="text-blue-400">def find_duplicates(arr):</div>
                  <div className="ml-4 text-yellow-400">seen = set()</div>
                  <div className="ml-4 text-yellow-400">duplicates = []</div>
                  <div className="ml-4 text-purple-400">for num in arr:</div>
                  <div className="ml-8 text-green-400">if num in seen:</div>
                  <div className="ml-12 text-white">duplicates.append(num)</div>
                  <div className="ml-8 text-green-400">seen.add(num)</div>
                  <div className="ml-4 text-purple-400">return duplicates</div>
                  <div className="text-green-500 mt-2">✓ Optimal O(n) solution!</div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Performance: Excellent</span>
                  <span className="text-green-600 font-semibold">Score: 95/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CodeSage?
            </h3>
            <p className="text-xl text-gray-600">
              Experience the most advanced AI-powered technical interview preparation platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    {feature.highlight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Join Our Community of Successful Candidates
            </h3>
            <p className="text-xl text-gray-600">
              Thousands have improved their interview skills with CodeSage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Start Your Journey to Interview Success
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of developers who&apos;ve landed their dream jobs with CodeSage
          </p>
          <Link 
            href="/practice"
            className="bg-white text-purple-600 hover:text-purple-700 px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Your First Interview
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CodeSage</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered technical interview preparation platform designed to help you succeed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/practice" className="hover:text-white transition-colors">Practice Interviews</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#testimonials" className="hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Team</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Hackathon</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 CodeSage. Built for Hackathon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
