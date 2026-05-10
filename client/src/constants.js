export const TOPICS = [
  { id: "career", label: "Career" },
  { id: "relationships", label: "Relationships" },
  { id: "mental-health", label: "Mental health" },
  { id: "education", label: "Education" },
  { id: "life-decisions", label: "Life decisions" },
];

export const POST_TYPES = [
  { id: "mistake", label: "A mistake I made" },
  { id: "lesson", label: "A lesson I learned" },
  { id: "experience", label: "An experience to learn from" },
];

export function topicLabel(id) {
  return TOPICS.find((t) => t.id === id)?.label || id;
}

export function postTypeLabel(id) {
  return POST_TYPES.find((t) => t.id === id)?.label || id;
}
