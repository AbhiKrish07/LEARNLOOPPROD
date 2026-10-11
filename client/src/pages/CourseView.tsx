import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { BookOpen, PlayCircle, Trophy, Brain, ChevronRight, Sparkles, Target, Clock3, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { StudyQuestDashboard } from '../components/courses/StudyQuestDashboard';
import { useDarwinity } from '@/contexts/DarwinityStoreContext';
import { useCompanion } from '@/contexts/CompanionContext';
import { initialCourses } from '@/lib/persistence';
import { generate10LevelCourse } from '@/lib/courseGenerator';

export function CourseView() {
  const [, params] = useRoute('/courses/:courseId');
  const [, setLocation] = useLocation();
  const { state: darwinityState, dispatch } = useDarwinity();
  const companion = useCompanion();
  
  const courseIdParam = params?.courseId;
  const courseIdNum = Number(courseIdParam);
  const isTrpc = !isNaN(courseIdNum) && courseIdParam ? !courseIdParam.includes('-') : false;

  const { data: trpcCourse, isLoading, error, isError } = trpc.curriculum.get.useQuery(
    { courseId: courseIdNum }, 
    { enabled: isTrpc }
  );

  let darwinityCourse = darwinityState.courses.find(c => String(c.id) === String(courseIdParam))
    || initialCourses.find(c => String(c.id) === String(courseIdParam));

  if (!darwinityCourse && courseIdParam) {
    const titleFromId = courseIdParam.replace(/^(course|mod|les)-/i, '').replace(/[-_]/g, ' ');
    darwinityCourse = generate10LevelCourse(titleFromId, "intermediate");
    dispatch({ type: "CREATE_COURSE", course: darwinityCourse });
  }

  if (darwinityCourse && !(darwinityCourse as any).mastery) {
    (darwinityCourse as any).mastery = {
      completedLessonIds: [],
      completedLessons: 0,
      progress: darwinityCourse.progress || 0,
    };
  }

  const course = isTrpc ? (trpcCourse || darwinityCourse) : darwinityCourse;

  if (isTrpc && isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading your AI course...</p>
      </div>
    );
  }

  // If no specific course ID is provided or course not found, render the complete AI Courses Catalog
  if (!courseIdParam || !course) {
    const allCoursesList = Array.from(new Map(
      [...darwinityState.courses, ...initialCourses].map(c => [c.id, c])
    ).values());

    return (
      <div className="max-w-6xl mx-auto py-8 px-6 font-sans min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Brain size={16} /> Adaptive Curriculums
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your AI Learning Courses</h1>
            <p className="text-gray-500 text-sm mt-1">Master topics with personalized 10-level adaptive learning paths.</p>
          </div>
          
          <Button 
            onClick={() => setLocation('/course-builder')} 
            className="bg-[#5B5CE2] hover:bg-[#4b4cd1] text-white font-bold px-6 py-3 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Sparkles size={18} /> Create New AI Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCoursesList.map((c: any) => {
            const lessonsCount = c.lessons?.length || (c.modules || []).flatMap((m: any) => m.lessons || []).length || 10;
            const completed = c.mastery?.completedLessons || 0;
            const pct = Math.round((completed / Math.max(1, lessonsCount)) * 100);

            return (
              <div 
                key={c.id}
                onClick={() => setLocation(`/courses/${c.id}`)}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-[#5B5CE2]/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5B5CE2] flex items-center justify-center font-bold">
                      <BookOpen size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {c.level || "Intermediate"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-[#5B5CE2] transition-colors mb-2 line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-6">
                    {c.description || "Comprehensive 10-level adaptive curriculum built for concept mastery."}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                    <span>{lessonsCount} Levels</span>
                    <span>{pct}% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#5B5CE2] to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 text-sm font-bold text-[#5B5CE2]">
                    <span>Open Course Path</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (course && course.modules && course.lessons && !course.modules[0]?.lessons) {
    course.modules.forEach((mod: any) => {
      if (mod.lessonIds) {
        mod.lessons = mod.lessonIds.map((id: string) => course.lessons.find((l: any) => l.id === id)).filter(Boolean);
      }
    });
  }

  // Flatten lessons from modules to build the path
  const allLessons = course?.lessons || (course?.modules || []).flatMap((m: any) => m.lessons || []);
  const totalLessons = allLessons.length;
  const completedLessonIds = course.mastery?.completedLessonIds ?? [];
  const completedLessons = course.mastery?.completedLessons ?? completedLessonIds.length;
  const progress = course.mastery?.progress ?? (totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100));

  const mockLessons = allLessons.map((l: any, i: number) => ({
    id: l.id,
    title: l.title,
    completed: completedLessonIds.includes(l.id),
    current: !completedLessonIds.includes(l.id) && i === completedLessons,
    locked: !completedLessonIds.includes(l.id) && i > completedLessons,
  }));

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans min-h-screen">
      <StudyQuestDashboard course={course} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Lesson Path grouped by module */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Target size={20} className="text-[#123d2d]" />
            Learning Path
          </h2>
          
          {(course.modules || []).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Brain size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Course structure is being generated...</p>
              <p className="text-sm mt-1">This may take a moment after course creation.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {(course.modules || []).map((mod: any, modIdx: number) => (
                <div key={mod.id} className="relative">
                  {/* Module header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
                      {modIdx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Module {modIdx + 1}</p>
                      <h3 className="font-bold text-gray-800 text-lg">{mod.title}</h3>
                    </div>
                  </div>

                  {/* Lessons in this module */}
                  <div className="relative flex flex-col items-center">
                    <div className="absolute top-0 bottom-0 w-full pointer-events-none flex justify-center">
                      <svg width="200" height="100%" className="overflow-visible stroke-gray-200">
                        <path d="M100,0 L100,9999" strokeWidth="8" fill="none" strokeDasharray="8,8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="space-y-8 relative z-10 w-full max-w-sm mx-auto">
                      {(mod.lessons || []).map((lesson: any, lesIdx: number) => {
                        const globalIdx = allLessons.findIndex((l: any) => l.id === lesson.id);
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isCurrent = !isCompleted && globalIdx === completedLessons;
                        const isLocked = !isCompleted && globalIdx > completedLessons;
                        const offset = Math.sin(lesIdx * 1.5) * 36;

                        return (
                          <div
                            key={lesson.id}
                            className="flex justify-center"
                            style={{ transform: `translateX(${offset}px)` }}
                          >
                            <div
                              onClick={() => !isLocked && setLocation(`/courses/${course.id}/learn/${lesson.id}`)}
                              className={`relative group flex flex-col items-center ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1 transition-transform'}`}
                            >
                              {/* Tooltip */}
                              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded-xl border shadow-lg whitespace-nowrap z-20 font-bold text-sm text-gray-800 pointer-events-none">
                                {lesson.title}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r transform rotate-45" />
                              </div>

                              {/* Node */}
                              <div className={`w-20 h-20 rounded-full border-b-8 shadow-md flex items-center justify-center text-2xl relative z-10 transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-400 border-emerald-600 text-white'
                                  : isCurrent
                                    ? 'bg-amber-400 border-amber-600 text-white ring-4 ring-amber-100 ring-offset-2 scale-110'
                                    : 'bg-gray-200 border-gray-300 text-gray-400'
                              }`}>
                                {isCompleted ? <Trophy size={30} /> : isCurrent ? <Sparkles size={30} /> : <Target size={28} />}
                              </div>
                              <span className="mt-2 text-xs font-semibold text-gray-500 max-w-[80px] text-center leading-tight">{lesson.title?.split(':')[0]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Module separator */}
                  {modIdx < (course.modules || []).length - 1 && (
                    <div className="mt-8 flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium px-2">Next Module</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right: Course Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          
          <div className="space-y-3">
            <button onClick={() => setLocation(`/learn?courseId=${course.id}`)} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#123d2d] hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Brain size={20} className="text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Quiz Me</h3>
                <p className="text-xs text-gray-500">AI-generated questions</p>
              </div>
            </button>
            
            <button onClick={() => companion.open()} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#123d2d] hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Sparkles size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Study with AI</h3>
                <p className="text-xs text-gray-500">Companion-guided review</p>
              </div>
            </button>
            
            <button onClick={() => setLocation(course.sourceIds?.length ? `/spaces/${course.sourceIds[0]}` : '/artifacts')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#123d2d] hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookOpen size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">View Sources</h3>
                <p className="text-xs text-gray-500">Original study material</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
