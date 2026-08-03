export type Metric = { label: string; value: number; display_value: string; percentile: number; description: string };
export type SeasonTrend = { season: string; points: number; true_shooting: number; usage: number; minutes: number };
export type CompositeMetric = { name: string; score: number; percentile: number; interpretation: string; components: string[] };
export type SimilarPlayer = { slug: string; name: string; team: string; position: string; similarity_score: number; shared_traits: string[] };
export type PlayerEvaluation = {
  slug: string;
  identity: { name: string; team: string; position: string; age: number; height: string; weight: number; experience: number; jersey_number: string };
  contract: { current_salary: number; years_remaining: number; average_annual_value: number; cap_percentage: number; contract_type: string };
  key_metrics: Metric[];
  season_trends: SeasonTrend[];
  composites: CompositeMetric[];
  scout_notes: string[];
  similar_players: SimilarPlayer[];
};
