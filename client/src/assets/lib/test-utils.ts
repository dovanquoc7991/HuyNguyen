import type { TestData, QuestionGroup } from "@shared/schemaAdmin";

export function generateTestJSON(
  formData: { title: string; time: number; test_type: string; part_number?: number },
  passageText: string,
  questionGroups: QuestionGroup[],
  parts?: { [key: number]: { passage: string; groups: QuestionGroup[] } }
): TestData {
  const reading: any = {};
  
  if (formData.test_type === "full_test" && parts) {
    // Full test with 3 parts
    Object.keys(parts).forEach(partKey => {
      const partNum = parseInt(partKey);
      const part = parts[partNum];
      if (part.passage.trim() || part.groups.length > 0) {
        const passage = part.passage.split("\n\n").filter(p => p.trim());
        reading[`part${partNum}`] = [
          {
            id: partNum.toString(),
            title: `${formData.title} - Part ${partNum}`,
            time: Math.ceil(formData.time / 3).toString(), // Divide time across parts
            passage,
            groups: part.groups,
          },
        ];
      }
    });
  } else {
    // Single part
    const passage = passageText.split("\n\n").filter(p => p.trim());
    const partNumber = formData.part_number || 1;
    reading[`part${partNumber}`] = [
      {
        id: partNumber.toString(),
        title: formData.title,
        time: formData.time.toString(),
        passage,
        groups: questionGroups,
      },
    ];
  }
  
  return {
    Detailedtest: {
      reading,
      listening: {},
    },
  };
}

export function validateTestData(testData: TestData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!testData.Detailedtest?.reading?.part1?.length) {
    errors.push("Test must have at least one reading part");
  }

  const part1 = testData.Detailedtest?.reading?.part1?.[0];
  if (part1) {
    if (!part1.title) errors.push("Test name is required");
    if (!part1.passage?.length) errors.push("Test passage is required");
    if (!part1.groups?.length) errors.push("Test must have at least one question group");

    part1.groups?.forEach((group, groupIndex) => {
      if (!group.instruction) {
        errors.push(`Question group ${groupIndex + 1} must have instructions`);
      }
      if (!group.questions?.length) {
        errors.push(`Question group ${groupIndex + 1} must have at least one question`);
      }

      group.questions?.forEach((question, questionIndex) => {
        if (group.type === "TFNG" && !(question as any).question) {
          errors.push(`Question ${questionIndex + 1} in group ${groupIndex + 1} must have a question text`);
        }
        if ((group.type === "MCQ" || group.type === "MULTI") && !(question as any).question) {
          errors.push(`Question ${questionIndex + 1} in group ${groupIndex + 1} must have a question text`);
        }
        if ((group.type === "MCQ" || group.type === "MULTI") && !(question as any).options?.length) {
          errors.push(`Question ${questionIndex + 1} in group ${groupIndex + 1} must have options`);
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
