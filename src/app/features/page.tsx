'use client';

import { ArrowLeft, Code2, BarChart3, Users, Brain, Clock, Target, Trophy, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Brain className="w-12 h-12 text-purple-600" />,
      title: "AI-Powered Code Analysis",
      description: "Advanced machine learning algorithms analyze your code in real-time, providing instant feedback on syntax, logic, and performance optimization opportunities.",
      benefits: [
        "Real-time syntax and logic error detection",
        "Complexity analysis with Big O notation",
        "Performance bottleneck identification",
        "Code quality scoring and recommendations"
      ]
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      title: "Comprehensive Analytics Dashboard", 
      description: "Track your progress with detailed analytics that show improvement over time, identify strengths and weaknesses, and provide actionable insights.",
      benefits: [
        "Performance tracking across sessions",
        "Skill gap analysis and recommendations", 
        "Interview readiness scoring",
        "Progress visualization and trends"
      ]
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: "Interactive AI Coaching",
      description: "Get personalized guidance from our AI coach that adapts to your learning style and provides progressive hints when you're stuck.",
      benefits: [
        "Contextual hints and guidance",
        "Adaptive difficulty adjustment",
        "Communication skills coaching",
        "Interview best practices training"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Real-Time Performance Metrics",
      description: "Monitor execution time, memory usage, and algorithmic complexity as you code."
    },
    {
      icon: <Target className="w-8 h-8 text-red-500" />,
      title: "Company-Specific Practice",
      description: "Practice with problems commonly asked at top tech companies like Google, Amazon, and Microsoft."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Achievement System",
      description: "Unlock achievements as you solve problems and improve your coding interview skills."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CodeSage</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
              Reviews
            </Link>
            <Link href="/practice" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg">
              Start Practice
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Master Technical Interviews</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with proven interview preparation methodologies 
            to help you land your dream job at top tech companies.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h3>
            <p className="text-lg text-gray-600">Powered by advanced AI and designed for your success</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Advanced Capabilities</h3>
            <p className="text-lg text-gray-600">Professional-grade tools for serious interview preparation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600">Simple steps to interview success</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Problem</h4>
              <p className="text-sm text-gray-600">Select from our curated list of interview problems from top companies</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Code & Practice</h4>
              <p className="text-sm text-gray-600">Write your solution in our advanced code editor with real-time feedback</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Get AI Coaching</h4>
              <p className="text-sm text-gray-600">Receive instant feedback and progressive hints from our AI coach</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                4
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">Monitor your improvement with detailed analytics and personalized insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Interview Skills?
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of developers who've succeeded with CodeSage
          </p>
          <Link 
            href="/practice"
            className="bg-white text-purple-600 hover:text-purple-700 px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center"
          >
            <Code2 className="w-5 h-5 mr-2" />
            Start Your Practice Session
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
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/#testimonials" className="hover:text-white transition-colors">Success Stories</Link></li>
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