/**
 * LearnLoop Deterministic Simulations Engine
 * Maps to Specification Section 8 & UI Pages 11-12, 22.
 * Calculates exact mathematical values, slopes, trajectories, and graph curves.
 */

export interface ChainRuleSimParams {
  x?: number;
  inner_slope?: number;
  inner_intercept?: number;
  outer_power?: number;
}

export interface GradientDescentSimParams {
  initial_theta?: number;
  learning_rate?: number;
  target_minimum?: number;
  steps?: number;
}

export interface SimulationRecord {
  id: string;
  kind: "chain_rule" | "gradient_descent";
  parameters: any;
  result: any;
  user_prediction?: any;
  pinned_to_page_id?: string;
  created_at: string;
}

const simulationsStore: Record<string, SimulationRecord> = {};

export function getSimulationsCatalog() {
  return [
    {
      id: "sim-chain-rule",
      kind: "chain_rule",
      title: "Chain Rule Rate Multiplier",
      concept_id: "chain-rule",
      description: "Visualizes how rates multiply like mechanical gear ratios along composite functions y = f(g(x)).",
      default_params: {
        x: 1.0,
        inner_slope: 3.0,
        inner_intercept: 1.0,
        outer_power: 2.0
      }
    },
    {
      id: "sim-gradient-descent",
      kind: "gradient_descent",
      title: "Gradient Descent Optimization",
      concept_id: "gradient-descent",
      description: "Steps parameters downhill along the negative gradient surface θ_{t+1} = θ_t - η * ∇L(θ_t).",
      default_params: {
        initial_theta: 5.0,
        learning_rate: 0.15,
        target_minimum: 0.0,
        steps: 20
      }
    }
  ];
}

/**
 * Runs Chain Rule Simulation deterministically:
 * g(x) = ax + b, f(u) = u^p
 * h(x) = (ax + b)^p
 * h'(x) = p(ax + b)^(p-1) * a
 */
export function runChainRuleSim(params: ChainRuleSimParams) {
  const x = params.x ?? 1.0;
  const a = params.inner_slope ?? 3.0;
  const b = params.inner_intercept ?? 1.0;
  const p = params.outer_power ?? 2.0;

  // Intermediate values
  const u = a * x + b;
  const y = Math.pow(u, p);

  // Component slopes
  const du_dx = a;
  const dy_du = p * Math.pow(u, p - 1);
  const total_slope = dy_du * du_dx;

  // Generate curve points for graphing around x
  const points: Array<{ x: number; y: number; u: number }> = [];
  const minX = x - 2.0;
  const maxX = x + 2.0;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const curX = minX + (i / steps) * (maxX - minX);
    const curU = a * curX + b;
    const curY = Math.pow(curU, p);
    points.push({
      x: parseFloat(curX.toFixed(2)),
      u: parseFloat(curU.toFixed(2)),
      y: parseFloat(curY.toFixed(2))
    });
  }

  const simId = `sim_chain_${Date.now()}`;
  const record: SimulationRecord = {
    id: simId,
    kind: "chain_rule",
    parameters: { x, inner_slope: a, inner_intercept: b, outer_power: p },
    result: {
      evaluated_x: x,
      evaluated_u: u,
      evaluated_y: y,
      inner_rate_du_dx: du_dx,
      outer_rate_dy_du: dy_du,
      total_rate_dy_dx: total_slope,
      formula_inner: `u = ${a}x + ${b}`,
      formula_outer: `y = u^${p}`,
      chain_expression: `dy/dx = (dy/du) · (du/dx) = (${dy_du}) · (${du_dx}) = ${total_slope}`,
      points
    },
    created_at: new Date().toISOString()
  };

  simulationsStore[simId] = record;
  return record;
}

/**
 * Runs Gradient Descent Simulation:
 * L(θ) = 0.5 * (θ - θ*)^2
 * ∇L(θ) = θ - θ*
 * θ_{t+1} = θ_t - η * (θ_t - θ*)
 */
export function runGradientDescentSim(params: GradientDescentSimParams) {
  const initTheta = params.initial_theta ?? 5.0;
  const lr = params.learning_rate ?? 0.15;
  const target = params.target_minimum ?? 0.0;
  const numSteps = Math.min(100, Math.max(1, params.steps ?? 20));

  let currentTheta = initTheta;
  const trajectory: Array<{ step: number; theta: number; loss: number; gradient: number }> = [];

  for (let t = 0; t <= numSteps; t++) {
    const loss = 0.5 * Math.pow(currentTheta - target, 2);
    const grad = currentTheta - target;
    trajectory.push({
      step: t,
      theta: parseFloat(currentTheta.toFixed(4)),
      loss: parseFloat(loss.toFixed(4)),
      gradient: parseFloat(grad.toFixed(4))
    });
    currentTheta = currentTheta - lr * grad;
  }

  const finalLoss = trajectory[trajectory.length - 1].loss;
  const isConverged = finalLoss < 0.01;

  const simId = `sim_gd_${Date.now()}`;
  const record: SimulationRecord = {
    id: simId,
    kind: "gradient_descent",
    parameters: { initial_theta: initTheta, learning_rate: lr, target_minimum: target, steps: numSteps },
    result: {
      initial_theta: initTheta,
      learning_rate: lr,
      final_theta: trajectory[trajectory.length - 1].theta,
      final_loss: finalLoss,
      is_converged: isConverged,
      trajectory
    },
    created_at: new Date().toISOString()
  };

  simulationsStore[simId] = record;
  return record;
}

export function saveSimulationPrediction(simId: string, prediction: any) {
  const sim = simulationsStore[simId];
  if (!sim) return null;
  sim.user_prediction = prediction;
  return sim;
}

export function pinSimulationToPage(simId: string, pageId: string) {
  const sim = simulationsStore[simId];
  if (!sim) return null;
  sim.pinned_to_page_id = pageId;
  return sim;
}

export function getSimulationById(simId: string) {
  return simulationsStore[simId] || null;
}
