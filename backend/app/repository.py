from app.schemas import (
    CompositeMetric,
    Contract,
    Metric,
    PlayerEvaluation,
    PlayerIdentity,
    PlayerSearchResult,
    SeasonTrend,
    SimilarPlayer,
)


Mikal_BRIDGES = PlayerEvaluation(
    slug="mikal-bridges",
    identity=PlayerIdentity(
        name="Mikal Bridges",
        team="Brooklyn Nets",
        position="G/F",
        age=29,
        height="6'6\"",
        weight=209,
        experience=7,
        jersey_number="1",
    ),
    contract=Contract(
        current_salary=23_300_000,
        years_remaining=1,
        average_annual_value=22_500_000,
        cap_percentage=16.5,
        contract_type="Veteran extension",
    ),
    key_metrics=[
        Metric(label="PPG", value=19.6, display_value="19.6", percentile=77, description="Points per game"),
        Metric(label="TS%", value=57.1, display_value="57.1%", percentile=68, description="True shooting percentage"),
        Metric(label="USG%", value=22.1, display_value="22.1%", percentile=56, description="Share of team possessions used"),
        Metric(label="NET RTG", value=-1.8, display_value="−1.8", percentile=41, description="On-court net rating"),
    ],
    season_trends=[
        SeasonTrend(season="2021–22", points=14.2, true_shooting=62.7, usage=15.1, minutes=34.8),
        SeasonTrend(season="2022–23", points=17.8, true_shooting=59.0, usage=19.4, minutes=35.7),
        SeasonTrend(season="2023–24", points=19.6, true_shooting=57.1, usage=22.1, minutes=34.0),
    ],
    composites=[
        CompositeMetric(
            name="Spacing Index", score=78, percentile=81,
            interpretation="Above-average off-ball spacer with credible movement shooting and efficient spot-up volume.",
            components=["Catch-and-shoot efficiency", "3PA volume", "Corner 3%", "Off-ball activity"],
        ),
        CompositeMetric(
            name="Creation Index", score=61, percentile=63,
            interpretation="Capable secondary creator; value increases when attacks tilted defenses rather than initiating every action.",
            components=["Usage", "Assist rate", "Pull-up shooting", "Rim pressure"],
        ),
        CompositeMetric(
            name="Finishing Index", score=70, percentile=74,
            interpretation="Efficient finisher with length-driven advantage, particularly when attacking closeouts.",
            components=["Rim FG%", "Rim attempt rate", "Foul rate", "Transition efficiency"],
        ),
    ],
    scout_notes=[
        "Versatile wing defender with strong anticipation away from the ball.",
        "Best offensive value comes as a connector and advantage extender.",
        "Monitor creation efficiency as on-ball responsibility increases.",
    ],
    similar_players=[
        SimilarPlayer(slug="og-anunoby", name="OG Anunoby", team="New York Knicks", position="F", similarity_score=91, shared_traits=["Two-way wing", "Low-turnover scorer", "Defensive versatility"]),
        SimilarPlayer(slug="derrick-white", name="Derrick White", team="Boston Celtics", position="G", similarity_score=86, shared_traits=["Connector role", "Off-ball value", "Team defense"]),
        SimilarPlayer(slug="jaden-mcdaniels", name="Jaden McDaniels", team="Minnesota Timberwolves", position="F", similarity_score=82, shared_traits=["Length", "Wing defense", "Secondary offense"]),
    ],
)


def comparable_player(slug: str, name: str, team: str, position: str, age: int, height: str, number: str, metrics: list[tuple[str, float, str, int]]) -> PlayerEvaluation:
    player = Mikal_BRIDGES.model_copy(deep=True)
    player.slug = slug
    player.identity = PlayerIdentity(name=name, team=team, position=position, age=age, height=height, weight=210, experience=6, jersey_number=number)
    player.key_metrics = [Metric(label=label, value=value, display_value=display, percentile=percentile, description=label) for label, value, display, percentile in metrics]
    player.similar_players = [similar for similar in Mikal_BRIDGES.similar_players if similar.slug != slug]
    return player


OG_ANUNOBY = comparable_player("og-anunoby", "OG Anunoby", "New York Knicks", "F", 27, "6'7\"", "8", [("PPG", 14.7, "14.7", 57), ("TS%", 61.0, "61.0%", 84), ("USG%", 17.2, "17.2%", 32), ("NET RTG", 7.1, "+7.1", 81)])
DERRICK_WHITE = comparable_player("derrick-white", "Derrick White", "Boston Celtics", "G", 30, "6'4\"", "9", [("PPG", 15.2, "15.2", 59), ("TS%", 60.9, "60.9%", 83), ("USG%", 17.6, "17.6%", 35), ("NET RTG", 11.6, "+11.6", 94)])
JADEN_MCDANIELS = comparable_player("jaden-mcdaniels", "Jaden McDaniels", "Minnesota Timberwolves", "F", 24, "6'9\"", "3", [("PPG", 10.5, "10.5", 34), ("TS%", 56.1, "56.1%", 61), ("USG%", 12.6, "12.6%", 14), ("NET RTG", 4.8, "+4.8", 70)])

PLAYERS = {player.slug: player for player in [Mikal_BRIDGES, OG_ANUNOBY, DERRICK_WHITE, JADEN_MCDANIELS]}


def search_players(query: str = "") -> list[PlayerSearchResult]:
    normalized = query.lower().strip()
    return [
        PlayerSearchResult(slug=p.slug, name=p.identity.name, team=p.identity.team, position=p.identity.position)
        for p in PLAYERS.values()
        if not normalized or normalized in p.identity.name.lower() or normalized in p.identity.team.lower()
    ]


def get_player(slug: str) -> PlayerEvaluation | None:
    return PLAYERS.get(slug)
