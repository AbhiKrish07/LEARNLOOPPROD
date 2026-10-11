/**
 * LearnLoop Seven-Concept CS / Calculus Ontology
 * Foundation:
 *   1. functions
 *   2. derivatives
 *   3. composition
 * Core Diagnostic:
 *   4. chain-rule
 * Next:
 *   5. computational-graphs
 * Advanced:
 *   6. backpropagation
 *   7. gradient-descent
 */

export interface MisconceptionDef {
  id: string;
  conceptId: string;
  pattern: string;
  description: string;
  exampleSlip: string;
  correctedRule: string;
  diagnosticRules: string[];
}

export interface DiagnosticQuestion {
  id: string;
  conceptId: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionId?: string;
    explanation: string;
  }[];
  expectedReasoningSkill: string;
}

export interface ConceptDef {
  id: string;
  slug: string;
  name: string;
  tier: "Foundation" | "Core Diagnostic" | "Next" | "Advanced";
  description: string;
  explanation: string;
  prerequisites: string[];
  misconceptionIds: string[];
  diagnosticQuestionIds: string[];
  exampleIds: string[];
  curriculumVersion: number;
}

export const CS_CONCEPTS: Record<string, ConceptDef> = {
  "functions": {
    id: "functions",
    slug: "functions",
    name: "Functions",
    tier: "Foundation",
    description: "Mappings from input domains to outputs, state transformations, and evaluation rules.",
    explanation: "A mathematical function f: X -> Y assigns exactly one output f(x) to each input x. In computational models, functions represent deterministic transformation steps.",
    prerequisites: [],
    misconceptionIds: ["functions_as_equations_only", "confuses_input_output"],
    diagnosticQuestionIds: ["diag_func_1", "diag_func_2"],
    exampleIds: ["ex_func_1"],
    curriculumVersion: 1
  },
  "derivatives": {
    id: "derivatives",
    slug: "derivatives",
    name: "Derivatives",
    tier: "Foundation",
    description: "Instantaneous rates of change, sensitivities, and linear approximations.",
    explanation: "The derivative df/dx measures the sensitivity of output f to tiny perturbations in input x. It is the limit of (f(x+h) - f(x))/h as h approaches 0.",
    prerequisites: ["functions"],
    misconceptionIds: ["derivative_is_static_fraction", "forgets_power_rule_constant"],
    diagnosticQuestionIds: ["diag_deriv_1", "diag_deriv_2"],
    exampleIds: ["ex_deriv_1"],
    curriculumVersion: 1
  },
  "composition": {
    id: "composition",
    slug: "composition",
    name: "Composition",
    tier: "Foundation",
    description: "Nesting functions where the output of g becomes the input to f: (f ∘ g)(x) = f(g(x)).",
    explanation: "Composition models multi-stage processing pipelines. If g converts x to u, and f converts u to y, then (f ∘ g)(x) converts x directly to y through intermediate state u.",
    prerequisites: ["functions"],
    misconceptionIds: ["confuses_composition_with_multiplication", "swaps_inner_outer"],
    diagnosticQuestionIds: ["diag_comp_1", "diag_comp_2"],
    exampleIds: ["ex_comp_1"],
    curriculumVersion: 1
  },
  "chain-rule": {
    id: "chain-rule",
    slug: "chain-rule",
    name: "Chain Rule",
    tier: "Core Diagnostic",
    description: "The derivative of a composite function is the product of component derivatives: dy/dx = (dy/du) * (du/dx).",
    explanation: "Slopes on a path multiply like mechanical gear ratios. If y changes 2x as fast as u, and u changes 3x as fast as x, then y changes 2 * 3 = 6x as fast as x.",
    prerequisites: ["derivatives", "composition"],
    misconceptionIds: ["adds_rates_instead_of_chaining", "forgets_inner_derivative", "differentiates_outer_only"],
    diagnosticQuestionIds: ["diag_chain_1", "diag_chain_2", "diag_chain_3"],
    exampleIds: ["ex_chain_1", "ex_chain_2"],
    curriculumVersion: 1
  },
  "computational-graphs": {
    id: "computational-graphs",
    slug: "computational-graphs",
    name: "Computational Graphs",
    tier: "Next",
    description: "Directed acyclic graphs representing mathematical operations as nodes and tensors as edges.",
    explanation: "A computational graph breaks compound mathematical operations into elementary primitive nodes (add, multiply, activation). Forward evaluation computes values; reverse traversal computes local gradients.",
    prerequisites: ["chain-rule"],
    misconceptionIds: ["adds_gradients_instead_of_multiplying_edges", "confuses_forward_backward_flow"],
    diagnosticQuestionIds: ["diag_cgraph_1", "diag_cgraph_2"],
    exampleIds: ["ex_cgraph_1"],
    curriculumVersion: 1
  },
  "backpropagation": {
    id: "backpropagation",
    slug: "backpropagation",
    name: "Backpropagation",
    tier: "Advanced",
    description: "Reverse-mode automatic differentiation applying the chain rule backward from scalar loss to all parameters.",
    explanation: "Backpropagation computes the gradient of an objective function with respect to every weight in O(1) passes by caching intermediate activations and propagating adjoints backward.",
    prerequisites: ["computational-graphs"],
    misconceptionIds: ["recalculates_intermediate_activations", "confuses_weight_gradient_with_activation_gradient"],
    diagnosticQuestionIds: ["diag_backprop_1", "diag_backprop_2"],
    exampleIds: ["ex_backprop_1"],
    curriculumVersion: 1
  },
  "gradient-descent": {
    id: "gradient-descent",
    slug: "gradient-descent",
    name: "Gradient Descent",
    tier: "Advanced",
    description: "Iterative optimization stepping parameters in the negative gradient direction: θ_{t+1} = θ_t - η * ∇L(θ_t).",
    explanation: "Optimization seeks the minimum of an objective loss surface. By computing the gradient vector via backpropagation and taking proportional steps downhill, parameters converge toward lower loss.",
    prerequisites: ["backpropagation"],
    misconceptionIds: ["steps_along_gradient_instead_of_negative", "overshooting_due_to_high_learning_rate"],
    diagnosticQuestionIds: ["diag_gd_1", "diag_gd_2"],
    exampleIds: ["ex_gd_1"],
    curriculumVersion: 1
  }
};

export const MISCONCEPTIONS: Record<string, MisconceptionDef> = {
  "adds_rates_instead_of_chaining": {
    id: "adds_rates_instead_of_chaining",
    conceptId: "chain-rule",
    pattern: "Adds derivatives (dy/du + du/dx) instead of multiplying them (dy/du * du/dx)",
    description: "The learner calculates intermediate derivatives correctly, but adds them together at the final step as if rates were additive, rather than compounding multiplicatively.",
    exampleSlip: "dy/du = 2u, du/dx = 3 => dy/dx = 2u + 3",
    correctedRule: "dy/dx = (dy/du) * (du/dx). In a composite function, the change in the outer function is scaled by the rate of the inner function.",
    diagnosticRules: ["contains '+' or 'plus' between differential operators dy/du and du/dx"]
  },
  "forgets_inner_derivative": {
    id: "forgets_inner_derivative",
    conceptId: "chain-rule",
    pattern: "Differentiates the outer function but forgets to multiply by the inner derivative du/dx",
    description: "The learner applies the power or outer rule but leaves out the inner factor du/dx completely.",
    exampleSlip: "d/dx[(3x+1)^2] = 2(3x+1)",
    correctedRule: "Always multiply by du/dx: d/dx[(3x+1)^2] = 2(3x+1) * 3 = 6(3x+1).",
    diagnosticRules: ["derivative lacks inner scaling factor"]
  },
  "differentiates_outer_only": {
    id: "differentiates_outer_only",
    conceptId: "chain-rule",
    pattern: "Differentiates inner and outer functions separately without chaining",
    description: "Treats f(g(x)) as f'(x) * g'(x) or f'(g'(x)) instead of evaluating outer derivative at g(x).",
    exampleSlip: "d/dx[sin(x^2)] = cos(2x)",
    correctedRule: "Evaluate the outer derivative at the intact inner function: f'(g(x)) * g'(x) = cos(x^2) * 2x.",
    diagnosticRules: ["inner argument replaced by derivative inside outer function"]
  },
  "confuses_composition_with_multiplication": {
    id: "confuses_composition_with_multiplication",
    conceptId: "composition",
    pattern: "Treats f(g(x)) as f(x) * g(x)",
    description: "The student multiplies the outputs of f and g instead of feeding g(x) as the argument to f.",
    exampleSlip: "If f(u) = u^2 and g(x) = 3x, then f(g(x)) = (x^2) * (3x)",
    correctedRule: "(f ∘ g)(x) = f(g(x)) substitutes g(x) into every occurrence of the parameter in f.",
    diagnosticRules: ["multiplication of independent evaluations"]
  },
  "steps_along_gradient_instead_of_negative": {
    id: "steps_along_gradient_instead_of_negative",
    conceptId: "gradient-descent",
    pattern: "Adds the gradient step instead of subtracting: θ + η*∇L (Gradient Ascent)",
    description: "Moves uphill in the direction of steepest increase rather than downhill toward minimum loss.",
    exampleSlip: "θ_new = θ + 0.1 * dL/dθ",
    correctedRule: "Gradient descent moves in the opposite direction of the gradient: θ_{t+1} = θ_t - η * ∇L.",
    diagnosticRules: ["positive sign on gradient update"]
  }
};

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag_chain_1",
    conceptId: "chain-rule",
    prompt: "Given y = (3x + 1)^2, let u = 3x + 1 so y = u^2. If dy/du = 2u and du/dx = 3, what is dy/dx?",
    options: [
      {
        id: "opt_chain_1_a",
        text: "dy/dx = 2u + 3 = 6x + 5",
        isCorrect: false,
        misconceptionId: "adds_rates_instead_of_chaining",
        explanation: "You added the rates instead of chaining them. Rates compound multiplicatively."
      },
      {
        id: "opt_chain_1_b",
        text: "dy/dx = 2u · 3 = 6(3x + 1) = 18x + 6",
        isCorrect: true,
        explanation: "Correct! dy/dx = (dy/du) * (du/dx) = 2u * 3."
      },
      {
        id: "opt_chain_1_c",
        text: "dy/dx = 2(3x + 1) = 6x + 2",
        isCorrect: false,
        misconceptionId: "forgets_inner_derivative",
        explanation: "You differentiated the outer function but forgot to multiply by du/dx = 3."
      },
      {
        id: "opt_chain_1_d",
        text: "dy/dx = 2(3) = 6",
        isCorrect: false,
        misconceptionId: "differentiates_outer_only",
        explanation: "You differentiated both separately without evaluating the outer derivative at u."
      }
    ],
    expectedReasoningSkill: "Chain Rule rate multiplication"
  },
  {
    id: "diag_comp_1",
    conceptId: "composition",
    prompt: "If f(u) = u^2 and g(x) = 2x - 3, what is f(g(x))?",
    options: [
      {
        id: "opt_comp_1_a",
        text: "(2x - 3)^2",
        isCorrect: true,
        explanation: "Correct! The output of g(x) becomes the input to f(u)."
      },
      {
        id: "opt_comp_1_b",
        text: "x^2 · (2x - 3)",
        isCorrect: false,
        misconceptionId: "confuses_composition_with_multiplication",
        explanation: "You multiplied f(x) by g(x) instead of substituting g(x) into f."
      },
      {
        id: "opt_comp_1_c",
        text: "2x^2 - 3",
        isCorrect: false,
        explanation: "That would be g(f(x)), which swaps the inner and outer operations."
      }
    ],
    expectedReasoningSkill: "Function composition substitution"
  },
  {
    id: "diag_deriv_1",
    conceptId: "derivatives",
    prompt: "What is the derivative of f(x) = 5x^3 with respect to x?",
    options: [
      {
        id: "opt_deriv_1_a",
        text: "15x^2",
        isCorrect: true,
        explanation: "Correct! Power rule: d/dx[a*x^n] = n*a*x^(n-1)."
      },
      {
        id: "opt_deriv_1_b",
        text: "5x^2",
        isCorrect: false,
        explanation: "The exponent 3 must multiply the coefficient 5."
      },
      {
        id: "opt_deriv_1_c",
        text: "15x^3",
        isCorrect: false,
        explanation: "Remember to decrease the exponent by 1."
      }
    ],
    expectedReasoningSkill: "Power rule for polynomials"
  },
  {
    id: "diag_gd_1",
    conceptId: "gradient-descent",
    prompt: "In gradient descent for scalar parameter w, if the loss gradient dL/dw = +4.0 and learning rate η = 0.1, how should w be updated?",
    options: [
      {
        id: "opt_gd_1_a",
        text: "w_new = w - 0.1 * 4.0 = w - 0.4",
        isCorrect: true,
        explanation: "Correct! Gradient descent moves downhill opposite to the positive gradient."
      },
      {
        id: "opt_gd_1_b",
        text: "w_new = w + 0.1 * 4.0 = w + 0.4",
        isCorrect: false,
        misconceptionId: "steps_along_gradient_instead_of_negative",
        explanation: "Adding the gradient moves uphill (gradient ascent), increasing the loss."
      }
    ],
    expectedReasoningSkill: "Negative gradient step direction"
  }
];

export const RETEST_TEMPLATES = [
  {
    id: "retest_chain_power_1",
    conceptId: "chain-rule",
    misconceptionId: "adds_rates_instead_of_chaining",
    problemText: "Differentiate y = (5x - 2)^3 with respect to x. Show your substitution step, derivatives dy/du and du/dx, and your final result.",
    substitution: "u = 5x - 2, y = u^3",
    dy_du: "3u^2",
    du_dx: "5",
    finalExpected: "15(5x - 2)^2",
    rubric: [
      "Identifies inner function u = 5x - 2",
      "Calculates dy/du = 3u^2 = 3(5x - 2)^2",
      "Calculates du/dx = 5",
      "Multiplies dy/dx = (dy/du) * (du/dx) to get 15(5x - 2)^2"
    ]
  },
  {
    id: "retest_chain_power_2",
    conceptId: "chain-rule",
    misconceptionId: "adds_rates_instead_of_chaining",
    problemText: "Differentiate y = (4x + 3)^4 with respect to x. Show intermediate rates and multiply them.",
    substitution: "u = 4x + 3, y = u^4",
    dy_du: "4u^3",
    du_dx: "4",
    finalExpected: "16(4x + 3)^3",
    rubric: [
      "Identifies inner function u = 4x + 3",
      "Calculates dy/du = 4u^3",
      "Calculates du/dx = 4",
      "Multiplies rates to get 16(4x + 3)^3"
    ]
  }
];
