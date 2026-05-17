export function validateTestConfig(testConfig) {
  const errors = [];
  const resultKeys = new Set(testConfig.resultTypes?.map((type) => type.key) ?? []);
  const dimensionKeys = new Set(testConfig.dimensions?.map((dimension) => dimension.key) ?? []);

  if (!testConfig.id) errors.push("Missing test id");
  if ((testConfig.resultTypes?.length ?? 0) !== 6) errors.push("Expected 6 result types");
  if ((testConfig.dimensions?.length ?? 0) !== 6) errors.push("Expected 6 dimensions");
  if ((testConfig.questions?.length ?? 0) !== 36) errors.push("Expected 36 questions");

  for (const type of testConfig.resultTypes ?? []) {
    for (const field of ["key", "name", "short", "summary", "origin", "pattern", "relationshipFocus", "actionPractice", "path"]) {
      if (!type[field]) errors.push(`Result type ${type.key ?? "unknown"} missing ${field}`);
    }
  }

  for (const question of testConfig.questions ?? []) {
    if (!question.id) errors.push("Question missing id");
    if (!dimensionKeys.has(question.dimension)) {
      errors.push(`Question ${question.id} has invalid dimension ${question.dimension}`);
    }
    if ((question.options?.length ?? 0) !== 4) {
      errors.push(`Question ${question.id} must have 4 options`);
    }

    for (const option of question.options ?? []) {
      if (!option.id || !option.text) {
        errors.push(`Question ${question.id} has an incomplete option`);
      }
      for (const key of Object.keys(option.scores ?? {})) {
        if (!resultKeys.has(key)) {
          errors.push(`Question ${question.id} option ${option.id} scores unknown result ${key}`);
        }
      }
    }
  }

  return errors;
}

export function scoreTest(testConfig, answers) {
  const validationErrors = validateTestConfig(testConfig);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid test config: ${validationErrors.join("; ")}`);
  }

  const scores = Object.fromEntries(testConfig.resultTypes.map((type) => [type.key, 0]));
  const dimensions = Object.fromEntries(testConfig.dimensions.map((dimension) => [dimension.key, 0]));

  for (const question of testConfig.questions) {
    const answerId = answers[question.id];
    if (!answerId) {
      throw new Error(`Missing answer for question ${question.id}`);
    }

    const option = question.options.find((item) => item.id === answerId);
    if (!option) {
      throw new Error(`Invalid answer ${answerId} for question ${question.id}`);
    }

    for (const [key, value] of Object.entries(option.scores)) {
      scores[key] += value;
    }
    dimensions[question.dimension] += option.dimensionScore ?? 1;
  }

  const ranked = testConfig.resultTypes
    .map((type, index) => ({ ...type, score: scores[type.key], index }))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return {
    primary: ranked[0],
    secondary: ranked[1],
    scores,
    dimensions: normalizeDimensions(testConfig, dimensions),
  };
}

function normalizeDimensions(testConfig, dimensions) {
  const normalized = {};

  for (const dimension of testConfig.dimensions) {
    const max = testConfig.questions.filter((question) => question.dimension === dimension.key).length * 4;
    normalized[dimension.key] = Math.round((dimensions[dimension.key] / max) * 100);
  }

  return normalized;
}
