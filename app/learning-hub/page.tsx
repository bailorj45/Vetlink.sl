'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Play, Search } from 'lucide-react';
import { LearningLesson } from '@/lib/types';

const mockLessons: LearningLesson[] = [
  {
    id: '1',
    title: 'Introduction to Livestock Health Management',
    description: 'Learn the basics of keeping your livestock healthy and productive.',
    category: 'Health Management',
    content: 'This lesson covers fundamental principles of livestock health...',
    duration: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Common Diseases in Cattle',
    description: 'Identify and prevent common diseases affecting cattle in Sierra Leone.',
    category: 'Disease Prevention',
    content: 'Understanding common cattle diseases helps in early detection...',
    duration: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Goat Breeding Best Practices',
    description: 'Essential knowledge for successful goat breeding programs.',
    category: 'Breeding',
    content: 'Proper breeding practices ensure healthy offspring...',
    duration: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Poultry Nutrition Basics',
    description: 'Learn about proper nutrition for healthy and productive poultry.',
    category: 'Nutrition',
    content: 'Nutrition is key to poultry health and egg production...',
    duration: 12,
    createdAt: new Date().toISOString(),
  },
];

const categories = [
  'All Categories',
  'Health Management',
  'Disease Prevention',
  'Breeding',
  'Nutrition',
  'Veterinary Care',
];

export default function LearningHubPage() {
  const [lessons, setLessons] = useState<LearningLesson[]>(mockLessons);
  const [filteredLessons, setFilteredLessons] = useState<LearningLesson[]>(mockLessons);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const filterLessons = React.useCallback(() => {
    let filtered = [...lessons];

    if (searchTerm) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter((lesson) => lesson.category === categoryFilter);
    }

    setFilteredLessons(filtered);
  }, [lessons, searchTerm, categoryFilter]);

  useEffect(() => {
    filterLessons();
  }, [filterLessons]);

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Learning Hub</h1>
          <p className="text-gray-600">
            Access educational resources and audio lessons for better livestock management
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No lessons found matching your criteria.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex items-start justify-between mb-3">
                  <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
                  <Badge variant="info">{lesson.category}</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  {lesson.duration && (
                    <span className="text-sm text-gray-500">
                      {lesson.duration} min
                    </span>
                  )}
                  <button className="flex items-center gap-2 text-primary hover:underline">
                    <Play className="w-4 h-4" />
                    Listen
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Lesson Detail Modal */}
        {selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge variant="info" className="mb-2">
                    {selectedLesson.category}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-2">{selectedLesson.title}</h2>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedLesson.audioUrl ? (
                <AudioPlayer
                  src={selectedLesson.audioUrl}
                  title="Audio Lesson"
                  className="mb-6"
                />
              ) : (
                <div className="bg-primary/10 rounded-12 p-6 mb-6 text-center">
                  <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-gray-600">
                    Audio lesson will be available soon
                  </p>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{selectedLesson.content}</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

