from pydantic import BaseModel, Field


class PlayerSearchResult(BaseModel):
    slug: str
    name: str
    team: str
    position: str


class PlayerIdentity(BaseModel):
    name: str
    team: str
    position: str
    age: int
    height: str
    weight: int
    experience: int
    jersey_number: str


class Contract(BaseModel):
    current_salary: int
    years_remaining: int
    average_annual_value: int
    cap_percentage: float
    contract_type: str


class Metric(BaseModel):
    label: str
    value: float
    display_value: str
    percentile: int = Field(ge=0, le=100)
    description: str


class SeasonTrend(BaseModel):
    season: str
    points: float
    true_shooting: float
    usage: float
    minutes: float


class CompositeMetric(BaseModel):
    name: str
    score: int = Field(ge=0, le=100)
    percentile: int = Field(ge=0, le=100)
    interpretation: str
    components: list[str]


class SimilarPlayer(BaseModel):
    slug: str
    name: str
    team: str
    position: str
    similarity_score: int = Field(ge=0, le=100)
    shared_traits: list[str]


class PlayerEvaluation(BaseModel):
    slug: str
    identity: PlayerIdentity
    contract: Contract
    key_metrics: list[Metric]
    season_trends: list[SeasonTrend]
    composites: list[CompositeMetric]
    scout_notes: list[str]
    similar_players: list[SimilarPlayer]
