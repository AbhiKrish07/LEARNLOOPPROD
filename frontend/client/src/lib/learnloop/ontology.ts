export interface RubricRequirement {
  id: string;
  statement: string;
  description: string;
}

export interface MisconceptionSignature {
  id: string;
  label: string;
  triggerPhrases: string[];
  explanation: string;
  counterExample: string;
}

export interface AssessmentItem {
  id: string;
  prompt: string;
  targetRequirementId: string;
  rubric: {
    met: string;
    partlyMet: string;
    notYetShown: string;
  };
  misconceptions: MisconceptionSignature[];
}

export interface ConceptDefinition {
  id: string;
  name: string;
  shortDefinition: string;
  prerequisiteIds: string[];
  requirements: RubricRequirement[];
  misconceptions: MisconceptionSignature[];
  assessmentItems: AssessmentItem[];
  simulationId?: 'chain-rule' | 'gradient-descent';
  unlockCondition: string;
}

export const CONCEPT_ONTOLOGY: Record<string, ConceptDefinition> = {
  'functions': {
    id: 'functions',
    name: 'Functions',
    shortDefinition: 'A mapping from an input set to a unique output value.',
    prerequisiteIds: [],
    unlockCondition: 'Default starting foundation',
    requirements: [
      { id: 'func-req-1', statement: 'Identifies inputs and outputs', description: 'Can clearly separate input variables from resulting output values.' },
      { id: 'func-req-2', statement: 'Understands deterministic mapping', description: 'Recognizes that a given input produces exactly one deterministic output.' }
    ],
    misconceptions: [
      {
        id: 'func-misc-1',
        label: 'Confusing input and output roles',
        triggerPhrases: ['output determines input', 'input changes when output changes'],
        explanation: 'In a standard function y = f(x), x is the independent variable (input) and y is the dependent variable (output).',
        counterExample: 'f(x) = x^2 has f(2) = 4, but output 4 could come from input 2 or -2, so input is the independent driver.'
      }
    ],
    assessmentItems: [
      {
        id: 'func-q1',
        prompt: 'Explain what happens to the output of f(x) = 3x + 2 when x increases by 1.',
        targetRequirementId: 'func-req-1',
        rubric: {
          met: 'Correctly identifies that the output increases by 3 consistently.',
          partlyMet: 'Notes that output increases but fails to quantify by 3.',
          notYetShown: 'Unable to describe the relationship between input x and output f(x).'
        },
        misconceptions: [
          {
            id: 'func-misc-1',
            label: 'Confusing input and output roles',
            triggerPhrases: ['output determines input'],
            explanation: 'The input drives the output, not vice versa.',
            counterExample: 'Changing x changes f(x).'
          }
        ]
      }
    ]
  },
  'derivatives': {
    id: 'derivatives',
    name: 'Derivatives',
    shortDefinition: 'The instantaneous rate of change of a function with respect to its variable.',
    prerequisiteIds: ['functions'],
    unlockCondition: 'Demonstrate function input/output mapping',
    requirements: [
      { id: 'deriv-req-1', statement: 'Recognizes derivative as rate of change', description: 'Understands df/dx as measuring sensitivity of output to small input changes.' },
      { id: 'deriv-req-2', statement: 'Interprets geometric tangent slope', description: 'Connects the numerical derivative to the slope of the curve at a specific point.' }
    ],
    misconceptions: [
      {
        id: 'deriv-misc-1',
        label: 'Confusing rate of change with current value',
        triggerPhrases: ['derivative is the value of f', 'high value means high derivative', 'f(x) is big so derivative is big'],
        explanation: 'A function can have a very high output value (y = 1000) while its rate of change (derivative) is zero.',
        counterExample: 'f(x) = 1000 is a flat horizontal line with value 1000, but derivative f\'(x) = 0.'
      }
    ],
    assessmentItems: [
      {
        id: 'deriv-q1',
        prompt: 'If a function has a high value at a point x, does its derivative at x also have to be high? Why or why not?',
        targetRequirementId: 'deriv-req-1',
        rubric: {
          met: 'Clearly distinguishes value f(x) from rate of change df/dx with an example.',
          partlyMet: 'States they are different but gives a vague or flawed reason.',
          notYetShown: 'Equates function height with derivative magnitude.'
        },
        misconceptions: [
          {
            id: 'deriv-misc-1',
            label: 'Confusing rate of change with current value',
            triggerPhrases: ['f(x) is big so derivative is big', 'high value means high derivative'],
            explanation: 'Height (value) and slope (derivative) are independent properties of a function.',
            counterExample: 'Consider f(x) = 100 (flat line, derivative = 0).'
          }
        ]
      }
    ]
  },
  'composition': {
    id: 'composition',
    name: 'Composition',
    shortDefinition: 'Combining two functions such that the output of one becomes the input of another.',
    prerequisiteIds: ['functions'],
    unlockCondition: 'Understand basic function mapping',
    requirements: [
      { id: 'comp-req-1', statement: 'Identifies outer and inner functions', description: 'In f(g(x)), correctly labels g(x) as inner and f(u) as outer.' },
      { id: 'comp-req-2', statement: 'Traces intermediate values', description: 'Evaluates g(x) first to yield intermediate value u, then passes u into f.' }
    ],
    misconceptions: [
      {
        id: 'comp-misc-1',
        label: 'Mixing up composition order',
        triggerPhrases: ['f(g(x)) is same as g(f(x))', 'order does not matter', 'multiply functions instead of composing'],
        explanation: 'Function composition f(g(x)) applies g first, then f. It is non-commutative in general.',
        counterExample: 'If f(x) = x^2 and g(x) = x + 1, then f(g(2)) = f(3) = 9, but g(f(2)) = g(4) = 5.'
      }
    ],
    assessmentItems: [
      {
        id: 'comp-q1',
        prompt: 'For f(x) = x^2 and g(x) = x + 3, explain how to compute f(g(x)) and why g is evaluated first.',
        targetRequirementId: 'comp-req-1',
        rubric: {
          met: 'Explains that g(x) computes the inner value first, which becomes the input to f.',
          partlyMet: 'Computes f(g(x)) = (x+3)^2 correctly but cannot articulate the evaluation order logic.',
          notYetShown: 'Confuses f(g(x)) with f(x) * g(x) or g(f(x)).'
        },
        misconceptions: [
          {
            id: 'comp-misc-1',
            label: 'Mixing up composition order',
            triggerPhrases: ['f(g(x)) is same as g(f(x))', 'multiply functions instead of composing'],
            explanation: 'Evaluation flows from inner to outer.',
            counterExample: 'f(g(x)) != g(f(x)) in general.'
          }
        ]
      }
    ]
  },
  'chain-rule': {
    id: 'chain-rule',
    name: 'Chain Rule',
    shortDefinition: 'A formula for computing the derivative of a composite function: dy/dx = (dy/du) * (du/dx).',
    prerequisiteIds: ['derivatives', 'composition'],
    unlockCondition: 'Familiarity with derivatives and composition',
    simulationId: 'chain-rule',
    requirements: [
      { id: 'chain-req-1', statement: 'Identifies outer and inner components in derivative', description: 'Identifies df/dg and dg/dx correctly in a composite expression.' },
      { id: 'chain-req-2', statement: 'Explains why rates multiply', description: 'Explains that rates of change compound multiplicatively through nested functions.' },
      { id: 'chain-req-3', statement: 'Applies chain rule in derivations', description: 'Computes correct analytical derivatives for nested expressions like sin(x^2).' }
    ],
    misconceptions: [
      {
        id: 'chain-misc-1',
        label: 'Adding rates instead of multiplying',
        triggerPhrases: ['add the rates', 'rates add up', 'df/dg + dg/dx', 'add the derivatives'],
        explanation: 'Because the inner output scales the outer input, a small change delta x produces delta g = (dg/dx) * delta x, which then produces delta f = (df/dg) * delta g. Substituting gives delta f = (df/dg) * (dg/dx) * delta x.',
        counterExample: 'If g moves 2x as fast as x, and f moves 3x as fast as g, then f moves 2 * 3 = 6x as fast as x.'
      },
      {
        id: 'chain-misc-2',
        label: 'Forgetting inner derivative',
        triggerPhrases: ['forget inner derivative', 'just differentiate outer', 'derivative of sin(x^2) is cos(x^2)'],
        explanation: 'Differentiating only the outer function treats the inner function as constant, ignoring how the inner variable changes.',
        counterExample: 'd/dx[sin(x^2)] = cos(x^2) * 2x, not just cos(x^2).'
      }
    ],
    assessmentItems: [
      {
        id: 'chain-q1',
        prompt: 'Why do we multiply (rather than add) the derivatives when taking the derivative of f(g(x))?',
        targetRequirementId: 'chain-req-2',
        rubric: {
          met: 'Clearly articulates rate compounding: small dx scales g by dg/dx, which then scales f by df/dg, resulting in multiplication.',
          partlyMet: 'Mentions the formula dy/dx = (dy/du)*(du/dx) but cannot explain why multiplication occurs physical/rate-wise.',
          notYetShown: 'Claims rates add up or states the inner derivative is not needed.'
        },
        misconceptions: [
          {
            id: 'chain-misc-1',
            label: 'Adding rates instead of multiplying',
            triggerPhrases: ['add the rates', 'rates add up', 'df/dg + dg/dx', 'add the derivatives'],
            explanation: 'Rates compound multiplicatively through function layering.',
            counterExample: 'Gear 1 turns Gear 2 at 2x, Gear 2 turns Gear 3 at 3x -> Gear 3 turns at 6x, not 5x.'
          },
          {
            id: 'chain-misc-2',
            label: 'Forgetting inner derivative',
            triggerPhrases: ['forget inner derivative', 'just differentiate outer'],
            explanation: 'The inner rate must multiply the outer rate.',
            counterExample: 'd/dx[ (3x)^2 ] = 2(3x)*3 = 18x.'
          }
        ]
      }
    ]
  },
  'computational-graphs': {
    id: 'computational-graphs',
    name: 'Computational Graphs',
    shortDefinition: 'A directed acyclic graph representing mathematical expressions as nodes and operations as edges.',
    prerequisiteIds: ['chain-rule'],
    unlockCondition: 'Understands Chain Rule multiplication',
    requirements: [
      { id: 'comp-graph-req-1', statement: 'Maps expressions to nodes and edges', description: 'Decomposes complex equations into elementary operation nodes (add, multiply, activation).' },
      { id: 'comp-graph-req-2', statement: 'Tracks forward pass values', description: 'Computes intermediate scalar values at each graph node given input vectors.' }
    ],
    misconceptions: [
      {
        id: 'comp-graph-misc-1',
        label: 'Treating computational graph as a neural network layer only',
        triggerPhrases: ['graphs are only for deep learning', 'only neural nets have graphs'],
        explanation: 'Any algebraic expression (e.g. y = a*x + b) can be expressed as a computational graph.',
        counterExample: 'y = x^2 + 3 is a 3-node computational graph.'
      }
    ],
    assessmentItems: [
      {
        id: 'comp-graph-q1',
        prompt: 'Draw or describe the computational graph for L = (w * x + b) - y. What are the intermediate nodes?',
        targetRequirementId: 'comp-graph-req-1',
        rubric: {
          met: 'Identifies multiplication node u = w*x, addition node v = u + b, and subtraction node L = v - y.',
          partlyMet: 'Identifies some nodes but omits intermediate operations.',
          notYetShown: 'Unable to break down expression into elementary graph steps.'
        },
        misconceptions: []
      }
    ]
  },
  'backpropagation': {
    id: 'backpropagation',
    name: 'Backpropagation',
    shortDefinition: 'An algorithm for efficiently computing gradients of a loss function with respect to graph parameters via reverse-mode automatic differentiation.',
    prerequisiteIds: ['computational-graphs', 'chain-rule'],
    unlockCondition: 'Understands computational graphs and chain rule',
    requirements: [
      { id: 'backprop-req-1', statement: 'Explains reverse pass gradient accumulation', description: 'Understands propagating gradients backward from output loss node to input weights.' },
      { id: 'backprop-req-2', statement: 'Applies multivariate chain rule at branch nodes', description: 'Sums incoming gradients when a node output splits into multiple forward paths.' }
    ],
    misconceptions: [
      {
        id: 'backprop-misc-1',
        label: 'Forgetting to sum gradients at branching nodes',
        triggerPhrases: ['take only one branch', 'pick max gradient', 'branch gradients do not add'],
        explanation: 'When a variable affects loss through multiple paths, its total gradient is the sum of partial gradients along all paths.',
        counterExample: 'If x is used in both u = x + 1 and v = x * 2, dL/dx = (dL/du)*(du/dx) + (dL/dv)*(dv/dx).'
      }
    ],
    assessmentItems: [
      {
        id: 'backprop-q1',
        prompt: 'When a node output splits into two branches in a computational graph, how are gradients from both branches combined during backpropagation?',
        targetRequirementId: 'backprop-req-2',
        rubric: {
          met: 'States that gradients from all child branches sum together due to the multivariate chain rule.',
          partlyMet: 'Remembers they combine but suggests averaging or picking the maximum.',
          notYetShown: 'Claims only one branch gradient is used.'
        },
        misconceptions: [
          {
            id: 'backprop-misc-1',
            label: 'Forgetting to sum gradients at branching nodes',
            triggerPhrases: ['take only one branch', 'pick max gradient'],
            explanation: 'Branch gradients sum during backward pass.',
            counterExample: 'Total sensitivity = sum of sensitivity along every path.'
          }
        ]
      }
    ]
  },
  'gradient-descent': {
    id: 'gradient-descent',
    name: 'Gradient Descent',
    shortDefinition: 'An optimization algorithm that iteratively steps parameters in the direction of steepest loss decrease: w = w - learning_rate * grad(L).',
    prerequisiteIds: ['backpropagation'],
    unlockCondition: 'Understands gradient computation via backpropagation',
    simulationId: 'gradient-descent',
    requirements: [
      { id: 'gd-req-1', statement: 'Understands negative gradient direction', description: 'Explains why stepping opposite to gradient reduces loss.' },
      { id: 'gd-req-2', statement: 'Evaluates learning rate trade-offs', description: 'Analyzes divergence with large learning rate vs slow convergence with small learning rate.' }
    ],
    misconceptions: [
      {
        id: 'gd-misc-1',
        label: 'Stepping in positive gradient direction',
        triggerPhrases: ['add gradient to parameters', 'w = w + learning_rate * grad', 'move in direction of gradient'],
        explanation: 'The gradient points in the direction of steepest INCREASE of loss. To MINIMIZE loss, we move in the opposite direction (-grad).',
        counterExample: 'If dL/dw = +5, loss goes up as w increases, so we must DECREASE w.'
      }
    ],
    assessmentItems: [
      {
        id: 'gd-q1',
        prompt: 'Why do we subtract the gradient (w = w - eta * grad) instead of adding it when updating weights during gradient descent?',
        targetRequirementId: 'gd-req-1',
        rubric: {
          met: 'Explains that gradient points uphill (steepest loss increase), so subtracting steps downhill (loss decrease).',
          partlyMet: 'Notes that subtraction decreases weight, but does not connect gradient sign to loss direction.',
          notYetShown: 'Recommends adding the gradient or confusing step direction.'
        },
        misconceptions: [
          {
            id: 'gd-misc-1',
            label: 'Stepping in positive gradient direction',
            triggerPhrases: ['add gradient to parameters', 'w = w + learning_rate * grad'],
            explanation: 'Gradient is steepest uphill vector; negative gradient is steepest downhill.',
            counterExample: 'To reach valley minimum, go downhill.'
          }
        ]
      }
    ]
  }
};

export const PATH_SEQUENCE = [
  'functions',
  'derivatives',
  'composition',
  'chain-rule',
  'computational-graphs',
  'backpropagation',
  'gradient-descent'
];
