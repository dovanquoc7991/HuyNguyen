<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Section;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\QuestionGroup;
use App\Models\Question;
class ExamController extends Controller
{
    public function showReadingPartList($id)
    {
        return $this->getSectionsByExamAndType($id, 'Reading');
    }

    public function showListeningPartList($id)
    {
        return $this->getSectionsByExamAndType($id, 'Listening');
    }

    public function showReadingPartListByType()
    {
        return $this->listSectionsByType('Reading');
    }

    public function showListeningPartListByType()
    {
        return $this->listSectionsByType('Listening');
    }

    public function showWritingPartListByType()
    {
        return $this->listSectionsByType('Writing');
    }

    public function showSpeakingPartListByType()
    {
        return $this->listSectionsByType('Speaking');
    }

    public function showReadingList()
    {
        return $this->listExamsBySectionType('Reading');
    }

    public function showListeningList()
    {
        return $this->listExamsBySectionType('Listening');
    }

    public function showReading($id)
    {
        $exam = Exam::with('sections.groups.questions')->find($id);

        if (!$exam) {
            return response()->json(['message' => 'Exam not found'], 404);
        }

        return response()->json([
            'id' => $exam->id,
            'reading' => $this->getSectionsByType($exam, 'Reading'),
        ]);
    }

    public function showFullExam($id)
    {
        $exam = Exam::with('sections.groups.questions')->find($id);

        if (!$exam) {
            return response()->json(['message' => 'Exam not found'], 404);
        }

        return response()->json([
            'id' => $exam->id,
            'reading' => $this->getSectionsByType($exam, 'Reading'),
            'listening' => $this->getSectionsByType($exam, 'listening'),
        ]);
    }

    public function storeReading(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $data = $request->validate([
            'description' => 'string',
            'reading' => 'array',
        ]);

        $exam = Exam::create([
            'description' => $data['description'],
        ]);

        $this->saveSections($exam, $data['reading'] ?? [], 'Reading');
        return response()->json(['message' => 'Exam created', 'id' => $exam->id], 201);
    }


    public function storeListening(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $data = $request->validate([
            'description' => 'string',
            'listening' => 'array',
        ]);

        $exam = Exam::create([
            'description' => $data['description'],
        ]);

        $sections = array_map(function ($section) {
            return array_merge([
                'passage' => null,
            ], $section);
        }, $data['listening'] ?? []);

        $this->saveSections($exam, $sections, 'Listening');
        return response()->json(['message' => 'Listening exam created', 'id' => $exam->id], 201);
    }

    public function storeWriting(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $data = $request->validate([
            'description' => 'string',
            'writing' => 'array',
        ]);

        $exam = Exam::create([
            'description' => $data['description'],
        ]);

        $this->saveSections($exam, $data['writing'] ?? [], 'Writing');
        return response()->json(['message' => 'Exam created', 'id' => $exam->id], 201);
    }

    public function storeSpeaking(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $data = $request->validate([
            'description' => 'string',
            'speaking' => 'array',
        ]);

        $exam = Exam::create([
            'description' => $data['description'],
        ]);

        $this->saveSections($exam, $data['speaking'] ?? [], 'Speaking');
        return response()->json(['message' => 'Exam created', 'id' => $exam->id], 201);
    }

    public function storeExam(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        $data = $request->validate([
            'description' => 'string',
            'reading' => 'array',
            'listening' => 'array',
        ]);

        $exam = Exam::create([
            'description' => $data['description'],
        ]);

        $this->saveSections($exam, $data['reading'] ?? [], 'Reading');
        $this->saveSections($exam, $data['listening'] ?? [], 'Listening');
        return response()->json(['message' => 'Exam created', 'id' => $exam->id], 201);
    }

    private function getSectionsByType($exam, $type)
    {
        return $exam->sections
            ->where('type', $type)
            ->values()
            ->map(function ($section) {
                return [
                    "title" => $section->title ?? '',
                    "time" => $section->time ?? '',
                    "passage" => $section->passage ?? '',
                    "locked" => $section->locked ?? '',
                    "isBasic" => $section->isBasic ?? '',
                    "password" => $section->password ?? '',
                    "part_number" => $section->part_number ?? 1,
                    "explanation" => $section->explanation ?? '',
                    'groups' => $section->groups->map(function ($group) {
                        return [
                            "type" => $group->type ?? '',
                            "instruction" => $group->instruction ?? '',
                            "imgContent" => $group->imgContent ?? '',
                            "paragraph" => $group->paragraph ?? '',
                            "choices" => $group->choices ?? [],
                            'questions' => $group->questions->map(function ($question) use ($group) {
                                return [
                                    "number" => $question->number ?? 0,
                                    "question" => $question->question ?? '',
                                    "answers" => $question->answers ?? [],
                                    "options" => $question->options ?? [],
                                    "type" => $group->type ?? '' // Assuming 'single' is the default type
                                ];
                            }),
                        ];
                    }),
                ];
            });
    }

    private function saveSections($exam, $sections, $type)
    {
        foreach ($sections as $sectionData) {
            $section = $exam->sections()->create([
                'type' => $type,
                'title' => $sectionData['title'] ?? '',
                'time' => $sectionData['time'] ?? '',
                'passage' => $sectionData['passage'] ?? '',
                'audio_url' => $sectionData['audio_url'] ?? '',
                'part_number' => $sectionData['part_number'] ?? 1,
                'locked' => $sectionData['locked'] ?? 0,
                'isBasic' => $sectionData['isBasic'] ?? 0,
                'password' => $sectionData['password'] ?? '',
                'explanation' => $sectionData['explanation'] ?? '',
                'examContent' => $sectionData['examContent'] ?? '',
            ]);

            foreach ($sectionData['groups'] ?? [] as $groupData) {
                $group = $section->groups()->create([
                    'type' => $groupData['type'] ?? '',
                    'instruction' => $groupData['instruction'] ?? '',
                    'imgContent' => $groupData['imgContent'] ?? '',
                    'paragraph' => $groupData['paragraph'] ?? '',
                    'choices' => $groupData['choices'] ?? [],
                ]);

                foreach ($groupData['questions'] ?? [] as $questionData) {
                    $group->questions()->create([
                        'number' => $questionData['number'] ?? 0,
                        'question' => $questionData['question'] ?? '',
                        'answers' => is_array($questionData['answer']) ? $questionData['answer'] : [$questionData['answer']],
                        'options' => $questionData['options'] ?? [],
                    ]);
                }
            }
        }
    }

    private function listExamsBySectionType($type)
    {
        $exams = Exam::whereHas('sections', function ($query) use ($type) {
            $query->where('type', $type);
        })
            ->with([
                'sections' => function ($query) use ($type) {
                    $query->where('type', $type);
                }
            ])
            ->get();

        $result = $exams->map(function ($exam) use ($type) {
            return [
                'id' => $exam->id,
                'description' => $exam->description ?? '',
                'parts' => $exam->sections->count(),
            ];
        });

        return response()->json([
            'exams' => $result ?? []
        ]);
    }

    private function getSectionsByExamAndType($examId, $type)
    {
        $exam = Exam::with(['sections.groups.questions'])
            ->find($examId);

        if (!$exam) {
            return response()->json(['message' => 'Exam not found'], 404);
        }

        $sections = $exam->sections
            ->where('type', $type)
            ->values()
            ->map(function ($section) {
                $questionsCount = $section->groups->reduce(function ($carry, $group) {
                    return $carry + ($group->questions ? $group->questions->count() : 0);
                }, 0);

                return [
                    'id' => $section->id,
                    'exam_id' => $section->exam_id,
                    'title' => $section->title ?? '',
                    'time' => $section->time ?? '',
                    'locked' => $section->locked ?? '',
                    'isBasic' => $section->isBasic ?? '',
                    'password' => $section->password ?? '',
                    'questions_count' => $questionsCount,
                    'part_number' => $section->part_number ?? 1,
                    "explanation" => $section->explanation ?? '',
                ];
            });

        return response()->json([
            'sections' => $sections
        ]);
    }

    private function listSectionsByType($type)
    {
        $sections = Section::with(['groups.questions'])
            ->where('type', $type)
            ->get()
            ->map(function ($section) {
                $questionsCount = $section->groups->reduce(function ($carry, $group) {
                    return $carry + ($group->questions ? $group->questions->count() : 0);
                }, 0);

                return [
                    'id' => $section->id,
                    'exam_id' => $section->exam_id,
                    'title' => $section->title ?? '',
                    'time' => $section->time ?? '',
                    'questions_count' => $questionsCount,
                    'locked' => $section->locked ?? '',
                    'isBasic' => $section->isBasic ?? '',
                    'password' => $section->password ?? '',
                    'part_number' => $section->part_number ?? 1,
                    'explanation' => $section->explanation ?? '',
                    'examContent' => $section->examContent ?? '',
                    'created_at' => $section->created_at ?? '',
                    'audio_url' => $section->audio_url ?? '',
                ];
            });

        return response()->json([
            'sections' => $sections
        ]);
    }

    public function getSectionById($id)
    {
        $section = Section::with(['groups.questions'])->find($id);

        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $questionsCount = $section->groups->reduce(function ($carry, $group) {
            return $carry + ($group->questions ? $group->questions->count() : 0);
        }, 0);

        return response()->json([
            'id' => $section->id,
            'exam_id' => $section->exam_id,
            'locked' => $section->locked ?? '',
            'isBasic' => $section->isBasic ?? '',
            'password' => $section->password ?? '',
            'title' => $section->title ?? '',
            'type' => $section->type ?? '',
            'time' => $section->time ?? '',
            'passage' => $section->passage ?? '',
            'audio_url' => $section->audio_url ?? '',
            'part_number' => $section->part_number ?? 1,
            "explanation" => $section->explanation ?? '',
            'examContent' => $section->examContent ?? '',
            'groups' => $section->groups->map(function ($group) {
                return [
                    'id' => $group->id,
                    'type' => $group->type ?? '',
                    'instruction' => $group->instruction ?? '',
                    "imgContent" => $group->imgContent ?? '',
                    'paragraph' => $group->paragraph ?? '',
                    'choices' => $group->choices ?? [],
                    'questions' => $group->questions->map(function ($question) use ($group) {
                        return [
                            'id' => $question->id,
                            'number' => $question->number ?? 0,
                            'question' => $question->question ?? '',
                            'answers' => $question->answers ?? [],
                            'options' => $question->options ?? [],
                            'type' => $group->type ?? '',
                        ];
                    }),
                ];
            }),
            'questions_count' => $questionsCount,
        ]);
    }

    public function deleteTest($id)
    {
        $exam = Exam::find($id);
        if (!$exam) {
            return response()->json(['message' => 'Exam not found'], 404);
        }
        $exam->delete();
        return response()->json(['message' => 'Exam deleted successfully']);
    }

    /**
     * Cập nhật một bài thi đã có.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Exam  $exam
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Exam $exam)
    {
        // Xác thực quyền, chỉ admin mới có quyền sửa
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Validate dữ liệu đầu vào một cách linh hoạt hơn
        $validatedData = $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'reading' => 'sometimes|required|array',
            'listening' => 'sometimes|required|array',
            'writing' => 'sometimes|required|array',
            'speaking' => 'sometimes|required|array',
        ]);

        try {
            // Bắt đầu một transaction để đảm bảo toàn vẹn dữ liệu
            DB::transaction(function () use ($exam, $validatedData) {
                // 1. Cập nhật thông tin của bản ghi Exam chính
                if (isset($validatedData['description'])) {
                    $exam->update([
                        'description' => $validatedData['description'],
                    ]);
                }

                // 2. Xác định các loại section có trong request để xóa và tạo lại
                $typesInRequest = [];
                if (isset($validatedData['reading']))
                    $typesInRequest[] = 'Reading';
                if (isset($validatedData['listening']))
                    $typesInRequest[] = 'Listening';
                if (isset($validatedData['writing']))
                    $typesInRequest[] = 'Writing';
                if (isset($validatedData['speaking']))
                    $typesInRequest[] = 'Speaking';

                // 3. Xóa các section cũ thuộc các loại có trong request
                if (!empty($typesInRequest)) {
                    // Giả định rằng bạn đã thiết lập onDelete('cascade') trong migrations
                    // Nếu không, bạn cần xóa thủ công từ dưới lên (Question -> QuestionGroup -> Section)
                    $exam->sections()->whereIn('type', $typesInRequest)->delete();
                }

                // 4. Tạo lại các section mới bằng cách tái sử dụng hàm saveSections
                if (isset($validatedData['reading'])) {
                    $this->saveSections($exam, $validatedData['reading'], 'Reading');
                }
                if (isset($validatedData['listening'])) {
                    $sections = array_map(function ($section) {
                        return array_merge(['passage' => null], $section);
                    }, $validatedData['listening']);
                    $this->saveSections($exam, $sections, 'Listening');
                }
                if (isset($validatedData['writing'])) {
                    $this->saveSections($exam, $validatedData['writing'], 'Writing');
                }
                if (isset($validatedData['speaking'])) {
                    $this->saveSections($exam, $validatedData['speaking'], 'Speaking');
                }
            });

            // Trả về exam đã được cập nhật với các quan hệ đã load
            return response()->json(['message' => 'Bài thi đã được cập nhật thành công!', 'exam' => $exam->fresh()->load('sections.groups.questions')]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật bài thi: ' . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra trong quá trình cập nhật.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật một section cụ thể.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Section  $section
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSection(Request $request, Section $section)
    {
        Log::info('Request to updateSection received for section ID: ' . $section->id);

        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        // Validate dữ liệu
        $validatedData = $request->validate([
            'title' => 'sometimes|string',
            'time' => 'sometimes|string',
            'passage' => 'nullable|string',
            'audio_url' => 'nullable|string',
            'part_number' => 'sometimes|integer',
            'locked' => 'sometimes|boolean',
            'isBasic' => 'sometimes|boolean',
            'password' => 'nullable|string',
            'explanation' => 'nullable|string',
            'examContent' => 'nullable|string',
            'groups' => 'sometimes|array',
            'groups.*.type' => 'string',
            'groups.*.instruction' => 'nullable|string',
            'groups.*.imgContent' => 'nullable|string',
            'groups.*.paragraph' => 'nullable|string',
            'groups.*.choices' => 'nullable|array',
            'groups.*.questions' => 'sometimes|array',
            'groups.*.questions.*.number' => 'nullable|integer',
            'groups.*.questions.*.question' => 'nullable|string',
            'groups.*.questions.*.answer' => 'nullable',
            'groups.*.questions.*.options' => 'nullable|array',
        ]);

        try {
            DB::transaction(function () use ($section, $validatedData) {
                // Tách dữ liệu section và groups
                $sectionData = collect($validatedData)->except('groups')->toArray();
                $groupsData = $validatedData['groups'] ?? [];

                // Đảm bảo 'password' không bao giờ là null nếu nó không được gửi
                if (!isset($sectionData['password'])) {
                    $sectionData['password'] = '';
                }

                // Update thông tin section
                $section->update($sectionData);

                // Xóa group cũ và tạo mới
                $section->groups()->delete();

                foreach ($groupsData as $groupData) {
                    Log::info('Đang tạo group:', $groupData);
                    $group = $section->groups()->create([
                        'type' => $groupData['type'] ?? '',
                        'instruction' => $groupData['instruction'] ?? '',
                        'imgContent' => $groupData['imgContent'] ?? '',
                        'paragraph' => $groupData['paragraph'] ?? '',
                        'choices' => $groupData['choices'] ?? [],
                    ]);

                    foreach ($groupData['questions'] ?? [] as $questionData) {
                        Log::info('Đang tạo question:', $questionData);

                        $answers = isset($questionData['answer'])
                            ? (is_array($questionData['answer']) ? $questionData['answer'] : [$questionData['answer']])
                            : [];

                        $group->questions()->create([
                            'number' => $questionData['number'] ?? 0,
                            'question' => $questionData['question'] ?? '',
                            'answers' => $answers,
                            'options' => $questionData['options'] ?? [],
                        ]);
                    }
                }
            });

            return response()->json([
                'message' => 'Phần thi đã được cập nhật thành công!',
                'section' => $section->fresh()->load('groups.questions')
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật section: ' . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra trong quá trình cập nhật.', 'error' => $e->getMessage()], 500);
        }
    }

}
