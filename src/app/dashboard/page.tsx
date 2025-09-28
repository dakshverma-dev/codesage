'use client';

import { ArrowLeft, User, Calendar, Clock, Target, TrendingUp, CheckCircle, XCircle, AlertCircle, Award, Star, Code, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function InterviewerDashboard() {
  // Sample interview data
  const interviewData = {
    candidate: {
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      appliedFor: "Senior Software Engineer",
      experience: "5 years"
    },
    interview: {
      date: "September 27, 2025",
      duration: "52 minutes",
      interviewer: "Sarah Mitchell",
      type: "Technical Interview - Data Structures & Algorithms"
    },
    problems: [
      {
        title: "Two Sum",
        difficulty: "Medium",
        solved: true,
        timeSpent: "12 minutes",
        approach: "Hash Map",
        complexity: "O(n)",
        score: 85
      },
      {
        title: "Valid Parentheses", 
        difficulty: "Easy",
        solved: true,
        timeSpent: "8 minutes",
        approach: "Stack",
        complexity: "O(n)",
        score: 92
      },
      {
        title: "Merge Intervals",
        difficulty: "Hard", 
        solved: false,
        timeSpent: "25 minutes",
        approach: "Sorting (Incomplete)",
        complexity: "O(n log n)",
        score: 45
      }
    ],
    overallScore: 74,
    recommendation: "HIRE - Conditional",
    strengths: [
      "Strong problem-solving approach",
      "Good communication skills", 
      "Clean and readable code",
      "Proper time complexity analysis",
      "Asked clarifying questions"
    ],
    weaknesses: [
      "Struggled with advanced algorithms",
      "Could improve edge case handling",
      "Time management on complex problems"
    ],
    detailedFeedback: {
      technical: "Candidate demonstrated solid understanding of fundamental data structures. Code was well-structured and readable. However, faced challenges with the advanced problem requiring optimization.",
      communication: "Excellent communication throughout the interview. Thought process was clear and articulated well. Asked relevant questions and handled feedback positively.",
      problemSolving: "Good analytical thinking for basic to medium problems. Needs improvement in breaking down complex algorithmic challenges into smaller components."
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Interviewer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Interviewer</p>
                <p className="font-semibold text-gray-900">{interviewData.interview.interviewer}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                SM
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Interview Summary Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-gray-900">{interviewData.overallScore}%</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                interviewData.overallScore >= 80 ? 'bg-green-100 text-green-600' :
                interviewData.overallScore >= 60 ? 'bg-yellow-100 text-yellow-600' : 
                'bg-red-100 text-red-600'
              }`}>
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {interviewData.problems.filter(p => p.solved).length}/{interviewData.problems.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-3xl font-bold text-gray-900">{interviewData.interview.duration}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                <p className="text-lg font-bold text-orange-600">{interviewData.recommendation}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {interviewData.candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{interviewData.candidate.name}</h2>
                    <p className="text-gray-600">{interviewData.candidate.email}</p>
                    <p className="text-sm text-gray-500">{interviewData.candidate.appliedFor} • {interviewData.candidate.experience}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{interviewData.interview.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{interviewData.interview.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Interviewer:</span>
                    <span className="ml-2 font-medium">{interviewData.interview.interviewer}</span>
                  </div>
                  <div className="flex items-center">
                    <Code className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{interviewData.interview.type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problems Solved */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Problems & Performance</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {interviewData.problems.map((problem, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            problem.solved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {problem.solved ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{problem.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{problem.score}%</p>
                          <p className="text-sm text-gray-500">{problem.timeSpent}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Approach:</span> {problem.approach}
                        </div>
                        <div>
                          <span className="font-medium">Complexity:</span> {problem.complexity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Feedback</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Technical Skills
                  </h4>
                  <p className="text-gray-700">{interviewData.detailedFeedback.technical}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Communication
                  </h4>
                  <p className="text-gray-700">{interviewData.detailedFeedback.communication}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Problem Solving
                  </h4>
                  <p className="text-gray-700">{interviewData.detailedFeedback.problemSolving}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Strengths
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {interviewData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Areas for Improvement
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {interviewData.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Schedule Follow-up
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Send Feedback Email
                </button>
                <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium">
                  Download Report
                </button>
                <Link href="/practice" className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center">
                  Start New Interview
                </Link>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Overall Assessment</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Technical Skills</span>
                  <div className="flex items-center">
                    {[1,2,3,4].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Communication</span>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Problem Solving</span>
                  <div className="flex items-center">
                    {[1,2,3].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}