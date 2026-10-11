export type PaperTemplate = "ruled" | "grid" | "cornell" | "dotted" | "blank" | "dark";

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  tool: "pen" | "highlighter" | "eraser" | "text" | "lasso";
  color: string;
  width: number;
  points: Point[];
}

export interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface Page {
  id: string;
  title: string;
  template: PaperTemplate;
  strokes: Stroke[];
  textBoxes: TextBox[];
}

export interface Notebook {
  id: string;
  title: string;
  subject: string;
  coverColor: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
  sources?: string[];
  aiNotes?: string[];
}

const STORAGE_KEY = "learnloop_notebooks_v2";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: "cs-foundations",
    title: "Computer Science Foundations",
    subject: "Computer Science",
    coverColor: "bg-slate-900 border-slate-700 text-amber-300",
    createdAt: new Date().toISOString(),
    updatedAt: "Just now",
    pages: [
      {
        id: "p1",
        title: "Functions & Computational Graphs",
        template: "ruled",
        strokes: [],
        textBoxes: [
          {
            id: "tb1",
            x: 80,
            y: 70,
            text: "Computer Science Foundations — Session 01\n\nKey Concepts:\n1. Functions as transformations of data: f(x) -> y\n2. Composition of functions: f(g(x))\n3. Computational graphs for algorithmic data flow\n4. Sensitivity & gradient propagation in network graphs"
          }
        ]
      }
    ]
  },
  {
    id: "world-history",
    title: "World History & Global Revolutions",
    subject: "History",
    coverColor: "bg-amber-900 border-amber-700 text-[#FDFCF9]",
    createdAt: new Date().toISOString(),
    updatedAt: "2 hours ago",
    pages: [
      {
        id: "p1",
        title: "The Industrial Revolution & Global Trade",
        template: "cornell",
        strokes: [],
        textBoxes: [
          {
            id: "tb1",
            x: 240,
            y: 150,
            text: "Industrial Revolution Notes:\n- Shift from agrarian economies to mechanized manufacturing\n- Steam engine innovations (James Watt)\n- Urbanization and socioeconomic shifts in 18th century Europe"
          }
        ]
      }
    ]
  },
  {
    id: "organic-chemistry",
    title: "Organic Chemistry & Molecular Bonds",
    subject: "Chemistry",
    coverColor: "bg-emerald-950 border-emerald-800 text-emerald-200",
    createdAt: new Date().toISOString(),
    updatedAt: "Yesterday",
    pages: [
      {
        id: "p1",
        title: "Hydrocarbons & Reaction Mechanisms",
        template: "grid",
        strokes: [],
        textBoxes: [
          {
            id: "tb1",
            x: 80,
            y: 60,
            text: "Reaction Mechanisms:\n- Nucleophilic substitution (SN1 vs SN2)\n- Electrophilic addition across carbon-carbon double bonds"
          }
        ]
      }
    ]
  },
  {
    id: "calculus-derivatives",
    title: "Calculus & Rate Compounding",
    subject: "Mathematics",
    coverColor: "bg-indigo-950 border-indigo-800 text-indigo-200",
    createdAt: new Date().toISOString(),
    updatedAt: "3 days ago",
    pages: [
      {
        id: "p1",
        title: "Chain Rule & Derivative Rates",
        template: "ruled",
        strokes: [],
        textBoxes: [
          {
            id: "tb1",
            x: 80,
            y: 60,
            text: "Chain Rule Formula:\ndy/dx = (df/dg) · (dg/dx)\n\nRates of change compound multiplicatively when one function is nested inside another."
          }
        ]
      }
    ]
  }
];

export function getStoredNotebooks(): Notebook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTEBOOKS));
      return INITIAL_NOTEBOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTEBOOKS;
  } catch {
    return INITIAL_NOTEBOOKS;
  }
}

export function saveNotebooks(notebooks: Notebook[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
  } catch (e) {
    console.error("Failed to save notebooks to localStorage", e);
  }
}

export function createNewNotebook(title: string, subject: string): Notebook {
  const notebooks = getStoredNotebooks();
  const colors = [
    "bg-[#1E2026] text-[#FCFBF7]",
    "bg-indigo-900 text-indigo-100",
    "bg-emerald-900 text-emerald-100",
    "bg-amber-900 text-amber-100",
    "bg-purple-900 text-purple-100",
    "bg-blue-900 text-blue-100"
  ];
  const coverColor = colors[notebooks.length % colors.length];

  const newNotebook: Notebook = {
    id: makeId(),
    title: title.trim() || "Untitled Notebook",
    subject: subject.trim() || "General Notes",
    coverColor,
    createdAt: new Date().toISOString(),
    updatedAt: "Just now",
    pages: [
      {
        id: makeId(),
        title: `${title} — Page 1`,
        template: "ruled",
        strokes: [],
        textBoxes: [
          {
            id: makeId(),
            x: 80,
            y: 60,
            text: `${title}\nSubject: ${subject}\nDate: ${new Date().toLocaleDateString()}`
          }
        ]
      }
    ]
  };

  const updated = [newNotebook, ...notebooks];
  saveNotebooks(updated);
  return newNotebook;
}
